import test from 'node:test';
import assert from 'node:assert/strict';
import {rankPlayers} from '../dist/ranking.js';

test('Cloud leaderboard ranks unique names by highest XP and stars',()=>{
  const rows=rankPlayers([
    {displayName:'Harry',nameKey:'harry',xp:30,stars:4},
    {displayName:'Mimi',nameKey:'mimi',xp:50,stars:2},
    {displayName:'Harry',nameKey:'harry',xp:45,stars:5},
    {displayName:'Pip',nameKey:'pip',xp:50,stars:3},
    {displayName:'',nameKey:'blank',xp:1000,stars:1000}
  ]);
  assert.deepEqual(rows.map(row=>[row.displayName,row.xp]),[['Pip',50],['Mimi',50],['Harry',45]]);
  assert.equal(rows.filter(row=>row.nameKey==='harry').length,1);
});
