// Learn-track progress persistence.
//
// Fully independent of the mission game. It uses its OWN localStorage key
// (csq_learn_v1) and never touches csq_v2 (game progress) or csq_mastery_v1
// (concept mastery). Completing a lesson can optionally feed concept mastery,
// but that call lives in the Learn feature, not here.

import { LEARN_TRACK } from '../data/lessons.js';

const SAVE_KEY = 'csq_learn_v1';

let cache = null;

function blankState() {
  return {
    version: 1,
    completedLessons: {},   // lessonId -> true
    stepState: {},          // lessonId -> { [stepIndex]: 'correct' | 'wrong' }
    drafts: {},
    stepHints: {},
    position: null,         // { unitId, lessonId, stepIndex } — resume point
  };
}

export function loadLearnProgress() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    cache = blankState();
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const key of ['completedLessons', 'stepState', 'drafts', 'stepHints']) {
        if (parsed[key] && typeof parsed[key] === 'object' && !Array.isArray(parsed[key])) cache[key] = parsed[key];
      }
      const pos = parsed.position;
      if (pos && typeof pos.unitId === 'string' && typeof pos.lessonId === 'string' && Number.isInteger(pos.stepIndex) && pos.stepIndex >= 0) cache.position = pos;
    }
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
  delete state.drafts[lessonId];
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
export function isUnitUnlocked(unit, track = LEARN_TRACK) {
  const index = track.findIndex(u => u.id === unit.id);
  return index >= 0 && track.slice(0, index).every(isUnitComplete);
}

export function isLessonUnlocked(unit, lessonIndex) {
  const lesson = unit?.lessons[lessonIndex];
  if (!lesson) return false;
  // Preserve access to lessons completed before prerequisites were added.
  if (isLessonComplete(lesson.id)) return true;
  return isUnitUnlocked(unit) && unit.lessons.slice(0, lessonIndex).every(l => isLessonComplete(l.id));
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

export function clearPosition() {
  loadLearnProgress().position = null;
  saveLearnProgress();
}

export function isLessonPassed(lesson) {
  const results = loadLearnProgress().stepState[lesson.id] || {};
  return lesson.steps.every((step, index) => step.type === 'concept' || results[index] === 'correct');
}

export function getStepResult(lessonId, stepIndex) {
  return loadLearnProgress().stepState[lessonId]?.[stepIndex];
}

export function saveDraft(lessonId, stepIndex, sql) {
  const state = loadLearnProgress();
  if (isLessonComplete(lessonId)) return;
  if (!state.drafts[lessonId]) state.drafts[lessonId] = {};
  state.drafts[lessonId][stepIndex] = sql;
  saveLearnProgress();
}

export function getDraft(lessonId, stepIndex) {
  return loadLearnProgress().drafts[lessonId]?.[stepIndex];
}

export function markHintUsed(lessonId, stepIndex) {
  const state = loadLearnProgress();
  if (state.stepHints[lessonId]?.[stepIndex]) return false;
  if (!state.stepHints[lessonId]) state.stepHints[lessonId] = {};
  state.stepHints[lessonId][stepIndex] = true;
  saveLearnProgress();
  return true;
}

export function clearDraft(lessonId) {
  delete loadLearnProgress().drafts[lessonId];
  saveLearnProgress();
}
