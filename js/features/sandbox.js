import { createSandboxDatabase, executeSandboxQuery } from '../core/sqlEngine.js';
import { createSqlHighlighter } from '../core/editor.js';
import { loadSqlUsageStats, recordSqlUsage, resetSqlUsageStats, SQL_USAGE_SKILLS } from '../learning/sqlUsageTracker.js';
import { schema } from '../data/schema.js';

const EXAMPLE_QUERIES = {
  clients: `SELECT client_id, full_name, kyc_status, risk_rating
FROM clients
ORDER BY client_id
LIMIT 8;`,
  transactions: `SELECT transaction_type, COUNT(*) AS transaction_count
FROM transactions
GROUP BY transaction_type
ORDER BY transaction_count DESC;`,
  join: `SELECT c.full_name, a.account_id, a.account_type, a.balance
FROM clients c
JOIN accounts a ON c.client_id = a.client_id
ORDER BY a.balance DESC
LIMIT 10;`,
  group: `SELECT account_id, SUM(amount) AS total_deposited
FROM transactions
WHERE transaction_type = 'Deposit'
GROUP BY account_id
ORDER BY total_deposited DESC;`
};

const SANDBOX_SQL_BUTTONS = [
  { label: 'SELECT', insert: 'SELECT ' },
  { label: 'FROM', insert: 'FROM ' },
  { label: 'WHERE', insert: 'WHERE ' },
  { label: 'AND', insert: 'AND ' },
  { label: 'OR', insert: 'OR ' },
  { label: 'JOIN', insert: 'JOIN ' },
  { label: 'ON', insert: 'ON ' },
  { label: 'GROUP BY', insert: 'GROUP BY ' },
  { label: 'ORDER BY', insert: 'ORDER BY ' },
  { label: 'HAVING', insert: 'HAVING ' },
  { label: 'LIMIT', insert: 'LIMIT ' },
  { label: 'COUNT(*)', insert: 'COUNT(*)' },
  { label: 'SUM()', insert: 'SUM()', cursorBack: 1 },
  { label: 'AVG()', insert: 'AVG()', cursorBack: 1 },
  { label: 'ROUND()', insert: 'ROUND()', cursorBack: 1 },
  { label: "' ' ", action: 'quote' },
  { label: '( )', action: 'paren' }
];

let sandboxDb = null;
let isReady = false;
let sandboxEditor = null;

export function initSandboxLab() {
  initSandboxEditorTools();
  bindSandboxEvents();
  renderSandboxSchema();
  initSandboxSchemaToggle();
  initSandboxMobileTabs();
  renderUsageStats(loadSqlUsageStats());
  renderSandboxEmptyState();
  resetSandboxDatabase({ quiet: true });
}

export function openSandboxLab() {
  document.getElementById('homeScreen').style.display = 'none';
  document.querySelector('.game-container').style.display = 'none';
  const lab = document.getElementById('sandboxScreen');
  lab.style.display = 'flex';
  lab.scrollTop = 0;
  setSandboxMobileTab('editor');
  document.getElementById('sandboxMobileTabs')?.style.removeProperty('display');
  initSandboxEditorTools();
  sandboxEditor?.focus();
}

export function closeSandboxLab() {
  document.getElementById('sandboxScreen').style.display = 'none';
  const tabs = document.getElementById('sandboxMobileTabs');
  if (tabs) tabs.style.display = 'none';
  document.getElementById('homeScreen').style.display = 'flex';
}

function initSandboxEditorTools() {
  if (!sandboxEditor) {
    sandboxEditor = createSqlHighlighter('sandboxSqlInput');
  }

  const input = document.getElementById('sandboxSqlInput');
  const chipRow = document.querySelector('.sandbox-chip-row');
  if (!input || !chipRow || document.getElementById('sandboxKeywordBar')) return;

  const bar = document.createElement('div');
  bar.id = 'sandboxKeywordBar';
  bar.className = 'sandbox-keyword-bar';
  bar.setAttribute('aria-label', 'SQL helper buttons');
  bar.innerHTML = SANDBOX_SQL_BUTTONS.map(btn => `
    <button type="button" class="sandbox-sql-key" data-sandbox-insert="${escapeHtml(btn.insert || '')}" data-sandbox-action="${escapeHtml(btn.action || '')}" data-cursor-back="${btn.cursorBack || 0}">${escapeHtml(btn.label)}</button>
  `).join('');

  chipRow.insertAdjacentElement('afterend', bar);
}

function bindSandboxEvents() {
  document.getElementById('btnSandboxRun')?.addEventListener('click', runSandboxQuery);
  document.getElementById('btnSandboxClear')?.addEventListener('click', clearSandboxEditor);
  document.getElementById('btnSandboxResetDb')?.addEventListener('click', () => resetSandboxDatabase());
  document.getElementById('btnSandboxBack')?.addEventListener('click', closeSandboxLab);
  document.getElementById('btnSandboxResetStats')?.addEventListener('click', () => {
    renderUsageStats(resetSqlUsageStats());
    showSandboxStatus('Stats reset. Fresh XP track ready.', 'success');
  });

  document.querySelectorAll('[data-sandbox-example]').forEach(btn => {
    btn.addEventListener('click', () => {
      const query = EXAMPLE_QUERIES[btn.dataset.sandboxExample];
      if (query) {
        if (!sandboxEditor) sandboxEditor = createSqlHighlighter('sandboxSqlInput');
        sandboxEditor?.setValue(query);
        sandboxEditor?.focus();
      }
    });
  });

  document.getElementById('sandboxKeywordBar')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-sandbox-insert], [data-sandbox-action]');
    if (!btn) return;
    if (!sandboxEditor) sandboxEditor = createSqlHighlighter('sandboxSqlInput');

    const action = btn.dataset.sandboxAction;
    if (action === 'quote') {
      sandboxEditor?.wrapCursor("'", "'");
      return;
    }
    if (action === 'paren') {
      sandboxEditor?.wrapCursor('(', ')');
      return;
    }

    sandboxEditor?.insertText(btn.dataset.sandboxInsert || '', Number(btn.dataset.cursorBack || 0));
  });

  document.getElementById('sandboxSqlInput')?.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runSandboxQuery();
    }
  });
}

async function resetSandboxDatabase(options = {}) {
  setSandboxBusy(true);
  try {
    sandboxDb = await createSandboxDatabase();
    isReady = true;
    if (!options.quiet) {
      renderSandboxEmptyState('Sandbox DB restored to the original sample data.');
      showSandboxStatus('Database reset complete.', 'success');
    }
  } catch (err) {
    isReady = false;
    renderSandboxError('Sandbox database failed to load. Check your connection and try again.', err.message);
  } finally {
    setSandboxBusy(false);
  }
}

function getSandboxSql() {
  if (!sandboxEditor) sandboxEditor = createSqlHighlighter('sandboxSqlInput');
  return sandboxEditor?.getValue().trim() || document.getElementById('sandboxSqlInput')?.value.trim() || '';
}

function runSandboxQuery() {
  const sql = getSandboxSql();
  if (!sql) {
    renderSandboxEmptyState('Add a query, tap a SQL helper, or pick a Try this chip to begin.');
    showSandboxStatus('Editor is empty.', 'error');
    return;
  }
  if (!isReady) {
    showSandboxStatus('Sandbox database is still loading.', 'error');
    return;
  }

  try {
    const result = executeSandboxQuery(sandboxDb, sql);
    renderUsageStats(recordSqlUsage(sql));
    renderSandboxResult(result);
    showSandboxStatus('Query executed successfully.', 'success');
  } catch (err) {
    renderUsageStats(recordSqlUsage(sql));
    renderSandboxError('SQL error', err.message);
    showSandboxStatus('Query stopped. Review the error panel.', 'error');
  }
  if (isSandboxMobile()) {
    document.querySelector('.sandbox-results-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function clearSandboxEditor() {
  if (!sandboxEditor) sandboxEditor = createSqlHighlighter('sandboxSqlInput');
  sandboxEditor?.setValue('');
  renderSandboxEmptyState();
  showSandboxStatus('Editor cleared.', 'success');
}

function renderSandboxResult(result) {
  const panel = document.getElementById('sandboxResultPanel');
  const meta = document.getElementById('sandboxRowCount');
  if (!result.columns.length) {
    const changed = Number.isFinite(result.rowsModified) ? result.rowsModified : 0;
    panel.innerHTML = `
      <div class="sandbox-success-state">
        <strong>Query executed successfully</strong>
        <span>${changed ? changed + ' row' + (changed === 1 ? '' : 's') + ' changed' : 'No result table returned'}</span>
      </div>`;
    meta.textContent = changed ? changed + ' row' + (changed === 1 ? '' : 's') + ' changed' : '';
    return;
  }

  if (!result.rows.length) {
    panel.innerHTML = `<div class="sandbox-empty-state">Query returned 0 rows.<br><br>Columns: ${result.columns.map(escapeHtml).join(', ')}</div>`;
    meta.textContent = '0 rows';
    return;
  }

  const thead = result.columns.map(col => `<th>${escapeHtml(col)}</th>`).join('');
  const tbody = result.rows.map(row =>
    '<tr>' + row.map(value => `<td>${escapeHtml(formatValue(value))}</td>`).join('') + '</tr>'
  ).join('');
  panel.innerHTML = `<table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>`;
  meta.textContent = result.rows.length + ' row' + (result.rows.length === 1 ? '' : 's');
}

function renderSandboxEmptyState(message = 'Run any SQL here. Mission score, hints, badges, and mastery stay untouched.') {
  document.getElementById('sandboxResultPanel').innerHTML = `<div class="sandbox-empty-state">${escapeHtml(message)}</div>`;
  document.getElementById('sandboxRowCount').textContent = '';
}

function renderSandboxError(title, message) {
  document.getElementById('sandboxResultPanel').innerHTML = `
    <div class="sandbox-error-state">
      <strong>${escapeHtml(title)}</strong>
      <code>${escapeHtml(message)}</code>
    </div>`;
  document.getElementById('sandboxRowCount').textContent = '';
}

function renderUsageStats(stats) {
  const max = Math.max(1, ...SQL_USAGE_SKILLS.map(skill => stats[skill.id] || 0));
  document.getElementById('sandboxStatsGrid').innerHTML = SQL_USAGE_SKILLS.map(skill => {
    const value = stats[skill.id] || 0;
    const pct = Math.max(4, Math.round((value / max) * 100));
    return `
      <div class="sandbox-xp">
        <div class="sandbox-xp-top">
          <span>${escapeHtml(skill.label)}</span>
          <strong>${value} XP</strong>
        </div>
        <div class="sandbox-xp-track"><span style="width:${pct}%"></span></div>
      </div>`;
  }).join('');
}

function showSandboxStatus(message, type) {
  const el = document.getElementById('sandboxStatus');
  el.textContent = message;
  el.dataset.type = type;
}

function setSandboxBusy(isBusy) {
  ['btnSandboxRun', 'btnSandboxResetDb'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = isBusy;
  });
  if (isBusy) showSandboxStatus('Preparing sandbox database...', 'info');
  else if (isReady) showSandboxStatus('Training room online.', 'success');
}

function renderSandboxSchema() {
  const panel = document.getElementById('sandboxSchemaPanel');
  if (!panel) return;
  panel.innerHTML = Object.entries(schema).map(([table, cols]) => `
    <div class="schema-table collapsed">
      <div class="schema-header" data-sandbox-schema-toggle>
        ${escapeHtml(table)} <span><svg class="game-icon" aria-hidden="true"><use href="#icon-next"/></svg></span>
      </div>
      <div class="schema-body">
        ${cols.map(([name, type]) =>
          `<div><span>${escapeHtml(name)}</span><span class="type-tag">${escapeHtml(type)}</span></div>`
        ).join('')}
      </div>
    </div>
  `).join('');

  panel.addEventListener('click', e => {
    const header = e.target.closest('[data-sandbox-schema-toggle]');
    if (!header) return;
    const box = header.closest('.schema-table');
    box.classList.toggle('collapsed');
    header.querySelector('span').innerHTML = box.classList.contains('collapsed')
      ? '<svg class="game-icon" aria-hidden="true"><use href="#icon-next"/></svg>'
      : '<svg class="game-icon" aria-hidden="true"><use href="#icon-collapse"/></svg>';
  });
}

function initSandboxSchemaToggle() {
  const btn = document.getElementById('btnSandboxSchemaToggle');
  const wrap = document.getElementById('sandboxSchemaWrap');
  if (!btn || !wrap) return;
  btn.addEventListener('click', () => {
    const isCollapsed = wrap.classList.toggle('collapsed');
    btn.innerHTML = isCollapsed
      ? '<svg class="game-icon" aria-hidden="true"><use href="#icon-next"/></svg> Show'
      : '<svg class="game-icon" aria-hidden="true"><use href="#icon-collapse"/></svg> Hide';
  });
}

function isSandboxMobile() {
  return window.innerWidth <= 768;
}

function initSandboxMobileTabs() {
  document.querySelectorAll('.sandbox-mobile-tab').forEach(tab => {
    tab.addEventListener('click', () => setSandboxMobileTab(tab.dataset.sandboxTab));
  });
}

function setSandboxMobileTab(name) {
  const screen = document.getElementById('sandboxScreen');
  if (!screen) return;
  screen.classList.remove('sandbox-tab-schema', 'sandbox-tab-results', 'sandbox-tab-stats');
  if (name !== 'editor') screen.classList.add('sandbox-tab-' + name);
  document.querySelectorAll('.sandbox-mobile-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.sandboxTab === name);
  });
  screen.scrollTo(0, 0);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, '');
  return String(value);
}
