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

import { getDueLearnReviews, scheduleLearnReview, recordLearnReview, markLearnReviewSupported } from '../learning/learnReview.js';
import { schema } from '../data/schema.js';
import { LEARN_TRACK, getUnit, getLesson } from '../data/lessons.js';
import { createSqlHighlighter } from '../core/editor.js';
import { executeQuery, isSafeQuery } from '../core/sqlEngine.js';
import { compareResults } from '../core/validation.js';
import { recordLearnAnswer, recordLearnHint } from '../learning/learnAssessment.js';
import {
  isLessonComplete, isLessonUnlocked, isUnitComplete, getUnitProgress,
  completeLesson, setPosition, getPosition, clearPosition, isLessonPassed, isUnitUnlocked, saveDraft, getDraft, clearDraft,
} from '../learning/learnProgress.js';

// ── Module state ────────────────────────────────────────────────────────────
let current = null;        // { unitId, lessonId, lesson, stepIndex }
let learnEditor = null;    // createSqlHighlighter instance for query/fill-blank steps
let reviewQueue = [];
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
  const position = getPosition();
  if (position && !isLessonComplete(position.lessonId)) startLesson(position.unitId, position.lessonId);
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
  const total = LEARN_TRACK.reduce((n, u) => n + u.lessons.length, 0);
  const done = LEARN_TRACK.reduce((n, u) => n + getUnitProgress(u).done, 0);
  return done === total ? 'Tutorial complete ✓' : `${done}/${total} lessons done`;

}

// Expose for the component fallback + cross-module calls.
window.openLearnTrack = openLearnTrack;
window.closeLearnTrack = closeLearnTrack;

// ── View toggling ───────────────────────────────────────────────────────────
function showMapView() {
  const map = $('learnMapView');
  const player = $('learnPlayerView');
  const hero = $('learnHero');
  if (map) map.style.display = 'block';
  if (player) player.style.display = 'none';
  if (hero) hero.style.display = '';
}

function showPlayerView() {
  const map = $('learnMapView');
  const player = $('learnPlayerView');
  const hero = $('learnHero');
  if (map) map.style.display = 'none';
  if (player) player.style.display = 'block';
  if (hero) hero.style.display = 'none';
}

// ── Map rendering ───────────────────────────────────────────────────────────
function renderMap() {
  const host = $('learnUnits');
  if (!host) return;

  const due = getDueLearnReviews(LEARN_TRACK, isLessonComplete);
  const review = `<aside class="learn-review-card"><div><h3>Recall desk</h3><p>${due.length ? 'A short mixed review is ready. Try remembering before using hints.' : 'No review is due. Keep learning; completed query lessons return for practice later.'}</p><p class="learn-review-note">Optional and untimed. Suggested gaps: 1, 3, 7, 14, then 30 days.</p></div>${due.length ? '<button type="button" class="btn-lg btn-primary" data-learn-review="true">Review ' + due.length + ' questions</button>' : ''}</aside>`;
  host.innerHTML = review + LEARN_TRACK.map((unit, unitIndex) => {
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
        : 'disabled aria-disabled="true"';
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
        ${!isUnitUnlocked(unit) ? `<p class="learn-unit-prerequisite">Complete ${escapeHtml(LEARN_TRACK[unitIndex - 1]?.title || 'the earlier units')} first.</p>` : ''}
        <div class="learn-path">${nodes}</div>
        ${graduate}
      </div>`;
  }).join('');
}

// ── Lesson player ───────────────────────────────────────────────────────────
function startLesson(unitId, lessonId) {
  const lesson = getLesson(unitId, lessonId);
  const unit = getUnit(unitId);
  if (!lesson || !unit || !isLessonUnlocked(unit, unit.lessons.indexOf(lesson))) return;
  const position = getPosition();
  const stepIndex = !isLessonComplete(lessonId) && position?.lessonId === lessonId
    ? Math.min(Math.max(Number.isInteger(position.stepIndex) ? position.stepIndex : 0, 0), lesson.steps.length - 1) : 0;
  current = { unitId, lessonId, lesson, stepIndex };
  setPosition(unitId, lessonId, stepIndex);
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
  const stage = $('learnStepPhase');
  if (stage) stage.textContent = step.phase || (current.mode === 'review' ? 'Retrieve' : 'Practice');
  const label = $('learnProgressLabel');
  if (label) label.textContent = (stepIndex + 1) + ' / ' + total;

  current.hintIndex = 0;
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
    if (hintBtn) hintBtn.hidden = !(step.hint || step.hintSteps?.length);
  } else if (step.type === 'query') {
    host.innerHTML = renderQuery(step);
    if (checkBtn) { checkBtn.hidden = false; checkBtn.disabled = false; }
    if (hintBtn) hintBtn.hidden = !(step.hint || step.hintSteps?.length);
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
      ${renderPrediction(step)}
      <div class="learn-choices">${choices}</div>
    </div>`;
}


function renderPrediction(step) {
  const samples = [step.sample, ...(step.relatedSamples || [])].filter(Boolean);
  const table = samples.map(sample => `<div class="learn-preview-scroll"><table class="learn-result-table"><caption>Small example: ${escapeHtml(sample.name)}</caption><thead><tr>${sample.columns.map(c => `<th scope="col">${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${sample.rows.map(row => `<tr>${row.map(v => `<td>${escapeHtml(v === null ? 'NULL' : v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`).join('');
  return table + (step.example ? `<pre class="learn-example">${escapeHtml(step.example)}</pre>` : '');
}

function beginReview() {
  reviewQueue = getDueLearnReviews(LEARN_TRACK, isLessonComplete);
  showNextReview();
}

function showNextReview() {
  const item = reviewQueue.shift();
  if (!item) { current = null; showMapView(); renderMap(); return; }
  current = {
    mode: 'review', unitId: item.unitId, sourceLessonId: item.lesson.id,
    lessonId: 'review:' + item.lesson.id,
    lesson: { ...item.lesson, title: 'Recall: ' + item.lesson.title, steps: [item.question] },
    stepIndex: 0, assisted: false
  };
  showPlayerView();
  renderStep();
}

function renderFill(step) {
  // Replace {{n}} tokens with inline inputs.
  const html = escapeHtml(step.template).replace(/\{\{(\d+)\}\}/g, (m, n) =>
    `<input type="text" aria-label="Blank ${Number(n) + 1}" class="learn-blank" data-blank-index="${n}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" />`
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
      <details class="learn-data-preview"><summary>Explore the tables and sample data</summary>
        <div id="learnTablePreview"></div>
      </details>
      <label for="learnQueryInput" class="learn-query-label">Your SQL query</label>
      <textarea id="learnQueryInput" class="learn-query-input" rows="5" spellcheck="false" autocapitalize="off" autocorrect="off"></textarea>
      <div id="learnQueryResult" class="learn-query-result" hidden></div>
    </div>`;
}

function mountQueryEditor(step) {
  // Reuse one highlighter instance; the textarea id is recreated each render,
  // so always (re)wrap the current element and seed the starter SQL.
  learnEditor = createSqlHighlighter('learnQueryInput');
  if (learnEditor) {
    learnEditor.setValue(getDraft(current.lessonId, current.stepIndex) ?? step.starterSQL ?? '');
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

  if (!ok) return resolveStep(false, 'Try again. ' + (step.choiceFeedback?.[idx] || step.explain || 'Trace the rows and try once more.'));

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
    resolveStep(false, step.hint ? 'Not quite. Hint: ' + step.hint : 'Not quite — check the highlighted blanks and try again.');
  }
}

function checkQuery(step) {
  const sql = (learnEditor ? learnEditor.getValue() : ($('learnQueryInput')?.value || '')).trim();
  if (!sql) {
    return resolveStep(false, 'Write a query first.');
  }
  if (!isSafeQuery(sql)) {
    return resolveStep(false, 'Only SELECT / WITH queries are allowed here.');
  }

  let userResult, expected;
  try {
    userResult = executeQuery(sql);
    expected = executeQuery(step.solutionSQL);
  } catch (err) {
    return resolveStep(false, 'SQL error: ' + (err && err.message ? err.message : 'check your syntax.'));
  }

  const { ok, message } = compareResults(userResult, expected, step.requiredColumns, step.orderMatters);
  renderQueryResult(userResult);
  resolveStep(ok, ok ? (step.explain || 'Correct!') : message);
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

// Wrong answers keep Check available; correct answers unlock Continue.
function resolveStep(ok, message) {
  showFeedback(ok, message);
  if (current?.mode === 'review') {
    if (!ok) { current.assisted = true; markLearnReviewSupported(current.sourceLessonId); }
  } else if (current) recordLearnAnswer(current.lesson, current.stepIndex, ok);

  const checkBtn = $('btnLearnCheck');
  const continueBtn = $('btnLearnContinue');
  if (ok) {
    const step = current?.lesson.steps[current.stepIndex];
    if (step?.explanationPrompt) {
      const reflection = document.createElement('p');
      reflection.className = 'learn-reflection';
      reflection.textContent = 'Explain it to yourself: ' + step.explanationPrompt;
      $('learnFeedback')?.appendChild(reflection);
    }
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
  if (current.mode !== 'review') setPosition(current.unitId, current.lessonId, current.stepIndex);
  renderStep();
}

function finishLesson() {
  if (!current) return;
  if (current.mode === 'review') {
    recordLearnReview(current.sourceLessonId, { correct: true, assisted: current.assisted });
    clearDraft(current.lessonId);
    showNextReview();
    return;
  }
  const { lesson } = current;
  if (!isLessonComplete(lesson.id) && !isLessonPassed(lesson)) return;
  completeLesson(lesson.id);
  scheduleLearnReview(lesson.id);
  clearPosition();

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
    if (event.target.closest('[data-learn-review]')) { beginReview(); return; }

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
    if (event.target.closest('#btnLearnExitLesson')) { reviewQueue = []; current = null; showMapView(); renderMap(); return; }
    if (event.target.closest('#btnLearnHint')) {
      const step = current?.lesson.steps[current.stepIndex];
      const hints = step?.hintSteps?.length ? step.hintSteps : step?.hint ? [step.hint] : [];
      if (hints.length) {
        if (current.mode === 'review') { current.assisted = true; markLearnReviewSupported(current.sourceLessonId); }
        else recordLearnHint(current.lesson, current.stepIndex);
        const index = Math.min(current.hintIndex++, hints.length - 1);
        showFeedback(false, `Hint ${index + 1}/${hints.length}: ${hints[index]}`);
      }
      return;
    }
  });

  document.addEventListener('input', event => {
    if (current && event.target.id === 'learnQueryInput') saveDraft(current.lessonId, current.stepIndex, event.target.value);
  });

  // Load only the tables used by this question, after the learner expands it.
  document.addEventListener('toggle', event => {
    if (!current || !event.target.matches?.('.learn-data-preview') || !event.target.open) return;
    const host = $('learnTablePreview');
    if (!host || host.childElementCount) return;
    const step = current.lesson.steps[current.stepIndex];
    const tables = Object.keys(schema).filter(table => new RegExp('\\b' + table + '\\b', 'i').test(step.solutionSQL || ''));
    try {
      host.innerHTML = tables.map(table => {
        const sample = executeQuery(`SELECT * FROM ${table} LIMIT 3`);
        return `<h4>${escapeHtml(table)}</h4><p>${schema[table].map(([name, type]) => escapeHtml(name + ' (' + type + ')')).join(', ')}</p><div class="learn-preview-scroll"><table class="learn-result-table"><caption>First 3 sample rows from ${escapeHtml(table)}</caption><thead><tr>${sample.columns.map(c => `<th scope="col">${escapeHtml(c)}</th>`).join('')}</tr></thead><tbody>${sample.rows.map(row => `<tr>${row.map(value => `<td>${escapeHtml(value === null ? 'NULL' : value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      }).join('');
    } catch {
      host.textContent = 'Sample data is unavailable. Close and reopen this lesson to try again.';
    }
  }, true);

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
