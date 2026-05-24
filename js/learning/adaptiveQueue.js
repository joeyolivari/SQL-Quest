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

function getFallbackQueue(missions, difficulty, limit) {
  return missions
    .filter(mission => mission.difficulty === difficulty)
    .slice(0, limit);
}
