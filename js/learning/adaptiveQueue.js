const DIFF_ORDER = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };

/**
 * Inspect mastery progress and return the single best mission to practice next,
 * or null when no mastery data exists yet.
 *
 * @param {object[]} missions - Full mission list from missions.js.
 * @param {object}   masteryProgress - Output of getAllMastery(): concept → { attempts, correct, hintsUsed, mistakeTypes, score }.
 * @returns {{ mission, reason, weakConcept, score } | null}
 */
export function getRecommendedMission(missions, masteryProgress) {
  if (!masteryProgress) return null;

  const attempted = Object.entries(masteryProgress)
    .filter(([, data]) => data.attempts > 0)
    .map(([concept, data]) => ({ concept, score: data.score }));

  if (!attempted.length) return null;

  // Weakest concept first; break ties by alphabetical concept name for stability
  attempted.sort((a, b) => a.score - b.score || a.concept.localeCompare(b.concept));
  const { concept: weakConcept, score } = attempted[0];

  // Missions that cover the weak concept, sorted easiest first
  const related = missions
    .filter(m => m.concepts.includes(weakConcept))
    .sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 3) - (DIFF_ORDER[b.difficulty] ?? 3));

  if (!related.length) return null;

  const mission = related[0];
  const pct = Math.round(score * 100);
  const reason = pct === 0
    ? `You haven't mastered ${weakConcept} yet — try this targeted mission.`
    : `Your weakest skill is ${weakConcept} at ${pct}% mastery. A focused review will help.`;

  return { mission, reason, weakConcept, score };
}
