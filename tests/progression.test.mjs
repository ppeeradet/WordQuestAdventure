import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProgress,mergeProgress,completeMission,isBossMission} from '../dist/progression.js';
import {PETS} from '../dist/pets.js';
import {PRIMARY_VOCAB} from '../dist/primary-vocab.js';
import {expandQuestionBank,validateQuestionBank} from '../dist/question-bank.js';
import {OPENING_STORY,missionStory} from '../dist/stories.js';
import {readFileSync} from 'node:fs';
import {parse} from 'acorn';
import {runInNewContext} from 'node:vm';

test('same-name cloud progress keeps highest stage and both collections',()=>{
  const merged=mergeProgress({xp:360,stars:52,missionUnlocked:11,petIds:[1,2,99],completedMissions:[1,2,10],egg:40},{xp:300,stars:60,missionUnlocked:9,petIds:[1,3],completedMissions:[1,3],egg:80});
  assert.equal(merged.missionUnlocked,11);
  assert.equal(merged.xp,360);
  assert.equal(merged.stars,60);
  assert.deepEqual(merged.petIds,[1,2,3,99]);
  assert.deepEqual(merged.completedMissions,[1,2,3,10]);
});

test('100 distinct pets have image cells and individual details',()=>{
  assert.equal(PETS.length,100);
  assert.equal(new Set(PETS.map(p=>p.name)).size,100);
  for(const p of PETS){assert.ok(p.species&&p.trait&&p.story);assert.ok(p.cell>=0&&p.cell<25)}
});
test('primary-level question bank has valid six-mode options',()=>{
  const bank=expandQuestionBank([],PRIMARY_VOCAB);
  assert.equal(PRIMARY_VOCAB.length,108);
  assert.equal(bank.length,648);
  assert.deepEqual(validateQuestionBank(bank),[]);
  assert.deepEqual(new Set(bank.map(q=>q.mode)),new Set(['analysis','meaning','reverse','context','listening','spelling']));
});
test('complete gameplay bank has valid options and one-blank sentences',()=>{
  const source=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const ast=parse(source,{ecmaVersion:'latest',sourceType:'module'});
  const literal=name=>{
    const node=ast.body.find(part=>part.type==='VariableDeclaration'&&part.declarations[0]?.id.name===name)?.declarations[0].init;
    assert.ok(node,`missing ${name}`);
    return runInNewContext(source.slice(node.start,node.end));
  };
  const base=literal('WORDS'),vocab=literal('VOCAB');
  for(const row of PRIMARY_VOCAB)if(!vocab.some(existing=>existing[0]===row[0]))vocab.push(row);
  const bank=expandQuestionBank(base,vocab);
  assert.ok(bank.length>=900);
  assert.deepEqual(validateQuestionBank(bank),[]);
  assert.ok(bank.some(q=>q.mode==='analysis'&&q.ex==='It is important to be ____ and help others.'));
});
test('replay does not skip a mission and boss failure keeps next locked',()=>{
  let p=normalizeProgress({missionUnlocked:1,petIds:[1],completed:0});
  p=completeMission(p,1,8).progress;
  assert.equal(p.missionUnlocked,2);
  p=completeMission(p,1,9).progress;
  assert.equal(p.missionUnlocked,2);
  for(let n=2;n<10;n++)p=completeMission(p,n,8).progress;
  assert.equal(p.missionUnlocked,10);
  assert.equal(isBossMission(10),true);
  const fail=completeMission(p,10,6);
  assert.equal(fail.reward.passed,false);
  assert.equal(fail.progress.missionUnlocked,10);
  assert.equal(fail.progress.egg,p.egg);
  assert.equal(completeMission(p,10,7).progress.missionUnlocked,11);
});
test('all 100 missions unlock in sequence; egg hatches a real pet',()=>{
  let p=normalizeProgress({missionUnlocked:1,petIds:[1],completed:0});
  let hatched=0;
  for(let n=1;n<=100;n++){
    const result=completeMission(p,n,8,10,()=>0);
    p=result.progress;
    if(result.reward.hatchedPetId)hatched++;
    assert.equal(p.missionUnlocked,Math.min(100,n+1));
    assert.ok(result.reward.passed);
  }
  assert.equal(p.completedMissions.length,100);
  assert.equal(p.petIds.length,100);
  assert.ok(hatched>0);
  assert.equal(p.eggsHatched,20);
});
test('opening and all 100 stage stories have bilingual, stage-specific text',()=>{
  assert.ok(OPENING_STORY.en&&OPENING_STORY.th);
  const stories=Array.from({length:100},(_,i)=>missionStory(i+1,PETS[Math.min(99,i+1)].name));
  assert.equal(new Set(stories.map(story=>story.en)).size,100);
  assert.equal(new Set(stories.map(story=>story.th)).size,100);
  assert.equal(stories.filter(story=>story.boss).length,10);
  assert.ok(stories.every(story=>story.title&&story.en&&story.th&&story.topics.length));
  assert.ok(stories.every(story=>PRIMARY_VOCAB.some(word=>story.topics.includes(word[4]))));
  const bank=expandQuestionBank([],PRIMARY_VOCAB);
  for(const story of stories){
    const modes=new Set(bank.filter(question=>story.topics.includes(question.topic)).map(question=>question.mode));
    assert.equal(modes.size,6,`missing themed question mode for ${story.title}`);
  }
});
