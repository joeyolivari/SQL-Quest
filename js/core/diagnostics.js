export function getDiagnosticMessage({ sql, mission, userResult, expectedResult, validationMessage }) {
  const checks = [
    detectWrongAlias,
    detectWhereInsteadOfHaving,
    detectWrongAggregate,
    detectMissingFilterValue,
    detectWrongJoinKey,
    detectMissingPartitionBy,
    detectMissingWindowOrderBy
  ];

  for (const check of checks) {
    const message = check(sql, mission, userResult, expectedResult, validationMessage);
    if (message) return message;
  }

  return validationMessage;
}

function detectWrongAlias(sql, mission, userResult, expectedResult, validationMessage) {
  const missingColumns = getMissingRequiredColumns(userResult?.columns || [], mission.requiredColumns || []);
  if (!missingColumns.length) return '';

  const userColumnCount = userResult?.columns?.length || 0;
  const expectedColumnCount = expectedResult?.columns?.length || (mission.requiredColumns || []).length;
  if (userColumnCount !== expectedColumnCount) return '';

  return `Your result has the right number of columns, but the alias is off. Rename the missing column as ${missingColumns.join(', ')}.`;
}

function detectWrongAggregate(sql, mission) {
  const expectedAggregates = getAggregates(mission.solutionSQL);
  if (!expectedAggregates.length) return '';

  const userAggregates = getAggregates(sql);
  const missing = expectedAggregates.filter(fn => !userAggregates.includes(fn));
  const wrong = userAggregates.filter(fn => !expectedAggregates.includes(fn));

  if (!missing.length && !wrong.length) return '';
  if (missing.length && wrong.length) {
    return `Check the aggregate function: this mission needs ${formatList(missing)}, but your query uses ${formatList(wrong)}.`;
  }
  if (missing.length) return `Check the aggregate function: this mission needs ${formatList(missing)}.`;
  return `Check the aggregate function: ${formatList(wrong)} does not match this mission's expected calculation.`;
}

function detectMissingFilterValue(sql, mission) {
  const expectedValues = getFilterValues(mission.solutionSQL);
  if (!expectedValues.length) return '';

  const userSql = normalize(sql);
  const missing = expectedValues.filter(value => !userSql.includes(value));
  if (!missing.length) return '';

  return `Your filter is missing required value ${formatList(missing)}. Recheck the WHERE or HAVING condition in the mission.`;
}

function detectWhereInsteadOfHaving(sql, mission) {
  const userSql = normalize(sql);
  const expectedSql = normalize(mission.solutionSQL);
  if (!expectedSql.includes(' HAVING ')) return '';
  if (userSql.includes(' HAVING ')) return '';

  const hasAggregateFilter = /\bWHERE\b[^;]*(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(sql);
  if (hasAggregateFilter || userSql.includes(' GROUP BY ')) {
    return 'This filter belongs in HAVING because it runs after GROUP BY. Keep row-level filters in WHERE and aggregate filters in HAVING.';
  }

  return '';
}

function detectWrongJoinKey(sql, mission) {
  const expectedPairs = getJoinKeyPairs(mission.solutionSQL);
  if (!expectedPairs.length) return '';

  const userSql = normalize(sql);
  const missing = expectedPairs.filter(pair => !userSql.includes(pair));
  if (!missing.length) return '';

  return `Check the JOIN key. This mission needs ${missing[0].replace(' = ', ' = ')} in the join condition.`;
}

function detectMissingPartitionBy(sql, mission) {
  const expectedWindows = getWindowBodies(mission.solutionSQL);
  if (!expectedWindows.some(body => body.includes('PARTITION BY'))) return '';

  const userWindows = getWindowBodies(sql);
  if (!userWindows.length) return '';
  if (userWindows.some(body => body.includes('PARTITION BY'))) return '';

  return 'Your window function is missing PARTITION BY. Add it inside OVER (...) so the calculation resets for each group.';
}

function detectMissingWindowOrderBy(sql, mission) {
  const expectedWindows = getWindowBodies(mission.solutionSQL);
  if (!expectedWindows.some(body => body.includes('ORDER BY'))) return '';

  const userWindows = getWindowBodies(sql);
  if (!userWindows.length) return '';
  if (userWindows.some(body => body.includes('ORDER BY'))) return '';

  return 'Your window function is missing ORDER BY inside OVER (...). A regular ORDER BY at the end does not define the window sequence.';
}

function getMissingRequiredColumns(columns, requiredColumns) {
  const lowerColumns = columns.map(col => String(col).toLowerCase());
  return requiredColumns
    .map(col => typeof col === 'string' ? { name: col, aliases: [] } : col)
    .filter(col => ![col.name, ...(col.aliases || [])].some(name => lowerColumns.includes(String(name).toLowerCase())))
    .map(col => col.name);
}

function getAggregates(sql) {
  const matches = normalize(sql).match(/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/g) || [];
  return [...new Set(matches.map(match => match.replace(/\s*\($/, '')))];
}

function getFilterValues(sql) {
  const clauses = normalize(sql).match(/\b(WHERE|HAVING)\b[\s\S]*?(?=\bGROUP BY\b|\bORDER BY\b|\bUNION\b|\)|;|$)/g) || [];
  const values = [];

  clauses.forEach(clause => {
    values.push(...(clause.match(/'[^']*'/g) || []));
    values.push(...(clause.match(/\b\d+(?:\.\d+)?\b/g) || []));
  });

  return [...new Set(values)];
}

function getJoinKeyPairs(sql) {
  const joinClauses = normalize(sql).match(/\bJOIN\b[\s\S]*?\bON\b[\s\S]*?(?=\bJOIN\b|\bWHERE\b|\bGROUP BY\b|\bHAVING\b|\bORDER BY\b|\bUNION\b|;|$)/g) || [];
  const pairs = joinClauses.flatMap(clause => clause.match(/\b\w+\.\w+\s*=\s*\w+\.\w+\b/g) || []);
  return [...new Set(pairs.map(pair => pair.replace(/\s*=\s*/, ' = ')))];
}

function getWindowBodies(sql) {
  const matches = normalize(sql).match(/\bOVER\s*\(([^)]*)\)/g) || [];
  return matches.map(match => match.replace(/^OVER\s*\(/, '').replace(/\)$/, ''));
}

function normalize(sql) {
  return String(sql || '').replace(/\s+/g, ' ').trim().toUpperCase();
}

function formatList(items) {
  return items.join(', ');
}
