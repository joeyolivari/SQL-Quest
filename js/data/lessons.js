// Progressive "Learn" track content.
//
// This is PURE DATA. The Learn track screen (js/features/learn.js) reads this
// and renders it. To add more lessons or whole new units later, you only add
// more entries here — no UI code changes needed.
//
// Shape:
//   LEARN_TRACK: Unit[]
//   Unit   = { id, title, subtitle, icon, graduatesTo, lessons: Lesson[] }
//   Lesson = { id, title, concepts?: string[], steps: Step[] }
//   Step   = one of the four types below (discriminated by `type`):
//
//   { type: 'concept', title, body, eli12?, example? }
//       A teaching card. No input — the learner just reads and continues.
//
//   { type: 'choice', prompt, choices: string[], answerIndex, explain? }
//       Tap-the-answer multiple choice.
//
//   { type: 'fill', prompt, template, blanks: [{ accept: string[] }], caseSensitive?, hint?, explain? }
//       Fill-in-the-blank. `template` contains {{0}}, {{1}} ... tokens; each
//       maps to blanks[i]. An answer passes if it matches any string in accept
//       (case-insensitive unless caseSensitive is true).
//
//   { type: 'query', prompt, starterSQL, solutionSQL, requiredColumns, orderMatters, hint?, explain? }
//       Write a real query. It runs against the live sample database and is
//       graded with the same compareResults() the missions use.
//
// All example SQL below targets the real seeded tables:
//   clients(client_id, full_name, email, advisor_id, kyc_status, province, risk_rating, onboarding_date)
//   accounts(account_id, client_id, account_type, balance, open_date, account_status, last_review_date)
// Real values: kyc_status in ('complete','pending','expired'); risk_rating in
// ('Low','Medium','High'); account_type in ('RRSP','TFSA','RESP','FHSA','Non-Registered').

export const LEARN_TRACK = [
  {
    "id": "foundations",
    "title": "Foundations",
    "subtitle": "Start from zero: tables, SELECT, filtering, and sorting.",
    "icon": "🌱",
    "graduatesTo": 1,
    "lessons": [
      {
        "id": "foundations-01",
        "title": "What is a database?",
        "concepts": [
          "SELECT"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "A table is a grid",
            "body": "A database is just a set of tables. Each table is a grid: every row is one record, and every column is one fact about that record.",
            "eli12": "A table is a spreadsheet. In the clients table, each ROW is one client and each COLUMN is one fact about them (their name, their email, and so on).",
            "example": "clients\n──────────────────────────────────\nclient_id │ full_name   │ kyc_status\n    1     │ Sarah Chen  │ complete\n    3     │ Priya Patel │ pending"
          },
          {
            "type": "choice",
            "prompt": "In the clients table above, what is ONE ROW?",
            "choices": [
              "One client",
              "One column of data",
              "The whole database",
              "A SQL keyword"
            ],
            "answerIndex": 0,
            "explain": "Each row is a single record. Here, one row = one client."
          },
          {
            "type": "choice",
            "prompt": "Which word do we use to ASK a database for data?",
            "choices": [
              "OPEN",
              "SELECT",
              "SHOW",
              "FETCH"
            ],
            "answerIndex": 1,
            "explain": "SELECT is how every read query starts — it chooses which columns come back."
          }
        ]
      },
      {
        "id": "foundations-02",
        "title": "SELECT specific columns",
        "concepts": [
          "SELECT"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "SELECT picks columns, FROM picks the table",
            "body": "You list the columns you want after SELECT, separated by commas. Then FROM says which table to read them from.",
            "eli12": "Your locker holds books, gym clothes, and snacks. SELECT is grabbing only the books you want — you name exactly what to take.",
            "example": "SELECT full_name, kyc_status\nFROM clients;"
          },
          {
            "type": "fill",
            "prompt": "Complete the query to return full_name and email from the clients table.",
            "template": "SELECT {{0}}, {{1}}\nFROM {{2}};",
            "blanks": [
              {
                "accept": [
                  "full_name"
                ]
              },
              {
                "accept": [
                  "email"
                ]
              },
              {
                "accept": [
                  "clients"
                ]
              }
            ],
            "hint": "Name each column after SELECT, then the table name after FROM.",
            "explain": "SELECT full_name, email FROM clients; — columns first, table second."
          },
          {
            "type": "query",
            "prompt": "Now write it yourself: return client_id and full_name for every client.",
            "starterSQL": "SELECT \nFROM clients;",
            "solutionSQL": "SELECT client_id, full_name FROM clients;",
            "requiredColumns": [
              "client_id",
              "full_name"
            ],
            "orderMatters": false,
            "hint": "Two column names after SELECT, separated by a comma, then FROM clients.",
            "explain": "Listing columns by name is the most common form of SELECT."
          }
        ]
      },
      {
        "id": "foundations-03",
        "title": "SELECT * (every column)",
        "concepts": [
          "SELECT"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "The * shortcut",
            "body": "If you want every column, you do not have to type them all. The star * means \"all columns\".",
            "eli12": "Instead of listing every single thing in your locker, * is just saying \"give me everything\".",
            "example": "SELECT *\nFROM accounts;"
          },
          {
            "type": "choice",
            "prompt": "What does SELECT * return?",
            "choices": [
              "Only the first column",
              "All columns",
              "No columns",
              "A random column"
            ],
            "answerIndex": 1,
            "explain": "* is shorthand for every column in the table."
          },
          {
            "type": "fill",
            "prompt": "Return every column from the accounts table.",
            "template": "SELECT {{0}}\nFROM {{1}};",
            "blanks": [
              {
                "accept": [
                  "*"
                ]
              },
              {
                "accept": [
                  "accounts"
                ]
              }
            ],
            "hint": "One symbol means \"all columns\".",
            "explain": "SELECT * FROM accounts; gives you the whole table."
          }
        ]
      },
      {
        "id": "foundations-04",
        "title": "WHERE — keep only some rows",
        "concepts": [
          "WHERE"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "WHERE filters rows",
            "body": "WHERE keeps only the rows that match a condition. Text values go inside single quotes. Numbers do not.",
            "eli12": "A lunch-table rule: \"only people in a red shirt may sit here.\" Everyone who fails the rule is turned away before you even look.",
            "example": "SELECT full_name, kyc_status\nFROM clients\nWHERE kyc_status = 'pending';"
          },
          {
            "type": "choice",
            "prompt": "How do you write a TEXT value like pending in a WHERE condition?",
            "choices": [
              "In single quotes: 'pending'",
              "In all caps: PENDING",
              "With no quotes: pending",
              "In brackets: [pending]"
            ],
            "answerIndex": 0,
            "explain": "Text/strings always go in single quotes. So: WHERE kyc_status = 'pending'."
          },
          {
            "type": "query",
            "prompt": "Return client_id and full_name for clients whose risk_rating is 'High'.",
            "starterSQL": "SELECT client_id, full_name\nFROM clients\nWHERE ",
            "solutionSQL": "SELECT client_id, full_name FROM clients WHERE risk_rating = 'High';",
            "requiredColumns": [
              "client_id",
              "full_name"
            ],
            "orderMatters": false,
            "hint": "Add: WHERE risk_rating = 'High' — remember the single quotes around High.",
            "explain": "WHERE filters rows down to only the ones that match your condition."
          }
        ]
      },
      {
        "id": "foundations-05",
        "title": "WHERE with numbers",
        "concepts": [
          "WHERE"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Compare numbers with > < =",
            "body": "For number columns you can use comparisons: greater than (>), less than (<), equals (=), and so on. No quotes around numbers.",
            "eli12": "Like a height sign at a theme park: \"you must be taller than 120 cm to ride.\" WHERE balance > 100000 keeps only the big accounts.",
            "example": "SELECT account_id, balance\nFROM accounts\nWHERE balance > 100000;"
          },
          {
            "type": "fill",
            "prompt": "Keep only accounts with a balance greater than 50000.",
            "template": "SELECT account_id, balance\nFROM accounts\nWHERE balance {{0}} 50000;",
            "blanks": [
              {
                "accept": [
                  ">"
                ]
              }
            ],
            "hint": "The symbol for \"greater than\".",
            "explain": "WHERE balance > 50000 — numbers need no quotes."
          },
          {
            "type": "query",
            "prompt": "Return account_id and account_type for accounts with a balance of at least 100000 (100000 or more).",
            "starterSQL": "SELECT account_id, account_type\nFROM accounts\nWHERE ",
            "solutionSQL": "SELECT account_id, account_type FROM accounts WHERE balance >= 100000;",
            "requiredColumns": [
              "account_id",
              "account_type"
            ],
            "orderMatters": false,
            "hint": "\"At least\" means greater-than-or-equal: WHERE balance >= 100000.",
            "explain": ">= means \"greater than or equal to\", so 100000 itself is included."
          }
        ]
      },
      {
        "id": "foundations-06",
        "title": "ORDER BY — sort the result",
        "concepts": [
          "ORDER BY"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Sort with ORDER BY",
            "body": "ORDER BY sorts your rows by a column. Add ASC for smallest-first (the default) or DESC for largest-first.",
            "eli12": "Lining classmates up by height: shortest-to-tallest is ASC, tallest-to-shortest is DESC.",
            "example": "SELECT account_id, balance\nFROM accounts\nORDER BY balance DESC;"
          },
          {
            "type": "fill",
            "prompt": "Sort accounts by balance, HIGHEST first.",
            "template": "SELECT account_id, balance\nFROM accounts\nORDER BY balance {{0}};",
            "blanks": [
              {
                "accept": [
                  "DESC"
                ]
              }
            ],
            "hint": "The keyword for largest-first (descending).",
            "explain": "DESC = descending = highest value first."
          },
          {
            "type": "query",
            "prompt": "Return client_id and full_name from clients, sorted by full_name from A to Z.",
            "starterSQL": "SELECT client_id, full_name\nFROM clients\n",
            "solutionSQL": "SELECT client_id, full_name FROM clients ORDER BY full_name ASC;",
            "requiredColumns": [
              "client_id",
              "full_name"
            ],
            "orderMatters": true,
            "hint": "ORDER BY full_name (ASC is the default, A to Z).",
            "explain": "A-to-Z is ascending order — ORDER BY full_name, optionally with ASC."
          }
        ]
      },
      {
        "id": "foundations-07",
        "title": "LIMIT — just the top rows",
        "concepts": [
          "ORDER BY"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Cap the rows with LIMIT",
            "body": "LIMIT caps how many rows come back. Combined with ORDER BY, it gives you a \"top N\" list.",
            "eli12": "A leaderboard only shows the top 5 scores. ORDER BY ranks everyone; LIMIT 5 keeps just the top of the list.",
            "example": "SELECT account_id, balance\nFROM accounts\nORDER BY balance DESC\nLIMIT 5;"
          },
          {
            "type": "query",
            "prompt": "Return the 5 accounts with the HIGHEST balance. Show account_id and balance. Break equal balances by account_id ascending.",
            "starterSQL": "SELECT account_id, balance\nFROM accounts\n",
            "solutionSQL": "SELECT account_id, balance FROM accounts ORDER BY balance DESC, account_id ASC LIMIT 5;",
            "requiredColumns": [
              "account_id",
              "balance"
            ],
            "orderMatters": true,
            "hint": "Sort with ORDER BY balance DESC, then add LIMIT 5.",
            "explain": "ORDER BY ranks the rows; LIMIT 5 keeps only the top five. You just built a leaderboard!"
          },
          {
            "type": "concept",
            "title": "You did it! 🎉",
            "body": "You can select, filter, sort and limit. Continue to Filtering for combined conditions, then use missions as practice checkpoints.",
            "eli12": "These four moves — pick, filter, sort, limit — show up in nearly every query a pro writes. You have the foundation now."
          }
        ]
      }
    ]
  },
  {
    "id": "filtering",
    "title": "Filtering",
    "subtitle": "Combine conditions and handle missing information.",
    "icon": "📘",
    "graduatesTo": 1,
    "lessons": [
      {
        "id": "filtering-01",
        "title": "AND and OR",
        "concepts": [
          "AND"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "AND and OR",
            "body": "Return active accounts with balance at least 100000. Show account_id and balance. Break equal balances by account_id ascending.",
            "example": "SELECT account_id, balance FROM accounts WHERE account_status = 'Active' AND balance >= 100000;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT account_id, balance FROM accounts WHERE account_status = 'Active' {{0}} balance >= 100000;",
            "blanks": [
              {
                "accept": [
                  "AND"
                ]
              }
            ],
            "hint": "Use AND."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return active accounts with balance at least 100000. Show account_id and balance. Break equal balances by account_id ascending.",
            "starterSQL": "",
            "solutionSQL": "SELECT account_id, balance FROM accounts WHERE account_status = 'Active' AND balance >= 100000;",
            "requiredColumns": [
              "account_id",
              "balance"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return active accounts with balance at least 100000. Show account_id and balance. Break equal balances by account_id ascending."
          }
        ]
      },
      {
        "id": "filtering-or",
        "title": "OR and parentheses",
        "concepts": [
          "WHERE"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Group alternatives",
            "body": "AND requires both conditions; OR allows either. Parentheses group alternatives so AND applies to the whole group.",
            "example": "WHERE risk_rating = 'High' AND (kyc_status = 'pending' OR kyc_status = 'expired')"
          },
          {
            "type": "query",
            "prompt": "Return client_id for High risk clients with pending or expired KYC.",
            "starterSQL": "",
            "solutionSQL": "SELECT client_id FROM clients WHERE risk_rating = 'High' AND (kyc_status = 'pending' OR kyc_status = 'expired');",
            "requiredColumns": [
              "client_id"
            ],
            "orderMatters": false,
            "hint": "Put the two KYC alternatives inside parentheses."
          }
        ]
      },
      {
        "id": "filtering-02",
        "title": "IN lists",
        "concepts": [
          "IN"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "IN lists",
            "body": "Return pending or expired clients. Show client_id and kyc_status. IN tests membership; OR can express the same condition.",
            "example": "SELECT client_id, kyc_status FROM clients WHERE kyc_status IN ('pending','expired');"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT client_id, kyc_status FROM clients WHERE kyc_status {{0}} ('pending','expired');",
            "blanks": [
              {
                "accept": [
                  "IN"
                ]
              }
            ],
            "hint": "Use IN."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return pending or expired clients. Show client_id and kyc_status. IN tests membership; OR can express the same condition.",
            "starterSQL": "",
            "solutionSQL": "SELECT client_id, kyc_status FROM clients WHERE kyc_status IN ('pending','expired');",
            "requiredColumns": [
              "client_id",
              "kyc_status"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return pending or expired clients. Show client_id and kyc_status. IN tests membership; OR can express the same condition."
          }
        ]
      },
      {
        "id": "filtering-03",
        "title": "Inclusive ranges",
        "concepts": [
          "BETWEEN"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Inclusive ranges",
            "body": "Return account_id and balance for balances between 30000 and 100000, including both endpoints.",
            "example": "SELECT account_id, balance FROM accounts WHERE balance BETWEEN 30000 AND 100000;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT account_id, balance FROM accounts WHERE balance {{0}} 30000 AND 100000;",
            "blanks": [
              {
                "accept": [
                  "BETWEEN"
                ]
              }
            ],
            "hint": "Use BETWEEN."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return account_id and balance for balances between 30000 and 100000, including both endpoints.",
            "starterSQL": "",
            "solutionSQL": "SELECT account_id, balance FROM accounts WHERE balance BETWEEN 30000 AND 100000;",
            "requiredColumns": [
              "account_id",
              "balance"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return account_id and balance for balances between 30000 and 100000, including both endpoints."
          }
        ]
      },
      {
        "id": "filtering-04",
        "title": "Text patterns",
        "concepts": [
          "LIKE"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Text patterns",
            "body": "Return client_id and full_name for names containing son. The % wildcard matches any number of characters.",
            "example": "SELECT client_id, full_name FROM clients WHERE full_name LIKE '%son%';"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT client_id, full_name FROM clients WHERE full_name {{0}} '%son%';",
            "blanks": [
              {
                "accept": [
                  "LIKE"
                ]
              }
            ],
            "hint": "Use LIKE."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return client_id and full_name for names containing son. The % wildcard matches any number of characters.",
            "starterSQL": "",
            "solutionSQL": "SELECT client_id, full_name FROM clients WHERE full_name LIKE '%son%';",
            "requiredColumns": [
              "client_id",
              "full_name"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return client_id and full_name for names containing son. The % wildcard matches any number of characters."
          }
        ]
      },
      {
        "id": "filtering-05",
        "title": "Missing values",
        "concepts": [
          "IS NULL"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Missing values",
            "body": "Return client_id and email for clients without an email. NULL means unknown: use IS NULL, never = NULL.",
            "example": "SELECT client_id, email FROM clients WHERE email IS NULL;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT client_id, email FROM clients WHERE email {{0}};",
            "blanks": [
              {
                "accept": [
                  "IS NULL"
                ]
              }
            ],
            "hint": "Use IS NULL."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return client_id and email for clients without an email. NULL means unknown: use IS NULL, never = NULL.",
            "starterSQL": "",
            "solutionSQL": "SELECT client_id, email FROM clients WHERE email IS NULL;",
            "requiredColumns": [
              "client_id",
              "email"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return client_id and email for clients without an email. NULL means unknown: use IS NULL, never = NULL."
          }
        ]
      },
      {
        "id": "filtering-checkpoint",
        "title": "Independent checkpoint",
        "concepts": [
          "AND",
          "IN",
          "BETWEEN",
          "LIKE",
          "IS NULL"
        ],
        "steps": [
          {
            "type": "query",
            "prompt": "Return client_id and full_name for High risk clients whose KYC is pending or expired, sorted by client_id ascending.",
            "starterSQL": "",
            "solutionSQL": "SELECT client_id, full_name FROM clients WHERE risk_rating = 'High' AND kyc_status IN ('pending','expired') ORDER BY client_id;",
            "requiredColumns": [
              "client_id",
              "full_name"
            ],
            "orderMatters": true,
            "hint": "Combine the ideas from this unit.",
            "explain": "You completed the unit investigation."
          }
        ]
      }
    ]
  },
  {
    "id": "summaries",
    "title": "Summaries",
    "subtitle": "Turn records into meaningful totals.",
    "icon": "📘",
    "graduatesTo": 4,
    "lessons": [
      {
        "id": "summaries-01",
        "title": "Unique values",
        "concepts": [
          "DISTINCT"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Unique values",
            "body": "Return each distinct account_type once.",
            "example": "SELECT DISTINCT account_type FROM accounts;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT {{0}} account_type FROM accounts;",
            "blanks": [
              {
                "accept": [
                  "DISTINCT"
                ]
              }
            ],
            "hint": "Use DISTINCT."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return each distinct account_type once.",
            "starterSQL": "",
            "solutionSQL": "SELECT DISTINCT account_type FROM accounts;",
            "requiredColumns": [
              "account_type"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return each distinct account_type once."
          }
        ]
      },
      {
        "id": "summaries-02",
        "title": "Count and average",
        "concepts": [
          "COUNT"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Count and average",
            "body": "Return transaction_count and average_amount for all transactions. COUNT(*) counts rows; AVG ignores NULL values.",
            "example": "SELECT COUNT(*) AS transaction_count, AVG(amount) AS average_amount FROM transactions;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT {{0}}(*) AS transaction_count, AVG(amount) AS average_amount FROM transactions;",
            "blanks": [
              {
                "accept": [
                  "COUNT"
                ]
              }
            ],
            "hint": "Use COUNT."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return transaction_count and average_amount for all transactions. COUNT(*) counts rows; AVG ignores NULL values.",
            "starterSQL": "",
            "solutionSQL": "SELECT COUNT(*) AS transaction_count, AVG(amount) AS average_amount FROM transactions;",
            "requiredColumns": [
              "transaction_count",
              "average_amount"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return transaction_count and average_amount for all transactions. COUNT(*) counts rows; AVG ignores NULL values."
          }
        ]
      },
      {
        "id": "summaries-03",
        "title": "Group records",
        "concepts": [
          "GROUP BY"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Group records",
            "body": "Return account_id, transaction_count and total_amount per account. SUM adds amounts; grouping returns one row per account.",
            "example": "SELECT account_id, COUNT(*) AS transaction_count, SUM(amount) AS total_amount FROM transactions GROUP BY account_id;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT account_id, COUNT(*) AS transaction_count, SUM(amount) AS total_amount FROM transactions {{0}} account_id;",
            "blanks": [
              {
                "accept": [
                  "GROUP BY"
                ]
              }
            ],
            "hint": "Use GROUP BY."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return account_id, transaction_count and total_amount per account. SUM adds amounts; grouping returns one row per account.",
            "starterSQL": "",
            "solutionSQL": "SELECT account_id, COUNT(*) AS transaction_count, SUM(amount) AS total_amount FROM transactions GROUP BY account_id;",
            "requiredColumns": [
              "account_id",
              "transaction_count",
              "total_amount"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return account_id, transaction_count and total_amount per account. SUM adds amounts; grouping returns one row per account."
          }
        ]
      },
      {
        "id": "summaries-04",
        "title": "Filter groups",
        "concepts": [
          "HAVING"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Filter groups",
            "body": "Return account_id and total_deposited for accounts whose Deposit amounts total more than 50000. WHERE selects deposits before grouping; HAVING filters totals afterward.",
            "example": "SELECT account_id, SUM(amount) AS total_deposited FROM transactions WHERE transaction_type = 'Deposit' GROUP BY account_id HAVING SUM(amount) > 50000;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT account_id, SUM(amount) AS total_deposited FROM transactions WHERE transaction_type = 'Deposit' GROUP BY account_id {{0}} SUM(amount) > 50000;",
            "blanks": [
              {
                "accept": [
                  "HAVING"
                ]
              }
            ],
            "hint": "Use HAVING."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return account_id and total_deposited for accounts whose Deposit amounts total more than 50000. WHERE selects deposits before grouping; HAVING filters totals afterward.",
            "starterSQL": "",
            "solutionSQL": "SELECT account_id, SUM(amount) AS total_deposited FROM transactions WHERE transaction_type = 'Deposit' GROUP BY account_id HAVING SUM(amount) > 50000;",
            "requiredColumns": [
              "account_id",
              "total_deposited"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return account_id and total_deposited for accounts whose Deposit amounts total more than 50000. WHERE selects deposits before grouping; HAVING filters totals afterward."
          }
        ]
      },
      {
        "id": "summaries-checkpoint",
        "title": "Independent checkpoint",
        "concepts": [
          "DISTINCT",
          "COUNT",
          "GROUP BY",
          "HAVING"
        ],
        "steps": [
          {
            "type": "query",
            "prompt": "Return account_type and total_balance for active accounts, keeping only types whose total balance exceeds 1000000.",
            "starterSQL": "",
            "solutionSQL": "SELECT account_type, SUM(balance) AS total_balance FROM accounts WHERE account_status = 'Active' GROUP BY account_type HAVING SUM(balance) > 1000000;",
            "requiredColumns": [
              "account_type",
              "total_balance"
            ],
            "orderMatters": false,
            "hint": "Combine the ideas from this unit.",
            "explain": "You completed the unit investigation."
          }
        ]
      }
    ]
  },
  {
    "id": "relationships",
    "title": "Relationships",
    "subtitle": "Connect tables without double-counting.",
    "icon": "📘",
    "graduatesTo": 2,
    "lessons": [
      {
        "id": "relationships-01",
        "title": "Keys and inner joins",
        "concepts": [
          "JOIN"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Keys and inner joins",
            "body": "Return client_id, full_name and account_id for clients with accounts. A primary key identifies a row; a foreign key points to it. One client can produce several joined rows.",
            "example": "SELECT c.client_id, c.full_name, a.account_id FROM clients c JOIN accounts a ON c.client_id = a.client_id;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT c.client_id, c.full_name, a.account_id FROM clients c {{0}} accounts a ON c.client_id = a.client_id;",
            "blanks": [
              {
                "accept": [
                  "JOIN"
                ]
              }
            ],
            "hint": "Use JOIN."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return client_id, full_name and account_id for clients with accounts. A primary key identifies a row; a foreign key points to it. One client can produce several joined rows.",
            "starterSQL": "",
            "solutionSQL": "SELECT c.client_id, c.full_name, a.account_id FROM clients c JOIN accounts a ON c.client_id = a.client_id;",
            "requiredColumns": [
              "client_id",
              "full_name",
              "account_id"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return client_id, full_name and account_id for clients with accounts. A primary key identifies a row; a foreign key points to it. One client can produce several joined rows."
          }
        ]
      },
      {
        "id": "relationships-02",
        "title": "Keep unmatched records",
        "concepts": [
          "LEFT JOIN"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Keep unmatched records",
            "body": "Return client_id and account_id for every client, including clients without accounts. Missing matches appear as NULL.",
            "example": "SELECT c.client_id, a.account_id FROM clients c LEFT JOIN accounts a ON c.client_id = a.client_id;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT c.client_id, a.account_id FROM clients c {{0}} accounts a ON c.client_id = a.client_id;",
            "blanks": [
              {
                "accept": [
                  "LEFT JOIN"
                ]
              }
            ],
            "hint": "Use LEFT JOIN."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return client_id and account_id for every client, including clients without accounts. Missing matches appear as NULL.",
            "starterSQL": "",
            "solutionSQL": "SELECT c.client_id, a.account_id FROM clients c LEFT JOIN accounts a ON c.client_id = a.client_id;",
            "requiredColumns": [
              "client_id",
              "account_id"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return client_id and account_id for every client, including clients without accounts. Missing matches appear as NULL."
          }
        ]
      },
      {
        "id": "relationships-03",
        "title": "Find gaps",
        "concepts": [
          "IS NULL"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Find gaps",
            "body": "Return account_id for accounts with no compliance review. Test the right table primary key after a LEFT JOIN.",
            "example": "SELECT a.account_id FROM accounts a LEFT JOIN compliance_reviews r ON a.account_id = r.account_id WHERE r.review_id IS NULL;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT a.account_id FROM accounts a LEFT JOIN compliance_reviews r ON a.account_id = r.account_id WHERE r.review_id {{0}};",
            "blanks": [
              {
                "accept": [
                  "IS NULL"
                ]
              }
            ],
            "hint": "Use IS NULL."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return account_id for accounts with no compliance review. Test the right table primary key after a LEFT JOIN.",
            "starterSQL": "",
            "solutionSQL": "SELECT a.account_id FROM accounts a LEFT JOIN compliance_reviews r ON a.account_id = r.account_id WHERE r.review_id IS NULL;",
            "requiredColumns": [
              "account_id"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return account_id for accounts with no compliance review. Test the right table primary key after a LEFT JOIN."
          }
        ]
      },
      {
        "id": "relationships-04",
        "title": "Count people once",
        "concepts": [
          "DISTINCT"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Count people once",
            "body": "Return advisor_id and high_risk_clients: count distinct High risk clients with accounts for each advisor. Multiple accounts must not multiply people.",
            "example": "SELECT c.advisor_id, COUNT(DISTINCT c.client_id) AS high_risk_clients FROM clients c JOIN accounts a ON c.client_id = a.client_id WHERE c.risk_rating = 'High' GROUP BY c.advisor_id;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT c.advisor_id, COUNT({{0}} c.client_id) AS high_risk_clients FROM clients c JOIN accounts a ON c.client_id = a.client_id WHERE c.risk_rating = 'High' GROUP BY c.advisor_id;",
            "blanks": [
              {
                "accept": [
                  "DISTINCT"
                ]
              }
            ],
            "hint": "Use DISTINCT."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return advisor_id and high_risk_clients: count distinct High risk clients with accounts for each advisor. Multiple accounts must not multiply people.",
            "starterSQL": "",
            "solutionSQL": "SELECT c.advisor_id, COUNT(DISTINCT c.client_id) AS high_risk_clients FROM clients c JOIN accounts a ON c.client_id = a.client_id WHERE c.risk_rating = 'High' GROUP BY c.advisor_id;",
            "requiredColumns": [
              "advisor_id",
              "high_risk_clients"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return advisor_id and high_risk_clients: count distinct High risk clients with accounts for each advisor. Multiple accounts must not multiply people."
          }
        ]
      },
      {
        "id": "relationships-checkpoint",
        "title": "Independent checkpoint",
        "concepts": [
          "JOIN",
          "LEFT JOIN",
          "IS NULL",
          "DISTINCT"
        ],
        "steps": [
          {
            "type": "query",
            "prompt": "Return client_id and full_name for clients with no account.",
            "starterSQL": "",
            "solutionSQL": "SELECT c.client_id, c.full_name FROM clients c LEFT JOIN accounts a ON c.client_id = a.client_id WHERE a.account_id IS NULL;",
            "requiredColumns": [
              "client_id",
              "full_name"
            ],
            "orderMatters": false,
            "hint": "Combine the ideas from this unit.",
            "explain": "You completed the unit investigation."
          }
        ]
      }
    ]
  },
  {
    "id": "analysis",
    "title": "Analysis",
    "subtitle": "Build readable investigations in stages.",
    "icon": "📘",
    "graduatesTo": 11,
    "lessons": [
      {
        "id": "analysis-01",
        "title": "Conditional labels",
        "concepts": [
          "CASE"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Conditional labels",
            "body": "Return account_id and risk_band: High for balance >= 100000, otherwise Standard. CASE checks conditions in order.",
            "example": "SELECT account_id, CASE WHEN balance >= 100000 THEN 'High' ELSE 'Standard' END AS risk_band FROM accounts;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT account_id, {{0}} WHEN balance >= 100000 THEN 'High' ELSE 'Standard' END AS risk_band FROM accounts;",
            "blanks": [
              {
                "accept": [
                  "CASE"
                ]
              }
            ],
            "hint": "Use CASE."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return account_id and risk_band: High for balance >= 100000, otherwise Standard. CASE checks conditions in order.",
            "starterSQL": "",
            "solutionSQL": "SELECT account_id, CASE WHEN balance >= 100000 THEN 'High' ELSE 'Standard' END AS risk_band FROM accounts;",
            "requiredColumns": [
              "account_id",
              "risk_band"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return account_id and risk_band: High for balance >= 100000, otherwise Standard. CASE checks conditions in order."
          }
        ]
      },
      {
        "id": "analysis-02",
        "title": "Above the average",
        "concepts": [
          "SELECT"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Above the average",
            "body": "Return transaction_id and amount where amount exceeds the global average. A subquery can calculate one value for a comparison.",
            "example": "SELECT transaction_id, amount FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "{{0}} transaction_id, amount FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);",
            "blanks": [
              {
                "accept": [
                  "SELECT"
                ]
              }
            ],
            "hint": "Use SELECT."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return transaction_id and amount where amount exceeds the global average. A subquery can calculate one value for a comparison.",
            "starterSQL": "",
            "solutionSQL": "SELECT transaction_id, amount FROM transactions WHERE amount > (SELECT AVG(amount) FROM transactions);",
            "requiredColumns": [
              "transaction_id",
              "amount"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return transaction_id and amount where amount exceeds the global average. A subquery can calculate one value for a comparison."
          }
        ]
      },
      {
        "id": "analysis-03",
        "title": "Check related rows",
        "concepts": [
          "EXISTS"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Check related rows",
            "body": "Return client_id for clients with at least one account. EXISTS tests for a match without multiplying client rows.",
            "example": "SELECT c.client_id FROM clients c WHERE EXISTS (SELECT 1 FROM accounts a WHERE a.client_id = c.client_id);"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT c.client_id FROM clients c WHERE {{0}} (SELECT 1 FROM accounts a WHERE a.client_id = c.client_id);",
            "blanks": [
              {
                "accept": [
                  "EXISTS"
                ]
              }
            ],
            "hint": "Use EXISTS."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return client_id for clients with at least one account. EXISTS tests for a match without multiplying client rows.",
            "starterSQL": "",
            "solutionSQL": "SELECT c.client_id FROM clients c WHERE EXISTS (SELECT 1 FROM accounts a WHERE a.client_id = c.client_id);",
            "requiredColumns": [
              "client_id"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return client_id for clients with at least one account. EXISTS tests for a match without multiplying client rows."
          }
        ]
      },
      {
        "id": "analysis-04",
        "title": "Named query stages",
        "concepts": [
          "WITH"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Named query stages",
            "body": "Return account_id and total_amount where total transaction amount exceeds 100000. Name the grouped stage totals using WITH.",
            "example": "WITH totals AS (SELECT account_id, SUM(amount) AS total_amount FROM transactions GROUP BY account_id) SELECT account_id, total_amount FROM totals WHERE total_amount > 100000;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "{{0}} totals AS (SELECT account_id, SUM(amount) AS total_amount FROM transactions GROUP BY account_id) SELECT account_id, total_amount FROM totals WHERE total_amount > 100000;",
            "blanks": [
              {
                "accept": [
                  "WITH"
                ]
              }
            ],
            "hint": "Use WITH."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return account_id and total_amount where total transaction amount exceeds 100000. Name the grouped stage totals using WITH.",
            "starterSQL": "",
            "solutionSQL": "WITH totals AS (SELECT account_id, SUM(amount) AS total_amount FROM transactions GROUP BY account_id) SELECT account_id, total_amount FROM totals WHERE total_amount > 100000;",
            "requiredColumns": [
              "account_id",
              "total_amount"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return account_id and total_amount where total transaction amount exceeds 100000. Name the grouped stage totals using WITH."
          }
        ]
      },
      {
        "id": "analysis-null-values",
        "title": "COALESCE — fill missing values",
        "concepts": [
          "NULL",
          "CASE"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Unknown is different from zero",
            "body": "NULL means unknown. COALESCE picks the first value that is not NULL. Use COALESCE(balance, 0) only when the report explicitly requires missing balances to display as zero; this does not change the source data.",
            "example": "SELECT account_id, COALESCE(balance, 0) AS reported_balance\nFROM accounts;"
          },
          {
            "type": "query",
            "prompt": "Return account_id and reported_balance for every account. Display 0 for a missing balance; keep all other balances unchanged.",
            "starterSQL": "SELECT account_id,\nFROM accounts;",
            "solutionSQL": "SELECT account_id, COALESCE(balance, 0) AS reported_balance FROM accounts;",
            "requiredColumns": [
              "account_id",
              "reported_balance"
            ],
            "orderMatters": false,
            "hint": "COALESCE(balance, 0) chooses balance when it is known, otherwise 0."
          }
        ]
      },
      {
        "id": "analysis-not-exists",
        "title": "NOT EXISTS — find missing relationships",
        "concepts": [
          "EXISTS",
          "WHERE"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Check for no matching rows",
            "body": "NOT EXISTS is true when the inner query finds no matching row. Correlate the inner query to the current outer row. Unlike a join, it does not duplicate the outer row when multiple matches exist.",
            "example": "SELECT a.account_id FROM accounts a\nWHERE NOT EXISTS (\n  SELECT 1 FROM compliance_reviews r\n  WHERE r.account_id = a.account_id\n);"
          },
          {
            "type": "query",
            "prompt": "Return account_id for accounts that have no compliance reviews using NOT EXISTS.",
            "starterSQL": "SELECT a.account_id FROM accounts a\nWHERE NOT EXISTS (\n);",
            "solutionSQL": "SELECT a.account_id FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM compliance_reviews r WHERE r.account_id = a.account_id);",
            "requiredColumns": [
              "account_id"
            ],
            "orderMatters": false,
            "hint": "Match r.account_id to a.account_id inside the subquery."
          }
        ]
      },
      {
        "id": "analysis-checkpoint",
        "title": "Independent checkpoint",
        "concepts": [
          "CASE",
          "SELECT",
          "EXISTS",
          "WITH"
        ],
        "steps": [
          {
            "type": "query",
            "prompt": "Return client_id for clients with no account using NOT EXISTS.",
            "starterSQL": "",
            "solutionSQL": "SELECT c.client_id FROM clients c WHERE NOT EXISTS (SELECT 1 FROM accounts a WHERE a.client_id = c.client_id);",
            "requiredColumns": [
              "client_id"
            ],
            "orderMatters": false,
            "hint": "Combine the ideas from this unit.",
            "explain": "You completed the unit investigation."
          }
        ]
      }
    ]
  },
  {
    "id": "advanced",
    "title": "Advanced investigations",
    "subtitle": "Keep rows while ranking and comparing activity.",
    "icon": "📘",
    "graduatesTo": 29,
    "lessons": [
      {
        "id": "advanced-01",
        "title": "Number transactions",
        "concepts": [
          "ROW_NUMBER"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Number transactions",
            "body": "Return transaction_id, account_id and sequence_no. Number transactions within each account by transaction_date then transaction_id. Window functions keep individual rows.",
            "example": "SELECT transaction_id, account_id, ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id) AS sequence_no FROM transactions;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT transaction_id, account_id, {{0}}() OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id) AS sequence_no FROM transactions;",
            "blanks": [
              {
                "accept": [
                  "ROW_NUMBER"
                ]
              }
            ],
            "hint": "Use ROW_NUMBER."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return transaction_id, account_id and sequence_no. Number transactions within each account by transaction_date then transaction_id. Window functions keep individual rows.",
            "starterSQL": "",
            "solutionSQL": "SELECT transaction_id, account_id, ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id) AS sequence_no FROM transactions;",
            "requiredColumns": [
              "transaction_id",
              "account_id",
              "sequence_no"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return transaction_id, account_id and sequence_no. Number transactions within each account by transaction_date then transaction_id. Window functions keep individual rows."
          }
        ]
      },
      {
        "id": "advanced-02",
        "title": "Rank with ties",
        "concepts": [
          "DENSE_RANK"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Rank with ties",
            "body": "Return account_id, balance and balance_rank, ranking balances highest first. Equal balances share a rank; DENSE_RANK leaves no gaps.",
            "example": "SELECT account_id, balance, DENSE_RANK() OVER (ORDER BY balance DESC) AS balance_rank FROM accounts;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT account_id, balance, {{0}}() OVER (ORDER BY balance DESC) AS balance_rank FROM accounts;",
            "blanks": [
              {
                "accept": [
                  "DENSE_RANK"
                ]
              }
            ],
            "hint": "Use DENSE_RANK."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return account_id, balance and balance_rank, ranking balances highest first. Equal balances share a rank; DENSE_RANK leaves no gaps.",
            "starterSQL": "",
            "solutionSQL": "SELECT account_id, balance, DENSE_RANK() OVER (ORDER BY balance DESC) AS balance_rank FROM accounts;",
            "requiredColumns": [
              "account_id",
              "balance",
              "balance_rank"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return account_id, balance and balance_rank, ranking balances highest first. Equal balances share a rank; DENSE_RANK leaves no gaps."
          }
        ]
      },
      {
        "id": "advanced-03",
        "title": "Compare previous activity",
        "concepts": [
          "LAG"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Compare previous activity",
            "body": "Return transaction_id and previous_amount for each transaction within its account, ordered by transaction_date then transaction_id. The first has NULL previous_amount.",
            "example": "SELECT transaction_id, LAG(amount) OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id) AS previous_amount FROM transactions;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "SELECT transaction_id, {{0}}(amount) OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id) AS previous_amount FROM transactions;",
            "blanks": [
              {
                "accept": [
                  "LAG"
                ]
              }
            ],
            "hint": "Use LAG."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return transaction_id and previous_amount for each transaction within its account, ordered by transaction_date then transaction_id. The first has NULL previous_amount.",
            "starterSQL": "",
            "solutionSQL": "SELECT transaction_id, LAG(amount) OVER (PARTITION BY account_id ORDER BY transaction_date, transaction_id) AS previous_amount FROM transactions;",
            "requiredColumns": [
              "transaction_id",
              "previous_amount"
            ],
            "orderMatters": false,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return transaction_id and previous_amount for each transaction within its account, ordered by transaction_date then transaction_id. The first has NULL previous_amount."
          }
        ]
      },
      {
        "id": "advanced-04",
        "title": "Investigation report",
        "concepts": [
          "WITH"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "Investigation report",
            "body": "Return advisor_id, high_risk_clients and open_reviews. Count distinct clients rated High and distinct Open reviews, include every advisor, then sort by open_reviews descending and advisor_id ascending. Separate aggregates prevent account and review joins from multiplying people.",
            "example": "WITH people AS (SELECT advisor_id, COUNT(*) AS high_risk_clients FROM clients WHERE risk_rating = 'High' GROUP BY advisor_id), reviews AS (SELECT c.advisor_id, COUNT(DISTINCT r.review_id) AS open_reviews FROM clients c JOIN accounts a ON c.client_id = a.client_id JOIN compliance_reviews r ON a.account_id = r.account_id WHERE r.review_status = 'Open' GROUP BY c.advisor_id) SELECT adv.advisor_id, COALESCE(p.high_risk_clients,0) AS high_risk_clients, COALESCE(r.open_reviews,0) AS open_reviews FROM advisors adv LEFT JOIN people p ON adv.advisor_id = p.advisor_id LEFT JOIN reviews r ON adv.advisor_id = r.advisor_id ORDER BY open_reviews DESC, adv.advisor_id ASC;"
          },
          {
            "type": "fill",
            "prompt": "Complete the SQL keyword.",
            "template": "{{0}} people AS (SELECT advisor_id, COUNT(*) AS high_risk_clients FROM clients WHERE risk_rating = 'High' GROUP BY advisor_id), reviews AS (SELECT c.advisor_id, COUNT(DISTINCT r.review_id) AS open_reviews FROM clients c JOIN accounts a ON c.client_id = a.client_id JOIN compliance_reviews r ON a.account_id = r.account_id WHERE r.review_status = 'Open' GROUP BY c.advisor_id) SELECT adv.advisor_id, COALESCE(p.high_risk_clients,0) AS high_risk_clients, COALESCE(r.open_reviews,0) AS open_reviews FROM advisors adv LEFT JOIN people p ON adv.advisor_id = p.advisor_id LEFT JOIN reviews r ON adv.advisor_id = r.advisor_id ORDER BY open_reviews DESC, adv.advisor_id ASC;",
            "blanks": [
              {
                "accept": [
                  "WITH"
                ]
              }
            ],
            "hint": "Use WITH."
          },
          {
            "type": "query",
            "prompt": "Write the example yourself: Return advisor_id, high_risk_clients and open_reviews. Count distinct clients rated High and distinct Open reviews, include every advisor, then sort by open_reviews descending and advisor_id ascending. Separate aggregates prevent account and review joins from multiplying people.",
            "starterSQL": "",
            "solutionSQL": "WITH people AS (SELECT advisor_id, COUNT(*) AS high_risk_clients FROM clients WHERE risk_rating = 'High' GROUP BY advisor_id), reviews AS (SELECT c.advisor_id, COUNT(DISTINCT r.review_id) AS open_reviews FROM clients c JOIN accounts a ON c.client_id = a.client_id JOIN compliance_reviews r ON a.account_id = r.account_id WHERE r.review_status = 'Open' GROUP BY c.advisor_id) SELECT adv.advisor_id, COALESCE(p.high_risk_clients,0) AS high_risk_clients, COALESCE(r.open_reviews,0) AS open_reviews FROM advisors adv LEFT JOIN people p ON adv.advisor_id = p.advisor_id LEFT JOIN reviews r ON adv.advisor_id = r.advisor_id ORDER BY open_reviews DESC, adv.advisor_id ASC;",
            "requiredColumns": [
              "advisor_id",
              "high_risk_clients",
              "open_reviews"
            ],
            "orderMatters": true,
            "hint": "Build the query one clause at a time. Review the example if you get stuck.",
            "explain": "Return advisor_id, high_risk_clients and open_reviews. Count distinct clients rated High and distinct Open reviews, include every advisor, then sort by open_reviews descending and advisor_id ascending. Separate aggregates prevent account and review joins from multiplying people."
          }
        ]
      },
      {
        "id": "advanced-conditional-totals",
        "title": "Conditional totals",
        "concepts": [
          "CASE",
          "GROUP BY"
        ],
        "steps": [
          {
            "type": "concept",
            "title": "SUM with CASE",
            "body": "Place CASE inside SUM to add only a particular category while still counting all rows. ELSE 0 makes other categories contribute zero. Use WHERE first when you want to exclude a status from every calculation.",
            "example": "SELECT account_id,\n  SUM(CASE WHEN transaction_type = 'Deposit' THEN amount ELSE 0 END) AS total_deposited,\n  COUNT(*) AS transaction_count\nFROM transactions WHERE transaction_status = 'Posted'\nGROUP BY account_id;"
          },
          {
            "type": "query",
            "prompt": "For each account with posted activity, return account_id, total_withdrawn (sum only Withdrawal amounts) and transaction_count (all Posted transactions).",
            "starterSQL": "",
            "solutionSQL": "SELECT account_id, SUM(CASE WHEN transaction_type = 'Withdrawal' THEN amount ELSE 0 END) AS total_withdrawn, COUNT(*) AS transaction_count FROM transactions WHERE transaction_status = 'Posted' GROUP BY account_id;",
            "requiredColumns": [
              "account_id",
              "total_withdrawn",
              "transaction_count"
            ],
            "orderMatters": false,
            "hint": "Filter Posted rows, group by account_id, then use SUM(CASE...) and COUNT(*)."
          }
        ]
      },
      {
        "id": "advanced-checkpoint",
        "title": "Independent checkpoint",
        "concepts": [
          "ROW_NUMBER",
          "DENSE_RANK",
          "LAG",
          "WITH"
        ],
        "steps": [
          {
            "type": "query",
            "prompt": "Final investigation: consider only Posted transactions. For each advisor with posted activity, calculate total_deposited from Deposit transactions (use 0 for other transaction types) and transaction_count for all posted transactions. Rank advisors by total_deposited highest first using DENSE_RANK. Return advisor_id, total_deposited, transaction_count and deposit_rank; sort by deposit_rank ascending, then advisor_id ascending. Use a CTE to separate the grouped totals from the ranking.",
            "starterSQL": "",
            "solutionSQL": "WITH advisor_totals AS (SELECT c.advisor_id, SUM(CASE WHEN t.transaction_type = 'Deposit' THEN t.amount ELSE 0 END) AS total_deposited, COUNT(*) AS transaction_count FROM clients c JOIN accounts a ON c.client_id = a.client_id JOIN transactions t ON a.account_id = t.account_id WHERE t.transaction_status = 'Posted' GROUP BY c.advisor_id) SELECT advisor_id, total_deposited, transaction_count, DENSE_RANK() OVER (ORDER BY total_deposited DESC) AS deposit_rank FROM advisor_totals ORDER BY deposit_rank ASC, advisor_id ASC;",
            "requiredColumns": [
              "advisor_id",
              "total_deposited",
              "transaction_count",
              "deposit_rank"
            ],
            "orderMatters": true,
            "hint": "First join clients → accounts → transactions and group posted activity by advisor in a CTE. Then rank the deposit totals in the outer query.",
            "explain": "You combined filtering, table relationships, conditional totals, a CTE, ranking and deterministic sorting in one investigation."
          }
        ]
      }
    ]
  }
];

// ── Pure helpers (no DOM) ──────────────────────────────────────────────────
export function getUnit(unitId) {
  return LEARN_TRACK.find(u => u.id === unitId) || null;
}

export function getLesson(unitId, lessonId) {
  const unit = getUnit(unitId);
  return unit ? unit.lessons.find(l => l.id === lessonId) || null : null;
}
