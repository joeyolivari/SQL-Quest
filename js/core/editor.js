// Lightweight SQL editor highlighter.
//
// This keeps the native #sqlInput <textarea> as the real editable field so all
// existing game logic, mobile keyboard behavior, selection helpers, and form
// behavior stay stable. A highlighted <pre> layer sits underneath the textarea
// and mirrors its text. The textarea text is transparent, but its caret remains
// visible, so the user sees colored SQL while still typing into a normal field.

let textarea = null;
let highlightLayer = null;
let editorReady = false;

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL',
  'CROSS', 'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'BETWEEN',
  'LIKE', 'EXISTS', 'GROUP', 'BY', 'ORDER', 'HAVING', 'DISTINCT', 'WITH',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
  'ASC', 'DESC', 'CREATE', 'TABLE', 'INSERT', 'UPDATE', 'DELETE', 'DROP',
  'ALTER', 'VALUES', 'INTO', 'SET', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES'
]);

const SQL_FUNCTIONS = new Set([
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'COALESCE', 'LOWER', 'UPPER',
  'TRIM', 'DATE', 'CAST', 'ABS', 'LENGTH', 'SUBSTR', 'SUBSTRING'
]);

const SQL_ATOMS = new Set(['TRUE', 'FALSE', 'NULL']);

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function span(className, value) {
  return `<span class="${className}">${escapeHtml(value)}</span>`;
}

function isIdentifierStart(ch) {
  return /[A-Za-z_]/.test(ch);
}

function isIdentifierPart(ch) {
  return /[A-Za-z0-9_$]/.test(ch);
}

function consumeQuoted(sql, start, quote) {
  let i = start + 1;
  while (i < sql.length) {
    if (sql[i] === quote) {
      // SQL escapes quotes by doubling them: 'Ontario''s'
      if (sql[i + 1] === quote) { i += 2; continue; }
      i++;
      break;
    }
    i++;
  }
  return i;
}

function consumeLineComment(sql, start) {
  const end = sql.indexOf('\n', start);
  return end === -1 ? sql.length : end;
}

function consumeBlockComment(sql, start) {
  const end = sql.indexOf('*/', start + 2);
  return end === -1 ? sql.length : end + 2;
}

function consumeNumber(sql, start) {
  let i = start;
  while (i < sql.length && /[0-9]/.test(sql[i])) i++;
  if (sql[i] === '.' && /[0-9]/.test(sql[i + 1] || '')) {
    i++;
    while (i < sql.length && /[0-9]/.test(sql[i])) i++;
  }
  return i;
}

function consumeIdentifier(sql, start) {
  let i = start + 1;
  while (i < sql.length && isIdentifierPart(sql[i])) i++;
  return i;
}

function highlightSql(sql) {
  if (!sql) return '<span class="tok-comment">-- Start typing SQL...</span>';

  let out = '';
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];

    // Preserve whitespace exactly.
    if (/\s/.test(ch)) {
      out += escapeHtml(ch);
      i++;
      continue;
    }

    // Comments.
    if (ch === '-' && next === '-') {
      const end = consumeLineComment(sql, i);
      out += span('tok-comment', sql.slice(i, end));
      i = end;
      continue;
    }
    if (ch === '/' && next === '*') {
      const end = consumeBlockComment(sql, i);
      out += span('tok-comment', sql.slice(i, end));
      i = end;
      continue;
    }

    // Strings and quoted identifiers.
    if (ch === "'") {
      const end = consumeQuoted(sql, i, "'");
      out += span('tok-string', sql.slice(i, end));
      i = end;
      continue;
    }
    if (ch === '"') {
      const end = consumeQuoted(sql, i, '"');
      out += span('tok-quoted', sql.slice(i, end));
      i = end;
      continue;
    }

    // Numbers.
    if (/[0-9]/.test(ch)) {
      const end = consumeNumber(sql, i);
      out += span('tok-number', sql.slice(i, end));
      i = end;
      continue;
    }

    // Identifiers / keywords / functions.
    if (isIdentifierStart(ch)) {
      const end = consumeIdentifier(sql, i);
      const word = sql.slice(i, end);
      const upper = word.toUpperCase();
      if (SQL_KEYWORDS.has(upper)) {
        out += span('tok-keyword', word);
      } else if (SQL_FUNCTIONS.has(upper)) {
        out += span('tok-builtin', word);
      } else if (SQL_ATOMS.has(upper)) {
        out += span('tok-atom', word);
      } else {
        out += span('tok-variable', word);
      }
      i = end;
      continue;
    }

    // Operators and punctuation.
    if ('=<>!+-*/%'.includes(ch)) {
      const two = sql.slice(i, i + 2);
      if (['>=', '<=', '<>', '!=', '=='].includes(two)) {
        out += span('tok-operator', two);
        i += 2;
      } else {
        out += span('tok-operator', ch);
        i++;
      }
      continue;
    }
    if ('(),.;'.includes(ch)) {
      out += span('tok-punct', ch);
      i++;
      continue;
    }

    out += escapeHtml(ch);
    i++;
  }

  // The trailing newline keeps the mirrored layer height aligned with textarea.
  return out + (sql.endsWith('\n') ? ' ' : '');
}

function syncHighlight() {
  if (!textarea || !highlightLayer) return;
  highlightLayer.innerHTML = highlightSql(textarea.value);
  highlightLayer.scrollTop = textarea.scrollTop;
  highlightLayer.scrollLeft = textarea.scrollLeft;
}

function syncScroll() {
  if (!textarea || !highlightLayer) return;
  highlightLayer.scrollTop = textarea.scrollTop;
  highlightLayer.scrollLeft = textarea.scrollLeft;
}

export function initSqlEditor() {
  if (editorReady) { syncHighlight(); return; }

  textarea = document.getElementById('sqlInput');
  if (!textarea) return;

  const shell = document.createElement('div');
  shell.className = 'sql-highlight-editor';
  shell.setAttribute('data-sql-highlighting', 'active');

  highlightLayer = document.createElement('pre');
  highlightLayer.className = 'sql-highlight-layer';
  highlightLayer.setAttribute('aria-hidden', 'true');

  textarea.classList.add('sql-editor-native');

  textarea.parentNode.insertBefore(shell, textarea);
  shell.appendChild(highlightLayer);
  shell.appendChild(textarea);

  textarea.addEventListener('input', syncHighlight);
  textarea.addEventListener('scroll', syncScroll);
  textarea.addEventListener('keyup', syncHighlight);
  textarea.addEventListener('click', syncScroll);

  editorReady = true;
  syncHighlight();
}

export function enableSqlEditor() {
  const el = textarea || document.getElementById('sqlInput');
  if (el) {
    el.disabled = false;
    el.removeAttribute('aria-disabled');
  }
  syncHighlight();
}

export function getSqlValue() {
  const el = textarea || document.getElementById('sqlInput');
  return el ? el.value : '';
}

export function setSqlValue(text) {
  const el = textarea || document.getElementById('sqlInput');
  if (!el) return;
  el.value = text;
  syncHighlight();
}

export function focusSqlEditor() {
  const el = textarea || document.getElementById('sqlInput');
  if (el) el.focus();
}

export function insertSqlText(text, cursorBack = 0) {
  const el = textarea || document.getElementById('sqlInput');
  if (!el) return;

  const pos = el.selectionStart;
  const before = el.value.slice(0, pos);
  const after = el.value.slice(el.selectionEnd);
  const needsSpace = before.length > 0 && !/[\s(]$/.test(before);
  const insert = (needsSpace ? ' ' : '') + text;

  el.value = before + insert + after;
  const cursorPos = Math.max(0, pos + insert.length - cursorBack);
  el.selectionStart = el.selectionEnd = cursorPos;
  syncHighlight();
  el.focus();
}

export function wrapSqlCursor(open, close) {
  const el = textarea || document.getElementById('sqlInput');
  if (!el) return;

  const s = el.selectionStart;
  const end = el.selectionEnd;
  const val = el.value;

  if (s !== end) {
    const selected = val.slice(s, end);
    el.value = val.slice(0, s) + open + selected + close + val.slice(end);
    el.selectionStart = s + open.length;
    el.selectionEnd = s + open.length + selected.length;
  } else {
    let ws = s, we = s;
    while (ws > 0 && /\w/.test(val[ws - 1])) ws--;
    while (we < val.length && /\w/.test(val[we])) we++;

    if (ws < we) {
      const word = val.slice(ws, we);
      el.value = val.slice(0, ws) + open + word + close + val.slice(we);
      el.selectionStart = ws + open.length;
      el.selectionEnd = ws + open.length + word.length;
    } else {
      el.value = val.slice(0, s) + open + close + val.slice(s);
      el.selectionStart = el.selectionEnd = s + open.length;
    }
  }

  syncHighlight();
  el.focus();
}
