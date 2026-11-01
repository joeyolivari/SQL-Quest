// Optional delayed retrieval, independent of mission scores and course position.
// The gaps are a product heuristic; they are not a validated optimal schedule.
const KEY = 'csq_learn_review_v1';
const DAY = 86400000;
const GAPS = [1, 3, 7, 14, 30];
let cache;
function state() {
  if (cache) return cache;
  cache = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      for (const [id, item] of Object.entries(parsed)) {
        if (item && Number.isFinite(item.dueAt) && Number.isInteger(item.stage) && item.stage >= 0 && item.stage < GAPS.length) cache[id] = { ...item, attempts: Number.isInteger(item.attempts) && item.attempts >= 0 ? item.attempts : 0, independent: Number.isInteger(item.independent) && item.independent >= 0 ? item.independent : 0 };
      }
    }
  } catch { /* Storage can be unavailable; the course still works. */ }
  return cache;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state())); } catch {} }

export function scheduleLearnReview(lessonId, now = Date.now()) {
  if (!state()[lessonId]) {
    state()[lessonId] = { stage: 0, dueAt: now + DAY, attempts: 0, independent: 0 };
    save();
  }
}

export function getReviewQuestion(lesson) {
  const source = lesson.review || [...lesson.steps].reverse().find(s => s.type === 'query');
  return source ? { ...source, phase: 'Retrieve', starterSQL: '' } : null;
}

export function getDueLearnReviews(track, isComplete, now = Date.now(), limit = 3) {
  const groups = track.map(unit => unit.lessons
    .filter(lesson => isComplete(lesson.id) && getReviewQuestion(lesson) && (!state()[lesson.id] || state()[lesson.id].dueAt <= now))
    .map(lesson => ({ unitId: unit.id, lesson, question: getReviewQuestion(lesson), dueAt: state()[lesson.id]?.dueAt ?? 0 }))
    .sort((a, b) => a.dueAt - b.dueAt));
  const result = [];
  // Round-robin units mixes familiar skills rather than repeatedly drilling one.
  while (result.length < limit && groups.some(group => group.length)) {
    for (const group of groups) {
      if (group.length && result.length < limit) result.push(group.shift());
    }
  }
  return result;
}

export function recordLearnReview(lessonId, { correct, assisted = false }, now = Date.now()) {
  scheduleLearnReview(lessonId, now);
  const item = state()[lessonId];
  item.attempts++;
  assisted ||= item.inProgressAssisted === true;
  delete item.inProgressAssisted;
  if (correct && !assisted) {
    item.stage = Math.min(item.stage + 1, GAPS.length - 1);
    item.independent++;
    item.dueAt = now + GAPS[item.stage] * DAY;
  } else {
    item.stage = 0;
    item.dueAt = now + (correct ? DAY : 10 * 60000);
  }
  item.lastOutcome = correct && !assisted ? 'independent' : 'supported';
  save();
  return { ...item };
}

// Preserve assistance across exiting and reopening the same due question.
export function markLearnReviewSupported(lessonId, now = Date.now()) {
  scheduleLearnReview(lessonId, now);
  state()[lessonId].inProgressAssisted = true;
  state()[lessonId].dueAt = Math.min(state()[lessonId].dueAt, now);
  save();
}
