import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {OPENING_STORY,missionStory} from '../dist/stories.js';
import {PETS} from '../dist/pets.js';

test('Thai narration exists for the introduction and all 100 stages',()=>{
  const stories=[OPENING_STORY,...Array.from({length:100},(_,i)=>missionStory(i+1,PETS[Math.min(99,i+1)].name))];
  for(const story of stories){
    const path=new URL(`../dist/assets/story-th/${story.audioId}.mp3`,import.meta.url);
    assert.ok(statSync(path).size>2000,`Missing audio: ${story.audioId}`);
    const header=readFileSync(path).subarray(0,3);
    assert.ok(header.toString('ascii')==='ID3'||(header[0]===0xff&&(header[1]&0xe0)===0xe0),`Invalid MP3: ${story.audioId}`);
  }
});
