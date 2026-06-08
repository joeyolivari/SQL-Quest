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
    id: 'foundations',
    title: 'Foundations',
    subtitle: 'Start from zero: tables, SELECT, filtering, and sorting.',
    icon: '🌱',
    graduatesTo: 1, // Mission 1 — the first real case once the unit is done.
    lessons: [
      // ── Lesson 1 ──────────────────────────────────────────────────────────
      {
        id: 'foundations-01',
        title: 'What is a database?',
        concepts: ['SELECT'],
        steps: [
          {
            type: 'concept',
            title: 'A table is a grid',
            body: 'A database is just a set of tables. Each table is a grid: every row is one record, and every column is one fact about that record.',
            eli12: 'A table is a spreadsheet. In the clients table, each ROW is one client and each COLUMN is one fact about them (their name, their email, and so on).',
            example: 'clients\n──────────────────────────────────\nclient_id │ full_name   │ kyc_status\n    1     │ Sarah Chen  │ complete\n    3     │ Priya Patel │ pending'
          },
          {
            type: 'choice',
            prompt: 'In the clients table above, what is ONE ROW?',
            choices: ['One client', 'One column of data', 'The whole database', 'A SQL keyword'],
            answerIndex: 0,
            explain: 'Each row is a single record. Here, one row = one client.'
          },
          {
            type: 'choice',
            prompt: 'Which word do we use to ASK a database for data?',
            choices: ['OPEN', 'SELECT', 'SHOW', 'FETCH'],
            answerIndex: 1,
            explain: 'SELECT is how every read query starts — it chooses which columns come back.'
          }
        ]
      },

      // ── Lesson 2 ──────────────────────────────────────────────────────────
      {
        id: 'foundations-02',
        title: 'SELECT specific columns',
        concepts: ['SELECT'],
        steps: [
          {
            type: 'concept',
            title: 'SELECT picks columns, FROM picks the table',
            body: 'You list the columns you want after SELECT, separated by commas. Then FROM says which table to read them from.',
            eli12: 'Your locker holds books, gym clothes, and snacks. SELECT is grabbing only the books you want — you name exactly what to take.',
            example: 'SELECT full_name, kyc_status\nFROM clients;'
          },
          {
            type: 'fill',
            prompt: 'Complete the query to return full_name and email from the clients table.',
            template: 'SELECT {{0}}, {{1}}\nFROM {{2}};',
            blanks: [{ accept: ['full_name'] }, { accept: ['email'] }, { accept: ['clients'] }],
            hint: 'Name each column after SELECT, then the table name after FROM.',
            explain: 'SELECT full_name, email FROM clients; — columns first, table second.'
          },
          {
            type: 'query',
            prompt: 'Now write it yourself: return client_id and full_name for every client.',
            starterSQL: 'SELECT \nFROM clients;',
            solutionSQL: 'SELECT client_id, full_name FROM clients;',
            requiredColumns: ['client_id', 'full_name'],
            orderMatters: false,
            hint: 'Two column names after SELECT, separated by a comma, then FROM clients.',
            explain: 'Listing columns by name is the most common form of SELECT.'
          }
        ]
      },

      // ── Lesson 3 ──────────────────────────────────────────────────────────
      {
        id: 'foundations-03',
        title: 'SELECT * (every column)',
        concepts: ['SELECT'],
        steps: [
          {
            type: 'concept',
            title: 'The * shortcut',
            body: 'If you want every column, you do not have to type them all. The star * means "all columns".',
            eli12: 'Instead of listing every single thing in your locker, * is just saying "give me everything".',
            example: 'SELECT *\nFROM accounts;'
          },
          {
            type: 'choice',
            prompt: 'What does SELECT * return?',
            choices: ['Only the first column', 'All columns', 'No columns', 'A random column'],
            answerIndex: 1,
            explain: '* is shorthand for every column in the table.'
          },
          {
            type: 'fill',
            prompt: 'Return every column from the accounts table.',
            template: 'SELECT {{0}}\nFROM {{1}};',
            blanks: [{ accept: ['*'] }, { accept: ['accounts'] }],
            hint: 'One symbol means "all columns".',
            explain: 'SELECT * FROM accounts; gives you the whole table.'
          }
        ]
      },

      // ── Lesson 4 ──────────────────────────────────────────────────────────
      {
        id: 'foundations-04',
        title: 'WHERE — keep only some rows',
        concepts: ['WHERE'],
        steps: [
          {
            type: 'concept',
            title: 'WHERE filters rows',
            body: 'WHERE keeps only the rows that match a condition. Text values go inside single quotes. Numbers do not.',
            eli12: 'A lunch-table rule: "only people in a red shirt may sit here." Everyone who fails the rule is turned away before you even look.',
            example: "SELECT full_name, kyc_status\nFROM clients\nWHERE kyc_status = 'pending';"
          },
          {
            type: 'choice',
            prompt: "How do you write a TEXT value like pending in a WHERE condition?",
            choices: ["In single quotes: 'pending'", 'In all caps: PENDING', 'With no quotes: pending', 'In brackets: [pending]'],
            answerIndex: 0,
            explain: "Text/strings always go in single quotes. So: WHERE kyc_status = 'pending'."
          },
          {
            type: 'query',
            prompt: "Return client_id and full_name for clients whose risk_rating is 'High'.",
            starterSQL: "SELECT client_id, full_name\nFROM clients\nWHERE ",
            solutionSQL: "SELECT client_id, full_name FROM clients WHERE risk_rating = 'High';",
            requiredColumns: ['client_id', 'full_name'],
            orderMatters: false,
            hint: "Add: WHERE risk_rating = 'High' — remember the single quotes around High.",
            explain: 'WHERE filters rows down to only the ones that match your condition.'
          }
        ]
      },

      // ── Lesson 5 ──────────────────────────────────────────────────────────
      {
        id: 'foundations-05',
        title: 'WHERE with numbers',
        concepts: ['WHERE'],
        steps: [
          {
            type: 'concept',
            title: 'Compare numbers with > < =',
            body: 'For number columns you can use comparisons: greater than (>), less than (<), equals (=), and so on. No quotes around numbers.',
            eli12: 'Like a height sign at a theme park: "you must be taller than 120 cm to ride." WHERE balance > 100000 keeps only the big accounts.',
            example: 'SELECT account_id, balance\nFROM accounts\nWHERE balance > 100000;'
          },
          {
            type: 'fill',
            prompt: 'Keep only accounts with a balance greater than 50000.',
            template: 'SELECT account_id, balance\nFROM accounts\nWHERE balance {{0}} 50000;',
            blanks: [{ accept: ['>'] }],
            hint: 'The symbol for "greater than".',
            explain: 'WHERE balance > 50000 — numbers need no quotes.'
          },
          {
            type: 'query',
            prompt: 'Return account_id and account_type for accounts with a balance of at least 100000 (100000 or more).',
            starterSQL: 'SELECT account_id, account_type\nFROM accounts\nWHERE ',
            solutionSQL: 'SELECT account_id, account_type FROM accounts WHERE balance >= 100000;',
            requiredColumns: ['account_id', 'account_type'],
            orderMatters: false,
            hint: '"At least" means greater-than-or-equal: WHERE balance >= 100000.',
            explain: '>= means "greater than or equal to", so 100000 itself is included.'
          }
        ]
      },

      // ── Lesson 6 ──────────────────────────────────────────────────────────
      {
        id: 'foundations-06',
        title: 'ORDER BY — sort the result',
        concepts: ['ORDER BY'],
        steps: [
          {
            type: 'concept',
            title: 'Sort with ORDER BY',
            body: 'ORDER BY sorts your rows by a column. Add ASC for smallest-first (the default) or DESC for largest-first.',
            eli12: 'Lining classmates up by height: shortest-to-tallest is ASC, tallest-to-shortest is DESC.',
            example: 'SELECT account_id, balance\nFROM accounts\nORDER BY balance DESC;'
          },
          {
            type: 'fill',
            prompt: 'Sort accounts by balance, HIGHEST first.',
            template: 'SELECT account_id, balance\nFROM accounts\nORDER BY balance {{0}};',
            blanks: [{ accept: ['DESC', 'descending'] }],
            hint: 'The keyword for largest-first (descending).',
            explain: 'DESC = descending = highest value first.'
          },
          {
            type: 'query',
            prompt: 'Return client_id and full_name from clients, sorted by full_name from A to Z.',
            starterSQL: 'SELECT client_id, full_name\nFROM clients\n',
            solutionSQL: 'SELECT client_id, full_name FROM clients ORDER BY full_name ASC;',
            requiredColumns: ['client_id', 'full_name'],
            orderMatters: true,
            hint: 'ORDER BY full_name (ASC is the default, A to Z).',
            explain: 'A-to-Z is ascending order — ORDER BY full_name, optionally with ASC.'
          }
        ]
      },

      // ── Lesson 7 ──────────────────────────────────────────────────────────
      {
        id: 'foundations-07',
        title: 'LIMIT — just the top rows',
        concepts: ['ORDER BY'],
        steps: [
          {
            type: 'concept',
            title: 'Cap the rows with LIMIT',
            body: 'LIMIT caps how many rows come back. Combined with ORDER BY, it gives you a "top N" list.',
            eli12: 'A leaderboard only shows the top 5 scores. ORDER BY ranks everyone; LIMIT 5 keeps just the top of the list.',
            example: 'SELECT account_id, balance\nFROM accounts\nORDER BY balance DESC\nLIMIT 5;'
          },
          {
            type: 'query',
            prompt: 'Return the 5 accounts with the HIGHEST balance. Show account_id and balance.',
            starterSQL: 'SELECT account_id, balance\nFROM accounts\n',
            solutionSQL: 'SELECT account_id, balance FROM accounts ORDER BY balance DESC LIMIT 5;',
            requiredColumns: ['account_id', 'balance'],
            orderMatters: true,
            hint: 'Sort with ORDER BY balance DESC, then add LIMIT 5.',
            explain: 'ORDER BY ranks the rows; LIMIT 5 keeps only the top five. You just built a leaderboard!'
          },
          {
            type: 'concept',
            title: 'You did it! 🎉',
            body: 'You can now SELECT columns, filter rows with WHERE, sort with ORDER BY, and trim with LIMIT — the backbone of almost every query. Next stop: your first real case, Mission 1.',
            eli12: 'These four moves — pick, filter, sort, limit — show up in nearly every query a pro writes. You have the foundation now.'
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
