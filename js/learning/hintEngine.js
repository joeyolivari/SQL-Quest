const hintProgress = new Map();

function hasHintSteps(mission) {
  return Array.isArray(mission.hintSteps) && mission.hintSteps.length > 0;
}

export function resetHintLadder(missionId) {
  hintProgress.delete(missionId);
}

export function getNextHint(mission) {
  if (!mission) {
    return { text: '', shouldConsume: false, isProgressive: false };
  }

  if (!hasHintSteps(mission)) {
    const alreadyShown = hintProgress.get(mission.id) === 'shown';
    hintProgress.set(mission.id, 'shown');
    return {
      text: mission.hint || '',
      shouldConsume: !alreadyShown,
      isProgressive: false
    };
  }

  const currentStep = hintProgress.get(mission.id) || 0;
  const nextStep = Math.min(currentStep, mission.hintSteps.length - 1);
  const isNewStep = currentStep < mission.hintSteps.length;

  if (isNewStep) {
    hintProgress.set(mission.id, currentStep + 1);
  }

  return {
    text: mission.hintSteps[nextStep],
    shouldConsume: isNewStep,
    isProgressive: true,
    step: nextStep + 1,
    total: mission.hintSteps.length
  };
}
