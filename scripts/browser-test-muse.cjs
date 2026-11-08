const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const target=process.argv[2]||'file://'+path.resolve(__dirname,'../muse.html');
(async()=>{for(const [engine,type] of [['Chrome',chromium]]){
const browser=await type.launch({headless:true,channel:'chrome'});
try{for(const width of [1440,390,320]){
const context=await browser.newContext({viewport:{width,height:1000}});const page=await context.newPage();const requests=[],errors=[];
page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{window.__outbound=[];for(const n of ['fetch','XMLHttpRequest','WebSocket','EventSource']){if(n in window)window[n]=function(){window.__outbound.push(n);throw Error('Unexpected network API')}};navigator.sendBeacon=()=>{window.__outbound.push('sendBeacon');return false};window.__copied='';Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text}}})});
await page.goto(target,{waitUntil:'networkidle'});const initial=requests.length;await context.setOffline(true);
assert.equal(await page.locator('#api-key').inputValue(),'');
await page.locator('#api-key').fill('fka_SYNTHETIC_é漢🙂');await page.locator('#generate').click();const expected='Basic '+Buffer.from('fka_SYNTHETIC_é漢🙂:').toString('base64');assert.equal(await page.locator('#header-value').inputValue(),expected);assert.equal(await page.locator('#header-value').getAttribute('type'),'password');
await page.locator('#copy').click();assert.equal(await page.evaluate(()=>window.__copied),expected);await page.locator('#copy').click();
await page.locator('#show-header').click();assert.equal(await page.locator('#header-value').getAttribute('type'),'text');await page.locator('#show-header').click();
await page.locator('#api-key').fill('fka_SYNTHETIC_CHANGED');assert.equal(await page.locator('#header-value').inputValue(),'');assert(!await page.locator('#result').isVisible());await page.locator('#api-key').press('Enter');
await page.evaluate(()=>navigator.clipboard.writeText=async()=>{throw Error('denied')});await page.locator('#copy').click();assert((await page.locator('#status').textContent()).includes('manually'));assert.equal(await page.locator('#header-value').getAttribute('type'),'text');
await page.locator('#api-key').fill('colon:bad');await page.locator('#generate').click();assert.equal(await page.locator('#header-value').inputValue(),'');
await page.locator('#api-key').fill('fka_SYNTHETIC_FINAL');await page.locator('#generate').click();await page.locator('#clear').click();assert.equal(await page.locator('#api-key').inputValue(),'');assert.equal(await page.locator('#header-value').inputValue(),'');
await page.locator('#api-key').fill('fka_SYNTHETIC_RESTORE');await page.locator('#generate').click();await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide')));assert.equal(await page.locator('#api-key').inputValue(),'');await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));assert.equal(await page.locator('#header-value').inputValue(),'');
const state=await page.evaluate(()=>({attempts:window.__outbound,width:innerWidth,scroll:document.documentElement.scrollWidth,cookies:document.cookie,storage:(()=>{try{return [localStorage.length,sessionStorage.length]}catch{return [0,0]}})()}));assert.deepEqual(state.attempts,[]);assert.equal(state.cookies,'');assert.deepEqual(state.storage,[0,0]);assert(state.scroll<=state.width);assert.equal(requests.length,initial);assert.deepEqual(errors,[]);
if(target.startsWith('file:')){await page.reload({waitUntil:'load'});assert.equal(await page.locator('#api-key').inputValue(),'');await page.locator('#api-key').fill('fka_SYNTHETIC_RELOAD');await page.locator('#generate').click();assert.equal(await page.locator('#header-value').inputValue(),'Basic '+Buffer.from('fka_SYNTHETIC_RELOAD:').toString('base64'));await page.locator('#clear').click()}
if(process.env.QA_SCREENSHOT&&width===390)await page.screenshot({path:process.env.QA_SCREENSHOT+'-'+engine+'.png',fullPage:true});
console.log(JSON.stringify({engine,width,offlineConversion:'PASS',initialRequests:requests.slice(0,initial),newRequestsDuringUse:0,networkApiAttempts:0,storage:'empty',errors:0}));await context.close();
}}finally{await browser.close()}}
})().catch(e=>{console.error(e);process.exitCode=1});
