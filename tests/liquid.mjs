import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:1000}});
await p.goto(process.env.TEST_URL||'http://127.0.0.1:5173/ui-library/');
assert.equal(await p.locator('#frame-counter').count(),0);
await p.locator('a[href="#/component/liquid-magnet"]').click();
const button=p.locator('#detail-preview .liquid-button');await button.waitFor();
const r=await button.boundingBox();await p.mouse.move(r.x+r.width/2+95,r.y+r.height/2+30);await p.waitForTimeout(700);
const moved=await button.boundingBox();assert.ok(moved.x-r.x>75);assert.ok(Math.abs(moved.y-r.y-28.5)<4);
await p.mouse.move(2,2);await p.waitForTimeout(1000);const home=await button.boundingBox();assert.ok(Math.abs(home.x-r.x)<2);
await p.getByRole('button',{name:'Close component'}).click();await p.locator('a[href="#/component/command-menu"]').click();
const input=p.locator('#detail-preview [role=combobox]');await input.waitFor();await input.focus();await input.press('ArrowDown');await p.waitForTimeout(500);
const transform=await p.locator('#detail-preview .command-selection').evaluate(e=>getComputedStyle(e).transform);
console.log(transform,await p.locator('#detail-preview [role=option][aria-selected=true]').textContent());assert.ok(Math.abs(Number(transform.split(',')[5].replace(')',''))-45)<1);
console.log('PASS: counter removed, cursor attachment follows 95px motion, release springs home, liquid selection follows keyboard.');await b.close();

