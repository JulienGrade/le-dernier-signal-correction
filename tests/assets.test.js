import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('le GLB expose les relais, les coeurs et le pivot attendus',()=>{
 const bytes=readFileSync(new URL('../assets/outpost.glb',import.meta.url));
 assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(bytes.readUInt32LE(4),2);
 const jsonLength=bytes.readUInt32LE(12);const gltf=JSON.parse(bytes.toString('utf8',20,20+jsonLength));
 const names=new Set(gltf.nodes.map(node=>node.name));
 for(const name of ['Relay_01','Relay_02','Relay_03','Relay_01_Core','Relay_02_Core','Relay_03_Core','Pivot_Antenna'])assert.ok(names.has(name),name);
 assert.ok(gltf.meshes.length>0);
});
