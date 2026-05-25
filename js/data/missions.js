export const missions = [
  {
    id: 1,
    title: 'SELECT + WHERE — KYC Sweep',
    difficulty: 'Beginner',
    scenario: 'Client Documentation Review',
    concepts: ['SELECT', 'WHERE', 'IN'],
    skillIds: ['select_where', 'where_in'],
    task: "Find all clients whose kyc_status is 'pending' or 'expired'. Return client_id, full_name, and kyc_status.",
    requiredColumns: ['client_id', 'full_name', 'kyc_status'],
    orderMatters: false,
    starterSQL: "SELECT client_id, full_name, kyc_status\nFROM clients\nWHERE ",
    solutionSQL: "SELECT client_id, full_name, kyc_status\nFROM clients\nWHERE kyc_status IN ('pending', 'expired');",
    hint: "Use WHERE kyc_status IN ('pending', 'expired').",
    hintSteps: [
      'Start by filtering rows in the clients table with WHERE.',
      "You need two possible kyc_status values: 'pending' and 'expired'.",
      "Use IN: WHERE kyc_status IN ('pending', 'expired')."
    ],
    explanation: "KYC filtering is the first step in compliance monitoring. A simple WHERE clause helps isolate incomplete or expired client documentation before it becomes an audit issue."
  },
  {
    id: 2,
    title: 'JOIN — Pending KYC With Active Accounts',
    difficulty: 'Beginner',
    scenario: 'Client Documentation Review',
    concepts: ['JOIN', 'WHERE'],
    skillIds: ['joins', 'select_where'],
    task: "Find active accounts belonging to clients with pending KYC. Return client_id, full_name, account_id, account_type, and account_status.",
    requiredColumns: ['client_id', 'full_name', 'account_id', 'account_type', 'account_status'],
    orderMatters: false,
    starterSQL: "SELECT c.client_id, c.full_name, a.account_id, a.account_type, a.account_status\nFROM clients c\nJOIN accounts a ON ",
    solutionSQL: "SELECT c.client_id, c.full_name, a.account_id, a.account_type, a.account_status\nFROM clients c\nJOIN accounts a ON c.client_id = a.client_id\nWHERE c.kyc_status = 'pending'\n  AND a.account_status = 'Active';",
    hint: "Join clients to accounts using client_id, then filter kyc_status = 'pending' and account_status = 'Active'.",
    hintSteps: [
      'Join clients to accounts so each client can be matched to their accounts.',
      'The join condition should connect c.client_id to a.client_id.',
      "After the join, filter for c.kyc_status = 'pending' and a.account_status = 'Active'."
    ],
    explanation: "JOINs connect business entities. In compliance work, the risk is rarely in one table. You often need client data plus account status to identify real operational exposure."
  },
  {
    id: 3,
    title: 'ORDER BY — Sort Transactions By Amount',
    difficulty: 'Beginner',
    scenario: 'Transaction Monitoring',
    concepts: ['ORDER BY', 'DESC'],
    skillIds: ['order_by'],
    task: 'List all transactions sorted by amount from highest to lowest. Return transaction_id, account_id, amount, and transaction_type.',
    requiredColumns: ['transaction_id', 'account_id', 'amount', 'transaction_type'],
    orderMatters: true,
    starterSQL: 'SELECT transaction_id, account_id, amount, transaction_type\nFROM transactions\nORDER BY ',
    solutionSQL: 'SELECT transaction_id, account_id, amount, transaction_type\nFROM transactions\nORDER BY amount DESC;',
    hint: 'Use ORDER BY amount DESC to sort from largest to smallest.',
    hintSteps: [
      'Use ORDER BY to control the order of the result rows.',
      'The mission asks for the largest amounts first.',
      'Sort by amount DESC.'
    ],
    explanation: 'Sorting by amount descending is a classic first pass in transaction monitoring. High-value items float to the top for immediate review without any thresholds or filters.'
  },
  {
    id: 4,
    title: 'COUNT + GROUP BY — Transactions Per Account',
    difficulty: 'Beginner',
    scenario: 'Transaction Monitoring',
    concepts: ['COUNT', 'GROUP BY'],
    skillIds: ['group_by', 'order_by'],
    task: 'Count the number of transactions per account. Return account_id and transaction_count, ordered by transaction_count descending.',
    requiredColumns: ['account_id', 'transaction_count'],
    orderMatters: true,
    starterSQL: 'SELECT account_id, COUNT(*) AS transaction_count\nFROM transactions\nGROUP BY ',
    solutionSQL: 'SELECT account_id, COUNT(*) AS transaction_count\nFROM transactions\nGROUP BY account_id\nORDER BY transaction_count DESC;',
    hint: 'GROUP BY account_id, then use COUNT(*) and alias it transaction_count.',
    hintSteps: [
      'Group the transactions by account_id so each account gets one result row.',
      'Use COUNT(*) to count how many transactions are in each group.',
      'Alias the count as transaction_count and order by transaction_count DESC.'
    ],
    explanation: 'Grouping by account helps surface concentration of activity. Accounts with unusually high transaction counts may warrant a deeper review for layering or structuring patterns.'
  },
  {
    id: 5,
    title: 'SUM + HAVING — High-Volume Accounts',
    difficulty: 'Beginner',
    scenario: 'Transaction Monitoring',
    concepts: ['SUM', 'HAVING', 'GROUP BY'],
    skillIds: ['group_by', 'having'],
    task: 'Find accounts where the total deposited amount exceeds 50000. Return account_id and total_deposited.',
    requiredColumns: ['account_id', 'total_deposited'],
    orderMatters: false,
    starterSQL: "SELECT account_id, SUM(amount) AS total_deposited\nFROM transactions\nWHERE transaction_type = 'Deposit'\nGROUP BY account_id\nHAVING ",
    solutionSQL: "SELECT account_id, SUM(amount) AS total_deposited\nFROM transactions\nWHERE transaction_type = 'Deposit'\nGROUP BY account_id\nHAVING SUM(amount) > 50000;",
    hint: 'Use HAVING SUM(amount) > 50000 after GROUP BY.',
    hintSteps: [
      "First filter the rows to deposits with WHERE transaction_type = 'Deposit'.",
      'Group deposits by account_id and calculate SUM(amount) AS total_deposited.',
      'Use HAVING SUM(amount) > 50000 to keep only high-volume accounts.'
    ],
    explanation: 'HAVING filters after aggregation. This is essential in AML monitoring — you often need to find clients whose cumulative activity crosses a regulatory threshold, not just individual transactions.'
  },
  {
    id: 6,
    title: 'DISTINCT — Unique Scenarios In Compliance Reviews',
    difficulty: 'Beginner',
    scenario: 'Audit Trail Review',
    concepts: ['DISTINCT'],
    skillIds: ['distinct'],
    task: 'Find all unique issue_type values from the compliance_reviews table.',
    requiredColumns: ['issue_type'],
    orderMatters: false,
    starterSQL: 'SELECT DISTINCT ',
    solutionSQL: 'SELECT DISTINCT issue_type\nFROM compliance_reviews;',
    hint: 'Use SELECT DISTINCT issue_type FROM compliance_reviews.',
    hintSteps: [
      'DISTINCT removes duplicate values from a result set.',
      'Select only issue_type from compliance_reviews and make it unique.',
      'Use SELECT DISTINCT issue_type FROM compliance_reviews.'
    ],
    explanation: 'DISTINCT removes duplicates from your result. In audit work, this is useful for cataloguing what categories of issues have been flagged — giving a fast summary without counting or grouping.'
  },
  {
    id: 7,
    title: 'BETWEEN — Mid-Range Account Balances',
    difficulty: 'Beginner',
    scenario: 'Client Documentation Review',
    concepts: ['BETWEEN', 'WHERE'],
    skillIds: ['select_where'],
    task: 'Find all accounts with a current_balance between 30000 and 100000. Return account_id, client_id, account_type, and current_balance.',
    requiredColumns: ['account_id', 'client_id', 'account_type', 'current_balance'],
    orderMatters: false,
    starterSQL: 'SELECT account_id, client_id, account_type, balance AS current_balance\nFROM accounts\nWHERE balance ',
    solutionSQL: 'SELECT account_id, client_id, account_type, balance AS current_balance\nFROM accounts\nWHERE balance BETWEEN 30000 AND 100000;',
    hint: 'Use WHERE balance BETWEEN 30000 AND 100000, and alias balance AS current_balance.',
    hintSteps: [
      'BETWEEN checks whether a value falls inside an inclusive range.',
      'Filter accounts with a WHERE clause on balance.',
      'Use WHERE balance BETWEEN 30000 AND 100000 and return balance AS current_balance.'
    ],
    explanation: 'BETWEEN is inclusive on both ends. In compliance, banding account balances helps analysts focus on a specific risk tier — for example, accounts large enough to matter but below high-net-worth monitoring thresholds.'
  },
  {
    id: 8,
    title: 'NOT IN — Exclude Resolved Compliance Flags',
    difficulty: 'Beginner',
    scenario: 'Audit Trail Review',
    concepts: ['NOT IN', 'WHERE'],
    skillIds: ['where_in', 'select_where'],
    task: 'Find all compliance flags that are unresolved — exclude any row where reviewed = 1. Return flag_id, transaction_id, flag_type, and severity.',
    requiredColumns: ['flag_id', 'transaction_id', 'flag_type', 'severity'],
    orderMatters: false,
    starterSQL: 'SELECT flag_id, transaction_id, flag_type, severity\nFROM compliance_flags\nWHERE reviewed ',
    solutionSQL: 'SELECT flag_id, transaction_id, flag_type, severity\nFROM compliance_flags\nWHERE reviewed NOT IN (1);',
    hint: 'Use WHERE reviewed NOT IN (1) to exclude resolved flags.',
    hintSteps: [
      'NOT IN excludes rows that match one or more listed values.',
      'Filter compliance_flags so rows with reviewed = 1 are not returned.',
      'Use WHERE reviewed NOT IN (1).'
    ],
    explanation: 'NOT IN is a readable alternative to != for lists. In compliance dashboards, filtering out resolved items helps analysts focus attention on open items that still require action.'
  },
  {
    id: 9,
    title: 'UNION — Pending Transactions and Open Reviews',
    difficulty: 'Intermediate',
    scenario: 'Transaction Monitoring',
    concepts: ['UNION', 'SELECT'],
    skillIds: ['select_where'],
    task: "Build a combined action list using UNION. First, select transaction_id AS id labeled source = 'transaction' for all Pending transactions. Second, select account_id AS id labeled source = 'review' for all Open compliance reviews. Return source and id.",
    requiredColumns: ['source', 'id'],
    orderMatters: false,
    starterSQL: "SELECT 'transaction' AS source, transaction_id AS id\nFROM transactions\nWHERE transaction_status = 'Pending'\nUNION\n",
    solutionSQL: "SELECT 'transaction' AS source, transaction_id AS id\nFROM transactions\nWHERE transaction_status = 'Pending'\nUNION\nSELECT 'review' AS source, account_id AS id\nFROM compliance_reviews\nWHERE review_status = 'Open';",
    hint: "UNION combines results. Add SELECT 'review' AS source, account_id AS id FROM compliance_reviews WHERE review_status = 'Open'.",
    hintSteps: [
      'UNION stacks two SELECT results that have matching columns.',
      'Build one SELECT for pending transactions and another SELECT for open reviews.',
      "Add SELECT 'review' AS source, account_id AS id FROM compliance_reviews WHERE review_status = 'Open'."
    ],
    explanation: "UNION stacks result sets vertically. In compliance work, you often need to surface items from different tables into one unified action list — UNION makes that possible without a complex JOIN."
  },
  {
    id: 10,
    title: 'Subquery — Clients With Flagged Transactions',
    difficulty: 'Intermediate',
    scenario: 'Suspicious Activity Detection',
    concepts: ['Subquery', 'IN', 'SELECT'],
    skillIds: ['subquery', 'where_in'],
    task: 'Find clients linked to at least one compliance flag. Use nested subqueries along this path: compliance_flags → transactions → accounts → clients. Return client_id and full_name.',
    requiredColumns: ['client_id', 'full_name'],
    orderMatters: false,
    starterSQL: 'SELECT client_id, full_name\nFROM clients\nWHERE client_id IN (\n  SELECT client_id FROM accounts WHERE account_id IN (\n    ',
    solutionSQL: 'SELECT client_id, full_name\nFROM clients\nWHERE client_id IN (\n  SELECT client_id FROM accounts WHERE account_id IN (\n    SELECT account_id FROM transactions WHERE transaction_id IN (\n      SELECT transaction_id FROM compliance_flags\n    )\n  )\n);',
    hint: 'Nest subqueries: compliance_flags → transactions → accounts → clients.',
    hintSteps: [
      'A subquery can filter one table using IDs found in another table.',
      'Trace flagged rows from compliance_flags to transactions, then accounts, then clients.',
      'Use nested IN clauses along compliance_flags → transactions → accounts → clients.'
    ],
    explanation: 'Subqueries let you filter based on data in another table without an explicit JOIN. In compliance, chaining subqueries is common when tracing a flag back through transactions, accounts, and ultimately to a client.'
  },
  {
    id: 11,
    title: 'CTE — Flags Created in 2026',
    difficulty: 'Intermediate',
    scenario: 'Suspicious Activity Detection',
    concepts: ['WITH', 'CTE', 'WHERE'],
    skillIds: ['cte', 'select_where'],
    task: "Define a CTE named recent_flags that selects flag_id, transaction_id, and flag_type from compliance_flags where created_date >= '2026-01-01'. Then SELECT all three columns from recent_flags.",
    requiredColumns: ['flag_id', 'transaction_id', 'flag_type'],
    orderMatters: false,
    starterSQL: "WITH recent_flags AS (\n  SELECT flag_id, transaction_id, flag_type\n  FROM compliance_flags\n  WHERE ",
    solutionSQL: "WITH recent_flags AS (\n  SELECT flag_id, transaction_id, flag_type\n  FROM compliance_flags\n  WHERE created_date >= '2026-01-01'\n)\nSELECT flag_id, transaction_id, flag_type\nFROM recent_flags;",
    hint: "In the CTE WHERE clause, filter created_date >= '2026-01-01'. Then SELECT from recent_flags.",
    hintSteps: [
      'A CTE names a temporary result with WITH so the final SELECT is cleaner.',
      'Define recent_flags first, then select flag_id, transaction_id, and flag_type from it.',
      "Inside the CTE, use WHERE created_date >= '2026-01-01'."
    ],
    explanation: "CTEs (Common Table Expressions) use WITH to name a temporary result set. They improve readability for complex queries — especially in compliance reports where you want to isolate a filtered subset before further analysis."
  },
  {
    id: 12,
    title: 'EXISTS — Clients With Any Open Review',
    difficulty: 'Intermediate',
    scenario: 'Audit Trail Review',
    concepts: ['EXISTS', 'Subquery', 'JOIN'],
    skillIds: ['exists', 'subquery', 'joins'],
    task: "Find all clients who have at least one compliance review with status 'Open'. Return client_id and full_name.",
    requiredColumns: ['client_id', 'full_name'],
    orderMatters: false,
    starterSQL: "SELECT c.client_id, c.full_name\nFROM clients c\nWHERE EXISTS (\n  ",
    solutionSQL: "SELECT c.client_id, c.full_name\nFROM clients c\nWHERE EXISTS (\n  SELECT 1 FROM accounts a\n  JOIN compliance_reviews cr ON a.account_id = cr.account_id\n  WHERE a.client_id = c.client_id\n    AND cr.review_status = 'Open'\n);",
    hint: "Inside EXISTS, join accounts to compliance_reviews on account_id. Filter where a.client_id = c.client_id and review_status = 'Open'.",
    hintSteps: [
      'EXISTS checks whether the related subquery finds at least one row.',
      'The subquery should connect accounts to reviews and relate accounts back to the outer client.',
      "Filter inside EXISTS with a.client_id = c.client_id and cr.review_status = 'Open'."
    ],
    explanation: "EXISTS returns true if the subquery finds any row. It's often faster than IN for large datasets. In compliance, EXISTS is ideal for asking 'does this client have at least one open issue?' without counting or listing all of them."
  },
  {
    id: 13,
    title: 'AVG + ROUND — Average Transaction Per Account Type',
    difficulty: 'Intermediate',
    scenario: 'Transaction Monitoring',
    concepts: ['AVG', 'ROUND', 'JOIN', 'GROUP BY'],
    skillIds: ['joins', 'group_by'],
    task: 'Calculate the average transaction amount per account type, rounded to 2 decimal places. Return account_type and avg_amount.',
    requiredColumns: ['account_type', 'avg_amount'],
    orderMatters: false,
    starterSQL: 'SELECT a.account_type, ROUND(AVG(t.amount), 2) AS avg_amount\nFROM transactions t\nJOIN accounts a ON ',
    solutionSQL: 'SELECT a.account_type, ROUND(AVG(t.amount), 2) AS avg_amount\nFROM transactions t\nJOIN accounts a ON t.account_id = a.account_id\nGROUP BY a.account_type;',
    hint: 'JOIN on t.account_id = a.account_id, then GROUP BY a.account_type.',
    hintSteps: [
      'Averages by category need a JOIN plus GROUP BY.',
      'Join transactions to accounts so each transaction has an account_type.',
      'Use ROUND(AVG(t.amount), 2) and GROUP BY a.account_type.'
    ],
    explanation: 'AVG with ROUND gives clean numeric summaries. Comparing average transaction amounts across account types helps identify outliers — for example, if Non-Registered accounts average much higher than RRSPs, that pattern may be worth investigating.'
  },
  {
    id: 14,
    title: 'Date Filter — Transactions In January 2026',
    difficulty: 'Intermediate',
    scenario: 'Transaction Monitoring',
    concepts: ['WHERE', 'Date', 'BETWEEN'],
    skillIds: ['select_where'],
    task: 'Find all transactions that occurred in January 2026. Return transaction_id, account_id, transaction_date, and amount.',
    requiredColumns: ['transaction_id', 'account_id', 'transaction_date', 'amount'],
    orderMatters: false,
    starterSQL: "SELECT transaction_id, account_id, transaction_date, amount\nFROM transactions\nWHERE transaction_date ",
    solutionSQL: "SELECT transaction_id, account_id, transaction_date, amount\nFROM transactions\nWHERE transaction_date BETWEEN '2026-01-01' AND '2026-01-31';",
    hint: "Use BETWEEN '2026-01-01' AND '2026-01-31'.",
    hintSteps: [
      'Date filters work like other range filters when dates use YYYY-MM-DD text.',
      'Filter transaction_date with a WHERE clause for January 2026.',
      "Use transaction_date BETWEEN '2026-01-01' AND '2026-01-31'."
    ],
    explanation: "Date filtering is fundamental in audit work. Compliance reviews are often scoped to a reporting period — and being able to precisely isolate date ranges is essential for producing accurate extracts."
  },
  {
    id: 15,
    title: 'Multi-Join — Advisor Risk Dashboard',
    difficulty: 'Intermediate',
    scenario: 'Suspicious Activity Detection',
    concepts: ['JOIN', 'COUNT', 'GROUP BY', 'ORDER BY'],
    skillIds: ['joins', 'group_by', 'order_by'],
    task: "Build an advisor risk dashboard. For each advisor, count how many of their clients have compliance reviews with status 'Open'. Return advisor_id, advisor_name, and open_review_count, sorted by open_review_count descending.",
    requiredColumns: ['advisor_id', 'advisor_name', 'open_review_count'],
    orderMatters: true,
    starterSQL: "SELECT adv.advisor_id, adv.advisor_name, COUNT(cr.review_id) AS open_review_count\nFROM advisors adv\nJOIN clients c ON ",
    solutionSQL: "SELECT adv.advisor_id, adv.advisor_name, COUNT(cr.review_id) AS open_review_count\nFROM advisors adv\nJOIN clients c ON adv.advisor_id = c.advisor_id\nJOIN accounts a ON c.client_id = a.client_id\nJOIN compliance_reviews cr ON a.account_id = cr.account_id\nWHERE cr.review_status = 'Open'\nGROUP BY adv.advisor_id, adv.advisor_name\nORDER BY open_review_count DESC;",
    hint: "Chain joins: advisors → clients → accounts → compliance_reviews. Filter review_status = 'Open', then GROUP BY advisor.",
    hintSteps: [
      'Multi-join reports follow the relationship path between tables.',
      'Join advisors to clients, clients to accounts, and accounts to compliance_reviews.',
      "Filter cr.review_status = 'Open', group by advisor, and order by open_review_count DESC."
    ],
    explanation: "Multi-table joins power executive dashboards. This query mirrors what a compliance officer actually runs before a review meeting — surfacing which advisors have the most open items so attention can be directed appropriately."
  },
  {
    id: 16,
    title: 'CASE — Flag Transaction Risk Level',
    difficulty: 'Intermediate',
    scenario: 'Suspicious Activity Detection',
    concepts: ['CASE', 'WHEN', 'THEN'],
    skillIds: ['case_when'],
    task: "Add a risk_label to each transaction: 'High' if amount > 80000, 'Medium' if amount > 20000, else 'Low'. Return transaction_id, amount, and risk_label.",
    requiredColumns: ['transaction_id', 'amount', 'risk_label'],
    orderMatters: false,
    starterSQL: 'SELECT transaction_id, amount,\n  CASE\n    WHEN ',
    solutionSQL: "SELECT transaction_id, amount,\n  CASE\n    WHEN amount > 80000 THEN 'High'\n    WHEN amount > 20000 THEN 'Medium'\n    ELSE 'Low'\n  END AS risk_label\nFROM transactions;",
    hint: "CASE WHEN amount > 80000 THEN 'High' WHEN amount > 20000 THEN 'Medium' ELSE 'Low' END AS risk_label.",
    hintSteps: [
      'CASE creates a calculated label from conditional rules.',
      'Add a CASE expression after amount in the SELECT list.',
      "Use WHEN amount > 80000 THEN 'High', WHEN amount > 20000 THEN 'Medium', ELSE 'Low' END AS risk_label."
    ],
    explanation: "CASE lets you classify rows dynamically. In compliance, risk tiering is common — you often need to label transactions or clients into bands so downstream filters and reports can act on them."
  },
  {
    id: 17,
    title: 'Window Function — Running Total Per Account',
    difficulty: 'Advanced',
    scenario: 'Transaction Monitoring',
    concepts: ['SUM OVER', 'PARTITION BY', 'ORDER BY', 'Window Function'],
    skillIds: ['window_functions', 'order_by'],
    task: 'Calculate a running total of transaction amounts within each account, ordered by transaction_date. Use SUM() OVER with PARTITION BY account_id and ORDER BY transaction_date to keep totals per account. Return account_id, transaction_id, transaction_date, amount, and running_total.',
    requiredColumns: ['account_id', 'transaction_id', 'transaction_date', 'amount', 'running_total'],
    orderMatters: false,
    starterSQL: 'SELECT account_id, transaction_id, transaction_date, amount,\n  SUM(amount) OVER (PARTITION BY ',
    solutionSQL: 'SELECT account_id, transaction_id, transaction_date, amount,\n  SUM(amount) OVER (PARTITION BY account_id ORDER BY transaction_date) AS running_total\nFROM transactions;',
    hint: 'PARTITION BY account_id ORDER BY transaction_date gives a per-account running total.',
    hintSteps: [
      'Window functions calculate across related rows without grouping them away.',
      'Use SUM(amount) OVER (...) and keep each account in its own partition.',
      'Inside OVER, use PARTITION BY account_id ORDER BY transaction_date.'
    ],
    explanation: 'Window functions compute across rows related to the current row without collapsing them. A running balance per account is a core compliance tool — it lets you see the exact balance at each point in time, which is critical for investigating suspicious patterns.'
  },
  {
    id: 18,
    title: 'RANK — Top Advisors by Client Risk',
    difficulty: 'Advanced',
    scenario: 'Suspicious Activity Detection',
    concepts: ['RANK', 'Window Function', 'COUNT', 'GROUP BY'],
    skillIds: ['window_functions', 'group_by'],
    task: "In a subquery, join advisors to clients and count clients with risk_rating = 'High' per advisor as high_risk_count. In the outer query, apply RANK() OVER (ORDER BY high_risk_count DESC) as risk_rank. Return advisor_id, advisor_name, high_risk_count, and risk_rank.",
    requiredColumns: ['advisor_id', 'advisor_name', 'high_risk_count', 'risk_rank'],
    orderMatters: false,
    starterSQL: "SELECT advisor_id, advisor_name, high_risk_count,\n  RANK() OVER (ORDER BY high_risk_count DESC) AS risk_rank\nFROM (\n  SELECT adv.advisor_id, adv.advisor_name, COUNT(c.client_id) AS high_risk_count\n  FROM advisors adv\n  JOIN clients c ON ",
    solutionSQL: "SELECT advisor_id, advisor_name, high_risk_count,\n  RANK() OVER (ORDER BY high_risk_count DESC) AS risk_rank\nFROM (\n  SELECT adv.advisor_id, adv.advisor_name, COUNT(c.client_id) AS high_risk_count\n  FROM advisors adv\n  JOIN clients c ON adv.advisor_id = c.advisor_id\n  WHERE c.risk_rating = 'High'\n  GROUP BY adv.advisor_id, adv.advisor_name\n) sub;",
    hint: "Inner query: JOIN advisors to clients, filter risk_rating = 'High', COUNT and GROUP BY. Outer query: RANK() OVER (ORDER BY high_risk_count DESC).",
    hintSteps: [
      'RANK is a window function that orders rows by a calculated value.',
      'First build a grouped subquery that counts high-risk clients per advisor.',
      'In the outer SELECT, use RANK() OVER (ORDER BY high_risk_count DESC) AS risk_rank.'
    ],
    explanation: "RANK() assigns a position to each row based on an order. Here it surfaces which advisors carry the most concentrated high-risk client exposure — a key input in regulatory stress testing or targeted reviews."
  },
  {
    id: 19,
    title: 'Self-Join — Duplicate Transaction Detection',
    difficulty: 'Advanced',
    scenario: 'Suspicious Activity Detection',
    concepts: ['Self-Join', 'JOIN', 'WHERE'],
    skillIds: ['joins', 'select_where'],
    task: 'Find pairs of transactions on the same account with the same amount but on different dates. To avoid returning each pair twice, add the condition t1.transaction_id < t2.transaction_id. Return t1.transaction_id as txn1, t2.transaction_id as txn2, t1.account_id, and t1.amount.',
    requiredColumns: ['txn1', 'txn2', 'account_id', 'amount'],
    orderMatters: false,
    starterSQL: 'SELECT t1.transaction_id AS txn1, t2.transaction_id AS txn2, t1.account_id, t1.amount\nFROM transactions t1\nJOIN transactions t2 ON ',
    solutionSQL: 'SELECT t1.transaction_id AS txn1, t2.transaction_id AS txn2, t1.account_id, t1.amount\nFROM transactions t1\nJOIN transactions t2 ON t1.account_id = t2.account_id\n  AND t1.amount = t2.amount\n  AND t1.transaction_date != t2.transaction_date\n  AND t1.transaction_id < t2.transaction_id;',
    hint: 'Self-join on account_id and amount, different dates, and t1.transaction_id < t2.transaction_id to avoid duplicate pairs.',
    hintSteps: [
      'A self-join compares rows from the same table by using two aliases.',
      'Join transactions t1 to transactions t2 on matching account_id and amount.',
      'Add different dates and t1.transaction_id < t2.transaction_id to keep each pair once.'
    ],
    explanation: 'A self-join compares rows within the same table. Detecting duplicate transactions is a classic fraud pattern — the same amount appearing twice on the same account on different dates is a common structuring or error signal.'
  },
  {
    id: 20,
    title: 'Recursive CTE — Regulatory Update Chain',
    difficulty: 'Advanced',
    scenario: 'Regulatory Compliance',
    concepts: ['Recursive CTE', 'WITH RECURSIVE', 'UNION ALL'],
    skillIds: ['recursive_cte', 'cte'],
    task: 'Use a recursive CTE starting at the row with the lowest update_id. Each recursive step joins to the next row where ru.update_id = rc.update_id + 1. Assign a level counter starting at 1. Return level, update_id, regulator, and topic.',
    requiredColumns: ['level', 'update_id', 'regulator', 'topic'],
    orderMatters: false,
    starterSQL: 'WITH RECURSIVE reg_chain AS (\n  SELECT 1 AS level, update_id, regulator, topic\n  FROM regulatory_updates\n  WHERE update_id = (SELECT MIN(update_id) FROM regulatory_updates)\n  UNION ALL\n  SELECT rc.level + 1, ru.update_id, ru.regulator, ru.topic\n  FROM regulatory_updates ru\n  JOIN reg_chain rc ON ',
    solutionSQL: 'WITH RECURSIVE reg_chain AS (\n  SELECT 1 AS level, update_id, regulator, topic\n  FROM regulatory_updates\n  WHERE update_id = (SELECT MIN(update_id) FROM regulatory_updates)\n  UNION ALL\n  SELECT rc.level + 1, ru.update_id, ru.regulator, ru.topic\n  FROM regulatory_updates ru\n  JOIN reg_chain rc ON ru.update_id = rc.update_id + 1\n)\nSELECT level, update_id, regulator, topic\nFROM reg_chain;',
    hint: 'In the recursive part, JOIN reg_chain rc ON ru.update_id = rc.update_id + 1.',
    hintSteps: [
      'A recursive CTE has an anchor query and a recursive step.',
      'Start at the lowest update_id, then repeatedly join to the next update.',
      'In the recursive step, use JOIN reg_chain rc ON ru.update_id = rc.update_id + 1.'
    ],
    explanation: 'Recursive CTEs process hierarchical or sequential data by repeatedly referencing themselves. In compliance, this pattern is useful for tracing chains of events, organizational hierarchies, or sequential regulatory requirements — anywhere you need to walk a path row by row.'
  },
  {
    id: 21,
    title: 'COALESCE — Handle NULL Balances',
    difficulty: 'Intermediate',
    scenario: 'Client Documentation Review',
    concepts: ['COALESCE', 'NULL handling'],
    skillIds: ['null_handling', 'case_when'],
    task: 'Return account_id, account_type, and current_balance for all accounts. If current_balance is NULL or negative, display 0 instead.',
    requiredColumns: ['account_id', 'account_type', 'current_balance'],
    orderMatters: false,
    starterSQL: 'SELECT account_id, account_type,\n  COALESCE(',
    solutionSQL: 'SELECT account_id, account_type,\n  COALESCE(CASE WHEN balance < 0 THEN 0 ELSE balance END, 0) AS current_balance\nFROM accounts;',
    hint: 'Use COALESCE with a CASE to replace NULLs and negatives with 0.',
    hintSteps: [
      'COALESCE handles NULL values, while CASE handles conditional replacements.',
      'Use CASE to turn negative balances into 0, then COALESCE to handle NULL.',
      'Use COALESCE(CASE WHEN balance < 0 THEN 0 ELSE balance END, 0) AS current_balance.'
    ],
    explanation: 'COALESCE returns the first non-NULL value. Combining it with CASE lets you handle both NULLs and invalid values in one pass — important when preparing clean data for compliance reports or regulatory submissions.'
  },
  {
    id: 22,
    title: 'LIKE — Search Client Names',
    difficulty: 'Beginner',
    scenario: 'Client Documentation Review',
    concepts: ['LIKE', 'Pattern Matching'],
    skillIds: ['string_functions', 'select_where'],
    task: "Find all clients whose full_name contains 'son'. Return client_id and full_name.",
    requiredColumns: ['client_id', 'full_name'],
    orderMatters: false,
    starterSQL: "SELECT client_id, full_name\nFROM clients\nWHERE full_name ",
    solutionSQL: "SELECT client_id, full_name\nFROM clients\nWHERE full_name LIKE '%son%';",
    hint: "Use LIKE '%son%' to match any name containing 'son'.",
    hintSteps: [
      'LIKE searches text patterns, and % means any characters.',
      'Filter clients where full_name contains the letters son.',
      "Use WHERE full_name LIKE '%son%'."
    ],
    explanation: "LIKE with % wildcards enables partial text matching. In compliance systems, name searches are a daily tool — for KYC verification, sanctions screening, or simply finding a client record when the exact name is uncertain."
  },
  {
    id: 23,
    title: 'MAX + MIN — Balance Range Per Account Type',
    difficulty: 'Beginner',
    scenario: 'Transaction Monitoring',
    concepts: ['MAX', 'MIN', 'GROUP BY'],
    skillIds: ['group_by'],
    task: 'For each account_type, find the highest and lowest current_balance. Return account_type, max_balance, and min_balance.',
    requiredColumns: ['account_type', 'max_balance', 'min_balance'],
    orderMatters: false,
    starterSQL: 'SELECT account_type,\n  MAX(balance) AS max_balance,\n  MIN(balance) AS min_balance\nFROM accounts\nGROUP BY ',
    solutionSQL: 'SELECT account_type,\n  MAX(balance) AS max_balance,\n  MIN(balance) AS min_balance\nFROM accounts\nGROUP BY account_type;',
    hint: 'GROUP BY account_type, then use MAX and MIN on balance.',
    hintSteps: [
      'MAX and MIN summarize the highest and lowest values in each group.',
      'Group accounts by account_type before calculating the balance range.',
      'Select account_type, MAX(balance) AS max_balance, and MIN(balance) AS min_balance.'
    ],
    explanation: 'MAX and MIN in a GROUP BY give you the range within each category. This is useful for understanding how spread out values are — a very wide range might indicate data quality issues or outliers worth investigating.'
  },
  {
    id: 24,
    title: 'LEFT JOIN — Clients Without Reviews',
    difficulty: 'Intermediate',
    scenario: 'Audit Trail Review',
    concepts: ['LEFT JOIN', 'NULL', 'WHERE'],
    skillIds: ['joins', 'null_handling', 'select_where'],
    task: 'Find clients who have accounts but no compliance reviews. Return client_id, full_name, and account_id.',
    requiredColumns: ['client_id', 'full_name', 'account_id'],
    orderMatters: false,
    starterSQL: 'SELECT c.client_id, c.full_name, a.account_id\nFROM clients c\nJOIN accounts a ON c.client_id = a.client_id\nLEFT JOIN compliance_reviews cr ON ',
    solutionSQL: 'SELECT c.client_id, c.full_name, a.account_id\nFROM clients c\nJOIN accounts a ON c.client_id = a.client_id\nLEFT JOIN compliance_reviews cr ON a.account_id = cr.account_id\nWHERE cr.review_id IS NULL;',
    hint: 'LEFT JOIN compliance_reviews on account_id, then filter WHERE cr.review_id IS NULL.',
    hintSteps: [
      'A LEFT JOIN keeps rows even when the right table has no match.',
      'Join clients to accounts, then left join compliance_reviews by account_id.',
      'Filter for missing reviews with WHERE cr.review_id IS NULL.'
    ],
    explanation: 'LEFT JOIN keeps all rows from the left table even with no match. Filtering on IS NULL after a LEFT JOIN finds the gaps — here, accounts that have never been reviewed. That gap list is often more valuable than the reviewed list.'
  },
  {
    id: 25,
    title: 'String Functions — Extract Province Code',
    difficulty: 'Intermediate',
    scenario: 'Client Documentation Review',
    concepts: ['SUBSTR', 'LENGTH', 'String Functions'],
    skillIds: ['string_functions'],
    task: 'Return client_id, full_name, and province. Also add a short_province column showing only the first 2 characters of province.',
    requiredColumns: ['client_id', 'full_name', 'province', 'short_province'],
    orderMatters: false,
    starterSQL: 'SELECT client_id, full_name, province,\n  SUBSTR(',
    solutionSQL: 'SELECT client_id, full_name, province,\n  SUBSTR(province, 1, 2) AS short_province\nFROM clients;',
    hint: 'Use SUBSTR(province, 1, 2) to get the first 2 characters.',
    hintSteps: [
      'String functions can extract part of a text value.',
      'Add a calculated column that takes the first two characters of province.',
      'Use SUBSTR(province, 1, 2) AS short_province.'
    ],
    explanation: 'SUBSTR extracts a portion of a string. Province codes are a common normalization step before joining with external reference tables — regulators and reporting systems often use 2-letter codes rather than full names.'
  },
  {
    id: 26,
    title: 'Correlated Subquery — Above-Average Transactions',
    difficulty: 'Advanced',
    scenario: 'Suspicious Activity Detection',
    concepts: ['Correlated Subquery', 'AVG', 'WHERE'],
    skillIds: ['subquery', 'select_where'],
    task: 'Find transactions where the amount exceeds the average amount for that specific account. The subquery must be correlated: reference t1.account_id in the inner WHERE clause so the average is computed per account, not globally. Return transaction_id, account_id, and amount.',
    requiredColumns: ['transaction_id', 'account_id', 'amount'],
    orderMatters: false,
    starterSQL: 'SELECT transaction_id, account_id, amount\nFROM transactions t1\nWHERE amount > (\n  SELECT AVG(amount) FROM transactions t2 WHERE ',
    solutionSQL: 'SELECT transaction_id, account_id, amount\nFROM transactions t1\nWHERE amount > (\n  SELECT AVG(amount) FROM transactions t2 WHERE t2.account_id = t1.account_id\n);',
    hint: 'The subquery should reference t1.account_id: WHERE t2.account_id = t1.account_id.',
    hintSteps: [
      'A correlated subquery references the outer query row.',
      'Compare each transaction amount to AVG(amount) from transactions for the same account.',
      'Inside the subquery, use WHERE t2.account_id = t1.account_id.'
    ],
    explanation: 'A correlated subquery references the outer query. Here it computes a per-account average on the fly. This pattern detects spikes within a single account — a transaction that is large relative to that account\'s own history, rather than globally.'
  },
  {
    id: 27,
    title: 'DENSE_RANK — Tier Clients by Balance',
    difficulty: 'Advanced',
    scenario: 'Client Documentation Review',
    concepts: ['DENSE_RANK', 'Window Function', 'JOIN'],
    skillIds: ['window_functions', 'joins', 'group_by'],
    task: 'Rank all clients by their total account balance (sum of current_balance). Return client_id, full_name, total_balance, and balance_rank. Use DENSE_RANK.',
    requiredColumns: ['client_id', 'full_name', 'total_balance', 'balance_rank'],
    orderMatters: false,
    starterSQL: 'SELECT c.client_id, c.full_name,\n  SUM(a.balance) AS total_balance,\n  DENSE_RANK() OVER (ORDER BY ',
    solutionSQL: 'SELECT c.client_id, c.full_name,\n  SUM(a.balance) AS total_balance,\n  DENSE_RANK() OVER (ORDER BY SUM(a.balance) DESC) AS balance_rank\nFROM clients c\nJOIN accounts a ON c.client_id = a.client_id\nGROUP BY c.client_id, c.full_name;',
    hint: 'DENSE_RANK() OVER (ORDER BY SUM(a.balance) DESC). Include GROUP BY c.client_id, c.full_name.',
    hintSteps: [
      'DENSE_RANK assigns ranks without gaps when there are ties.',
      'Join clients to accounts, group by client, and sum each client balance.',
      'Use DENSE_RANK() OVER (ORDER BY SUM(a.balance) DESC) AS balance_rank.'
    ],
    explanation: 'DENSE_RANK skips no rank numbers after ties, unlike RANK. Ranking clients by total balance helps segment the book for tiered compliance treatment — high-balance clients often face stricter review requirements.'
  },
  {
    id: 28,
    title: 'PIVOT-style — Transaction Types Per Account',
    difficulty: 'Advanced',
    scenario: 'Transaction Monitoring',
    concepts: ['CASE', 'SUM', 'GROUP BY', 'Conditional Aggregation'],
    skillIds: ['conditional_aggregation', 'case_when', 'group_by'],
    task: "Using conditional aggregation, show for each account_id: the total amount of 'Deposit', 'Withdrawal', and 'Transfer' transactions as separate columns.",
    requiredColumns: ['account_id', 'total_deposit', 'total_withdrawal', 'total_transfer'],
    orderMatters: false,
    starterSQL: "SELECT account_id,\n  SUM(CASE WHEN transaction_type = 'Deposit' THEN amount ELSE 0 END) AS total_deposit,\n  SUM(CASE WHEN transaction_type = ",
    solutionSQL: "SELECT account_id,\n  SUM(CASE WHEN transaction_type = 'Deposit' THEN amount ELSE 0 END) AS total_deposit,\n  SUM(CASE WHEN transaction_type = 'Withdrawal' THEN amount ELSE 0 END) AS total_withdrawal,\n  SUM(CASE WHEN transaction_type = 'Transfer' THEN amount ELSE 0 END) AS total_transfer\nFROM transactions\nGROUP BY account_id;",
    hint: "Complete the CASE statements for 'Withdrawal' and 'Transfer'. Don't forget GROUP BY account_id.",
    hintSteps: [
      'Conditional aggregation uses CASE inside SUM to create separate totals.',
      'Create one SUM(CASE...) column for each transaction_type.',
      "Complete Withdrawal and Transfer CASE sums, then GROUP BY account_id."
    ],
    explanation: 'Conditional aggregation with CASE inside SUM simulates a pivot table. This is the SQL way to produce a wide-format summary — each transaction type becomes a column. Auditors often request exactly this format for cross-account comparison.'
  },
  {
    id: 29,
    title: 'LAG — Detect Balance Drops',
    difficulty: 'Advanced',
    scenario: 'Suspicious Activity Detection',
    concepts: ['LAG', 'Window Function', 'PARTITION BY'],
    skillIds: ['window_functions'],
    task: 'For each transaction, show the previous transaction amount on the same account using LAG. Return account_id, transaction_id, transaction_date, amount, and prev_amount.',
    requiredColumns: ['account_id', 'transaction_id', 'transaction_date', 'amount', 'prev_amount'],
    orderMatters: false,
    starterSQL: 'SELECT account_id, transaction_id, transaction_date, amount,\n  LAG(amount) OVER (PARTITION BY ',
    solutionSQL: 'SELECT account_id, transaction_id, transaction_date, amount,\n  LAG(amount) OVER (PARTITION BY account_id ORDER BY transaction_date) AS prev_amount\nFROM transactions;',
    hint: 'LAG(amount) OVER (PARTITION BY account_id ORDER BY transaction_date) AS prev_amount.',
    hintSteps: [
      'LAG reads a value from the previous row in a window.',
      'Partition by account_id so previous transactions are compared within the same account.',
      'Use LAG(amount) OVER (PARTITION BY account_id ORDER BY transaction_date) AS prev_amount.'
    ],
    explanation: 'LAG accesses the previous row in a window. Comparing a transaction to the one before it on the same account helps identify sudden large withdrawals or unusual reversals — signals that are invisible when looking at each transaction in isolation.'
  },
  {
    id: 30,
    title: 'Final Boss — Full Compliance Audit Report',
    difficulty: 'Advanced',
    scenario: 'Regulatory Compliance',
    concepts: ['Multi-Join', 'CTE', 'CASE', 'GROUP BY', 'ORDER BY'],
    skillIds: ['joins', 'cte', 'case_when', 'group_by', 'order_by', 'conditional_aggregation'],
    task: "Complete the outer SELECT using the provided CTE. Add a risk_tier column: 'Critical' if open_reviews > 3, 'Elevated' if open_reviews > 1, else 'Normal'. Filter to advisors with at least 1 open review. Order results by open_reviews descending. Return advisor_id, advisor_name, total_clients, high_risk_clients, open_reviews, and risk_tier.",
    requiredColumns: ['advisor_id', 'advisor_name', 'total_clients', 'high_risk_clients', 'open_reviews', 'risk_tier'],
    orderMatters: true,
    starterSQL: "WITH advisor_stats AS (\n  SELECT\n    adv.advisor_id,\n    adv.advisor_name,\n    COUNT(DISTINCT c.client_id) AS total_clients,\n    SUM(CASE WHEN c.risk_rating = 'High' THEN 1 ELSE 0 END) AS high_risk_clients,\n    COUNT(DISTINCT CASE WHEN cr.review_status = 'Open' THEN cr.review_id END) AS open_reviews\n  FROM advisors adv\n  JOIN clients c ON adv.advisor_id = c.advisor_id\n  LEFT JOIN accounts a ON c.client_id = a.client_id\n  LEFT JOIN compliance_reviews cr ON a.account_id = cr.account_id\n  GROUP BY adv.advisor_id, adv.advisor_name\n)\nSELECT\n  advisor_id, advisor_name, total_clients, high_risk_clients, open_reviews,\n  CASE\n    WHEN ",
    solutionSQL: "WITH advisor_stats AS (\n  SELECT\n    adv.advisor_id,\n    adv.advisor_name,\n    COUNT(DISTINCT c.client_id) AS total_clients,\n    SUM(CASE WHEN c.risk_rating = 'High' THEN 1 ELSE 0 END) AS high_risk_clients,\n    COUNT(DISTINCT CASE WHEN cr.review_status = 'Open' THEN cr.review_id END) AS open_reviews\n  FROM advisors adv\n  JOIN clients c ON adv.advisor_id = c.advisor_id\n  LEFT JOIN accounts a ON c.client_id = a.client_id\n  LEFT JOIN compliance_reviews cr ON a.account_id = cr.account_id\n  GROUP BY adv.advisor_id, adv.advisor_name\n)\nSELECT\n  advisor_id, advisor_name, total_clients, high_risk_clients, open_reviews,\n  CASE\n    WHEN open_reviews > 3 THEN 'Critical'\n    WHEN open_reviews > 1 THEN 'Elevated'\n    ELSE 'Normal'\n  END AS risk_tier\nFROM advisor_stats\nWHERE open_reviews >= 1\nORDER BY open_reviews DESC;",
    hint: "Complete the CASE: WHEN open_reviews > 3 THEN 'Critical' WHEN open_reviews > 1 THEN 'Elevated' ELSE 'Normal' END AS risk_tier. Add WHERE open_reviews >= 1 and ORDER BY open_reviews DESC.",
    hintSteps: [
      'This final report combines a CTE, grouped advisor stats, CASE, filtering, and ordering.',
      'Use the provided advisor_stats CTE, then finish the outer SELECT with a risk_tier CASE.',
      "Add CASE WHEN open_reviews > 3 THEN 'Critical' WHEN open_reviews > 1 THEN 'Elevated' ELSE 'Normal' END, filter open_reviews >= 1, and order by open_reviews DESC."
    ],
    explanation: 'This final boss combines CTEs, multi-table joins, conditional aggregation, CASE expressions, and filtering. It mirrors a real-world compliance dashboard query — the kind a data analyst would run before a regulatory examination to summarize advisor-level risk exposure across the entire book of business.'
  }
];
