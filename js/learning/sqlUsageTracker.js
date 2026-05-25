const STORAGE_KEY = 'csq_sql_usage_stats';

export const SQL_USAGE_SKILLS = [
  { id: 'select', label: 'SELECT', pattern: /\bSELECT\b/gi },
  { id: 'where', label: 'WHERE', pattern: /\bWHERE\b/gi },
  { id: 'join', label: 'JOIN', pattern: /\b(?:INNER\s+|RIGHT\s+|FULL\s+|CROSS\s+)?JOIN\b/gi },
  { id: 'leftJoin', label: 'LEFT JOIN', pattern: /\bLEFT\s+JOIN\b/gi },
  { id: 'groupBy', label: 'GROUP BY', pattern: /\bGROUP\s+BY\b/gi },
  { id: 'having', label: 'HAVING', pattern: /\bHAVING\b/gi },
  { id: 'orderBy', label: 'ORDER BY', pattern: /\bORDER\s+BY\b/gi },
  { id: 'count', label: 'COUNT', pattern: /\bCOUNT\s*\(/gi },
  { id: 'sum', label: 'SUM', pattern: /\bSUM\s*\(/gi },
  { id: 'avg', label: 'AVG', pattern: /\bAVG\s*\(/gi },
  { id: 'min', label: 'MIN', pattern: /\bMIN\s*\(/gi },
  { id: 'max', label: 'MAX', pattern: /\bMAX\s*\(/gi },
  { id: 'case', label: 'CASE', pattern: /\bCASE\b/gi },
  { id: 'cte', label: 'WITH/CTE', pattern: /\bWITH\b/gi },
  { id: 'subquery', label: 'SUBQUERY', pattern: /\(\s*SELECT\b/gi },
  { id: 'insert', label: 'INSERT', pattern: /\bINSERT\b/gi },
  { id: 'update', label: 'UPDATE', pattern: /\bUPDATE\b/gi },
  { id: 'delete', label: 'DELETE', pattern: /\bDELETE\b/gi },
  { id: 'create', label: 'CREATE', pattern: /\bCREATE\b/gi },
  { id: 'drop', label: 'DROP', pattern: /\bDROP\b/gi },
];

export function loadSqlUsageStats() {
  const blank = createBlankStats();
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return { ...blank, ...saved };
  } catch (e) {
    return blank;
  }
}

export function recordSqlUsage(sql) {
  const stats = loadSqlUsageStats();
  SQL_USAGE_SKILLS.forEach(skill => {
    const matches = String(sql || '').match(skill.pattern);
    if (matches) stats[skill.id] = (stats[skill.id] || 0) + matches.length;
  });
  saveStats(stats);
  return stats;
}

export function resetSqlUsageStats() {
  const stats = createBlankStats();
  saveStats(stats);
  return stats;
}

function createBlankStats() {
  return SQL_USAGE_SKILLS.reduce((acc, skill) => {
    acc[skill.id] = 0;
    return acc;
  }, {});
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {}
}
