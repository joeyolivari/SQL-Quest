// SQL editor powered by CodeMirror 6 (vendored locally in js/lib/codemirror-sql.js
// so the game keeps working offline / on GitHub Pages with no CDN dependency).
//
// The exported helpers (getSqlValue / setSqlValue / focusSqlEditor /
// insertSqlText / wrapSqlCursor) are the single source of truth the rest of the
// app uses to talk to the editor. If CodeMirror fails to load for any reason,
// every helper transparently falls back to the original #sqlInput <textarea>.

import {
  EditorView, EditorState, keymap, lineNumbers, highlightActiveLine,
  highlightActiveLineGutter, drawSelection, highlightSpecialChars,
  defaultKeymap, history, historyKeymap, indentWithTab,
  syntaxHighlighting, HighlightStyle, bracketMatching, indentOnInput,
  sql, SQLite, tags as t,
} from '../lib/codemirror-sql.js';

let view = null;       // the live CodeMirror 6 EditorView (null until init / on failure)
let cmReady = false;

// Stable token classes so colors can be themed (and flipped for light mode) in
// css/editor.css instead of being hard-coded inline by CodeMirror.
const sqlHighlight = HighlightStyle.define([
  { tag: t.keyword,                 class: 'tok-keyword' },
  { tag: t.operatorKeyword,         class: 'tok-keyword' },
  { tag: t.modifier,                class: 'tok-keyword' },
  { tag: t.string,                  class: 'tok-string' },
  { tag: t.special(t.string),       class: 'tok-string' },
  { tag: t.number,                  class: 'tok-number' },
  { tag: t.bool,                    class: 'tok-atom' },
  { tag: t.null,                    class: 'tok-atom' },
  { tag: t.lineComment,             class: 'tok-comment' },
  { tag: t.blockComment,            class: 'tok-comment' },
  { tag: t.comment,                 class: 'tok-comment' },
  { tag: t.operator,                class: 'tok-operator' },
  { tag: t.punctuation,             class: 'tok-punct' },
  { tag: t.typeName,                class: 'tok-type' },
  { tag: t.function(t.variableName),class: 'tok-builtin' },
  { tag: t.standard(t.name),        class: 'tok-builtin' },
  { tag: t.variableName,            class: 'tok-variable' },
  { tag: t.name,                    class: 'tok-variable' },
]);

function buildExtensions() {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    highlightSpecialChars(),
    history(),
    drawSelection(),
    indentOnInput(),
    bracketMatching(),
    EditorView.lineWrapping,
    sql({ dialect: SQLite, upperCaseKeywords: false }),
    syntaxHighlighting(sqlHighlight),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
  ];
}

export function initSqlEditor() {
  if (cmReady) return;
  const textarea = document.getElementById('sqlInput');
  if (!textarea) return;
  try {
    view = new EditorView({
      state: EditorState.create({
        doc: textarea.value,
        extensions: buildExtensions(),
      }),
    });
    // Drop the CodeMirror DOM right where the textarea sat, then hide the
    // textarea (kept in the DOM purely as a fallback / value mirror).
    textarea.insertAdjacentElement('afterend', view.dom);
    textarea.style.display = 'none';
    textarea.setAttribute('aria-hidden', 'true');
    textarea.setAttribute('tabindex', '-1');
    cmReady = true;
  } catch (e) {
    // Leave the textarea visible and usable if CodeMirror could not start.
    view = null;
    cmReady = false;
  }
}

export function enableSqlEditor() {
  // CodeMirror is editable from creation; nothing to toggle. Keep the textarea
  // fallback in sync so Run/Check work even before the editor is built.
  const el = document.getElementById('sqlInput');
  if (el) el.disabled = false;
}

export function getSqlValue() {
  if (view) return view.state.doc.toString();
  const el = document.getElementById('sqlInput');
  return el ? el.value : '';
}

export function setSqlValue(text) {
  if (view) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: text },
      selection: { anchor: text.length },
    });
    return;
  }
  const el = document.getElementById('sqlInput');
  if (el) el.value = text;
}

export function focusSqlEditor() {
  if (view) { view.focus(); return; }
  const el = document.getElementById('sqlInput');
  if (el) el.focus();
}

export function insertSqlText(text, cursorBack = 0) {
  if (view) {
    const sel = view.state.selection.main;
    const before = view.state.doc.sliceString(0, sel.from);
    const needsSpace = before.length > 0 && !/[\s(]$/.test(before);
    const insert = (needsSpace ? ' ' : '') + text;
    const cursorPos = sel.from + insert.length - cursorBack;
    view.dispatch({
      changes: { from: sel.from, to: sel.to, insert },
      selection: { anchor: Math.max(0, cursorPos) },
    });
    view.focus();
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
  if (view) {
    const sel = view.state.selection.main;
    if (!sel.empty) {
      const selected = view.state.doc.sliceString(sel.from, sel.to);
      view.dispatch({
        changes: { from: sel.from, to: sel.to, insert: open + selected + close },
        selection: { anchor: sel.from + open.length, head: sel.from + open.length + selected.length },
      });
    } else {
      const pos = sel.from;
      const line = view.state.doc.lineAt(pos);
      const text = line.text;
      const col = pos - line.from;
      let ws = col, we = col;
      while (ws > 0 && /\w/.test(text[ws - 1])) ws--;
      while (we < text.length && /\w/.test(text[we])) we++;
      if (ws < we) {
        const from = line.from + ws, to = line.from + we;
        const word = text.slice(ws, we);
        view.dispatch({
          changes: { from, to, insert: open + word + close },
          selection: { anchor: from + open.length, head: from + open.length + word.length },
        });
      } else {
        view.dispatch({
          changes: { from: pos, to: pos, insert: open + close },
          selection: { anchor: pos + open.length },
        });
      }
    }
    view.focus();
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
