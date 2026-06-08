// Learn track controller.
//
// Drives the screen built by js/components/learnScreen.js: a unit/lesson map
// and a step-by-step lesson player with four step types (concept, choice, fill,
// query). It REUSES the existing engine and helpers — it does not duplicate or
// modify mission logic:
//   - createSqlHighlighter  (its own editor instance, never touches #sqlInput)
//   - executeQuery / isSafeQuery  (the live seeded sample DB)
//   - compareResults  (the same grader missions use)
//   - recordMastery*  (so Learn wins feed the existing skill dashboard)
//
// Progress is stored in its own namespace via learnProgress.js (csq_learn_v1).

import { LEARN_TRACK, getUnit, getLesson } from '../data/lessons.js';
import { createSqlHighlighter } from '../core/editor.js';
import { executeQuery, isSafeQuery } from '../core/sqlEngine.js';
import { compareResults } from '../core/validation.js';
import { recordMasteryAttempt, recordMasterySuccess } from '../learning/masteryTracker.js';
import {
  isLessonComplete, isLessonUnlocked, isUnitComplete, getUnitProgress,
  markStepResult, completeLesson, setPosition,
} from '../learning/learnProgress.js';

// ── Module state ────────────────────────────────────────────────────────────
let current = null;        // { unitId, lessonId, lesson, stepIndex }
let learnEditor = null;    // createSqlHighlighter instance for query/fill-blank steps
let staticWired = false;   // one-time wiring of the persistent buttons

// ── Small DOM helpers ───────────────────────────────────────────────────────
function $(id) { return document.getElementById(id); }

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Public entry points ─────────────────────────────────────────────────────
export function initLearnTrack() {
  if (typeof window.ensureLearnScreen === 'function') window.ensureLearnScreen();
  wireStaticButtons();
}

export function openLearnTrack() {
  if (typeof window.ensureLearnScreen === 'function') window.ensureLearnScreen();
  wireStaticButtons();

  const home = $('homeScreen');
  const game = document.querySelector('.game-container');
  const screen = $('learnScreen');
  if (home) home.style.display = 'none';
  if (game) game.style.display = 'none';
  if (screen) screen.style.display = 'flex';

  showMapView();
  renderMap();
  window.scrollTo(0, 0);
}

export function closeLearnTrack() {
  const screen = $('learnScreen');
  const home = $('homeScreen');
  if (screen) screen.style.display = 'none';
  if (home) home.style.display = 'flex';
  // Refresh the home launcher meta if app.js provided a hook.
  if (typeof window.updateLearnLaunchMeta === 'function') window.updateLearnLaunchMeta();
  window.scrollTo(0, 0);
}

// Short summary string for the home-screen launcher meta line.
export function getLearnLaunchMeta() {
  const unit = LEARN_TRACK[0];
  if (!unit) return '';
  const { done, total } = getUnitProgress(unit);
  if (done === 0) return 'Start here · ' + total + ' lessons';
  if (done >= total) return 'Foundations complete ✓';
  return done + '/' + total + ' lessons done';
}

// Expose for the component fallback + cross-module calls.
window.openLearnTrack = openLearnTrack;
window.closeLearnTrack = closeLearnTrack;

// ── View toggling ───────────────────────────────────────────────────────────
function showMapView() {
  const map = $('learnMapView');
  const player = $('learnPlayerView');
  if (map) map.style.display = 'block';
  if (player) player.style.display = 'none';
}

function showPlayerView() {
  const map = $('learnMapView');
  const player = $('learnPlayerView');
  if (map) map.style.display = 'none';
  if (player) player.style.display = 'block';
}

// ── Map rendering ───────────────────────────────────────────────────────────
function renderMap() {
  const host = $('learnUnits');
  if (!host) return;

  host.innerHTML = LEARN_TRACK.map(unit => {
    const { done, total, pct } = getUnitProgress(unit);
    const complete = isUnitComplete(unit);

    const nodes = unit.lessons.map((lesson, idx) => {
      const doneLesson = isLessonComplete(lesson.id);
      const unlocked = isLessonUnlocked(unit, idx);
      const isCurrent = unlocked && !doneLesson;
      const stateClass = doneLesson ? 'is-complete' : (isCurrent ? 'is-current' : 'is-locked');
      const badge = doneLesson ? '✓' : (unlocked ? (idx + 1) : '🔒');
      const attrs = unlocked
        ? `data-learn-unit="${escapeHtml(unit.id)}" data-learn-lesson="${escapeHtml(lesson.id)}"`
        : 'aria-disabled="true"';
      return `
        <button type="button" class="learn-node ${stateClass}" ${attrs}>
          <span class="learn-node-dot">${badge}</span>
          <span class="learn-node-title">${escapeHtml(lesson.title)}</span>
        </button>`;
    }).join('');

    const graduate = complete && unit.graduatesTo != null
      ? `<button type="button" class="btn-lg btn-primary learn-graduate" data-learn-graduate="${escapeHtml(String(unit.graduatesTo))}">&#9654; Start Mission ${escapeHtml(String(unit.graduatesTo))}</button>`
      : '';

    return `
      <div class="learn-unit-card ${complete ? 'is-unit-complete' : ''}">
        <div class="learn-unit-head">
          <span class="learn-unit-icon">${escapeHtml(unit.icon || '📘')}</span>
          <div class="learn-unit-meta">
            <h3>${escapeHtml(unit.title)}</h3>
            <p>${escapeHtml(unit.subtitle || '')}</p>
          </div>
          <span class="learn-unit-count">${done}/${total}</span>
        </div>
        <div class="learn-unit-track"><span class="learn-unit-fill" style="width:${pct}%"></span></div>
        <div class="learn-path">${nodes}</div>
        ${graduate}
      </div>`;
  }).join('');
}

// ── Lesson player ───────────────────────────────────────────────────────────
function startLesson(unitId, lessonId) {
  const lesson = getLesson(unitId, lessonId);
  if (!lesson) return;
  current = { unitId, lessonId, lesson, stepIndex: 0 };
  setPosition(unitId, lessonId, 0);
  showPlayerView();
  renderStep();
}

function renderStep() {
  if (!current) return;
  const { lesson, stepIndex } = current;
  const step = lesson.steps[stepIndex];
  if (!step) { finishLesson(); return; }

  // Title + progress bar.
  const titleEl = $('learnLessonTitle');
  if (titleEl) titleEl.textContent = lesson.title;
  const total = lesson.steps.length;
  const pct = Math.round((stepIndex / total) * 100);
  const fill = $('learnProgressFill');
  if (fill) fill.style.width = pct + '%';
  const label = $('learnProgressLabel');
  if (label) label.textContent = (stepIndex + 1) + ' / ' + total;

  // Reset feedback + buttons.
  hideFeedback();
  const checkBtn = $('btnLearnCheck');
  const continueBtn = $('btnLearnContinue');
  const hintBtn = $('btnLearnHint');
  if (continueBtn) continueBtn.hidden = true;

  const host = $('learnStepHost');
  if (!host) return;

  if (step.type === 'concept') {
    host.innerHTML = renderConcept(step);
    if (checkBtn) checkBtn.hidden = true;
    if (continueBtn) continueBtn.hidden = false;
    if (hintBtn) hintBtn.hidden = true;
  } else if (step.type === 'choice') {
    host.innerHTML = renderChoice(step);
    if (checkBtn) { checkBtn.hidden = false; checkBtn.disabled = true; }
    if (hintBtn) hintBtn.hidden = true;
  } else if (step.type === 'fill') {
    host.innerHTML = renderFill(step);
    if (checkBtn) { checkBtn.hidden = false; checkBtn.disabled = false; }
    if (hintBtn) hintBtn.hidden = !step.hint;
  } else if (step.type === 'query') {
    host.innerHTML = renderQuery(step);
    if (checkBtn) { checkBtn.hidden = false; checkBtn.disabled = false; }
    if (hintBtn) hintBtn.hidden = !step.hint;
    mountQueryEditor(step);
  }

  window.scrollTo(0, 0);
}

function renderConcept(step) {
  return `
    <div class="learn-step-card learn-concept">
      <h4 class="learn-step-title">${escapeHtml(step.title || '')}</h4>
      <p class="learn-concept-body">${escapeHtml(step.body || '')}</p>
      ${step.example ? `<pre class="learn-example">${escapeHtml(step.example)}</pre>` : ''}
      ${step.eli12 ? `<div class="learn-eli12"><span class="learn-eli12-label">Like you're 12</span>${escapeHtml(step.eli12)}</div>` : ''}
    </div>`;
}

function renderChoice(step) {
  const choices = step.choices.map((c, i) =>
    `<button type="button" class="learn-choice" data-choice-index="${i}">${escapeHtml(c)}</button>`
  ).join('');
  return `
    <div class="learn-step-card">
      <p class="learn-prompt">${escapeHtml(step.prompt)}</p>
      <div class="learn-choices">${choices}</div>
    </div>`;
}

function renderFill(step) {
  // Replace {{n}} tokens with inline inputs.
  const html = escapeHtml(step.template).replace(/\{\{(\d+)\}\}/g, (m, n) =>
    `<input type="text" class="learn-blank" data-blank-index="${n}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" />`
  );
  return `
    <div class="learn-step-card">
      <p class="learn-prompt">${escapeHtml(step.prompt)}</p>
      <pre class="learn-fill-template">${html}</pre>
    </div>`;
}

function renderQuery(step) {
  return `
    <div class="learn-step-card">
      <p class="learn-prompt">${escapeHtml(step.prompt)}</p>
      <textarea id="learnQueryInput" class="learn-query-input" rows="5" spellcheck="false" autocapitalize="off" autocorrect="off"></textarea>
      <div id="learnQueryResult" class="learn-query-result" hidden></div>
    </div>`;
}

function mountQueryEditor(step) {
  // Reuse one highlighter instance; the textarea id is recreated each render,
  // so always (re)wrap the current element and seed the starter SQL.
  learnEditor = createSqlHighlighter('learnQueryInput');
  if (learnEditor) {
    learnEditor.setValue(step.starterSQL || '');
    learnEditor.focus();
  }
}

// ── Checking ────────────────────────────────────────────────────────────────
function onCheck() {
  if (!current) return;
  const step = current.lesson.steps[current.stepIndex];
  if (!step) return;

  if (step.type === 'choice') return checkChoice(step);
  if (step.type === 'fill') return checkFill(step);
  if (step.type === 'query') return checkQuery(step);
}

function checkChoice(step) {
  const host = $('learnStepHost');
  const selected = host?.querySelector('.learn-choice.is-selected');
  if (!selected) return;
  const idx = Number(selected.dataset.choiceIndex);
  const ok = idx === step.answerIndex;

  host.querySelectorAll('.learn-choice').forEach((btn, i) => {
    btn.disabled = true;
    if (i === step.answerIndex) btn.classList.add('is-correct');
    else if (i === idx) btn.classList.add('is-wrong');
  });

  resolveStep(ok, ok ? (step.explain || 'Correct!') : (step.explain || 'Not quite — see the highlighted answer.'));
}

function normalize(value) {
  return String(value).trim().replace(/\s+/g, ' ');
}

function checkFill(step) {
  const host = $('learnStepHost');
  const inputs = [...host.querySelectorAll('.learn-blank')];
  let allOk = true;

  inputs.forEach(input => {
    const i = Number(input.dataset.blankIndex);
    const blank = step.blanks[i];
    const raw = normalize(input.value);
    const accepted = (blank?.accept || []).some(a =>
      step.caseSensitive ? normalize(a) === raw : normalize(a).toLowerCase() === raw.toLowerCase()
    );
    input.classList.toggle('is-correct', accepted);
    input.classList.toggle('is-wrong', !accepted);
    if (!accepted) allOk = false;
  });

  if (allOk) {
    inputs.forEach(i => { i.disabled = true; });
    resolveStep(true, step.explain || 'Correct!');
  } else {
    resolveStep(false, step.hint ? 'Not quite. Hint: ' + step.hint : 'Not quite — check the highlighted blanks and try again.', { retry: true });
  }
}

function checkQuery(step) {
  const sql = (learnEditor ? learnEditor.getValue() : ($('learnQueryInput')?.value || '')).trim();
  if (!sql) {
    return resolveStep(false, 'Write a query first.', { retry: true });
  }
  if (!isSafeQuery(sql)) {
    return resolveStep(false, 'Only SELECT / WITH queries are allowed here.', { retry: true });
  }

  let userResult, expected;
  try {
    userResult = executeQuery(sql);
    expected = executeQuery(step.solutionSQL);
  } catch (err) {
    return resolveStep(false, 'SQL error: ' + (err && err.message ? err.message : 'check your syntax.'), { retry: true });
  }

  const { ok, message } = compareResults(userResult, expected, step.requiredColumns, step.orderMatters);
  renderQueryResult(userResult);
  resolveStep(ok, ok ? (step.explain || 'Correct!') : message, { retry: !ok });
}

function renderQueryResult(result) {
  const panel = $('learnQueryResult');
  if (!panel) return;
  panel.hidden = false;
  if (!result.columns.length || !result.rows.length) {
    panel.innerHTML = '<div class="learn-query-empty">Query ran — 0 rows returned.</div>';
    return;
  }
  const rows = result.rows.slice(0, 8);
  const thead = result.columns.map(c => `<th>${escapeHtml(c)}</th>`).join('');
  const tbody = rows.map(r => '<tr>' + r.map(v => `<td>${escapeHtml(v === null ? 'NULL' : v)}</td>`).join('') + '</tr>').join('');
  const more = result.rows.length > rows.length ? `<div class="learn-query-more">+ ${result.rows.length - rows.length} more rows</div>` : '';
  panel.innerHTML = `<table class="learn-result-table"><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table>${more}`;
}

// Show feedback + flip Check/Continue. `retry` keeps Check available on a wrong answer.
function resolveStep(ok, message, options = {}) {
  showFeedback(ok, message);
  if (current) markStepResult(current.lessonId, current.stepIndex, ok ? 'correct' : 'wrong');

  const checkBtn = $('btnLearnCheck');
  const continueBtn = $('btnLearnContinue');
  if (ok) {
    if (checkBtn) checkBtn.hidden = true;
    if (continueBtn) continueBtn.hidden = false;
  } else if (!options.retry) {
    // choice steps are single-shot: reveal the answer and let them move on
    if (checkBtn) checkBtn.hidden = true;
    if (continueBtn) continueBtn.hidden = false;
  }
}

function onContinue() {
  if (!current) return;
  current.stepIndex += 1;
  if (current.stepIndex >= current.lesson.steps.length) {
    finishLesson();
    return;
  }
  setPosition(current.unitId, current.lessonId, current.stepIndex);
  renderStep();
}

function finishLesson() {
  if (!current) return;
  const { unitId, lesson } = current;
  completeLesson(lesson.id);

  // Feed the existing concept-mastery dashboard (does not affect mission scoring).
  if (Array.isArray(lesson.concepts) && lesson.concepts.length) {
    try {
      recordMasteryAttempt(lesson.concepts);
      recordMasterySuccess(lesson.concepts);
    } catch (e) {}
  }

  current = null;
  showMapView();
  renderMap();
  if (typeof window.updateLearnLaunchMeta === 'function') window.updateLearnLaunchMeta();
}

// ── Feedback banner ─────────────────────────────────────────────────────────
function showFeedback(ok, message) {
  const el = $('learnFeedback');
  if (!el) return;
  el.hidden = false;
  el.className = 'learn-feedback ' + (ok ? 'is-correct' : 'is-wrong');
  el.innerHTML = `<span class="learn-feedback-icon">${ok ? '✓' : '✕'}</span><span>${escapeHtml(message)}</span>`;
}

function hideFeedback() {
  const el = $('learnFeedback');
  if (el) { el.hidden = true; el.innerHTML = ''; }
}

// ── One-time wiring of persistent buttons + delegated step interactions ──────
function wireStaticButtons() {
  if (staticWired) return;
  staticWired = true;

  // Delegate clicks within the Learn screen (handles re-rendered content).
  document.addEventListener('click', event => {
    // Open a lesson node from the map.
    const node = event.target.closest('.learn-node[data-learn-lesson]');
    if (node) {
      startLesson(node.dataset.learnUnit, node.dataset.learnLesson);
      return;
    }

    // Graduate to the first real mission.
    const grad = event.target.closest('[data-learn-graduate]');
    if (grad) {
      const missionId = grad.dataset.learnGraduate;
      closeLearnTrack();
      if (typeof window.launchMissionById === 'function') window.launchMissionById(Number(missionId));
      return;
    }

    // Select a multiple-choice option (before checking).
    const choice = event.target.closest('#learnScreen .learn-choice:not([disabled])');
    if (choice) {
      const hostEl = $('learnStepHost');
      hostEl?.querySelectorAll('.learn-choice').forEach(b => b.classList.remove('is-selected'));
      choice.classList.add('is-selected');
      const checkBtn = $('btnLearnCheck');
      if (checkBtn) checkBtn.disabled = false;
      return;
    }

    // Persistent action buttons.
    if (event.target.closest('#btnLearnCheck')) { onCheck(); return; }
    if (event.target.closest('#btnLearnContinue')) { onContinue(); return; }
    if (event.target.closest('#btnLearnExitLesson')) { current = null; showMapView(); renderMap(); return; }
    if (event.target.closest('#btnLearnHint')) {
      const step = current?.lesson.steps[current.stepIndex];
      if (step?.hint) showFeedback(false, 'Hint: ' + step.hint);
      return;
    }
  });

  // Ctrl/Cmd+Enter checks the current step (matches the missions editor).
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const screen = $('learnScreen');
      const player = $('learnPlayerView');
      if (screen && screen.style.display !== 'none' && player && player.style.display !== 'none') {
        const checkBtn = $('btnLearnCheck');
        if (checkBtn && !checkBtn.hidden && !checkBtn.disabled) onCheck();
      }
    }
  });
}
