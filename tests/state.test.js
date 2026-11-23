import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMission,activateRelay,startTransmission,finishTransmission,resetMission,RELAY_IDS } from '../src/state.js';
test('un relais ne compte qu’une fois et les identifiants inconnus sont rejetés',()=>{
 const state=createMission();assert.equal(activateRelay(state,'bad'),false);
 assert.equal(activateRelay(state,RELAY_IDS[0]),true);assert.equal(activateRelay(state,RELAY_IDS[0]),false);assert.equal(state.active.size,1);
});
test('la transmission exige trois relais et ne démarre qu’une fois',()=>{
 const state=createMission();assert.equal(startTransmission(state),false);
 RELAY_IDS.forEach(id=>activateRelay(state,id));assert.equal(state.phase,'ready');
 assert.equal(startTransmission(state),true);assert.equal(startTransmission(state),false);
 assert.equal(finishTransmission(state),true);assert.equal(state.phase,'sent');assert.equal(finishTransmission(state),false);
});
test('recommencer pendant une transmission rend la mission rejouable',()=>{
 const state=createMission();RELAY_IDS.forEach(id=>activateRelay(state,id));startTransmission(state);
 resetMission(state);assert.equal(state.phase,'collecting');assert.equal(state.active.size,0);
 assert.equal(finishTransmission(state),false);RELAY_IDS.forEach(id=>activateRelay(state,id));assert.equal(startTransmission(state),true);
});
