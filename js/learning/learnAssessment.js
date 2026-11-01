// Record practice evidence once a step has been answered correctly.
// Wrong retries count as attempts; replaying a passed step earns no extra credit.
import { isLessonComplete, getStepResult, markStepResult, markHintUsed } from './learnProgress.js';
import { recordMasteryAttempt, recordMasterySuccess, recordMasteryHint } from './masteryTracker.js';

export function recordLearnAnswer(lesson, stepIndex, ok) {
  if (lesson.steps[stepIndex]?.type === 'concept' || isLessonComplete(lesson.id) || getStepResult(lesson.id, stepIndex) === 'correct') return;
  recordMasteryAttempt(lesson.concepts);
  if (ok) recordMasterySuccess(lesson.concepts);
  markStepResult(lesson.id, stepIndex, ok ? 'correct' : 'wrong');
}

export function recordLearnHint(lesson, stepIndex) {
  if (!isLessonComplete(lesson.id) && getStepResult(lesson.id, stepIndex) !== 'correct' && markHintUsed(lesson.id, stepIndex)) recordMasteryHint(lesson.concepts);
}
