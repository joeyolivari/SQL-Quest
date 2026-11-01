// Original research-informed activities. Existing lesson step indices stay stable.
const additions = {
  "foundations": [
    {
      "id": "foundations-grain",
      "title": "What does one result row mean?",
      "concepts": [
        "SELECT"
      ],
      "after": "foundations-03",
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Return one row per transaction with transaction_id and account_id.",
        "starterSQL": "",
        "solutionSQL": "SELECT transaction_id, account_id FROM transactions;",
        "requiredColumns": [
          "transaction_id",
          "account_id"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Decide what entity one row should represent.",
          "Accounts and clients have different keys.",
          "Use the table named in the request and select its identifying key."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "What does one result row mean?",
          "body": "Before writing SQL, finish this sentence: one result row represents ____. SELECT picks columns; WHERE changes which records remain. A client and an account are different kinds of record.",
          "example": "SELECT account_id, client_id FROM accounts;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "accounts",
            "columns": [
              "account_id",
              "client_id"
            ],
            "rows": [
              [
                11,
                1
              ],
              [
                12,
                1
              ],
              [
                13,
                2
              ]
            ]
          },
          "example": "SELECT client_id FROM accounts;",
          "choices": [
            "3 rows: 1, 1, 2",
            "2 rows: 1, 2",
            "1 row: 3"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              1
            ],
            [
              1
            ],
            [
              2
            ]
          ],
          "explain": "Before writing SQL, finish this sentence: one result row represents ____. SELECT picks columns; WHERE changes which records remain. A client and an account are different kinds of record.",
          "choiceFeedback": [
            "Trace the rows in the small table. Before writing SQL, finish this sentence: one result row represents ____. SELECT picks columns; WHERE changes which records remain. A client and an account are different kinds of record.",
            "Trace the rows in the small table. Before writing SQL, finish this sentence: one result row represents ____. SELECT picks columns; WHERE changes which records remain. A client and an account are different kinds of record.",
            "Trace the rows in the small table. Before writing SQL, finish this sentence: one result row represents ____. SELECT picks columns; WHERE changes which records remain. A client and an account are different kinds of record."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "The request is one row per account. Repair the table and return account_id and client_id for all accounts.",
          "starterSQL": "SELECT client_id FROM clients;",
          "solutionSQL": "SELECT account_id, client_id FROM accounts;",
          "requiredColumns": [
            "account_id",
            "client_id"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Decide what entity one row should represent.",
            "Accounts and clients have different keys.",
            "Use the table named in the request and select its identifying key."
          ],
          "explain": "Before writing SQL, finish this sentence: one result row represents ____. SELECT picks columns; WHERE changes which records remain. A client and an account are different kinds of record.",
          "explanationPrompt": "Explain why two accounts owned by the same client still produce two account rows."
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return one row per client with client_id and province for all clients.",
          "starterSQL": "",
          "solutionSQL": "SELECT client_id, province FROM clients;",
          "requiredColumns": [
            "client_id",
            "province"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Decide what entity one row should represent.",
            "Accounts and clients have different keys.",
            "Use the table named in the request and select its identifying key."
          ],
          "explain": "Explain why two accounts owned by the same client still produce two account rows.",
          "explanationPrompt": "Explain why two accounts owned by the same client still produce two account rows."
        }
      ]
    },
    {
      "id": "foundations-aliases",
      "title": "Readable names with AS",
      "concepts": [
        "SELECT"
      ],
      "after": "foundations-grain",
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Return advisor_id and advisor_name under the heading reviewer_name for every advisor.",
        "starterSQL": "",
        "solutionSQL": "SELECT advisor_id, advisor_name AS reviewer_name FROM advisors;",
        "requiredColumns": [
          "advisor_id",
          "reviewer_name"
        ],
        "orderMatters": false,
        "hintSteps": [
          "An alias changes a result heading.",
          "The source still contains balance or full_name.",
          "Write source_column AS requested_heading."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Readable names with AS",
          "body": "AS labels a result column without renaming the stored column. The original name is used to read the data; the alias is the heading of the result.",
          "example": "SELECT balance AS reported_balance FROM accounts;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "accounts",
            "columns": [
              "balance"
            ],
            "rows": [
              [
                100
              ],
              [
                200
              ]
            ]
          },
          "example": "SELECT balance AS reported_balance FROM accounts;",
          "choices": [
            "Heading: reported_balance; values: 100, 200",
            "Heading: balance; values: 100, 200",
            "The stored column is permanently renamed"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              100
            ],
            [
              200
            ]
          ],
          "explain": "AS labels a result column without renaming the stored column. The original name is used to read the data; the alias is the heading of the result.",
          "choiceFeedback": [
            "Trace the rows in the small table. AS labels a result column without renaming the stored column. The original name is used to read the data; the alias is the heading of the result.",
            "Trace the rows in the small table. AS labels a result column without renaming the stored column. The original name is used to read the data; the alias is the heading of the result.",
            "Trace the rows in the small table. AS labels a result column without renaming the stored column. The original name is used to read the data; the alias is the heading of the result."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Return account_id and balance under the heading reported_balance.",
          "starterSQL": "SELECT account_id, reported_balance FROM accounts;",
          "solutionSQL": "SELECT account_id, balance AS reported_balance FROM accounts;",
          "requiredColumns": [
            "account_id",
            "reported_balance"
          ],
          "orderMatters": false,
          "hintSteps": [
            "An alias changes a result heading.",
            "The source still contains balance or full_name.",
            "Write source_column AS requested_heading."
          ],
          "explain": "AS labels a result column without renaming the stored column. The original name is used to read the data; the alias is the heading of the result.",
          "explanationPrompt": "Which name exists in the source table and which exists only in the result?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return client_id and full_name under the heading client_name for every client.",
          "starterSQL": "",
          "solutionSQL": "SELECT client_id, full_name AS client_name FROM clients;",
          "requiredColumns": [
            "client_id",
            "client_name"
          ],
          "orderMatters": false,
          "hintSteps": [
            "An alias changes a result heading.",
            "The source still contains balance or full_name.",
            "Write source_column AS requested_heading."
          ],
          "explain": "Which name exists in the source table and which exists only in the result?",
          "explanationPrompt": "Which name exists in the source table and which exists only in the result?"
        }
      ]
    },
    {
      "id": "foundations-ties",
      "title": "Make a top list reproducible",
      "concepts": [
        "ORDER BY"
      ],
      "after": "foundations-07",
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Return the four largest account balances. Show account_id and balance; break ties by account_id ascending.",
        "starterSQL": "",
        "solutionSQL": "SELECT account_id, balance FROM accounts ORDER BY balance DESC, account_id ASC LIMIT 4;",
        "requiredColumns": [
          "account_id",
          "balance"
        ],
        "orderMatters": true,
        "hintSteps": [
          "Choose which rows belong at the top.",
          "Sort the main value descending, then the unique ID ascending.",
          "Place LIMIT after ORDER BY."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Make a top list reproducible",
          "body": "Equal primary sort values need a tie-breaker when the exact sequence matters. A unique ID makes a top-N result reproducible. LIMIT without an ordering does not mean highest or newest.",
          "example": "SELECT account_id, balance FROM accounts ORDER BY balance DESC, account_id ASC LIMIT 2;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "accounts",
            "columns": [
              "account_id",
              "balance"
            ],
            "rows": [
              [
                3,
                100
              ],
              [
                1,
                100
              ],
              [
                2,
                50
              ]
            ]
          },
          "example": "SELECT account_id FROM accounts ORDER BY balance DESC, account_id ASC LIMIT 2;",
          "choices": [
            "1, 3",
            "3, 1",
            "2, 1"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              1
            ],
            [
              3
            ]
          ],
          "explain": "Equal primary sort values need a tie-breaker when the exact sequence matters. A unique ID makes a top-N result reproducible. LIMIT without an ordering does not mean highest or newest.",
          "choiceFeedback": [
            "Trace the rows in the small table. Equal primary sort values need a tie-breaker when the exact sequence matters. A unique ID makes a top-N result reproducible. LIMIT without an ordering does not mean highest or newest.",
            "Trace the rows in the small table. Equal primary sort values need a tie-breaker when the exact sequence matters. A unique ID makes a top-N result reproducible. LIMIT without an ordering does not mean highest or newest.",
            "Trace the rows in the small table. Equal primary sort values need a tie-breaker when the exact sequence matters. A unique ID makes a top-N result reproducible. LIMIT without an ordering does not mean highest or newest."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Repair this top-three query: highest balance first, then account_id ascending. Return account_id and balance.",
          "starterSQL": "SELECT account_id, balance FROM accounts LIMIT 3;",
          "solutionSQL": "SELECT account_id, balance FROM accounts ORDER BY balance DESC, account_id ASC LIMIT 3;",
          "requiredColumns": [
            "account_id",
            "balance"
          ],
          "orderMatters": true,
          "hintSteps": [
            "Choose which rows belong at the top.",
            "Sort the main value descending, then the unique ID ascending.",
            "Place LIMIT after ORDER BY."
          ],
          "explain": "Equal primary sort values need a tie-breaker when the exact sequence matters. A unique ID makes a top-N result reproducible. LIMIT without an ordering does not mean highest or newest.",
          "explanationPrompt": "Why can the same amount belong to two different transactions?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return the four largest transactions by amount, breaking ties by transaction_id ascending. Show transaction_id and amount.",
          "starterSQL": "",
          "solutionSQL": "SELECT transaction_id, amount FROM transactions ORDER BY amount DESC, transaction_id ASC LIMIT 4;",
          "requiredColumns": [
            "transaction_id",
            "amount"
          ],
          "orderMatters": true,
          "hintSteps": [
            "Choose which rows belong at the top.",
            "Sort the main value descending, then the unique ID ascending.",
            "Place LIMIT after ORDER BY."
          ],
          "explain": "Why can the same amount belong to two different transactions?",
          "explanationPrompt": "Why can the same amount belong to two different transactions?"
        }
      ]
    }
  ],
  "filtering": [
    {
      "id": "filtering-not",
      "title": "Negation and parentheses",
      "concepts": [
        "WHERE"
      ],
      "after": null,
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Return client_id for clients whose risk_rating is neither High nor Medium.",
        "starterSQL": "",
        "solutionSQL": "SELECT client_id FROM clients WHERE risk_rating NOT IN ('High','Medium');",
        "requiredColumns": [
          "client_id"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Try the condition on a Closed account by hand.",
          "OR between two not-equal comparisons often keeps everything.",
          "Negate the whole alternatives group, or use NOT IN."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Negation and parentheses",
          "body": "NOT reverses a condition for known values. Parentheses make the group explicit. Read a compound condition aloud before adding it to a report.",
          "example": "SELECT account_id FROM accounts WHERE NOT (account_status = 'Closed' OR account_status = 'Suspended');"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "accounts",
            "columns": [
              "account_id",
              "account_status"
            ],
            "rows": [
              [
                1,
                "Active"
              ],
              [
                2,
                "Closed"
              ],
              [
                3,
                "Suspended"
              ]
            ]
          },
          "example": "SELECT account_id FROM accounts WHERE NOT (account_status = 'Closed' OR account_status = 'Suspended');",
          "choices": [
            "Only 1",
            "Only 2 and 3",
            "All three"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              1
            ]
          ],
          "explain": "NOT reverses a condition for known values. Parentheses make the group explicit. Read a compound condition aloud before adding it to a report.",
          "choiceFeedback": [
            "Trace the rows in the small table. NOT reverses a condition for known values. Parentheses make the group explicit. Read a compound condition aloud before adding it to a report.",
            "Trace the rows in the small table. NOT reverses a condition for known values. Parentheses make the group explicit. Read a compound condition aloud before adding it to a report.",
            "Trace the rows in the small table. NOT reverses a condition for known values. Parentheses make the group explicit. Read a compound condition aloud before adding it to a report."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Keep accounts that are neither Closed nor Suspended. Return account_id.",
          "starterSQL": "SELECT account_id FROM accounts WHERE account_status != 'Closed' OR account_status != 'Suspended';",
          "solutionSQL": "SELECT account_id FROM accounts WHERE NOT (account_status = 'Closed' OR account_status = 'Suspended');",
          "requiredColumns": [
            "account_id"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Try the condition on a Closed account by hand.",
            "OR between two not-equal comparisons often keeps everything.",
            "Negate the whole alternatives group, or use NOT IN."
          ],
          "explain": "NOT reverses a condition for known values. Parentheses make the group explicit. Read a compound condition aloud before adding it to a report.",
          "explanationPrompt": "Why does Closed satisfy at least one of the two not-equal tests in the broken query?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return client_id for clients whose kyc_status is neither pending nor expired.",
          "starterSQL": "",
          "solutionSQL": "SELECT client_id FROM clients WHERE kyc_status NOT IN ('pending','expired');",
          "requiredColumns": [
            "client_id"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Try the condition on a Closed account by hand.",
            "OR between two not-equal comparisons often keeps everything.",
            "Negate the whole alternatives group, or use NOT IN."
          ],
          "explain": "Why does Closed satisfy at least one of the two not-equal tests in the broken query?",
          "explanationPrompt": "Why does Closed satisfy at least one of the two not-equal tests in the broken query?"
        }
      ]
    },
    {
      "id": "filtering-null-trap",
      "title": "Unknown is not equal to anything",
      "concepts": [
        "NULL"
      ],
      "after": null,
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Return client_id and email for clients with a known email.",
        "starterSQL": "",
        "solutionSQL": "SELECT client_id, email FROM clients WHERE email IS NOT NULL;",
        "requiredColumns": [
          "client_id",
          "email"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Unknown and empty text are different.",
          "Ordinary equality does not test for NULL.",
          "Use IS NULL or IS NOT NULL."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Unknown is not equal to anything",
          "body": "NULL means unknown. Comparisons such as = NULL and != NULL are not true. WHERE keeps only true conditions, so use IS NULL or IS NOT NULL.",
          "example": "SELECT client_id FROM clients WHERE email IS NULL;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "clients",
            "columns": [
              "client_id",
              "email"
            ],
            "rows": [
              [
                1,
                "a@example.ca"
              ],
              [
                2,
                null
              ],
              [
                3,
                ""
              ]
            ]
          },
          "example": "SELECT client_id FROM clients WHERE email IS NULL;",
          "choices": [
            "Only 2",
            "2 and 3",
            "No rows"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              2
            ]
          ],
          "explain": "NULL means unknown. Comparisons such as = NULL and != NULL are not true. WHERE keeps only true conditions, so use IS NULL or IS NOT NULL.",
          "choiceFeedback": [
            "Trace the rows in the small table. NULL means unknown. Comparisons such as = NULL and != NULL are not true. WHERE keeps only true conditions, so use IS NULL or IS NOT NULL.",
            "Trace the rows in the small table. NULL means unknown. Comparisons such as = NULL and != NULL are not true. WHERE keeps only true conditions, so use IS NULL or IS NOT NULL.",
            "Trace the rows in the small table. NULL means unknown. Comparisons such as = NULL and != NULL are not true. WHERE keeps only true conditions, so use IS NULL or IS NOT NULL."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Find clients with a missing email. Empty text is a known string. Return client_id and email.",
          "starterSQL": "SELECT client_id, email FROM clients WHERE email = NULL;",
          "solutionSQL": "SELECT client_id, email FROM clients WHERE email IS NULL;",
          "requiredColumns": [
            "client_id",
            "email"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Unknown and empty text are different.",
            "Ordinary equality does not test for NULL.",
            "Use IS NULL or IS NOT NULL."
          ],
          "explain": "NULL means unknown. Comparisons such as = NULL and != NULL are not true. WHERE keeps only true conditions, so use IS NULL or IS NOT NULL.",
          "explanationPrompt": "What is the difference between an unknown email and an empty string?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return account_id and last_review_date for accounts with a known last_review_date.",
          "starterSQL": "",
          "solutionSQL": "SELECT account_id, last_review_date FROM accounts WHERE last_review_date IS NOT NULL;",
          "requiredColumns": [
            "account_id",
            "last_review_date"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Unknown and empty text are different.",
            "Ordinary equality does not test for NULL.",
            "Use IS NULL or IS NOT NULL."
          ],
          "explain": "What is the difference between an unknown email and an empty string?",
          "explanationPrompt": "What is the difference between an unknown email and an empty string?"
        }
      ]
    },
    {
      "id": "filtering-boundaries",
      "title": "Catch the boundary bug",
      "concepts": [
        "WHERE"
      ],
      "after": null,
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Return transaction_id and amount for transactions of at least 10000.",
        "starterSQL": "",
        "solutionSQL": "SELECT transaction_id, amount FROM transactions WHERE amount >= 10000;",
        "requiredColumns": [
          "transaction_id",
          "amount"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Translate the words into an inclusive or exclusive rule.",
          "Test the exact threshold.",
          "At least uses >=; BETWEEN includes both endpoints."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Catch the boundary bug",
          "body": "At least includes the threshold; more than excludes it. Test values just below, exactly at, and just above a threshold instead of relying on a query that happens to pass one sample.",
          "example": "SELECT account_id FROM accounts WHERE balance >= 100000;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "accounts",
            "columns": [
              "account_id",
              "balance"
            ],
            "rows": [
              [
                1,
                99999
              ],
              [
                2,
                100000
              ],
              [
                3,
                100001
              ]
            ]
          },
          "example": "SELECT account_id FROM accounts WHERE balance >= 100000;",
          "choices": [
            "2 and 3",
            "Only 3",
            "All three"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              2
            ],
            [
              3
            ]
          ],
          "explain": "At least includes the threshold; more than excludes it. Test values just below, exactly at, and just above a threshold instead of relying on a query that happens to pass one sample.",
          "choiceFeedback": [
            "Trace the rows in the small table. At least includes the threshold; more than excludes it. Test values just below, exactly at, and just above a threshold instead of relying on a query that happens to pass one sample.",
            "Trace the rows in the small table. At least includes the threshold; more than excludes it. Test values just below, exactly at, and just above a threshold instead of relying on a query that happens to pass one sample.",
            "Trace the rows in the small table. At least includes the threshold; more than excludes it. Test values just below, exactly at, and just above a threshold instead of relying on a query that happens to pass one sample."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Repair the query to include accounts with a balance of at least 100000. Return account_id and balance.",
          "starterSQL": "SELECT account_id, balance FROM accounts WHERE balance > 100000;",
          "solutionSQL": "SELECT account_id, balance FROM accounts WHERE balance >= 100000;",
          "requiredColumns": [
            "account_id",
            "balance"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Translate the words into an inclusive or exclusive rule.",
            "Test the exact threshold.",
            "At least uses >=; BETWEEN includes both endpoints."
          ],
          "explain": "At least includes the threshold; more than excludes it. Test values just below, exactly at, and just above a threshold instead of relying on a query that happens to pass one sample.",
          "explanationPrompt": "Which extra row could prove that > and >= are different?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return account_id and balance for balances from 30000 through 100000, including both ends.",
          "starterSQL": "",
          "solutionSQL": "SELECT account_id, balance FROM accounts WHERE balance BETWEEN 30000 AND 100000;",
          "requiredColumns": [
            "account_id",
            "balance"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Translate the words into an inclusive or exclusive rule.",
            "Test the exact threshold.",
            "At least uses >=; BETWEEN includes both endpoints."
          ],
          "explain": "Which extra row could prove that > and >= are different?",
          "explanationPrompt": "Which extra row could prove that > and >= are different?"
        }
      ]
    }
  ],
  "summaries": [
    {
      "id": "summaries-count-null",
      "title": "Count rows or known values?",
      "concepts": [
        "COUNT"
      ],
      "after": null,
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "For each account_status, return account_count (all accounts) and dated_reviews (accounts with a known last_review_date).",
        "starterSQL": "",
        "solutionSQL": "SELECT account_status, COUNT(*) AS account_count, COUNT(last_review_date) AS dated_reviews FROM accounts GROUP BY account_status;",
        "requiredColumns": [
          "account_status",
          "account_count",
          "dated_reviews"
        ],
        "orderMatters": false,
        "hintSteps": [
          "What does the report want to count?",
          "COUNT(column) skips NULLs; COUNT(*) does not.",
          "Group by account_type only in the per-type report."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Count rows or known values?",
          "body": "COUNT(*) counts every row. COUNT(column) counts only known values in that column. Neither is automatically the right business measure: decide whether you need records or recorded values.",
          "example": "SELECT COUNT(*) AS client_count, COUNT(email) AS known_emails FROM clients;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "clients",
            "columns": [
              "client_id",
              "email"
            ],
            "rows": [
              [
                1,
                "a@example.ca"
              ],
              [
                2,
                null
              ],
              [
                3,
                "b@example.ca"
              ]
            ]
          },
          "example": "SELECT COUNT(*) AS client_count, COUNT(email) AS known_emails FROM clients;",
          "choices": [
            "3 clients and 2 known emails",
            "2 clients and 2 known emails",
            "3 clients and 3 known emails"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              3,
              2
            ]
          ],
          "explain": "COUNT(*) counts every row. COUNT(column) counts only known values in that column. Neither is automatically the right business measure: decide whether you need records or recorded values.",
          "choiceFeedback": [
            "Trace the rows in the small table. COUNT(*) counts every row. COUNT(column) counts only known values in that column. Neither is automatically the right business measure: decide whether you need records or recorded values.",
            "Trace the rows in the small table. COUNT(*) counts every row. COUNT(column) counts only known values in that column. Neither is automatically the right business measure: decide whether you need records or recorded values.",
            "Trace the rows in the small table. COUNT(*) counts every row. COUNT(column) counts only known values in that column. Neither is automatically the right business measure: decide whether you need records or recorded values."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Return client_count for every client and known_emails for clients with a known email.",
          "starterSQL": "SELECT COUNT(email) AS client_count, COUNT(*) AS known_emails FROM clients;",
          "solutionSQL": "SELECT COUNT(*) AS client_count, COUNT(email) AS known_emails FROM clients;",
          "requiredColumns": [
            "client_count",
            "known_emails"
          ],
          "orderMatters": false,
          "hintSteps": [
            "What does the report want to count?",
            "COUNT(column) skips NULLs; COUNT(*) does not.",
            "Group by account_type only in the per-type report."
          ],
          "explain": "COUNT(*) counts every row. COUNT(column) counts only known values in that column. Neither is automatically the right business measure: decide whether you need records or recorded values.",
          "explanationPrompt": "Why should a missing balance not make an account disappear from account_count?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "For each account_type, return account_count (all accounts) and known_balances (non-NULL balances).",
          "starterSQL": "",
          "solutionSQL": "SELECT account_type, COUNT(*) AS account_count, COUNT(balance) AS known_balances FROM accounts GROUP BY account_type;",
          "requiredColumns": [
            "account_type",
            "account_count",
            "known_balances"
          ],
          "orderMatters": false,
          "hintSteps": [
            "What does the report want to count?",
            "COUNT(column) skips NULLs; COUNT(*) does not.",
            "Group by account_type only in the per-type report."
          ],
          "explain": "Why should a missing balance not make an account disappear from account_count?",
          "explanationPrompt": "Why should a missing balance not make an account disappear from account_count?"
        }
      ]
    },
    {
      "id": "summaries-order",
      "title": "Rows first, groups second",
      "concepts": [
        "HAVING"
      ],
      "after": null,
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Return account_id and posted_deposits for accounts with Posted Deposit totals above 100000.",
        "starterSQL": "",
        "solutionSQL": "SELECT account_id, SUM(amount) AS posted_deposits FROM transactions WHERE transaction_type = 'Deposit' AND transaction_status = 'Posted' GROUP BY account_id HAVING SUM(amount) > 100000;",
        "requiredColumns": [
          "account_id",
          "posted_deposits"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Choose input transactions before adding amounts.",
          "Aggregate conditions belong after GROUP BY.",
          "WHERE filters transaction type/status; HAVING filters SUM(amount)."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Rows first, groups second",
          "body": "A useful reasoning order is FROM/JOIN \u2192 WHERE \u2192 GROUP BY \u2192 HAVING \u2192 SELECT \u2192 ORDER BY \u2192 LIMIT. WHERE selects input rows; HAVING selects completed groups. This is a mental model, not a promise about the physical query plan.",
          "example": "SELECT account_id, SUM(amount) AS total FROM transactions WHERE transaction_type = 'Deposit' GROUP BY account_id HAVING SUM(amount) > 100;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "transactions",
            "columns": [
              "account_id",
              "amount",
              "transaction_type"
            ],
            "rows": [
              [
                1,
                80,
                "Deposit"
              ],
              [
                1,
                50,
                "Deposit"
              ],
              [
                1,
                500,
                "Withdrawal"
              ],
              [
                2,
                90,
                "Deposit"
              ]
            ]
          },
          "example": "SELECT account_id, SUM(amount) AS total FROM transactions WHERE transaction_type = 'Deposit' GROUP BY account_id HAVING SUM(amount) > 100;",
          "choices": [
            "Account 1, total 130",
            "Account 1, total 630",
            "Both accounts"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              1,
              130
            ]
          ],
          "explain": "A useful reasoning order is FROM/JOIN \u2192 WHERE \u2192 GROUP BY \u2192 HAVING \u2192 SELECT \u2192 ORDER BY \u2192 LIMIT. WHERE selects input rows; HAVING selects completed groups. This is a mental model, not a promise about the physical query plan.",
          "choiceFeedback": [
            "Trace the rows in the small table. A useful reasoning order is FROM/JOIN \u2192 WHERE \u2192 GROUP BY \u2192 HAVING \u2192 SELECT \u2192 ORDER BY \u2192 LIMIT. WHERE selects input rows; HAVING selects completed groups. This is a mental model, not a promise about the physical query plan.",
            "Trace the rows in the small table. A useful reasoning order is FROM/JOIN \u2192 WHERE \u2192 GROUP BY \u2192 HAVING \u2192 SELECT \u2192 ORDER BY \u2192 LIMIT. WHERE selects input rows; HAVING selects completed groups. This is a mental model, not a promise about the physical query plan.",
            "Trace the rows in the small table. A useful reasoning order is FROM/JOIN \u2192 WHERE \u2192 GROUP BY \u2192 HAVING \u2192 SELECT \u2192 ORDER BY \u2192 LIMIT. WHERE selects input rows; HAVING selects completed groups. This is a mental model, not a promise about the physical query plan."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Return account_id and total for Deposit totals above 50000. Repair the aggregate filter.",
          "starterSQL": "SELECT account_id, SUM(amount) AS total FROM transactions WHERE transaction_type = 'Deposit' AND SUM(amount) > 50000 GROUP BY account_id;",
          "solutionSQL": "SELECT account_id, SUM(amount) AS total FROM transactions WHERE transaction_type = 'Deposit' GROUP BY account_id HAVING SUM(amount) > 50000;",
          "requiredColumns": [
            "account_id",
            "total"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Choose input transactions before adding amounts.",
            "Aggregate conditions belong after GROUP BY.",
            "WHERE filters transaction type/status; HAVING filters SUM(amount)."
          ],
          "explain": "A useful reasoning order is FROM/JOIN \u2192 WHERE \u2192 GROUP BY \u2192 HAVING \u2192 SELECT \u2192 ORDER BY \u2192 LIMIT. WHERE selects input rows; HAVING selects completed groups. This is a mental model, not a promise about the physical query plan.",
          "explanationPrompt": "Would filtering individual amounts above the threshold find the same accounts as filtering their total?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return account_id and total_withdrawn for Posted Withdrawal totals above 10000.",
          "starterSQL": "",
          "solutionSQL": "SELECT account_id, SUM(amount) AS total_withdrawn FROM transactions WHERE transaction_type = 'Withdrawal' AND transaction_status = 'Posted' GROUP BY account_id HAVING SUM(amount) > 10000;",
          "requiredColumns": [
            "account_id",
            "total_withdrawn"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Choose input transactions before adding amounts.",
            "Aggregate conditions belong after GROUP BY.",
            "WHERE filters transaction type/status; HAVING filters SUM(amount)."
          ],
          "explain": "Would filtering individual amounts above the threshold find the same accounts as filtering their total?",
          "explanationPrompt": "Would filtering individual amounts above the threshold find the same accounts as filtering their total?"
        }
      ]
    }
  ],
  "relationships": [
    {
      "id": "relationships-fanout",
      "title": "Predict how a join multiplies rows",
      "concepts": [
        "JOIN"
      ],
      "after": "relationships-01",
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Return advisor_id and reviewed_clients: count distinct clients with at least one compliance review, despite multiple accounts and reviews.",
        "starterSQL": "",
        "solutionSQL": "SELECT c.advisor_id, COUNT(DISTINCT c.client_id) AS reviewed_clients FROM clients c JOIN accounts a ON c.client_id = a.client_id JOIN compliance_reviews r ON a.account_id = r.account_id GROUP BY c.advisor_id;",
        "requiredColumns": [
          "advisor_id",
          "reviewed_clients"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Name what one joined row represents.",
          "Count the key of the entity requested, not the joined rows.",
          "Use COUNT(DISTINCT entity_id)."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Predict how a join multiplies rows",
          "body": "A join produces one row for each matching pair. One client with two accounts becomes two joined rows. Joining another one-to-many table can multiply those rows again.",
          "example": "SELECT c.client_id, a.account_id FROM clients c JOIN accounts a ON c.client_id = a.client_id;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the two small tables below. Predict the join result before running SQL.",
          "sample": {
            "name": "accounts",
            "columns": [
              "client_id",
              "account_id"
            ],
            "rows": [
              [
                1,
                11
              ],
              [
                1,
                12
              ],
              [
                2,
                13
              ]
            ]
          },
          "example": "SELECT c.client_id, a.account_id FROM clients c JOIN accounts a ON c.client_id = a.client_id ORDER BY c.client_id, a.account_id;",
          "choices": [
            "Three rows: (1,11), (1,12), (2,13)",
            "Two rows: one for each client",
            "Six rows: every client paired with every account"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              1,
              11
            ],
            [
              1,
              12
            ],
            [
              2,
              13
            ]
          ],
          "explain": "A join produces one row for each matching pair. One client with two accounts becomes two joined rows. Joining another one-to-many table can multiply those rows again.",
          "choiceFeedback": [
            "Trace the rows in the small table. A join produces one row for each matching pair. One client with two accounts becomes two joined rows. Joining another one-to-many table can multiply those rows again.",
            "Trace the rows in the small table. A join produces one row for each matching pair. One client with two accounts becomes two joined rows. Joining another one-to-many table can multiply those rows again.",
            "Trace the rows in the small table. A join produces one row for each matching pair. One client with two accounts becomes two joined rows. Joining another one-to-many table can multiply those rows again."
          ],
          "relatedSamples": [
            {
              "name": "clients",
              "columns": [
                "client_id"
              ],
              "rows": [
                [
                  1
                ],
                [
                  2
                ]
              ]
            }
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Return advisor_id and distinct client_count for advisors with account-owning clients. Repair the count so clients with several accounts count once.",
          "starterSQL": "SELECT c.advisor_id, COUNT(*) AS client_count FROM clients c JOIN accounts a ON c.client_id = a.client_id GROUP BY c.advisor_id;",
          "solutionSQL": "SELECT c.advisor_id, COUNT(DISTINCT c.client_id) AS client_count FROM clients c JOIN accounts a ON c.client_id = a.client_id GROUP BY c.advisor_id;",
          "requiredColumns": [
            "advisor_id",
            "client_count"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Name what one joined row represents.",
            "Count the key of the entity requested, not the joined rows.",
            "Use COUNT(DISTINCT entity_id)."
          ],
          "explain": "A join produces one row for each matching pair. One client with two accounts becomes two joined rows. Joining another one-to-many table can multiply those rows again.",
          "explanationPrompt": "What would COUNT(*) count after joining accounts to their review history?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return client_id and distinct reviewed_accounts (accounts with at least one compliance review). Multiple reviews must not multiply accounts.",
          "starterSQL": "",
          "solutionSQL": "SELECT a.client_id, COUNT(DISTINCT a.account_id) AS reviewed_accounts FROM accounts a JOIN compliance_reviews r ON a.account_id = r.account_id GROUP BY a.client_id;",
          "requiredColumns": [
            "client_id",
            "reviewed_accounts"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Name what one joined row represents.",
            "Count the key of the entity requested, not the joined rows.",
            "Use COUNT(DISTINCT entity_id)."
          ],
          "explain": "What would COUNT(*) count after joining accounts to their review history?",
          "explanationPrompt": "What would COUNT(*) count after joining accounts to their review history?"
        }
      ]
    },
    {
      "id": "relationships-preserve",
      "title": "LEFT JOIN: where should a filter go?",
      "concepts": [
        "LEFT JOIN"
      ],
      "after": "relationships-02",
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Keep every client and show account_id only for matching Active accounts. Return client_id and account_id.",
        "starterSQL": "",
        "solutionSQL": "SELECT c.client_id, a.account_id FROM clients c LEFT JOIN accounts a ON c.client_id = a.client_id AND a.account_status = 'Active';",
        "requiredColumns": [
          "client_id",
          "account_id"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Decide whether unmatched accounts should remain.",
          "ON chooses matches; WHERE removes final rows.",
          "Move the right-side status condition into ON."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "LEFT JOIN: where should a filter go?",
          "body": "To keep every account while matching only Open reviews, put the review-status condition in ON. A WHERE condition on the right table removes unmatched rows because their right-side values are NULL.",
          "example": "SELECT a.account_id, r.review_id FROM accounts a LEFT JOIN compliance_reviews r ON a.account_id = r.account_id AND r.review_status = 'Open';"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the two small tables below. Predict the join result before running SQL.",
          "sample": {
            "name": "compliance_reviews",
            "columns": [
              "account_id",
              "review_id",
              "review_status"
            ],
            "rows": [
              [
                1,
                71,
                "Open"
              ],
              [
                1,
                72,
                "Closed"
              ],
              [
                2,
                73,
                "Closed"
              ]
            ]
          },
          "example": "SELECT a.account_id, r.review_id FROM accounts a LEFT JOIN compliance_reviews r ON a.account_id = r.account_id AND r.review_status = 'Open' ORDER BY a.account_id;",
          "choices": [
            "(1,71), (2,NULL), (3,NULL)",
            "Only (1,71)",
            "(1,71), (1,72), (2,73)"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              1,
              71
            ],
            [
              2,
              null
            ],
            [
              3,
              null
            ]
          ],
          "explain": "To keep every account while matching only Open reviews, put the review-status condition in ON. A WHERE condition on the right table removes unmatched rows because their right-side values are NULL.",
          "choiceFeedback": [
            "Trace the rows in the small table. To keep every account while matching only Open reviews, put the review-status condition in ON. A WHERE condition on the right table removes unmatched rows because their right-side values are NULL.",
            "Trace the rows in the small table. To keep every account while matching only Open reviews, put the review-status condition in ON. A WHERE condition on the right table removes unmatched rows because their right-side values are NULL.",
            "Trace the rows in the small table. To keep every account while matching only Open reviews, put the review-status condition in ON. A WHERE condition on the right table removes unmatched rows because their right-side values are NULL."
          ],
          "relatedSamples": [
            {
              "name": "accounts",
              "columns": [
                "account_id"
              ],
              "rows": [
                [
                  1
                ],
                [
                  2
                ],
                [
                  3
                ]
              ]
            }
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Keep every account, and show review_id only for matching Open reviews. Repair the filter placement.",
          "starterSQL": "SELECT a.account_id, r.review_id FROM accounts a LEFT JOIN compliance_reviews r ON a.account_id = r.account_id WHERE r.review_status = 'Open';",
          "solutionSQL": "SELECT a.account_id, r.review_id FROM accounts a LEFT JOIN compliance_reviews r ON a.account_id = r.account_id AND r.review_status = 'Open';",
          "requiredColumns": [
            "account_id",
            "review_id"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Decide whether unmatched accounts should remain.",
            "ON chooses matches; WHERE removes final rows.",
            "Move the right-side status condition into ON."
          ],
          "explain": "To keep every account while matching only Open reviews, put the review-status condition in ON. A WHERE condition on the right table removes unmatched rows because their right-side values are NULL.",
          "explanationPrompt": "Why does a WHERE test on a NULL right-side status remove unmatched accounts?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Keep every account, showing transaction_id only for matching Pending transactions.",
          "starterSQL": "",
          "solutionSQL": "SELECT a.account_id, t.transaction_id FROM accounts a LEFT JOIN transactions t ON a.account_id = t.account_id AND t.transaction_status = 'Pending';",
          "requiredColumns": [
            "account_id",
            "transaction_id"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Decide whether unmatched accounts should remain.",
            "ON chooses matches; WHERE removes final rows.",
            "Move the right-side status condition into ON."
          ],
          "explain": "Why does a WHERE test on a NULL right-side status remove unmatched accounts?",
          "explanationPrompt": "Why does a WHERE test on a NULL right-side status remove unmatched accounts?"
        }
      ]
    }
  ],
  "analysis": [
    {
      "id": "analysis-text",
      "title": "Clean text without changing the source",
      "concepts": [
        "String Functions"
      ],
      "after": null,
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Return client_id and search_name, trimming surrounding spaces from full_name and converting it to lowercase.",
        "starterSQL": "",
        "solutionSQL": "SELECT client_id, LOWER(TRIM(full_name)) AS search_name FROM clients;",
        "requiredColumns": [
          "client_id",
          "search_name"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Separate display cleanup from editing stored records.",
          "Compose the string functions around the source column.",
          "Use LOWER(TRIM(email)) or UPPER(SUBSTR(province, 1, 2))."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Clean text without changing the source",
          "body": "TRIM removes surrounding spaces; LOWER normalizes letter case. A calculated result does not edit the stored data. Text rules differ across SQL engines; these exercises use SQLite.",
          "example": "SELECT client_id, LOWER(TRIM(email)) AS clean_email FROM clients;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "clients",
            "columns": [
              "email"
            ],
            "rows": [
              [
                " A@EXAMPLE.CA "
              ],
              [
                null
              ],
              [
                "B@example.ca"
              ]
            ]
          },
          "example": "SELECT LOWER(TRIM(email)) AS clean_email FROM clients;",
          "choices": [
            "a@example.ca, NULL, b@example.ca",
            "A@EXAMPLE.CA, empty text, B@example.ca",
            "The source emails are overwritten"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              "a@example.ca"
            ],
            [
              null
            ],
            [
              "b@example.ca"
            ]
          ],
          "explain": "TRIM removes surrounding spaces; LOWER normalizes letter case. A calculated result does not edit the stored data. Text rules differ across SQL engines; these exercises use SQLite.",
          "choiceFeedback": [
            "Trace the rows in the small table. TRIM removes surrounding spaces; LOWER normalizes letter case. A calculated result does not edit the stored data. Text rules differ across SQL engines; these exercises use SQLite.",
            "Trace the rows in the small table. TRIM removes surrounding spaces; LOWER normalizes letter case. A calculated result does not edit the stored data. Text rules differ across SQL engines; these exercises use SQLite.",
            "Trace the rows in the small table. TRIM removes surrounding spaces; LOWER normalizes letter case. A calculated result does not edit the stored data. Text rules differ across SQL engines; these exercises use SQLite."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Return client_id and clean_email, removing surrounding spaces and converting known emails to lowercase. Keep NULL as NULL.",
          "starterSQL": "SELECT client_id, email AS clean_email FROM clients;",
          "solutionSQL": "SELECT client_id, LOWER(TRIM(email)) AS clean_email FROM clients;",
          "requiredColumns": [
            "client_id",
            "clean_email"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Separate display cleanup from editing stored records.",
            "Compose the string functions around the source column.",
            "Use LOWER(TRIM(email)) or UPPER(SUBSTR(province, 1, 2))."
          ],
          "explain": "TRIM removes surrounding spaces; LOWER normalizes letter case. A calculated result does not edit the stored data. Text rules differ across SQL engines; these exercises use SQLite.",
          "explanationPrompt": "What happens to NULL when you clean the email, and why should you preserve it?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return client_id and province_code containing the first two province characters in uppercase.",
          "starterSQL": "",
          "solutionSQL": "SELECT client_id, UPPER(SUBSTR(province, 1, 2)) AS province_code FROM clients;",
          "requiredColumns": [
            "client_id",
            "province_code"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Separate display cleanup from editing stored records.",
            "Compose the string functions around the source column.",
            "Use LOWER(TRIM(email)) or UPPER(SUBSTR(province, 1, 2))."
          ],
          "explain": "What happens to NULL when you clean the email, and why should you preserve it?",
          "explanationPrompt": "What happens to NULL when you clean the email, and why should you preserve it?"
        }
      ]
    },
    {
      "id": "analysis-dates",
      "title": "Dates and half-open intervals",
      "concepts": [
        "WHERE"
      ],
      "after": null,
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Return transaction_id and transaction_date for February 2026 using a half-open interval.",
        "starterSQL": "",
        "solutionSQL": "SELECT transaction_id, transaction_date FROM transactions WHERE transaction_date >= '2026-02-01' AND transaction_date < '2026-03-01';",
        "requiredColumns": [
          "transaction_id",
          "transaction_date"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Use the first day of the next month as the exclusive end.",
          "Use >= start and < next_start.",
          "For monthly summaries use strftime('%Y-%m', transaction_date)."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Dates and half-open intervals",
          "body": "With consistently formatted ISO dates (YYYY-MM-DD), text comparisons follow calendar order. A half-open interval includes its start and excludes the next period start. SQLite strftime is a dialect-specific way to group dates.",
          "example": "SELECT transaction_id, transaction_date FROM transactions WHERE transaction_date >= '2026-01-01' AND transaction_date < '2026-02-01';"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "transactions",
            "columns": [
              "transaction_id",
              "transaction_date"
            ],
            "rows": [
              [
                1,
                "2026-01-01"
              ],
              [
                2,
                "2026-01-31"
              ],
              [
                3,
                "2026-02-01"
              ]
            ]
          },
          "example": "SELECT transaction_id FROM transactions WHERE transaction_date >= '2026-01-01' AND transaction_date < '2026-02-01';",
          "choices": [
            "1 and 2",
            "1, 2 and 3",
            "Only 1"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              1
            ],
            [
              2
            ]
          ],
          "explain": "With consistently formatted ISO dates (YYYY-MM-DD), text comparisons follow calendar order. A half-open interval includes its start and excludes the next period start. SQLite strftime is a dialect-specific way to group dates.",
          "choiceFeedback": [
            "Trace the rows in the small table. With consistently formatted ISO dates (YYYY-MM-DD), text comparisons follow calendar order. A half-open interval includes its start and excludes the next period start. SQLite strftime is a dialect-specific way to group dates.",
            "Trace the rows in the small table. With consistently formatted ISO dates (YYYY-MM-DD), text comparisons follow calendar order. A half-open interval includes its start and excludes the next period start. SQLite strftime is a dialect-specific way to group dates.",
            "Trace the rows in the small table. With consistently formatted ISO dates (YYYY-MM-DD), text comparisons follow calendar order. A half-open interval includes its start and excludes the next period start. SQLite strftime is a dialect-specific way to group dates."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Return January 2026 transaction_id and transaction_date. Repair the upper boundary.",
          "starterSQL": "SELECT transaction_id, transaction_date FROM transactions WHERE transaction_date >= '2026-01-01' AND transaction_date <= '2026-02-01';",
          "solutionSQL": "SELECT transaction_id, transaction_date FROM transactions WHERE transaction_date >= '2026-01-01' AND transaction_date < '2026-02-01';",
          "requiredColumns": [
            "transaction_id",
            "transaction_date"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Use the first day of the next month as the exclusive end.",
            "Use >= start and < next_start.",
            "For monthly summaries use strftime('%Y-%m', transaction_date)."
          ],
          "explain": "With consistently formatted ISO dates (YYYY-MM-DD), text comparisons follow calendar order. A half-open interval includes its start and excludes the next period start. SQLite strftime is a dialect-specific way to group dates.",
          "explanationPrompt": "Why is excluding February 1 more reliable than trying to include every time on January 31?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return month and transaction_count for each transaction month using SQLite strftime with %Y-%m.",
          "starterSQL": "",
          "solutionSQL": "SELECT strftime('%Y-%m', transaction_date) AS month, COUNT(*) AS transaction_count FROM transactions GROUP BY strftime('%Y-%m', transaction_date);",
          "requiredColumns": [
            "month",
            "transaction_count"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Use the first day of the next month as the exclusive end.",
            "Use >= start and < next_start.",
            "For monthly summaries use strftime('%Y-%m', transaction_date)."
          ],
          "explain": "Why is excluding February 1 more reliable than trying to include every time on January 31?",
          "explanationPrompt": "Why is excluding February 1 more reliable than trying to include every time on January 31?"
        }
      ]
    },
    {
      "id": "analysis-union",
      "title": "Stack records with UNION ALL",
      "concepts": [
        "SELECT"
      ],
      "after": null,
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "Stack Dormant account IDs and expired-KYC client IDs. Return category (account or client) and entity_id; preserve all records.",
        "starterSQL": "",
        "solutionSQL": "SELECT 'account' AS category, account_id AS entity_id FROM accounts WHERE account_status = 'Dormant' UNION ALL SELECT 'client' AS category, client_id AS entity_id FROM clients WHERE kyc_status = 'expired';",
        "requiredColumns": [
          "category",
          "entity_id"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Stack records rather than joining them.",
          "Use each record type's own primary key.",
          "Give both SELECTs the same two output columns; use UNION ALL."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Stack records with UNION ALL",
          "body": "UNION stacks compatible result columns and removes duplicate result rows. UNION ALL preserves them. The inputs must have the same number of columns in the same intended order.",
          "example": "SELECT 'transaction' AS source, transaction_id AS item_id FROM transactions UNION ALL SELECT 'review' AS source, review_id AS item_id FROM compliance_reviews;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "clients",
            "columns": [
              "province"
            ],
            "rows": [
              [
                "ON"
              ],
              [
                "ON"
              ],
              [
                "BC"
              ]
            ]
          },
          "example": "SELECT province FROM clients UNION SELECT province FROM clients;",
          "choices": [
            "2 distinct province rows",
            "6 rows",
            "3 rows"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              "BC"
            ],
            [
              "ON"
            ]
          ],
          "explain": "UNION stacks compatible result columns and removes duplicate result rows. UNION ALL preserves them. The inputs must have the same number of columns in the same intended order.",
          "choiceFeedback": [
            "Trace the rows in the small table. UNION stacks compatible result columns and removes duplicate result rows. UNION ALL preserves them. The inputs must have the same number of columns in the same intended order.",
            "Trace the rows in the small table. UNION stacks compatible result columns and removes duplicate result rows. UNION ALL preserves them. The inputs must have the same number of columns in the same intended order.",
            "Trace the rows in the small table. UNION stacks compatible result columns and removes duplicate result rows. UNION ALL preserves them. The inputs must have the same number of columns in the same intended order."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Build a queue of all Pending transaction records and all Open review records. Show source and item_id; use transaction_id and review_id respectively. Preserve records with UNION ALL.",
          "starterSQL": "SELECT 'transaction' AS source, transaction_id AS item_id FROM transactions WHERE transaction_status = 'Pending' UNION ALL SELECT 'review' AS source, account_id AS item_id FROM compliance_reviews WHERE review_status = 'Open';",
          "solutionSQL": "SELECT 'transaction' AS source, transaction_id AS item_id FROM transactions WHERE transaction_status = 'Pending' UNION ALL SELECT 'review' AS source, review_id AS item_id FROM compliance_reviews WHERE review_status = 'Open';",
          "requiredColumns": [
            "source",
            "item_id"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Stack records rather than joining them.",
            "Use each record type's own primary key.",
            "Give both SELECTs the same two output columns; use UNION ALL."
          ],
          "explain": "UNION stacks compatible result columns and removes duplicate result rows. UNION ALL preserves them. The inputs must have the same number of columns in the same intended order.",
          "explanationPrompt": "Why is account_id not an identifier for an individual review?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return category and entity_id for all High risk clients (category client) and all Suspended accounts (category account). Preserve all records with UNION ALL.",
          "starterSQL": "",
          "solutionSQL": "SELECT 'client' AS category, client_id AS entity_id FROM clients WHERE risk_rating = 'High' UNION ALL SELECT 'account' AS category, account_id AS entity_id FROM accounts WHERE account_status = 'Suspended';",
          "requiredColumns": [
            "category",
            "entity_id"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Stack records rather than joining them.",
            "Use each record type's own primary key.",
            "Give both SELECTs the same two output columns; use UNION ALL."
          ],
          "explain": "Why is account_id not an identifier for an individual review?",
          "explanationPrompt": "Why is account_id not an identifier for an individual review?"
        }
      ]
    }
  ],
  "advanced": [
    {
      "id": "advanced-running",
      "title": "Running totals need a stable sequence",
      "concepts": [
        "Window Function"
      ],
      "after": "advanced-03",
      "review": {
        "type": "query",
        "phase": "Retrieve",
        "prompt": "For Posted transactions only, return transaction_id, account_id and running_posted: a per-account running sum of amount ordered by transaction_date then transaction_id with an explicit ROWS frame.",
        "starterSQL": "",
        "solutionSQL": "SELECT transaction_id, account_id, SUM(amount) OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_posted FROM transactions WHERE transaction_status = 'Posted';",
        "requiredColumns": [
          "transaction_id",
          "account_id",
          "running_posted"
        ],
        "orderMatters": false,
        "hintSteps": [
          "Choose the group whose sequence should restart.",
          "A window partition restarts per account.",
          "Use PARTITION BY account_id and date/ID ordering."
        ],
        "explain": "Recall check complete. Describe the rule in your own words before continuing.",
        "explanationPrompt": "Explain what one output row represents and why the query meets the requested rule."
      },
      "steps": [
        {
          "type": "concept",
          "phase": "Observe",
          "title": "Running totals need a stable sequence",
          "body": "SUM(...) OVER keeps individual rows and adds a cumulative value. Partition by account, order by date then transaction ID, and use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a row-by-row running sum.",
          "example": "SELECT transaction_id, SUM(amount) OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM transactions;"
        },
        {
          "type": "choice",
          "phase": "Predict",
          "prompt": "Use only the small table below. Predict the result before running SQL.",
          "sample": {
            "name": "transactions",
            "columns": [
              "transaction_id",
              "account_id",
              "transaction_date",
              "amount"
            ],
            "rows": [
              [
                1,
                11,
                "2026-01-01",
                10
              ],
              [
                2,
                11,
                "2026-01-01",
                20
              ],
              [
                3,
                12,
                "2026-01-01",
                5
              ]
            ]
          },
          "example": "SELECT transaction_id, SUM(amount) OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM transactions ORDER BY transaction_id;",
          "choices": [
            "(1,10), (2,30), (3,5)",
            "(1,10), (2,30), (3,35)",
            "One total row per account"
          ],
          "answerIndex": 0,
          "predictionRows": [
            [
              1,
              10
            ],
            [
              2,
              30
            ],
            [
              3,
              5
            ]
          ],
          "explain": "SUM(...) OVER keeps individual rows and adds a cumulative value. Partition by account, order by date then transaction ID, and use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a row-by-row running sum.",
          "choiceFeedback": [
            "Trace the rows in the small table. SUM(...) OVER keeps individual rows and adds a cumulative value. Partition by account, order by date then transaction ID, and use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a row-by-row running sum.",
            "Trace the rows in the small table. SUM(...) OVER keeps individual rows and adds a cumulative value. Partition by account, order by date then transaction ID, and use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a row-by-row running sum.",
            "Trace the rows in the small table. SUM(...) OVER keeps individual rows and adds a cumulative value. Partition by account, order by date then transaction ID, and use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a row-by-row running sum."
          ]
        },
        {
          "type": "query",
          "phase": "Repair",
          "prompt": "Return transaction_id, account_id and running_total per account in date/ID order. Repair the missing partition.",
          "starterSQL": "SELECT transaction_id, account_id, SUM(amount) OVER (ORDER BY transaction_date, transaction_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM transactions;",
          "solutionSQL": "SELECT transaction_id, account_id, SUM(amount) OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM transactions;",
          "requiredColumns": [
            "transaction_id",
            "account_id",
            "running_total"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Choose the group whose sequence should restart.",
            "A window partition restarts per account.",
            "Use PARTITION BY account_id and date/ID ordering."
          ],
          "explain": "SUM(...) OVER keeps individual rows and adds a cumulative value. Partition by account, order by date then transaction ID, and use ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a row-by-row running sum.",
          "explanationPrompt": "Why must the second account begin at 5 rather than carry over the first account's total?"
        },
        {
          "type": "query",
          "phase": "Apply",
          "prompt": "Return transaction_id, account_id and previous_amount using LAG within each account, ordered by transaction_date then transaction_id.",
          "starterSQL": "",
          "solutionSQL": "SELECT transaction_id, account_id, LAG(amount) OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id) AS previous_amount FROM transactions;",
          "requiredColumns": [
            "transaction_id",
            "account_id",
            "previous_amount"
          ],
          "orderMatters": false,
          "hintSteps": [
            "Choose the group whose sequence should restart.",
            "A window partition restarts per account.",
            "Use PARTITION BY account_id and date/ID ordering."
          ],
          "explain": "Why must the second account begin at 5 rather than carry over the first account's total?",
          "explanationPrompt": "Why must the second account begin at 5 rather than carry over the first account's total?"
        }
      ]
    }
  ]
};

export function extendLearnTrack(track) {
  for (const unit of track) {
    for (const lesson of additions[unit.id] || []) {
      if (unit.lessons.some(item => item.id === lesson.id)) continue;
      // Spread answer positions deterministically rather than teaching a button pattern.
      lesson.steps.filter(step => step.type === 'choice').forEach(step => {
        if (step.answerPositionsAssigned) return;
        const offset = [...lesson.id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % step.choices.length;
        step.choices = [...step.choices.slice(offset), ...step.choices.slice(0, offset)];
        step.choiceFeedback = [...step.choiceFeedback.slice(offset), ...step.choiceFeedback.slice(0, offset)];
        step.answerIndex = (step.answerIndex - offset + step.choices.length) % step.choices.length;
        step.answerPositionsAssigned = true;
      });
      const anchor = lesson.after ? unit.lessons.findIndex(item => item.id === lesson.after) : -1;
      const checkpoint = unit.lessons.findIndex(item => item.id.endsWith('-checkpoint'));
      unit.lessons.splice(anchor >= 0 ? anchor + 1 : checkpoint >= 0 ? checkpoint : unit.lessons.length, 0, lesson);
    }
    // Add metadata only to existing steps; saved step indices remain valid.
    for (const lesson of unit.lessons) {
      lesson.steps.forEach(step => {
        step.phase ||= ({ concept: 'Observe', choice: 'Recall', fill: 'Complete', query: 'Apply' })[step.type];
        if (step.type === 'query') {
          step.hintSteps ||= [
            'Name what one result row should represent, then choose the source table.',
            step.hint || 'Work through the query one clause at a time.'
          ];
          step.explanationPrompt ||= 'Explain what one result row means and how you checked the result.';
        }
      });
    }
  }
}
