export const state = {
  currentMissionIndex: 0,
  selectedScenario: null,
  score: 0,
  hintsLeft: 3,
  attempts: 0,
  levelHintUsed: false,
  solutionUsed: false,
  levelCompleted: false,
  completedMissions: new Set(),
  earnedBadges: new Set(),
  missionQueue: [],
  lastResult: null,
  lastRunSQL: '',
  unlockedConcepts: new Set(),
  missionAttempts: {},
  totalTime: 0,
  selectedDifficulty: 'beginner',
};

const SAVE_KEY = 'csq_v2';

export function saveProgress() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      score: state.score,
      hintsLeft: state.hintsLeft,
      completedMissions: [...state.completedMissions],
      earnedBadges: [...state.earnedBadges],
      currentMissionIndex: state.currentMissionIndex,
      missionAttempts: state.missionAttempts,
      totalTime: state.totalTime,
      selectedDifficulty: state.selectedDifficulty,
      queueIds: state.missionQueue.map(m => m.id),
    }));
  } catch (e) {}
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearProgress() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

export function resetForLevel(index) {
  state.currentMissionIndex = index;
  state.attempts = 0;
  state.levelHintUsed = false;
  state.solutionUsed = false;
  state.levelCompleted = false;
  state.lastResult = null;
  state.lastRunSQL = '';
}

export function useHint() {
  if (state.hintsLeft <= 0 || state.levelHintUsed) return false;
  state.hintsLeft--;
  state.levelHintUsed = true;
  return true;
}

export function recordAttempt() {
  state.attempts++;
}

export function completeCurrentMission() {
  if (state.levelCompleted) return 0;
  state.levelCompleted = true;
  state.completedMissions.add(state.currentMissionIndex);
  state.missionAttempts[state.currentMissionIndex] = state.attempts;
  let points = 100 - state.attempts * 15;
  if (state.levelHintUsed) points -= 10;
  if (state.solutionUsed) points -= 35;
  state.score += Math.max(points, 35);
  return Math.max(points, 35);
}
