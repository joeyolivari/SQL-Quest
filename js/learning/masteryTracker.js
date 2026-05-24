import { skillMap } from './skillMap.js';

export function buildMasteryProfile(missions, savedProgress) {
  const completedMissionIds = getCompletedMissionIds(savedProgress);
  const completedMissions = missions.filter(mission => completedMissionIds.has(mission.id));
  const skills = Object.entries(skillMap).map(([id, skill]) => {
    const total = missions.filter(mission => mission.skillIds?.includes(id)).length;
    const completed = completedMissions.filter(mission => mission.skillIds?.includes(id)).length;
    const mastery = total ? Math.round((completed / total) * 100) : 0;

    return {
      id,
      label: skill.label,
      level: skill.level,
      total,
      completed,
      remaining: Math.max(total - completed, 0),
      mastery
    };
  }).filter(skill => skill.total > 0);

  return {
    completedMissionIds,
    hasMasteryData: completedMissionIds.size > 0,
    totalCompleted: completedMissionIds.size,
    totalMissions: missions.length,
    skills
  };
}

export function getStrongestSkills(profile, limit = 3) {
  return [...profile.skills]
    .filter(skill => skill.completed > 0)
    .sort((a, b) => b.mastery - a.mastery || b.completed - a.completed || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function getWeakestSkills(profile, limit = 3) {
  return [...profile.skills]
    .filter(skill => skill.mastery < 100)
    .sort((a, b) => a.mastery - b.mastery || b.remaining - a.remaining || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function getCompletedMissionIds(savedProgress) {
  const queueIds = savedProgress?.queueIds || [];
  const completed = savedProgress?.completedMissions || [];
  return new Set(completed.map(index => queueIds[index]).filter(Boolean));
}
