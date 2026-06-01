let cm = null;
let cmReady = false;

export function initSqlEditor() {
  if (cmReady) return;
  const textarea = document.getElementById('sqlInput');
  if (!textarea || typeof window.CodeMirror === 'undefined') return;
  try {
    cm = window.CodeMirror.fromTextArea(textarea, {
      mode: 'text/x-sql',
      lineNumbers: true,
      tabSize: 2,
      indentWithTabs: false,
      lineWrapping: true,
    });
    cmReady = true;
  } catch (e) {
    cm = null;
  }
}

export function enableSqlEditor() {
  if (!cm) return;
  cm.setOption('readOnly', false);
}

export function getSqlValue() {
  if (cm) return cm.getValue();
  const el = document.getElementById('sqlInput');
  return el ? el.value : '';
}

export function setSqlValue(text) {
  if (cm) { cm.setValue(text); return; }
  const el = document.getElementById('sqlInput');
  if (el) el.value = text;
}

export function focusSqlEditor() {
  if (cm) { cm.focus(); return; }
  const el = document.getElementById('sqlInput');
  if (el) el.focus();
}

export function insertSqlText(text, cursorBack = 0) {
  if (cm) {
    const before = cm.getValue().slice(0, cm.getDoc().indexFromPos(cm.getCursor()));
    const needsSpace = before.length > 0 && !/[\s(]$/.test(before);
    const insert = (needsSpace ? ' ' : '') + text;
    cm.replaceSelection(insert, 'end');
    if (cursorBack > 0) {
      const c = cm.getCursor();
      cm.setCursor({ line: c.line, ch: Math.max(0, c.ch - cursorBack) });
    }
    cm.focus();
    return;
  }
  const el = document.getElementById('sqlInput');
  if (!el) return;
  const pos = el.selectionStart;
  const before = el.value.slice(0, pos);
  const after = el.value.slice(pos);
  const needsSpace = before.length > 0 && !/[\s(]$/.test(before);
  const str = (needsSpace ? ' ' : '') + text;
  el.value = before + str + after;
  el.selectionStart = el.selectionEnd = pos + str.length - cursorBack;
  el.focus();
}

export function wrapSqlCursor(open, close) {
  if (cm) {
    const doc = cm.getDoc();
    if (doc.somethingSelected()) {
      doc.replaceSelection(open + doc.getSelection() + close);
    } else {
      const cursor = doc.getCursor();
      const line = doc.getLine(cursor.line);
      let ws = cursor.ch, we = cursor.ch;
      while (ws > 0 && /\w/.test(line[ws - 1])) ws--;
      while (we < line.length && /\w/.test(line[we])) we++;
      if (ws < we) {
        const from = { line: cursor.line, ch: ws };
        const to   = { line: cursor.line, ch: we };
        const word = doc.getRange(from, to);
        doc.replaceRange(open + word + close, from, to);
        doc.setSelection(
          { line: cursor.line, ch: ws + open.length },
          { line: cursor.line, ch: ws + open.length + word.length }
        );
      } else {
        doc.replaceRange(open + close, cursor);
        doc.setCursor({ line: cursor.line, ch: cursor.ch + open.length });
      }
    }
    cm.focus();
    return;
  }
  const el = document.getElementById('sqlInput');
  if (!el) return;
  const s = el.selectionStart, end = el.selectionEnd;
  const val = el.value;
  if (s !== end) {
    el.value = val.slice(0, s) + open + val.slice(s, end) + close + val.slice(end);
    el.selectionStart = s; el.selectionEnd = end + 2;
  } else {
    let ws = s, we = s;
    while (ws > 0 && /\w/.test(val[ws - 1])) ws--;
    while (we < val.length && /\w/.test(val[we])) we++;
    if (ws < we) {
      el.value = val.slice(0, ws) + open + val.slice(ws, we) + close + val.slice(we);
      el.selectionStart = ws; el.selectionEnd = we + 2;
    } else {
      el.value = val.slice(0, s) + open + close + val.slice(s);
      el.selectionStart = el.selectionEnd = s + 1;
    }
  }
  el.focus();
}
