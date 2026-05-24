// Maps concept names to the SQL keyword the engine must detect in the query.
export const conceptKeywords = {
  'WHERE':          { keyword: 'WHERE',    pattern: /\bWHERE\b/i },
  'JOIN':           { keyword: 'JOIN',     pattern: /\bJOIN\b/i },
  'Self-Join':      { keyword: 'JOIN',     pattern: /\bJOIN\b/i },
  'GROUP BY':       { keyword: 'GROUP BY', pattern: /\bGROUP\s+BY\b/i },
  'ORDER BY':       { keyword: 'ORDER BY', pattern: /\bORDER\s+BY\b/i },
  'HAVING':         { keyword: 'HAVING',   pattern: /\bHAVING\b/i },
  'WITH':           { keyword: 'WITH',     pattern: /\bWITH\b/i },
  'CTE':            { keyword: 'WITH',     pattern: /\bWITH\b/i },
  'Recursive CTE':  { keyword: 'WITH',     pattern: /\bWITH\b/i },
  'WITH RECURSIVE': { keyword: 'WITH',     pattern: /\bWITH\b/i },
  'Window Function':{ keyword: 'OVER',     pattern: /\bOVER\b/i },
  'SUM OVER':       { keyword: 'OVER',     pattern: /\bOVER\b/i },
  'LAG':            { keyword: 'OVER',     pattern: /\bOVER\b/i },
  'RANK':           { keyword: 'OVER',     pattern: /\bOVER\b/i },
  'DENSE_RANK':     { keyword: 'OVER',     pattern: /\bOVER\b/i },
  'CASE':           { keyword: 'CASE',     pattern: /\bCASE\b/i },
  'LEFT JOIN':      { keyword: 'LEFT JOIN',pattern: /\bLEFT\s+JOIN\b/i },
};

export const skillMap = {
  select_where: {
    label: 'SELECT and WHERE',
    level: 'beginner',
    prerequisites: [],
    keywords: ['SELECT', 'FROM', 'WHERE', 'comparison operators']
  },
  where_in: {
    label: 'WHERE IN',
    level: 'beginner',
    prerequisites: ['select_where'],
    keywords: ['IN', 'NOT IN', 'list filters', 'membership']
  },
  joins: {
    label: 'Joins',
    level: 'beginner',
    prerequisites: ['select_where'],
    keywords: ['JOIN', 'INNER JOIN', 'ON', 'table relationships']
  },
  group_by: {
    label: 'GROUP BY',
    level: 'beginner',
    prerequisites: ['select_where'],
    keywords: ['GROUP BY', 'COUNT', 'SUM', 'AVG', 'aggregate functions']
  },
  having: {
    label: 'HAVING',
    level: 'intermediate',
    prerequisites: ['group_by'],
    keywords: ['HAVING', 'aggregate filters', 'group filters']
  },
  order_by: {
    label: 'ORDER BY',
    level: 'beginner',
    prerequisites: ['select_where'],
    keywords: ['ORDER BY', 'ASC', 'DESC', 'sorting']
  },
  distinct: {
    label: 'DISTINCT',
    level: 'beginner',
    prerequisites: ['select_where'],
    keywords: ['DISTINCT', 'unique rows', 'deduplication']
  },
  subquery: {
    label: 'Subqueries',
    level: 'intermediate',
    prerequisites: ['select_where', 'where_in'],
    keywords: ['subquery', 'nested SELECT', 'derived values']
  },
  exists: {
    label: 'EXISTS',
    level: 'intermediate',
    prerequisites: ['subquery'],
    keywords: ['EXISTS', 'NOT EXISTS', 'correlated subquery']
  },
  cte: {
    label: 'Common Table Expressions',
    level: 'intermediate',
    prerequisites: ['select_where', 'subquery'],
    keywords: ['WITH', 'CTE', 'temporary result set']
  },
  case_when: {
    label: 'CASE WHEN',
    level: 'intermediate',
    prerequisites: ['select_where'],
    keywords: ['CASE', 'WHEN', 'THEN', 'ELSE', 'conditional logic']
  },
  null_handling: {
    label: 'NULL Handling',
    level: 'intermediate',
    prerequisites: ['select_where'],
    keywords: ['NULL', 'IS NULL', 'IS NOT NULL', 'COALESCE']
  },
  string_functions: {
    label: 'String Functions',
    level: 'intermediate',
    prerequisites: ['select_where'],
    keywords: ['LIKE', 'LOWER', 'UPPER', 'TRIM', 'string matching']
  },
  window_functions: {
    label: 'Window Functions',
    level: 'advanced',
    prerequisites: ['group_by', 'order_by'],
    keywords: ['OVER', 'PARTITION BY', 'ROW_NUMBER', 'RANK', 'running total']
  },
  recursive_cte: {
    label: 'Recursive CTEs',
    level: 'advanced',
    prerequisites: ['cte'],
    keywords: ['WITH RECURSIVE', 'UNION ALL', 'anchor query', 'recursive query']
  },
  conditional_aggregation: {
    label: 'Conditional Aggregation',
    level: 'advanced',
    prerequisites: ['group_by', 'case_when'],
    keywords: ['SUM CASE', 'COUNT CASE', 'filtered counts', 'conditional totals']
  }
};

export default skillMap;
