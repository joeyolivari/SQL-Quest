import { missions } from './missions.js';
import { schema } from './schema.js';
import { tutorials } from './tutorial.js';
import { briefings } from './casefiles.js';
import { checkBadges, BADGE_DEFS } from './badges.js';
import { initEngine, executeQuery, isSafeQuery } from './sqlEngine.js';
import { compareResults } from './validation.js';
import { state, resetForLevel, useHint, recordAttempt, completeCurrentMission } from './gameState.js';
import * as ui from './ui.js';

function goHome() {
  state.missionQueue = [];
  state.completedMissions.clear();
  state.score = 0;
  state.hintsLeft = 3;
  ui.showHomeScreen();
}

let engineReady = false;
let selectedDifficulty = 'beginner';

// ── Home screen ──────────────────────────────────────────────────────────────

function initHomeScreen() {
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDifficulty = btn.dataset.diff;
    });
  });

  document.getElementById('btnPlayAll').addEventListener('click', () => {
    startGame(getMissionQueue(selectedDifficulty), null);
  });
}

function getMissionQueue(difficulty) {
  if (difficulty === 'all') return [...missions];
  const filtered = missions.filter(m => m.difficulty.toLowerCase() === difficulty);
  return filtered.length ? filtered : [...missions];
}

function startGame(queue, scenarioId) {
  if (!engineReady) {
    ui.showError('SQL engine is still loading. Please wait a moment.');
    return;
  }
  state.missionQueue = queue;
  state.selectedScenario = scenarioId;
  ui.hideHomeScreen();
  ui.renderSchema(schema);
  loadLevel(0);
}

// ── Game loop ────────────────────────────────────────────────────────────────

function loadLevel(index) {
  const mission = state.missionQueue[index];
  resetForLevel(index);
  ui.loadMission(mission, index, briefings[mission.id]);
  ui.updateStats(state.score, state.hintsLeft, state.attempts, index + 1);
  ui.renderProgressDots(state.completedMissions, index, state.missionQueue.length);
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
  if (result.ok) {
    const points = completeCurrentMission();
    ui.showSuccess(`&#10003; <strong>Mission complete.</strong> +${points} points.`);
    ui.showExplanation(mission.explanation);
    document.getElementById('btnCheck').disabled = true;
    ui.renderProgressDots(state.completedMissions, state.currentMissionIndex, state.missionQueue.length);
    ui.updateStats(state.score, state.hintsLeft, state.attempts, state.currentMissionIndex + 1);

    const newBadges = checkBadges(state, state.missionQueue.length);
    newBadges.forEach(id => {
      const def = BADGE_DEFS.find(b => b.id === id);
      if (def) ui.showBadgeToast(def);
    });

    if (state.currentMissionIndex < state.missionQueue.length - 1) {
      ui.showNextButton(true);
    } else {
      setTimeout(() => ui.showWinModal(state.score), 550);
    }
    ui.launchConfetti();
  } else {
    recordAttempt();
    ui.updateStats(state.score, state.hintsLeft, state.attempts, state.currentMissionIndex + 1);
    if (state.attempts >= 2) document.getElementById('btnSolution').disabled = false;
    ui.showError(result.message || 'Almost there. Your result set does not match the mission output yet.');
  }
}

function showHint() {
  if (state.hintsLeft <= 0) { ui.showError('No hints left. Try running a query and studying the result.'); return; }
  useHint();
  ui.showHintMessage('💡 ' + state.missionQueue[state.currentMissionIndex].hint);
  ui.updateStats(state.score, state.hintsLeft, state.attempts, state.currentMissionIndex + 1);
  if (state.hintsLeft <= 0) document.getElementById('btnHint').disabled = true;
}

function showSolution() {
  state.solutionUsed = true;
  ui.showSolutionBox(state.missionQueue[state.currentMissionIndex].solutionSQL);
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

// ── Bootstrap ────────────────────────────────────────────────────────────────

async function initGame() {
  try {
    await initEngine();
    engineReady = true;
    ['sqlInput', 'btnRun', 'btnCheck', 'btnHint', 'btnReset'].forEach(id => {
      document.getElementById(id).disabled = false;
    });
  } catch (err) {
    ui.showError('SQLite failed to load. Check your connection. ' + err.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnRun').addEventListener('click', runQuery);
  document.getElementById('btnCheck').addEventListener('click', checkAnswer);
  document.getElementById('btnHint').addEventListener('click', showHint);
  document.getElementById('btnReset').addEventListener('click', resetEditor);
  document.getElementById('btnSolution').addEventListener('click', showSolution);
  document.getElementById('btnNext').addEventListener('click', nextLevel);
  document.getElementById('btnTutorial').addEventListener('click', openTutorial);
  document.getElementById('btnHome').addEventListener('click', goHome);
  document.getElementById('btnCloseTutorial').addEventListener('click', closeTutorial);

  document.getElementById('btnSchemaMin').addEventListener('click', () => {
    const body = document.getElementById('schemaBody');
    const btn = document.getElementById('btnSchemaMin');
    const hidden = body.style.display === 'none';
    body.style.display = hidden ? 'block' : 'none';
    btn.innerHTML = hidden ? '&#9660; Hide' : '&#9654; Show';
  });

  document.getElementById('sqlInput').addEventListener('keydown', e => {
    if (e.key !== "'") return;
    e.preventDefault();
    const el = e.target;
    const s = el.selectionStart, end = el.selectionEnd;
    const val = el.value;
    el.value = val.slice(0, s) + "'" + val.slice(s, end) + "'" + val.slice(end);
    el.selectionStart = s + 1;
    el.selectionEnd = end + 1;
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!document.getElementById('btnRun').disabled) runQuery();
    }
  });
  initHomeScreen();
  initGame();
});
