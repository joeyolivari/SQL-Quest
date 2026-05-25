import { missions } from '../data/missions.js';
import { schema } from '../data/schema.js';
import { tutorials } from '../data/tutorial.js';
import { briefings } from '../data/casefiles.js';
import { checkBadges, BADGE_DEFS } from './badges.js';
import { initEngine, executeQuery, isSafeQuery } from '../core/sqlEngine.js';
import { compareResults } from '../core/validation.js';
import { getDiagnosticMessage } from '../core/diagnostics.js';
import { state, resetForLevel, useHint, recordAttempt, completeCurrentMission,
         saveProgress, loadProgress, clearProgress } from '../core/gameState.js';
import * as ui from '../ui/ui.js';
import { diagnoseSQL } from '../learning/diagnostics.js';
import {
  loadMastery, getAllMastery, recordMasteryAttempt, recordMasterySuccess,
  recordMasteryHint, recordMasteryMistake, buildMasteryProfile, getWeakestSkills,
} from '../learning/masteryTracker.js';
import { getRecommendedMission, buildTrainingQueue, buildReviewQueue, buildWeakSkillQueue } from '../learning/adaptiveQueue.js';
import { getHintStep, getNextHint, resetHintLadder } from '../learning/hintEngine.js';
import { buildLearningDashboard } from '../learning/dashboard.js';
import { initSandboxLab, openSandboxLab } from './sandbox.js';

let engineReady = false;
let selectedDifficulty = 'beginner';
let selectedMode = 'story';
let timerInterval = null;
let missionStartTime = 0;
let levelHintStep = 0;

function getMissionRating(attempts, levelHintUsed) {
  if (attempts === 0 && !levelHintUsed) return 'Perfect';
  if (attempts >= 3) return 'Needs Review';
  return 'Good';
}

// ── Theme ─────────────────────────────────────────────────────────────────────

function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  const btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
  try { localStorage.setItem('csq_theme', theme); } catch (e) {}
}

function toggleTheme() {
  const isLight = document.body.classList.contains('light');
  applyTheme(isLight ? 'dark' : 'light');
}

// ── Timer ─────────────────────────────────────────────────────────────────────

function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    state.totalTime++;
    ui.updateTimer(state.totalTime);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

// ── Home screen ───────────────────────────────────────────────────────────────

function updateRecommendation() {
  const rec = getRecommendedMission(missions, getAllMastery());
  ui.renderRecommendation(rec, () => {
    if (rec) startGame([rec.mission], null, 0);
  });
}

function renderLearningDashboard() {
  ui.renderLearningDashboard(buildLearningDashboard(missions, loadProgress()));
}

function renderHomeList() {
  const queue = getMissionQueue(selectedDifficulty);
  ui.renderMissionList(queue, (qIdx) => {
    startGame(queue, null, qIdx);
  });
  const hint = document.getElementById('missionListHint');
  if (hint) {
    if (selectedMode === 'training') {
      hint.textContent = 'Ordered by weakest skill — click any to start there';
    } else if (selectedMode === 'review') {
      hint.textContent = 'Focused on low-mastery skills — click any to start there';
    } else {
      hint.textContent = 'Click any mission to start from there';
    }
  }
}

function initHomeScreen() {
  // Populate difficulty counts
  const counts = { beginner: 0, intermediate: 0, advanced: 0, all: missions.length };
  missions.forEach(m => { const d = m.difficulty?.toLowerCase(); if (d && counts[d] !== undefined) counts[d]++; });
  Object.entries(counts).forEach(([diff, n]) => {
    const id = 'count' + diff.charAt(0).toUpperCase() + diff.slice(1);
    const el = document.getElementById(id);
    if (el) el.textContent = n + ' mission' + (n === 1 ? '' : 's');
  });

  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMode = btn.dataset.mode;
      renderHomeList();
    });
  });

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDifficulty = btn.dataset.diff;
      renderHomeList();
    });
  });

  initSectionToggles();

  document.getElementById('btnPlayAll').addEventListener('click', () => {
    clearProgress();
    startGame(getMissionQueue(selectedDifficulty), null, 0);
  });

  document.getElementById('btnSandboxLab')?.addEventListener('click', openSandboxLab);

  document.getElementById('btnWeakDrill')?.addEventListener('click', () => {
    startWeakSkillDrill();
  });

  const btnClear = document.getElementById('btnClearSave');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      clearProgress();
      const sec = document.getElementById('continueSection');
      if (sec) sec.style.display = 'none';
      renderLearningDashboard();
    });
  }

  refreshContinueSection();
  renderLearningDashboard();
  renderHomeList();
  updateRecommendation();
}

function initSectionToggles() {
  document.querySelectorAll('[data-collapse-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.collapseTarget);
      if (!target) return;
      const isCollapsed = target.classList.toggle('is-collapsed');
      btn.setAttribute('aria-expanded', String(!isCollapsed));
      btn.textContent = isCollapsed ? 'Show' : 'Minimize';
    });
  });
}

function getMissionsByDifficulty(difficulty) {
  if (difficulty === 'all') return [...missions];
  const filtered = missions.filter(m => m.difficulty?.toLowerCase() === difficulty);
  return filtered.length ? filtered : [...missions];
}

function getMissionQueue(difficulty) {
  if (selectedMode === 'training') {
    return buildTrainingQueue(missions, getAllMastery(), difficulty).queue;
  }
  if (selectedMode === 'review') {
    return buildReviewQueue(missions, getAllMastery(), difficulty).queue;
  }
  return getMissionsByDifficulty(difficulty);
}

function startWeakSkillDrill() {
  if (!engineReady) {
    ui.showHomeError('SQL engine is still loading. Please wait.');
    return;
  }

  const masteryProfile = buildMasteryProfile(missions, loadProgress());
  const weakestProfile = {
    ...masteryProfile,
    skills: getWeakestSkills(masteryProfile)
  };
  const queue = buildWeakSkillQueue(missions, weakestProfile);
  if (!queue.length) {
    ui.showHomeError('No drill missions are available yet.');
    return;
  }

  startGame(queue, 'weak-skill-drill', 0, 'weak drill');
}

function restoreProgress(saved) {
  if (!engineReady) { ui.showHomeError('SQL engine is still loading. Please wait.'); return; }
  const queue = saved.queueIds.map(id => missions.find(m => m.id === id)).filter(Boolean);
  if (!queue.length) { clearProgress(); return; }

  state.missionQueue = queue;
  state.score = saved.score;
  state.hintsLeft = saved.hintsLeft;
  state.completedMissions = new Set(saved.completedMissions || []);
  state.earnedBadges = new Set(saved.earnedBadges || []);
  state.missionAttempts = saved.missionAttempts || {};
  state.totalTime = saved.totalTime || 0;
  state.selectedDifficulty = saved.selectedDifficulty || 'beginner';

  ui.hideHomeScreen();
  ui.renderSchema(schema);
  const totalEl = document.getElementById('levelTotal');
  if (totalEl) totalEl.textContent = queue.length;
  const winCount = document.getElementById('winModalCount');
  if (winCount) winCount.textContent = queue.length;
  const idx = Math.min(saved.currentMissionIndex || 0, queue.length - 1);
  loadLevel(idx);
}

function startGame(queue, scenarioId, startIndex = 0, difficultyLabel = selectedDifficulty) {
  if (!engineReady) {
    ui.showError('SQL engine is still loading. Please wait a moment.');
    return;
  }
  state.missionQueue = queue;
  state.selectedScenario = scenarioId;
  state.score = 0;
  state.hintsLeft = 3;
  state.completedMissions = new Set();
  state.earnedBadges = new Set();
  state.missionAttempts = {};
  state.totalTime = 0;
  state.selectedDifficulty = difficultyLabel;

  ui.hideHomeScreen();
  ui.renderSchema(schema);
  const totalEl = document.getElementById('levelTotal');
  if (totalEl) totalEl.textContent = queue.length;
  const winCount = document.getElementById('winModalCount');
  if (winCount) winCount.textContent = queue.length;
  loadLevel(startIndex);
}

function refreshContinueSection() {
  const saved = loadProgress();
  const sec = document.getElementById('continueSection');
  if (saved && saved.queueIds && saved.queueIds.length) {
    ui.showContinueSection(
      `${(saved.completedMissions || []).length}/${saved.queueIds.length} missions · ${saved.score} pts · ${ui.formatTime(saved.totalTime || 0)}`
    );
    // Replace button to avoid listener accumulation
    const old = document.getElementById('btnContinue');
    const btn = old.cloneNode(true);
    old.replaceWith(btn);
    btn.addEventListener('click', () => restoreProgress(saved));
  } else if (sec) {
    sec.style.display = 'none';
  }
}

function goHome() {
  stopTimer();
  saveProgress();
  state.missionQueue = [];
  state.completedMissions = new Set();
  state.score = 0;
  state.hintsLeft = 3;
  state.missionAttempts = {};
  state.totalTime = 0;
  ui.updateTimer(0);
  ui.showHomeScreen();
  refreshContinueSection();
  renderLearningDashboard();
  renderHomeList();
  updateRecommendation();
}

// ── Mobile tabs ───────────────────────────────────────────────────────────────

function isMobileLayout() {
  return window.innerWidth <= 768;
}

function setMobileTab(name) {
  const container = document.querySelector('.game-container');
  if (!container) return;
  container.classList.remove('tab-schema');
  if (name === 'schema') container.classList.add('tab-schema');
  document.querySelectorAll('.mobile-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === name);
  });
  window.scrollTo(0, 0);
}

function initMobileTabs() {
  document.querySelectorAll('.mobile-tab').forEach(tab => {
    tab.addEventListener('click', () => setMobileTab(tab.dataset.tab));
  });
}

// ── Game loop ─────────────────────────────────────────────────────────────────

function loadLevel(index) {
  const mission = state.missionQueue[index];
  resetForLevel(index);
  resetHintLadder(mission.id);
  missionStartTime = state.totalTime;
  levelHintStep = 0;
  ui.loadMission(mission, index, briefings[mission.id]);
  ui.updateStats(state.score, state.hintsLeft, state.attempts, index + 1);
  document.getElementById('btnHint').disabled = state.hintsLeft <= 0;
  ui.renderProgressDots(state.completedMissions, index, state.missionQueue.length);
  startTimer();
  saveProgress();
  if (isMobileLayout()) setMobileTab('mission');
}

function runQuery() {
  ui.hideMessages(false);
  const sql = document.getElementById('sqlInput').value.trim();
  if (!sql) { ui.showError('Write a SELECT query first.'); return; }
  if (!isSafeQuery(sql)) { ui.showError('Only SELECT and WITH queries are allowed in this game.'); return; }
  try {
    state.lastResult = executeQuery(sql);
    state.lastRunSQL = sql;
    ui.renderResults(state.lastResult);
    if (isMobileLayout()) document.querySelector('.right-panel')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  } catch (err) {
    state.lastResult = null;
    state.lastRunSQL = '';
    ui.renderErrorResult(err.message);
    ui.showError('SQL error: ' + err.message);
  }
}

function checkAnswer() {
  const currentSQL = document.getElementById('sqlInput').value.trim();
  if (!state.lastResult) { ui.showError('Run your query before checking the answer.'); return; }
  if (currentSQL !== state.lastRunSQL) {
    ui.showError('You changed the SQL after running it. Run the query again before checking.');
    return;
  }
  const mission = state.missionQueue[state.currentMissionIndex];
  let expected;
  try {
    expected = executeQuery(mission.solutionSQL);
  } catch (err) {
    ui.showError('Internal solution error: ' + err.message);
    return;
  }
  const result = compareResults(state.lastResult, expected, mission.requiredColumns, mission.orderMatters);
  recordMasteryAttempt(mission.concepts);
  if (result.ok) {
    recordMasterySuccess(mission.concepts);
    stopTimer();
    const rating = getMissionRating(state.attempts, state.levelHintUsed);
    const points = completeCurrentMission();
    ui.showSummaryPanel({
      rating,
      points,
      attempts: state.attempts + 1,
      hintsUsed: state.levelHintUsed ? 1 : 0,
      timeTaken: state.totalTime - missionStartTime,
      concepts: mission.concepts,
    });
    ui.showExplanation(mission.explanation);
    document.getElementById('btnCheck').disabled = true;
    ui.renderProgressDots(state.completedMissions, state.currentMissionIndex, state.missionQueue.length);
    ui.updateStats(state.score, state.hintsLeft, state.attempts, state.currentMissionIndex + 1);
    saveProgress();

    const newBadges = checkBadges(state, state.missionQueue.length);
    newBadges.forEach(id => {
      const def = BADGE_DEFS.find(b => b.id === id);
      if (def) ui.showBadgeToast(def);
    });

    if (state.currentMissionIndex < state.missionQueue.length - 1) {
      ui.showNextButton(true);
    } else {
      setTimeout(() => ui.showWinModal(state.score, state.earnedBadges, state.missionQueue.length, state.totalTime, state.selectedDifficulty), 550);
    }
    ui.launchConfetti();
  } else {
    recordAttempt();
    ui.updateStats(state.score, state.hintsLeft, state.attempts, state.currentMissionIndex + 1);
    const diag = diagnoseSQL(currentSQL, mission, result);
    if (diag) {
      recordMasteryMistake(mission.concepts, diag.type);
      ui.showError(diag.message + ' ' + diag.nextStep);
    } else {
      ui.showError(getDiagnosticMessage({
        sql: currentSQL,
        mission,
        userResult: state.lastResult,
        expectedResult: expected,
        validationMessage: result.message
      }));
    }
  }
}

function showHint() {
  if (state.hintsLeft <= 0) { ui.showError('No hints left. Try running a query and studying the result.'); return; }
  const mission = state.missionQueue[state.currentMissionIndex];
  useHint();
  recordMasteryHint(mission.concepts);
  const progressive = getHintStep(mission.id, levelHintStep);
  levelHintStep++;
  ui.showHintMessage('💡 ' + (progressive ?? mission.hint));
  ui.updateStats(state.score, state.hintsLeft, state.attempts, state.currentMissionIndex + 1);
  if (state.hintsLeft <= 0) document.getElementById('btnHint').disabled = true;
}

function showProgressiveHint() {
  if (state.hintsLeft <= 0) {
    ui.showError('No hints left. Try running a query and studying the result.');
    return;
  }
  const mission = state.missionQueue[state.currentMissionIndex];
  const hint = getNextHint(mission);
  if (!hint.text) {
    ui.showError('No hint is available for this mission.');
    return;
  }
  if (hint.shouldConsume) {
    if (hint.isProgressive) {
      state.hintsLeft--;
      state.levelHintUsed = true;
    } else {
      useHint();
    }
    recordMasteryHint(mission.concepts);
  }
  if (hint.isProgressive && hint.shouldConsume) levelHintStep++;
  const label = hint.isProgressive ? `Hint ${hint.step}/${hint.total}: ` : '';
  ui.showHintMessage(label + hint.text);
  ui.updateStats(state.score, state.hintsLeft, state.attempts, state.currentMissionIndex + 1);
  if (state.hintsLeft <= 0) document.getElementById('btnHint').disabled = true;
}

function showSolution() {
  state.solutionUsed = true;
  const sql = state.missionQueue[state.currentMissionIndex].solutionSQL;
  document.getElementById('sqlInput').value = sql;
  ui.showSolutionBox(sql);
  runQuery();
}

function resetEditor() {
  document.getElementById('sqlInput').value = state.missionQueue[state.currentMissionIndex].starterSQL;
  state.lastResult = null;
  state.lastRunSQL = '';
  ui.hideMessages();
  ui.renderEmptyResults();
}

function nextLevel() {
  if (state.currentMissionIndex < state.missionQueue.length - 1) {
    loadLevel(state.currentMissionIndex + 1);
  }
}

function openTutorial() {
  ui.renderTutorialCards(tutorials);
  document.getElementById('tutorialModal').classList.add('visible');
}

function closeTutorial() {
  document.getElementById('tutorialModal').classList.remove('visible');
}

// ── Keyword bar ───────────────────────────────────────────────────────────────

const SQL_KEYWORDS = [
  { label: 'SELECT',    insert: 'SELECT ' },
  { label: 'FROM',      insert: 'FROM ' },
  { label: 'WHERE',     insert: 'WHERE ' },
  { label: 'AND',       insert: 'AND ' },
  { label: 'OR',        insert: 'OR ' },
  { label: 'NOT',       insert: 'NOT ' },
  { label: 'IN',        insert: 'IN ', cursor: null },
  { label: 'JOIN',      insert: 'JOIN ' },
  { label: 'LEFT JOIN', insert: 'LEFT JOIN ' },
  { label: 'ON',        insert: 'ON ' },
  { label: 'AS',        insert: 'AS ' },
  { label: 'GROUP BY',  insert: 'GROUP BY ' },
  { label: 'ORDER BY',  insert: 'ORDER BY ' },
  { label: 'HAVING',    insert: 'HAVING ' },
  { label: 'DISTINCT',  insert: 'DISTINCT ' },
  { label: 'COUNT(*)',  insert: 'COUNT(*)', cursor: null },
  { label: 'SUM()',     insert: 'SUM()', cursorBack: 1 },
  { label: 'AVG()',     insert: 'AVG()', cursorBack: 1 },
  { label: 'ROUND()',   insert: 'ROUND()', cursorBack: 1 },
  { label: 'CASE',      insert: 'CASE ' },
  { label: 'WHEN',      insert: 'WHEN ' },
  { label: 'THEN',      insert: 'THEN ' },
  { label: 'ELSE',      insert: 'ELSE ' },
  { label: 'END',       insert: 'END' },
  { label: 'WITH',      insert: 'WITH ' },
  { label: 'IS NULL',   insert: 'IS NULL' },
  { label: 'BETWEEN',   insert: 'BETWEEN ' },
  { label: 'LIKE',      insert: 'LIKE ' },
  { label: 'EXISTS',    insert: 'EXISTS ' },
  { label: 'DESC',      insert: 'DESC' },
  { label: 'ASC',       insert: 'ASC' },
];

function insertKeyword(kw) {
  const el = document.getElementById('sqlInput');
  const pos = el.selectionStart;
  const val = el.value;
  const before = val.slice(0, pos);
  const after = val.slice(pos);
  const needsSpace = before.length > 0 && !/[\s(]$/.test(before);
  const text = (needsSpace ? ' ' : '') + kw.insert;
  el.value = before + text + after;
  const newPos = pos + text.length - (kw.cursorBack || 0);
  el.selectionStart = el.selectionEnd = newPos;
  el.focus();
}

// ── Wrap helpers (quote / paren) ──────────────────────────────────────────────

function wrapCursor(open, close) {
  const el = document.getElementById('sqlInput');
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

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function initGame() {
  try {
    await initEngine();
    engineReady = true;
    ['sqlInput', 'btnRun', 'btnCheck', 'btnHint', 'btnReset', 'btnQuote', 'btnParen', 'btnSolution'].forEach(id => {
      document.getElementById(id).disabled = false;
    });
  } catch (err) {
    ui.showError('SQLite failed to load. Check your connection. ' + err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Restore saved theme
  try {
    const savedTheme = localStorage.getItem('csq_theme');
    if (savedTheme) applyTheme(savedTheme);
  } catch (e) {}

  document.getElementById('btnRun').addEventListener('click', runQuery);
  document.getElementById('btnCheck').addEventListener('click', checkAnswer);
  document.getElementById('btnHint').addEventListener('click', showProgressiveHint);
  document.getElementById('btnReset').addEventListener('click', resetEditor);
  document.getElementById('btnSolution').addEventListener('click', showSolution);
  document.getElementById('btnNext').addEventListener('click', nextLevel);
  document.getElementById('btnTutorial').addEventListener('click', openTutorial);
  const btnTutSchema = document.getElementById('btnTutorialSchema');
  if (btnTutSchema) btnTutSchema.addEventListener('click', openTutorial);
  document.getElementById('btnHome').addEventListener('click', goHome);
  document.getElementById('btnCloseTutorial').addEventListener('click', closeTutorial);
  document.getElementById('btnTheme').addEventListener('click', toggleTheme);
  document.getElementById('btnCopyScore').addEventListener('click', copyScore);

  document.getElementById('btnSchemaMin').addEventListener('click', function () {
    const body = document.getElementById('schemaBody');
    const collapsed = body.classList.toggle('schema-collapsed');
    this.innerHTML = collapsed ? '&#9654; Show' : '&#9660; Hide';
  });

  document.getElementById('btnQuote').addEventListener('click', () => wrapCursor("'", "'"));
  document.getElementById('btnParen').addEventListener('click', () => wrapCursor('(', ')'));

  // Keyword bar
  ui.renderKeywordBar(SQL_KEYWORDS, insertKeyword);

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!document.getElementById('btnRun').disabled) runQuery();
    }
  });

  loadMastery();
  initMobileTabs();
  initHomeScreen();
  initSandboxLab();
  initGame();
});

function copyScore() {
  const mission = state.missionQueue;
  const badges = [...state.earnedBadges].join(', ') || 'none';
  const text = `Compliance SQL Quest\nScore: ${state.score}\nMissions: ${state.completedMissions.size}/${mission.length}\nTime: ${ui.formatTime(state.totalTime)}\nBadges: ${badges}`;
  navigator.clipboard.writeText(text).catch(() => {});
  const btn = document.getElementById('btnCopyScore');
  if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy Results'; }, 2000); }
}
