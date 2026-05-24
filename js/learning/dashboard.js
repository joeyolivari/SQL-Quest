import { buildMasteryProfile, getStrongestSkills, getWeakestSkills } from './masteryTracker.js';

export function buildLearningDashboard(missions, savedProgress) {
  const profile = buildMasteryProfile(missions, savedProgress);
  const completedMissionIds = profile.completedMissionIds;
  const skillStats = profile.skills;
  const strongest = getStrongestSkills(profile);
  const weakest = getWeakestSkills(profile);

  const recommendedSkill = weakest[0] || skillStats.find(skill => skill.mastery < 100) || null;
  const recommendedMission = recommendedSkill
    ? missions.find(mission => !completedMissionIds.has(mission.id) && mission.skillIds?.includes(recommendedSkill.id))
    : missions.find(mission => !completedMissionIds.has(mission.id));

  return {
    totalCompleted: profile.totalCompleted,
    totalMissions: profile.totalMissions,
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
