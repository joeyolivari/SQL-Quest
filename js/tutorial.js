export const tutorials = [
  {
    concept: 'SELECT',
    summary: 'Choose which columns to return from a table.',
    example: `SELECT full_name, kyc_status\nFROM clients;`,
    complianceUse: 'Retrieve specific client fields for KYC review or audit reporting.'
  },
  {
    concept: 'WHERE',
    summary: 'Filter rows to only those matching a condition.',
    example: `SELECT * FROM clients\nWHERE kyc_status = 'pending';`,
    complianceUse: 'Isolate clients or transactions that meet a specific compliance condition.'
  },
  {
    concept: 'JOIN',
    summary: 'Combine rows from two tables using a shared key.',
    example: `SELECT c.full_name, a.account_type\nFROM clients c\nJOIN accounts a ON c.client_id = a.client_id;`,
    complianceUse: 'Link clients to accounts, transactions, or reviews for complete risk profiles.'
  },
  {
    concept: 'GROUP BY',
    summary: 'Collapse rows into groups and apply aggregate functions.',
    example: `SELECT severity, COUNT(*) AS total\nFROM compliance_flags\nGROUP BY severity;`,
    complianceUse: 'Summarise exceptions by category for management reporting.'
  },
  {
    concept: 'HAVING',
    summary: 'Filter groups after aggregation — like WHERE for GROUP BY.',
    example: `SELECT advisor_id, COUNT(*) AS issues\nFROM compliance_reviews\nGROUP BY advisor_id\nHAVING COUNT(*) > 1;`,
    complianceUse: 'Identify advisors or accounts with a material number of unresolved issues.'
  },
  {
    concept: 'LEFT JOIN',
    summary: 'Return all rows from the left table, with NULLs where no match exists on the right.',
    example: `SELECT a.account_id, cr.review_id\nFROM accounts a\nLEFT JOIN compliance_reviews cr\n  ON a.account_id = cr.account_id;`,
    complianceUse: 'Find accounts or clients that have no corresponding review record.'
  },
  {
    concept: 'CASE',
    summary: 'Return different values based on conditional logic — SQL\'s if/else.',
    example: `SELECT amount,\n  CASE\n    WHEN amount >= 10000 THEN 'High'\n    WHEN amount >= 5000  THEN 'Medium'\n    ELSE 'Low'\n  END AS risk_band\nFROM transactions;`,
    complianceUse: 'Classify raw values into reporting categories without altering source data.'
  },
  {
    concept: 'CTE',
    summary: 'Name an intermediate result with WITH and reference it like a table.',
    example: `WITH flagged AS (\n  SELECT t.account_id, COUNT(*) AS flags\n  FROM compliance_flags cf\n  JOIN transactions t ON cf.transaction_id = t.transaction_id\n  GROUP BY t.account_id\n)\nSELECT * FROM flagged WHERE flags >= 2;`,
    complianceUse: 'Break complex multi-step queries into readable named stages before the final SELECT.'
  },
  {
    concept: 'EXISTS',
    summary: 'Test whether a correlated subquery returns at least one row.',
    example: `SELECT full_name FROM clients c\nWHERE EXISTS (\n  SELECT 1 FROM accounts a\n  WHERE a.client_id = c.client_id\n    AND a.account_status = 'Suspended'\n);`,
    complianceUse: 'Efficiently check whether a client meets at least one exception condition.'
  },
  {
    concept: 'Window Functions',
    summary: 'Compute values across a set of rows related to the current row without collapsing them.',
    example: `SELECT account_id, amount,\n  ROW_NUMBER() OVER (\n    PARTITION BY account_id\n    ORDER BY transaction_date DESC\n  ) AS rn\nFROM transactions;`,
    complianceUse: 'Rank or sequence transactions per account to find the latest activity or detect duplicates.'
  }
];
