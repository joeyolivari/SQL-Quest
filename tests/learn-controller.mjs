// Controller integration harness with DOM/editor adapters, NOT a browser test.
// Run: node tests/learn-controller.mjs (Node 24+).
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { LEARN_TRACK } from '../js/data/lessons.js';
import { seedData } from '../js/data/data.js';
import { schema } from '../js/data/schema.js';
const db=new DatabaseSync(':memory:');
const names={journalEntries:'journal_entries',complianceReviews:'compliance_reviews',complianceFlags:'compliance_flags',regulatoryUpdates:'regulatory_updates'};
for(const [key,rows] of Object.entries(seedData)) {
 const table=names[key]||key,cols=schema[table];db.exec(`CREATE TABLE ${table} (${cols.map(([n,t])=>n+' '+t.split(' ')[0]).join(',')})`);
 const stmt=db.prepare(`INSERT INTO ${table} VALUES (${cols.map(()=>'?').join(',')})`);rows.forEach(row=>stmt.run(...row));
}
globalThis.__testQuery=sql=>{const stmt=db.prepare(sql),columns=stmt.columns().map(c=>c.name);return {columns,rows:stmt.all().map(row=>columns.map(c=>row[c]))};};
registerHooks({load(url,context,next){
 if(url.endsWith('/js/core/editor.js'))return {format:'module',shortCircuit:true,source:'export function createSqlHighlighter(){ let value=""; return globalThis.__testEditor={setValue(v){value=v;},getValue(){return value;},focus(){}}; }'};
 if(url.endsWith('/js/core/sqlEngine.js'))return {format:'module',shortCircuit:true,source:'export const executeQuery=globalThis.__testQuery; export const isSafeQuery=sql=>/^(select|with)\\b/i.test(sql.trim());'};
 return next(url,context);
}});
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
const nodes=new Map(),handlers=new Map();
class Element {
 constructor(id=''){this.id=id;this.style={};this.hidden=false;this.disabled=false;this.children=[];this.choices=[];this.dataset={};const classes=new Set();this.classList={add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c)};}
 set innerHTML(value){this.html=value;this.children=[];
  if(this.id==='learnStepHost') {
   this.choices=[...value.matchAll(/data-choice-index="(\d+)"/g)].map(m=>{const c=new Element();c.dataset.choiceIndex=m[1];return c;});
   if(value.includes('id="learnQueryInput"')){nodes.set('learnQueryInput',new Element('learnQueryInput'));nodes.set('learnQueryResult',new Element('learnQueryResult'));}
  }
 }
 get innerHTML(){return this.html||'';}
 appendChild(c){this.children.push(c);}
 querySelectorAll(){return this.choices;}
 querySelector(){return this.choices.find(c=>c.classList.contains('is-selected'));}
}
for(const id of ['homeScreen','learnScreen','learnMapView','learnPlayerView','learnHero','learnUnits','learnLessonTitle','learnProgressFill','learnStepPhase','learnProgressLabel','btnLearnCheck','btnLearnContinue','btnLearnHint','learnStepHost','learnFeedback'])nodes.set(id,new Element(id));
globalThis.document={getElementById:id=>nodes.get(id),querySelector:()=>new Element(),createElement:()=>new Element(),addEventListener:(type,fn)=>{if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(fn);}};
globalThis.window={scrollTo(){}};
function click(selector,element={}){for(const fn of handlers.get('click')||[])fn({target:{closest:requested=>requested===selector?element:null}});}
function type(sql){globalThis.__testEditor.setValue(sql);for(const fn of handlers.get('input')||[])fn({target:{id:'learnQueryInput',value:sql}});}
const progress=await import('../js/learning/learnProgress.js');
const review=await import('../js/learning/learnReview.js');
const learn=await import('../js/features/learn.js');
learn.initLearnTrack();learn.openLearnTrack();assert(nodes.get('learnUnits').innerHTML.includes('Recall desk'));
for(const id of ['foundations-01','foundations-02','foundations-03'])progress.completeLesson(id);
const source=LEARN_TRACK[0].lessons.find(l=>l.id==='foundations-grain');
progress.setPosition('foundations',source.id,2);progress.saveDraft(source.id,2,'SELECT account_id FROM accounts;');
learn.openLearnTrack();assert.equal(nodes.get('learnStepPhase').textContent,'Repair');assert.equal(__testEditor.getValue(),'SELECT account_id FROM accounts;');
type('SELECT account_id, client_id FROM accounts;');const position={...progress.getPosition()};const draft=progress.getDraft(source.id,2);
click('#btnLearnExitLesson');click('[data-learn-review]');assert.equal(nodes.get('learnStepPhase').textContent,'Retrieve');assert.equal(__testEditor.getValue(),'');
click('#btnLearnHint');assert(nodes.get('learnFeedback').innerHTML.includes('Hint 1/'));
click('#btnLearnHint');assert(nodes.get('learnFeedback').innerHTML.includes('Hint 2/'));
// Exit and resume: hint use must still prevent independent-retrieval credit.
click('#btnLearnExitLesson');click('[data-learn-review]');
const due=review.getDueLearnReviews(LEARN_TRACK,progress.isLessonComplete)[0];type(due.question.solutionSQL);click('#btnLearnCheck');
assert(nodes.get('btnLearnCheck').hidden);assert(!nodes.get('btnLearnContinue').hidden);assert(nodes.get('learnFeedback').children.length>0);
click('#btnLearnContinue');assert.deepEqual(progress.getPosition(),position);assert.equal(progress.getDraft(source.id,2),draft);
const reviewed=JSON.parse(storage.get('csq_learn_review_v1'))[due.lesson.id];assert.equal(reviewed.lastOutcome,'supported');assert.equal(reviewed.independent,0);
learn.openLearnTrack();assert.equal(__testEditor.getValue(),draft);
// Exercise prediction, corrective feedback, repair, transfer and course completion.
progress.setPosition('foundations',source.id,1);learn.openLearnTrack();
assert.equal(nodes.get('learnStepPhase').textContent,'Predict');assert(nodes.get('learnStepHost').innerHTML.includes('Small example: accounts'));
const prediction=source.steps[1],choices=nodes.get('learnStepHost').choices;
click('#learnScreen .learn-choice:not([disabled])',choices[(prediction.answerIndex+1)%choices.length]);click('#btnLearnCheck');assert(nodes.get('btnLearnContinue').hidden);assert(nodes.get('learnFeedback').innerHTML.includes('Try again'));
click('#learnScreen .learn-choice:not([disabled])',choices[prediction.answerIndex]);click('#btnLearnCheck');click('#btnLearnContinue');
assert.equal(nodes.get('learnStepPhase').textContent,'Repair');type(source.steps[2].solutionSQL);click('#btnLearnCheck');click('#btnLearnContinue');
assert.equal(nodes.get('learnStepPhase').textContent,'Apply');assert.equal(__testEditor.getValue(),'');type(source.steps[3].solutionSQL);click('#btnLearnCheck');click('#btnLearnContinue');
assert(progress.isLessonComplete(source.id));assert.equal(progress.getPosition(),null);assert.equal(progress.getDraft(source.id,2),undefined);
assert(JSON.parse(storage.get('csq_learn_review_v1'))[source.id].dueAt>Date.now());
console.log('Passed: controller prediction/retry, staged hints, repair/transfer, course completion, supported-review resume, source draft/position isolation and next-review scheduling (DOM/editor adapters).');
