import { seedData } from '../data/data.js';

let db = null;

export async function initEngine() {
  const SQL = await initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
  });
  db = new SQL.Database();
  createTables();
  seed();
}

export async function createSandboxDatabase() {
  const SQL = await initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
  });
  const sandboxDb = new SQL.Database();
  createTables(sandboxDb);
  seed(sandboxDb);
  return sandboxDb;
}

export function executeQuery(sql) {
  if (!db) throw new Error('Database not initialized.');
  return executeOnDatabase(db, sql);
}

export function executeSandboxQuery(sandboxDb, sql) {
  if (!sandboxDb) throw new Error('Sandbox database not initialized.');
  return executeOnDatabase(sandboxDb, sql);
}

function executeOnDatabase(targetDb, sql) {
  const beforeChanges = typeof targetDb.getRowsModified === 'function' ? targetDb.getRowsModified() : 0;
  const raw = targetDb.exec(sql);
  const afterChanges = typeof targetDb.getRowsModified === 'function' ? targetDb.getRowsModified() : beforeChanges;
  const rowsModified = Math.max(0, afterChanges - beforeChanges);
  if (!raw.length) return { columns: [], rows: [], rowsModified };
  return { columns: raw[0].columns, rows: raw[0].values, rowsModified };
}

export function isSafeQuery(sql) {
  const clean = sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .trim()
    .replace(/^;+/, '')
    .toLowerCase();

  if (!clean.startsWith('select') && !clean.startsWith('with')) return false;

  const blocked = ['insert','update','delete','drop','alter','create',
                   'replace','truncate','attach','detach','pragma','vacuum'];
  return !blocked.some(w => new RegExp('\\b' + w + '\\b', 'i').test(clean));
}

function insert(targetDb, table, columns, rows) {
  const ph = columns.map(() => '?').join(', ');
  const stmt = targetDb.prepare(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${ph})`);
  rows.forEach(row => stmt.run(row));
  stmt.free();
}

function createTables(targetDb = db) {
  targetDb.run(`
    CREATE TABLE clients (
      client_id INTEGER PRIMARY KEY, full_name TEXT, email TEXT,
      advisor_id INTEGER, kyc_status TEXT, province TEXT,
      risk_rating TEXT, onboarding_date TEXT
    );
    CREATE TABLE advisors (
      advisor_id INTEGER PRIMARY KEY, advisor_name TEXT, branch TEXT,
      region TEXT, license_type TEXT
    );
    CREATE TABLE accounts (
      account_id INTEGER PRIMARY KEY, client_id INTEGER, account_type TEXT,
      balance REAL, open_date TEXT, account_status TEXT, last_review_date TEXT
    );
    CREATE TABLE transactions (
      transaction_id INTEGER PRIMARY KEY, account_id INTEGER,
      transaction_date TEXT, amount REAL, transaction_type TEXT,
      debit_credit TEXT, transaction_status TEXT, description TEXT
    );
    CREATE TABLE journal_entries (
      journal_id INTEGER PRIMARY KEY, transaction_id INTEGER, entry_date TEXT,
      debit_amount REAL, credit_amount REAL, gl_account TEXT, created_by TEXT
    );
    CREATE TABLE compliance_reviews (
      review_id INTEGER PRIMARY KEY, account_id INTEGER, review_date TEXT,
      issue_type TEXT, severity TEXT, review_status TEXT, assigned_to TEXT
    );
    CREATE TABLE compliance_flags (
      flag_id INTEGER PRIMARY KEY, transaction_id INTEGER, flag_type TEXT,
      severity TEXT, reviewed INTEGER, created_date TEXT
    );
    CREATE TABLE regulatory_updates (
      update_id INTEGER PRIMARY KEY, regulator TEXT, topic TEXT,
      effective_date TEXT, impact_level TEXT, summary TEXT
    );
  `);
}

function seed(targetDb = db) {
  insert(targetDb, 'advisors',
    ['advisor_id','advisor_name','branch','region','license_type'],
    seedData.advisors);
  insert(targetDb, 'clients',
    ['client_id','full_name','email','advisor_id','kyc_status','province','risk_rating','onboarding_date'],
    seedData.clients);
  insert(targetDb, 'accounts',
    ['account_id','client_id','account_type','balance','open_date','account_status','last_review_date'],
    seedData.accounts);
  insert(targetDb, 'transactions',
    ['transaction_id','account_id','transaction_date','amount','transaction_type','debit_credit','transaction_status','description'],
    seedData.transactions);
  insert(targetDb, 'journal_entries',
    ['journal_id','transaction_id','entry_date','debit_amount','credit_amount','gl_account','created_by'],
    seedData.journalEntries);
  insert(targetDb, 'compliance_reviews',
    ['review_id','account_id','review_date','issue_type','severity','review_status','assigned_to'],
    seedData.complianceReviews);
  insert(targetDb, 'compliance_flags',
    ['flag_id','transaction_id','flag_type','severity','reviewed','created_date'],
    seedData.complianceFlags);
  insert(targetDb, 'regulatory_updates',
    ['update_id','regulator','topic','effective_date','impact_level','summary'],
    seedData.regulatoryUpdates);
}
