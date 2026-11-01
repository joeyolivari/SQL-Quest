// Run: node tests/research-learning.mjs (Node 24+).
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import { LEARN_TRACK } from '../js/data/lessons.js';
import { seedData } from '../js/data/data.js';
import { schema } from '../js/data/schema.js';
import { compareResults } from '../js/core/validation.js';
const db = new DatabaseSync(':memory:');
const names={journalEntries:'journal_entries',complianceReviews:'compliance_reviews',complianceFlags:'compliance_flags',regulatoryUpdates:'regulatory_updates'};
for(const [key,rows] of Object.entries(seedData)) {
 const table=names[key]||key,cols=schema[table];
 db.exec(`CREATE TABLE ${table} (${cols.map(([n,t])=>n+' '+t.split(' ')[0]).join(',')})`);
 const stmt=db.prepare(`INSERT INTO ${table} VALUES (${cols.map(()=>'?').join(',')})`);rows.forEach(row=>stmt.run(...row));
}
function query(db,sql) {const stmt=db.prepare(sql),columns=stmt.columns().map(c=>c.name);return {columns,rows:stmt.all().map(row=>columns.map(c=>row[c]))};}
let predictions=0,repairs=0,reviews=0;
const all=LEARN_TRACK.flatMap(u=>u.lessons);
for(const lesson of all) {
 for(const step of lesson.steps) {
  assert(step.phase,lesson.id);
  if(step.sample) {
   const tiny=new DatabaseSync(':memory:');const {name,columns,rows}=step.sample;
   for (const sample of [step.sample, ...(step.relatedSamples || [])]) {
   const {name,columns,rows}=sample;
   tiny.exec(`CREATE TABLE ${name} (${columns.map((c,i)=>c+' '+(rows.some(r=>typeof r[i]==='number')?'REAL':'TEXT')).join(',')})`);
   const insert=tiny.prepare(`INSERT INTO ${name} VALUES (${columns.map(()=>'?').join(',')})`);rows.forEach(row=>insert.run(...row));
   }
   assert.deepEqual(query(tiny,step.example).rows,step.predictionRows,lesson.id);
   assert(step.answerIndex>=0&&step.answerIndex<step.choices.length,lesson.id);predictions++;tiny.close();
  }
  if(step.phase==='Repair') {
   const expected=query(db,step.solutionSQL);let broken=false;
   try {broken=!compareResults(query(db,step.starterSQL),expected,step.requiredColumns,step.orderMatters).ok;} catch {broken=true;}
   assert(broken,'Repair starter accidentally passes: '+lesson.id);repairs++;
  }
 }
 if(lesson.review) {
  assert(!lesson.steps.some(step=>step.solutionSQL===lesson.review.solutionSQL),'Review should change the task: '+lesson.id);
  const r=query(db,lesson.review.solutionSQL);
  assert(r.rows.length>0,lesson.id);assert(compareResults(r,r,lesson.review.requiredColumns,lesson.review.orderMatters).ok,lesson.id);reviews++;
 }
}
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const review=await import('../js/learning/learnReview.js');
const DAY=86400000,now=Date.UTC(2026,0,1);
const eligible=LEARN_TRACK.slice(0,3).map(u=>u.lessons.find(l=>l.steps.some(s=>s.type==='query')));
const completed=new Set(eligible.map(l=>l.id));const isComplete=id=>completed.has(id);
assert.equal(review.getDueLearnReviews(LEARN_TRACK,()=>false,now).length,0);
for(const lesson of eligible)review.scheduleLearnReview(lesson.id,now);
assert.equal(review.getDueLearnReviews(LEARN_TRACK,isComplete,now).length,0);
const due=review.getDueLearnReviews(LEARN_TRACK,isComplete,now+DAY);
assert.equal(due.length,3);assert.equal(new Set(due.map(i=>i.unitId)).size,3);
assert(due.every(i=>i.question.starterSQL===''));
const id=eligible[0].id;
let result=review.recordLearnReview(id,{correct:true},now+DAY);
assert.equal(result.dueAt,now+4*DAY);assert.equal(result.independent,1);
result=review.recordLearnReview(id,{correct:true,assisted:true},now+4*DAY);
assert.equal(result.stage,0);assert.equal(result.dueAt,now+5*DAY);assert.equal(result.independent,1);
result=review.recordLearnReview(id,{correct:false},now+5*DAY);
assert.equal(result.dueAt,now+5*DAY+600000);assert.equal(result.lastOutcome,'supported');
// Rescheduling a completed lesson must not postpone an already due review.
const before=storage.get('csq_learn_review_v1');review.scheduleLearnReview(id,now+100*DAY);assert.equal(storage.get('csq_learn_review_v1'),before);
const reloaded=await import('../js/learning/learnReview.js?reload');assert(reloaded.getDueLearnReviews(LEARN_TRACK,isComplete,now+6*DAY).some(i=>i.lesson.id===id));
review.markLearnReviewSupported(id,now+6*DAY);
const afterExit=await import('../js/learning/learnReview.js?after-exit');
const resumed=afterExit.recordLearnReview(id,{correct:true},now+6*DAY);
assert.equal(resumed.lastOutcome,'supported');assert.equal(resumed.stage,0);
assert.equal(storage.size,1,'Review must not alter course progress or mission/mastery storage.');
// Damaged storage or unavailable storage must not crash optional review.
storage.set('csq_learn_review_v1','{"bad":{"stage":-1,"dueAt":0}}');const damaged=await import('../js/learning/learnReview.js?damaged');assert.equal(damaged.getDueLearnReviews(LEARN_TRACK,()=>false,now).length,0);
globalThis.localStorage={getItem(){throw Error('unavailable');},setItem(){throw Error('unavailable');}};
const unavailable=await import('../js/learning/learnReview.js?unavailable');unavailable.scheduleLearnReview(id,now);unavailable.recordLearnReview(id,{correct:true},now+DAY);
const sw=fs.readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
for(const asset of ['js/data/lessonExpansion.js','js/learning/learnReview.js'])assert(sw.includes(asset));
assert.equal(all.length,new Set(all.map(l=>l.id)).size);
console.log(`Passed: ${all.length} lessons, ${predictions} tiny-table predictions, ${repairs} genuine broken queries, ${reviews} review solutions, delayed/assisted review, mixed-unit selection, persistence and cache coverage.`);
