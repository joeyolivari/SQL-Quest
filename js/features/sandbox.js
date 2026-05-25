import { createSandboxDatabase, executeSandboxQuery } from '../core/sqlEngine.js';
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

let sandboxDb = null;
let isReady = false;

export function initSandboxLab() {
  bindSandboxEvents();
  initSandboxTabs();
  renderSandboxSchema();
  renderUsageStats(loadSqlUsageStats());
  renderSandboxEmptyState();
  resetSandboxDatabase({ quiet: true });
}

export function openSandboxLab() {
  document.getElementById('homeScreen').style.display = 'none';
  document.querySelector('.game-container').style.display = 'none';
  const lab = document.getElementById('sandboxScreen');
  lab.style.display = 'flex';
  setSandboxTab('editor');
  // Body scrolls on mobile (home screen is long), so reset body scroll not just element scroll
  window.scrollTo(0, 0);
  lab.scrollTop = 0;
  // Skip auto-focus on mobile: virtual keyboard pops up and fights the scroll-to-top
  if (window.innerWidth > 768) {
    document.getElementById('sandboxSqlInput')?.focus();
  }
}

export function closeSandboxLab() {
  document.getElementById('sandboxScreen').style.display = 'none';
  document.getElementById('homeScreen').style.display = 'flex';
  window.scrollTo(0, 0);
}

function initSandboxTabs() {
  document.querySelectorAll('[data-sandbox-tab]').forEach(tab => {
    tab.addEventListener('click', () => setSandboxTab(tab.dataset.sandboxTab));
  });
}

function setSandboxTab(name) {
  document.querySelectorAll('[data-sandbox-tab]').forEach(t => {
    t.classList.toggle('active', t.dataset.sandboxTab === name);
  });
  const paneId = 'sandboxPane' + name.charAt(0).toUpperCase() + name.slice(1);
  document.querySelectorAll('.sandbox-pane').forEach(p => {
    p.classList.toggle('active', p.id === paneId);
  });
}

function renderSandboxSchema() {
  const panel = document.getElementById('sandboxSchemaPanel');
  if (!panel) return;
  panel.innerHTML = Object.entries(schema).map(([table, cols]) => `
    <div class="schema-table">
      <div class="schema-header" data-sb-schema-toggle>
        ${escapeHtml(table)} <span>&#9660;</span>
      </div>
      <div class="schema-body">
        ${cols.map(([name, type]) =>
          `<div><span>${escapeHtml(name)}</span><span class="type-tag">${escapeHtml(type)}</span></div>`
        ).join('')}
      </div>
    </div>
  `).join('');
  panel.addEventListener('click', e => {
    const header = e.target.closest('[data-sb-schema-toggle]');
    if (!header) return;
    const box = header.closest('.schema-table');
    box.classList.toggle('collapsed');
    header.querySelector('span').textContent = box.classList.contains('collapsed') ? '▶' : '▼';
  });
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
        document.getElementById('sandboxSqlInput').value = query;
        document.getElementById('sandboxSqlInput').focus();
      }
    });
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

function runSandboxQuery() {
  const editor = document.getElementById('sandboxSqlInput');
  const sql = editor.value.trim();
  if (!sql) {
    renderSandboxEmptyState('Add a query or pick a Try this chip to begin.');
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
  if (window.innerWidth <= 768) setSandboxTab('results');
}

function clearSandboxEditor() {
  document.getElementById('sandboxSqlInput').value = '';
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
