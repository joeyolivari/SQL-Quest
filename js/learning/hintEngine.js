// Step-by-step progressive hints for missions 1–5.
export const hintSteps = {
  1: [
    'Start with the columns: SELECT client_id, full_name, kyc_status FROM clients',
    'Add a WHERE clause to filter by kyc_status',
    "Use IN to match both values: WHERE kyc_status IN ('pending', 'expired')",
  ],
  2: [
    'You need to join the clients table to the accounts table using client_id',
    'Add: JOIN accounts a ON c.client_id = a.client_id',
    "Add a WHERE clause: WHERE c.kyc_status = 'pending' AND a.account_status = 'Active'",
  ],
  3: [
    'Select the four required columns from the transactions table',
    'Add ORDER BY to sort the results',
    'Sort from largest to smallest: ORDER BY amount DESC',
  ],
  4: [
    'Use COUNT(*) AS transaction_count to count rows',
    'Add GROUP BY account_id so the count is per account',
    'Sort the output: ORDER BY transaction_count DESC',
  ],
  5: [
    "The WHERE already filters to transaction_type = 'Deposit' — keep it",
    'GROUP BY account_id gives you one row per account',
    'Use HAVING SUM(amount) > 50000 to filter after aggregation',
  ],
};

export function getHintStep(missionId, stepIndex) {
  const steps = hintSteps[missionId];
  if (!steps) return null;
  return steps[Math.min(stepIndex, steps.length - 1)] ?? null;
}
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
