const DIFF_ORDER = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
const REVIEW_SCORE_THRESHOLD = 0.6;

export function buildWeakSkillQueue(missions, masteryProfile, options = {}) {
  const limit = options.limit || 8;
  const fallbackDifficulty = options.fallbackDifficulty || 'Beginner';
  const weakSkills = masteryProfile.skills || [];

  if (!masteryProfile.hasMasteryData) {
    return getFallbackQueue(missions, fallbackDifficulty, limit);
  }

  const completedMissionIds = masteryProfile.completedMissionIds || new Set();
  const weakSkillIds = new Set(weakSkills.map(skill => skill.id));
  const weakMissions = missions.filter(mission =>
    mission.skillIds?.some(skillId => weakSkillIds.has(skillId))
  );

  const incomplete = weakMissions.filter(mission => !completedMissionIds.has(mission.id));
  const review = weakMissions.filter(mission => completedMissionIds.has(mission.id));
  const queue = [...incomplete, ...review].slice(0, limit);

  return queue.length ? queue : getFallbackQueue(missions, fallbackDifficulty, limit);
}

function getMissionsByDifficulty(allMissions, difficulty) {
  if (difficulty === 'all') return [...allMissions];
  const filtered = allMissions.filter(m => m.difficulty?.toLowerCase() === difficulty);
  return filtered.length ? filtered : [...allMissions];
}

function getFallbackQueue(missions, difficulty, limit) {
  return missions
    .filter(mission => mission.difficulty === difficulty)
    .slice(0, limit);
}

function collectByConceptRank(allMissions, rankedConcepts) {
  const seen = new Set();
  const queue = [];
  for (const concept of rankedConcepts) {
    allMissions
      .filter(m => m.concepts?.includes(concept) && !seen.has(m.id))
      .sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 3) - (DIFF_ORDER[b.difficulty] ?? 3))
      .forEach(m => { seen.add(m.id); queue.push(m); });
  }
  return { queue, seen };
}

/**
 * Training queue: missions ordered weakest-concept-first, then filled with
 * remaining difficulty-filtered missions. Falls back to difficulty queue when
 * no mastery data exists.
 */
export function buildTrainingQueue(allMissions, masteryProgress, difficulty) {
  const fallback = getMissionsByDifficulty(allMissions, difficulty);
  const attempted = masteryProgress
    ? Object.entries(masteryProgress)
        .filter(([, d]) => d.attempts > 0)
        .sort(([, a], [, b]) => a.score - b.score || 0)
        .map(([concept]) => concept)
    : [];

  if (!attempted.length) return { queue: fallback, usingFallback: true };

  const { queue, seen } = collectByConceptRank(allMissions, attempted);
  fallback.forEach(m => { if (!seen.has(m.id)) queue.push(m); });
  return { queue: queue.length ? queue : fallback, usingFallback: !queue.length };
}

/**
 * Review queue: only missions that cover concepts with score < threshold.
 * If nothing qualifies, uses the 3 lowest-scoring attempted concepts instead.
 * Falls back to difficulty queue when no mastery data exists.
 */
export function buildReviewQueue(allMissions, masteryProgress, difficulty) {
  const fallback = getMissionsByDifficulty(allMissions, difficulty);
  if (!masteryProgress) return { queue: fallback, usingFallback: true };

  const attempted = Object.entries(masteryProgress).filter(([, d]) => d.attempts > 0);
  if (!attempted.length) return { queue: fallback, usingFallback: true };

  let weakConcepts = attempted
    .filter(([, d]) => d.score < REVIEW_SCORE_THRESHOLD)
    .sort(([, a], [, b]) => a.score - b.score)
    .map(([c]) => c);

  if (!weakConcepts.length) {
    // Everything is passing — review the 3 lowest scorers anyway
    weakConcepts = attempted
      .sort(([, a], [, b]) => a.score - b.score)
      .slice(0, 3)
      .map(([c]) => c);
  }

  const { queue } = collectByConceptRank(allMissions, weakConcepts);
  return { queue: queue.length ? queue : fallback, usingFallback: !queue.length };
}

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
    .filter(m => m.concepts?.includes(weakConcept))
    .sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 3) - (DIFF_ORDER[b.difficulty] ?? 3));

  if (!related.length) return null;

  const mission = related[0];
  const pct = Math.round(score * 100);
  const reason = pct === 0
    ? `You haven't mastered ${weakConcept} yet — try this targeted mission.`
    : `Your weakest skill is ${weakConcept} at ${pct}% mastery. A focused review will help.`;

  return { mission, reason, weakConcept, score };
}
