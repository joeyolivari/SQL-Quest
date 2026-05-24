import { skillMap } from './skillMap.js';

export function buildLearningDashboard(missions, savedProgress) {
  const completedMissionIds = getCompletedMissionIds(savedProgress);
  const completedMissions = missions.filter(mission => completedMissionIds.has(mission.id));
  const skillStats = Object.entries(skillMap).map(([id, skill]) => {
    const total = missions.filter(mission => mission.skillIds?.includes(id)).length;
    const completed = completedMissions.filter(mission => mission.skillIds?.includes(id)).length;
    const mastery = total ? Math.round((completed / total) * 100) : 0;

    return {
      id,
      label: skill.label,
      level: skill.level,
      total,
      completed,
      mastery
    };
  }).filter(skill => skill.total > 0);

  const strongest = [...skillStats]
    .filter(skill => skill.completed > 0)
    .sort((a, b) => b.mastery - a.mastery || b.completed - a.completed || a.label.localeCompare(b.label))
    .slice(0, 3);

  const weakest = [...skillStats]
    .filter(skill => skill.mastery < 100)
    .sort((a, b) => a.mastery - b.mastery || b.total - b.completed - (a.total - a.completed) || a.label.localeCompare(b.label))
    .slice(0, 3);

  const recommendedSkill = weakest[0] || skillStats.find(skill => skill.mastery < 100) || null;
  const recommendedMission = recommendedSkill
    ? missions.find(mission => !completedMissionIds.has(mission.id) && mission.skillIds?.includes(recommendedSkill.id))
    : missions.find(mission => !completedMissionIds.has(mission.id));

  return {
    totalCompleted: completedMissionIds.size,
    totalMissions: missions.length,
    strongest,
    weakest,
    recommended: recommendedMission
      ? {
          missionId: recommendedMission.id,
          missionTitle: recommendedMission.title,
          skillLabel: recommendedSkill?.label || 'Next mission'
        }
      : {
          missionId: null,
          missionTitle: 'All missions complete',
          skillLabel: 'Review any skill'
        },
    skills: skillStats.sort((a, b) => a.label.localeCompare(b.label))
  };
}

function getCompletedMissionIds(savedProgress) {
  const queueIds = savedProgress?.queueIds || [];
  const completed = savedProgress?.completedMissions || [];
  return new Set(completed.map(index => queueIds[index]).filter(Boolean));
}
