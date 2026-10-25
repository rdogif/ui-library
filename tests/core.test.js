import test from 'node:test';
import assert from 'node:assert/strict';
import { frameAtProgress } from '../src/animations/hero-sequence.js';
import { components, defaults } from '../src/components/catalog.js';
import fs from 'node:fs';
test('scroll mapping clamps endpoints and reverses exactly',()=>{assert.equal(frameAtProgress(0),6);assert.equal(frameAtProgress(1),19);assert.equal(frameAtProgress(-1),6);assert.equal(frameAtProgress(2),19);const forward=Array.from({length:14},(_,i)=>frameAtProgress(i/13));assert.deepEqual(forward,Array.from({length:14},(_,i)=>i+6));assert.deepEqual([...forward].reverse(),Array.from({length:14},(_,i)=>frameAtProgress(1-i/13)))});
test('catalog has complete, bounded playground defaults',()=>{assert.equal(components.length,6);for(const c of components){assert.equal(typeof c.mount,'function');assert.ok(c.accessibility);for(const [key,,min,max] of c.controls){assert.ok(defaults(c)[key]>=min&&defaults(c)[key]<=max)}}});
test('all 19 source frames preserve original dimensions',()=>{for(let i=1;i<=19;i++){const data=fs.readFileSync(new URL(`../public/frames/frame_${String(i).padStart(3,'0')}.jpg`,import.meta.url));assert.ok(data.length>60000);assert.equal(data[0],255);assert.equal(data[1],216);let offset=2,dimensions=null;while(offset<data.length){if(data[offset]!==255){offset++;continue}const marker=data[offset+1];if([192,193,194].includes(marker)){dimensions=[data.readUInt16BE(offset+7),data.readUInt16BE(offset+5)];break}offset+=2+data.readUInt16BE(offset+2)}assert.deepEqual(dimensions,[1280,720])}});

