import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { PETS } from '../dist/pets.js';

const asset=name=>join(import.meta.dirname,'..','dist','assets','pet-cutouts',name);

test('every pet has its own PNG cutout',()=>{
  assert.equal(PETS.length,100);
  for(const pet of PETS){
    const filename=`${String(pet.id).padStart(3,'0')}-${pet.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}.png`;
    const bytes=readFileSync(asset(filename));
    assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',filename);
  }
});

test('mascot and game-item PNGs are present',()=>{
  for(const name of ['main-maple-explorer','item-rescue-egg','item-golden-star','item-explorer-compass','item-adventure-map','item-healing-potion','item-magic-herb','item-echo-crystal','item-pet-food']){
    assert.ok(existsSync(asset(`${name}.png`)),name);
  }
});
