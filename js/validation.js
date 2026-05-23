export function compareResults(userResult, expectedResult, requiredColumns, orderMatters) {
  const missing = getMissingColumns(userResult.columns, requiredColumns);
  if (missing.length > 0) {
    return { ok: false, message: 'Missing required column(s): ' + missing.join(', ') + '.' };
  }

  const userRows = projectRows(userResult, requiredColumns);
  const expectedColNames = requiredColumns.map(col => typeof col === 'string' ? col : col.name);
  const expectedRows = projectRows(expectedResult, expectedColNames);

  if (userRows.length !== expectedRows.length) {
    return { ok: false, message: 'Expected ' + expectedRows.length + ' row(s), but your query returned ' + userRows.length + '.' };
  }

  const userComp = userRows.map(row => JSON.stringify(row));
  const expComp = expectedRows.map(row => JSON.stringify(row));

  if (!orderMatters) { userComp.sort(); expComp.sort(); }

  const ok = JSON.stringify(userComp) === JSON.stringify(expComp);
  return {
    ok,
    message: orderMatters
      ? 'Rows or row order do not match. This mission requires the correct ORDER BY.'
      : 'Rows do not match the expected compliance result set.'
  };
}

function getMissingColumns(columns, requiredColumns) {
  const lower = columns.map(c => c.toLowerCase());
  const missing = [];
  requiredColumns.forEach(col => {
    const names = typeof col === 'string' ? [col] : [col.name, ...(col.aliases || [])];
    if (!names.some(n => lower.includes(n.toLowerCase()))) {
      missing.push(typeof col === 'string' ? col : col.name);
    }
  });
  return missing;
}

function projectRows(result, requiredColumns) {
  const lower = result.columns.map(c => c.toLowerCase());
  return result.rows.map(row =>
    requiredColumns.map(col => {
      const names = typeof col === 'string' ? [col] : [col.name, ...(col.aliases || [])];
      const idx = names.map(n => lower.indexOf(n.toLowerCase())).find(i => i >= 0);
      return normalizeValue(row[idx]);
    })
  );
}

function normalizeValue(value) {
  if (value === null || value === undefined) return '__null__';
  if (typeof value === 'number') return Number(value.toFixed(4));
  return String(value).trim().toLowerCase();
}
