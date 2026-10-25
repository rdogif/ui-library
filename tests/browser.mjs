import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const screenshots=process.env.SCREENSHOT_DIR||'test-results';await fs.mkdir(screenshots,{recursive:true});const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.setDefaultTimeout(10000);page.setDefaultNavigationTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL||'http://127.0.0.1:5173/ui-library/');
await page.waitForFunction(()=>document.querySelector('#sequence').dataset.frame==='27'&&document.querySelector('.hero').classList.contains('ready'));
assert.equal(await page.locator('#sequence').getAttribute('data-frame'),'27');
await page.waitForTimeout(800);
await page.screenshot({path:screenshots+'/rdoui-desktop.png',fullPage:false});
const travel=await page.locator('.sequence').evaluate(e=>e.offsetHeight-innerHeight);
await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),travel);
await page.waitForFunction(()=>document.querySelector('#sequence').dataset.frame==='98');
await page.evaluate(y=>scrollTo({top:y,behavior:'instant'}),travel/2);
await page.waitForFunction(()=>document.querySelector('#sequence').dataset.frame==='63');
await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
await page.waitForFunction(()=>document.querySelector('#sequence').dataset.frame==='27');
await page.evaluate(()=>scrollTo({top:document.querySelector('#collection').offsetTop-75,behavior:'instant'}));await page.waitForTimeout(200);
await page.screenshot({path:screenshots+'/rdoui-collection.png',fullPage:false});
console.log('scroll passed');await page.getByRole('button',{name:'Typography',exact:true}).click();assert.equal(await page.locator('.card').count(),1);
await page.getByRole('button',{name:/^All/}).click();assert.equal(await page.locator('.card').count(),6);
await page.getByRole('searchbox').fill('liquid');assert.equal(await page.locator('.card').count(),1);
console.log('search passed');await page.locator('.card-actions a').click();await page.waitForFunction(()=>document.querySelector('#detail').open);
await page.getByLabel('Magnetic strength',{exact:true}).fill('0.6');
await page.getByRole('tab',{name:'JavaScript'}).click();assert.match(await page.locator('#code-view').textContent(),/"strength": 0.6/);
await page.getByRole('tab',{name:'Preview',exact:true}).click();
const btn=page.locator('#detail-preview .liquid-button');const box=await btn.boundingBox();await page.mouse.move(box.x+box.width/2+50,box.y+box.height/2);await page.waitForTimeout(350);assert.notEqual(await btn.evaluate(e=>getComputedStyle(e).transform),'none');
console.log('magnet passed');await page.context().grantPermissions(['clipboard-read','clipboard-write']);await page.getByRole('button',{name:'Copy complete example'}).click();const copied=await page.evaluate(()=>navigator.clipboard.readText());assert.match(copied,/<!doctype html>/);
console.log('clipboard passed');const standalone=await browser.newPage();await standalone.setContent(copied);await standalone.waitForSelector('.liquid-button');assert.equal(await standalone.locator('.liquid-button').count(),1);await standalone.close();
console.log('next component');await page.getByRole('button',{name:'Close component'}).click();await page.getByRole('searchbox').fill('');console.log('search cleared',await page.locator('.card').count(),await page.getByRole('searchbox').inputValue(),await page.locator('.filters').innerText());
await page.locator('a[href="#/component/ascii-ripple"]').click();await page.getByLabel('Ripple strength',{exact:true}).fill('40');
const canvas=page.locator('#detail-preview canvas');const cb=await canvas.boundingBox();const before=await canvas.evaluate(e=>e.toDataURL());await page.mouse.move(cb.x+80,cb.y+100);await page.mouse.down();await page.mouse.move(cb.x+220,cb.y+160,{steps:10});await page.mouse.up();await page.waitForTimeout(100);assert.notEqual(await canvas.evaluate(e=>e.toDataURL()),before);
await page.getByRole('button',{name:'Copy complete example'}).click();const asciiCopy=await page.evaluate(()=>navigator.clipboard.readText());const asciiPage=await browser.newPage();await asciiPage.setContent(asciiCopy);await asciiPage.waitForSelector('canvas');await asciiPage.close();
console.log('next component');await page.getByRole('button',{name:'Close component'}).click();await page.locator('a[href="#/component/command-menu"]').click();const command=page.locator('#detail-preview [role=combobox]');await command.fill('source');assert.equal(await page.locator('#detail-preview [role=option]').count(),1);await command.press('Enter');assert.match(await page.locator('#detail-preview .command-footer').textContent(),/View source/);
console.log('next component');await page.getByRole('button',{name:'Close component'}).click();await page.locator('a[href="#/component/morphing-toggle"]').click();const toggle=page.locator('#detail-preview [role=switch]');await toggle.focus();await page.keyboard.press('Space');assert.equal(await toggle.getAttribute('aria-checked'),'true');
await page.setViewportSize({width:390,height:844});console.log('next component');await page.getByRole('button',{name:'Close component'}).click();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(400);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#toast').evaluate(e=>e.classList.remove('show'));await page.screenshot({path:screenshots+'/rdoui-mobile.png'});
await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.waitForFunction(()=>document.querySelector('.hero').classList.contains('ready'));assert.equal(await page.locator('#sequence').getAttribute('data-frame'),'27');
await page.locator('a[href="#/component/ascii-ripple"]').click();await page.getByRole('tab',{name:'JavaScript'}).click();assert.match(await page.locator('#code-view').textContent(),/const mount/);await page.reload();await page.waitForFunction(()=>document.querySelector('#detail').open);
assert.deepEqual(errors,[]);console.log('PASS: autoplay, exact frame 27, forward/reverse scroll, filters, search, live code, standalone exports, ripple, magnet, command keyboard, toggle, mobile overflow, reduced motion, direct-route reload.');
await browser.close();




