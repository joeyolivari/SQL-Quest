export const BADGE_DEFS = [
  { id: 'first-case',  icon: '🗂️', label: 'First Case Closed', desc: 'Completed your first mission.' },
  { id: 'no-mistakes', icon: '🎯', label: 'Perfect Run',        desc: 'First attempt, no hints or solution.' },
  { id: 'clean-hands', icon: '🧤', label: 'Clean Hands',        desc: 'Completed without hints or solution.' },
  { id: 'halfway',     icon: '⚡', label: 'Halfway There',      desc: 'Completed 10 missions.' },
  { id: 'audit-ready', icon: '🏆', label: 'Audit Ready',        desc: 'Completed all missions in the queue.' }
];

export function checkBadges(state, queueLength) {
  const newly = [];
  const done = state.completedMissions.size;
  const clean = !state.levelHintUsed && !state.solutionUsed;

  if (done === 1 && !state.earnedBadges.has('first-case'))                       newly.push('first-case');
  if (clean && state.attempts === 0 && !state.earnedBadges.has('no-mistakes'))   newly.push('no-mistakes');
  else if (clean && !state.earnedBadges.has('clean-hands'))                      newly.push('clean-hands');
  if (done === 10 && !state.earnedBadges.has('halfway'))                         newly.push('halfway');
  if (done >= queueLength && !state.earnedBadges.has('audit-ready'))             newly.push('audit-ready');

  newly.forEach(id => state.earnedBadges.add(id));
  return newly;
}
