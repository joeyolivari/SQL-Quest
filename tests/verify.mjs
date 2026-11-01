// Run: node tests/verify.mjs
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { seedData } from '../js/data/data.js';
import { LEARN_TRACK } from '../js/data/lessons.js';
import { missions } from '../js/data/missions.js';
import { schema } from '../js/data/schema.js';
import { isSafeQuery } from '../js/core/sqlEngine.js';
import { compareResults } from '../js/core/validation.js';
import * as progress from '../js/learning/learnProgress.js';
const db = new DatabaseSync(':memory:');
const names = {journalEntries:'journal_entries',complianceReviews:'compliance_reviews',complianceFlags:'compliance_flags',regulatoryUpdates:'regulatory_updates'};
for (const [key,rows] of Object.entries(seedData)) {
  const table=names[key]||key;const cols=schema[table];
  db.exec(`CREATE TABLE ${table} (${cols.map(([name,type])=>name+' '+type.split(' ')[0]).join(',')})`);
  const stmt=db.prepare(`INSERT INTO ${table} VALUES (${cols.map(()=>'?').join(',')})`);
  for (const row of rows) stmt.run(...row);
}
function query(sql) {const stmt=db.prepare(sql);const columns=stmt.columns().map(c=>c.name);return {columns,rows:stmt.all().map(r=>columns.map(c=>r[c]))};}
assert.equal(seedData.clients.length,200);assert.equal(seedData.accounts.length,350);assert.equal(seedData.transactions.length,5000);
for (const [child,fk,parent,pk] of [['clients','advisor_id','advisors','advisor_id'],['accounts','client_id','clients','client_id'],['transactions','account_id','accounts','account_id'],['compliance_reviews','account_id','accounts','account_id'],['compliance_flags','transaction_id','transactions','transaction_id'],['journal_entries','transaction_id','transactions','transaction_id']]) assert.equal(query(`SELECT * FROM ${child} c LEFT JOIN ${parent} p ON c.${fk}=p.${pk} WHERE p.${pk} IS NULL`).rows.length,0);
const ids=new Set();let queries=0;
for(const lesson of LEARN_TRACK.flatMap(u=>u.lessons)) {
 assert(!ids.has(lesson.id));ids.add(lesson.id);
 for(const step of lesson.steps) {
  if(step.type==='query') {assert(isSafeQuery(step.solutionSQL),lesson.id);const r=query(step.solutionSQL);assert(r.rows.length>0,lesson.id);assert(compareResults(r,r,step.requiredColumns,step.orderMatters).ok,lesson.id);queries++;}
  if(step.type==='fill') {const filled=step.template.replace(/\{\{(\d+)\}\}/g,(_,i)=>step.blanks[i].accept[0]);query(filled);}
 }
}
for(const mission of missions) {assert(isSafeQuery(mission.solutionSQL),'mission '+mission.id);const r=query(mission.solutionSQL);assert(r.rows.length>0,'mission '+mission.id);assert(compareResults(r,r,mission.requiredColumns,mission.orderMatters).ok,'mission '+mission.id);}
// Reference report must agree with independent counts, despite join fanout.
for(const row of query(missions.find(m=>m.id===30).solutionSQL).rows) {
 const [advisor,,total,high,open]=row;
 assert.equal(total,query(`SELECT COUNT(*) n FROM clients WHERE advisor_id=${advisor}`).rows[0][0]);
 assert.equal(high,query(`SELECT COUNT(*) n FROM clients WHERE advisor_id=${advisor} AND risk_rating='High'`).rows[0][0]);
 assert.equal(open,query(`SELECT COUNT(*) n FROM compliance_reviews r JOIN accounts a USING(account_id) JOIN clients c USING(client_id) WHERE c.advisor_id=${advisor} AND review_status='Open'`).rows[0][0]);
}
assert(query('SELECT * FROM accounts WHERE balance IS NULL').rows.length>0);
assert(query("SELECT * FROM clients WHERE LENGTH(province)>2").rows.length>0);
assert(query("SELECT * FROM compliance_flags WHERE created_date < '2026-01-01'").rows.length>0);
assert(query('SELECT * FROM accounts WHERE balance = 100000').rows.length>0);
const map=new Map();globalThis.localStorage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
progress.clearLearnProgress(); const lesson=LEARN_TRACK[0].lessons[0];
progress.markStepResult(lesson.id,1,'wrong');progress.completeLesson(lesson.id);assert(!progress.isLessonPassed(lesson));
for(let i=0;i<lesson.steps.length;i++) if(lesson.steps[i].type!=='concept')progress.markStepResult(lesson.id,i,'correct');
assert(progress.isLessonPassed(lesson));progress.setPosition('foundations',lesson.id,2);assert.equal(progress.getPosition().stepIndex,2);progress.clearPosition();assert.equal(progress.getPosition(),null);
const r=query('SELECT account_id, balance FROM accounts LIMIT 2');assert(!compareResults({...r,rows:[...r.rows].reverse()},r,r.columns,true).ok);assert(compareResults({...r,rows:[...r.rows].reverse()},r,r.columns,false).ok);
console.log(`Passed: ${queries} tutorial solutions, ${missions.length} missions, fill exercises, dataset coverage, relationships, report counts, grading and progress.`);
