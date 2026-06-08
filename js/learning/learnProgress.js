// Learn-track progress persistence.
//
// Fully independent of the mission game. It uses its OWN localStorage key
// (csq_learn_v1) and never touches csq_v2 (game progress) or csq_mastery_v1
// (concept mastery). Completing a lesson can optionally feed concept mastery,
// but that call lives in the Learn feature, not here.

const SAVE_KEY = 'csq_learn_v1';

let cache = null;

function blankState() {
  return {
    version: 1,
    completedLessons: {},   // lessonId -> true
    stepState: {},          // lessonId -> { [stepIndex]: 'correct' | 'wrong' }
    position: null,         // { unitId, lessonId, stepIndex } — resume point
  };
}

export function loadLearnProgress() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    cache = parsed && typeof parsed === 'object' ? { ...blankState(), ...parsed } : blankState();
  } catch {
    cache = blankState();
  }
  return cache;
}

export function saveLearnProgress() {
  if (!cache) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(cache));
  } catch (e) {
    // Storage full or unavailable — fail quietly, progress just won't persist.
  }
}

export function clearLearnProgress() {
  cache = blankState();
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

export function isLessonComplete(lessonId) {
  return !!loadLearnProgress().completedLessons[lessonId];
}

export function markStepResult(lessonId, stepIndex, result) {
  const state = loadLearnProgress();
  if (!state.stepState[lessonId]) state.stepState[lessonId] = {};
  state.stepState[lessonId][stepIndex] = result;
  saveLearnProgress();
}

export function completeLesson(lessonId) {
  const state = loadLearnProgress();
  state.completedLessons[lessonId] = true;
  saveLearnProgress();
}

export function setPosition(unitId, lessonId, stepIndex) {
  const state = loadLearnProgress();
  state.position = { unitId, lessonId, stepIndex };
  saveLearnProgress();
}

export function getPosition() {
  return loadLearnProgress().position;
}

// Lesson N is unlocked once lesson N-1 is complete. The first lesson is always
// unlocked. (unit.lessons order defines the ladder.)
export function isLessonUnlocked(unit, lessonIndex) {
  if (lessonIndex <= 0) return true;
  const prev = unit.lessons[lessonIndex - 1];
  return prev ? isLessonComplete(prev.id) : true;
}

export function getUnitProgress(unit) {
  const total = unit.lessons.length;
  const done = unit.lessons.filter(l => isLessonComplete(l.id)).length;
  const next = unit.lessons.find(l => !isLessonComplete(l.id)) || null;
  return {
    done,
    total,
    pct: total ? Math.round((done / total) * 100) : 0,
    nextLessonId: next ? next.id : null,
  };
}

export function isUnitComplete(unit) {
  return unit.lessons.every(l => isLessonComplete(l.id));
}
