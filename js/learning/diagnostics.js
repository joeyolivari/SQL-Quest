import { conceptKeywords } from './skillMap.js';

// Ordered so the most structural/defining concept for each mission fires first.
const CHECKS = [
  {
    type: 'missing_with',
    active: (m) => m.concepts.some(c => ['WITH', 'CTE', 'Recursive CTE', 'WITH RECURSIVE'].includes(c)),
    present: (sql) => /\bWITH\b/i.test(sql),
    message: 'Your query is missing a WITH clause (CTE).',
    nextStep: 'Define a CTE before your SELECT: WITH name AS ( SELECT ... ) SELECT ... FROM name',
  },
  {
    type: 'missing_over',
    active: (m) => m.concepts.some(c => conceptKeywords[c]?.keyword === 'OVER'),
    present: (sql) => /\bOVER\b/i.test(sql),
    message: 'Your query is missing OVER — this mission uses a window function.',
    nextStep: 'Add OVER (...) after your window function. '
            + 'Example: SUM(amount) OVER (PARTITION BY account_id ORDER BY transaction_date)',
  },
  {
    type: 'missing_case',
    active: (m) => m.concepts.includes('CASE'),
    present: (sql) => /\bCASE\b/i.test(sql),
    message: 'Your query is missing a CASE expression.',
    nextStep: "Add CASE WHEN ... THEN ... ELSE ... END to classify rows. "
            + "Example: CASE WHEN amount > 80000 THEN 'High' ELSE 'Low' END",
  },
  {
    type: 'missing_left_join',
    active: (m) => m.concepts.includes('LEFT JOIN'),
    present: (sql) => /\bLEFT\s+JOIN\b/i.test(sql),
    message: 'Your query is missing a LEFT JOIN.',
    nextStep: 'Add LEFT JOIN to keep rows from the left table even when there is no match. '
            + 'Example: LEFT JOIN compliance_reviews cr ON a.account_id = cr.account_id',
  },
  {
    type: 'missing_join',
    active: (m) => m.concepts.some(c => c === 'JOIN' || c === 'Self-Join'),
    present: (sql) => /\bJOIN\b/i.test(sql),
    message: 'Your query is missing a JOIN.',
    nextStep: 'Add a JOIN to combine two tables. '
            + 'Example: JOIN accounts a ON c.client_id = a.client_id',
  },
  {
    type: 'missing_having',
    active: (m) => m.concepts.includes('HAVING'),
    present: (sql) => /\bHAVING\b/i.test(sql),
    message: 'Your query is missing a HAVING clause.',
    nextStep: 'Use HAVING to filter after aggregation. Example: HAVING SUM(amount) > 50000',
  },
  {
    type: 'missing_group_by',
    active: (m) => m.concepts.includes('GROUP BY'),
    present: (sql) => /\bGROUP\s+BY\b/i.test(sql),
    message: 'Your query is missing GROUP BY.',
    nextStep: 'Add GROUP BY to aggregate rows into groups. Example: GROUP BY account_id',
  },
  {
    type: 'missing_order_by',
    active: (m) => m.orderMatters,
    present: (sql) => /\bORDER\s+BY\b/i.test(sql),
    message: 'This mission requires ORDER BY — results must be sorted in a specific order.',
    nextStep: 'Add ORDER BY to sort your results. Example: ORDER BY amount DESC',
  },
  {
    type: 'missing_where',
    active: (m) => m.concepts.includes('WHERE'),
    present: (sql) => /\bWHERE\b/i.test(sql),
    message: 'Your query is missing a WHERE clause.',
    nextStep: "Add WHERE to filter rows. Example: WHERE kyc_status = 'pending'",
  },
];

/**
 * Inspect sql against the mission's required concepts and return a targeted
 * diagnostic when a key clause is absent, or null when no structural gap is found.
 *
 * @param {string} sql - The SQL the learner submitted.
 * @param {object} mission - A mission object from missions.js.
 * @param {object} validationResult - The result returned by compareResults.
 * @returns {{ type: string, message: string, nextStep: string } | null}
 */
export function diagnoseSQL(sql, mission, validationResult) {
  if (!mission?.concepts?.length) return null;
  for (const check of CHECKS) {
    if (check.active(mission) && !check.present(sql)) {
      return { type: check.type, message: check.message, nextStep: check.nextStep };
    }
  }
  return null;
}
