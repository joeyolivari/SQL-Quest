import { missions } from './missions.js';
import { schema } from './schema.js';
import { tutorials } from './tutorial.js';
import { initEngine, executeQuery, isSafeQuery } from './sqlEngine.js';
import { compareResults } from './validation.js';
import { state, resetForLevel, useHint, recordAttempt, completeCurrentMission } from './gameState.js';
import * as ui from './ui.js';

const TOTAL = missions.length;

async function initGame() {
  ui.renderSchema(schema);
  ui.renderProgressDots(state.completedMissions, 0, TOTAL);
  try {
    await initEngine();
    ['sqlInput', 'btnRun', 'btnCheck', 'btnHint', 'btnReset'].forEach(id => {
      document.getElementById(id).disabled = false;
    });
    loadLevel(0);
  } catch (err) {
    ui.showError('SQLite failed to load. Check your connection. ' + err.message);
    document.getElementById('resultPanel').innerHTML =
      '<div class="empty-state">Could not load SQLite engine.</div>';
  }
}

function loadLevel(index) {
  resetForLevel(index);
  ui.loadMission(missions[index], index);
  ui.updateStats(state.score, state.hintsLeft, state.attempts, index + 1);
  ui.renderProgressDots(state.completedMissions, index, TOTAL);
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
  const mission = missions[state.currentMissionIndex];
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
    ui.renderProgressDots(state.completedMissions, state.currentMissionIndex, TOTAL);
    ui.updateStats(state.score, state.hintsLeft, state.attempts, state.currentMissionIndex + 1);
    if (state.currentMissionIndex < TOTAL - 1) {
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
  ui.showHintMessage('💡 ' + missions[state.currentMissionIndex].hint);
  ui.updateStats(state.score, state.hintsLeft, state.attempts, state.currentMissionIndex + 1);
  if (state.hintsLeft <= 0) document.getElementById('btnHint').disabled = true;
}

function showSolution() {
  state.solutionUsed = true;
  ui.showSolutionBox(missions[state.currentMissionIndex].solutionSQL);
}

function resetEditor() {
  document.getElementById('sqlInput').value = missions[state.currentMissionIndex].starterSQL;
  state.lastResult = null;
  state.lastRunSQL = '';
  ui.hideMessages();
  ui.renderEmptyResults();
}

function nextLevel() {
  if (state.currentMissionIndex < TOTAL - 1) loadLevel(state.currentMissionIndex + 1);
}

function openTutorial() {
  ui.renderTutorialCards(tutorials);
  document.getElementById('tutorialModal').classList.add('visible');
}

function closeTutorial() {
  document.getElementById('tutorialModal').classList.remove('visible');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnRun').addEventListener('click', runQuery);
  document.getElementById('btnCheck').addEventListener('click', checkAnswer);
  document.getElementById('btnHint').addEventListener('click', showHint);
  document.getElementById('btnReset').addEventListener('click', resetEditor);
  document.getElementById('btnSolution').addEventListener('click', showSolution);
  document.getElementById('btnNext').addEventListener('click', nextLevel);
  document.getElementById('btnTutorial').addEventListener('click', openTutorial);
  document.getElementById('btnCloseTutorial').addEventListener('click', closeTutorial);
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!document.getElementById('btnRun').disabled) runQuery();
    }
  });
  initGame();
});
