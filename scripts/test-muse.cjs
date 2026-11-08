const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../muse.html'),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1],css=html.match(/<style>([\s\S]*?)<\/style>/)[1];
for(const source of [js,css])assert(html.includes("'sha256-"+crypto.createHash('sha256').update(source).digest('base64')+"'"));
for(const term of ["default-src 'none'","connect-src 'none'","form-action 'none'","base-uri 'none'","worker-src 'none'"])assert(html.includes(term));
assert(!/<(?:script|link)[^>]+(?:src|href)=["']https?:/i.test(html));
assert(!/<(?:form|iframe|img|object)\b/i.test(html));
assert(!/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|localStorage|sessionStorage|indexedDB|serviceWorker|console|innerHTML|insertAdjacentHTML|eval)\b/.test(js));
assert(!/document\.cookie|location\.|history\./.test(js));
const elements={};for(const id of ['api-key','header-value','result','status','generate','copy','show-header','show-key','clear'])elements[id]={value:'',type:'password',hidden:false,disabled:false,textContent:'',attrs:{},handlers:{},classList:{toggle(){}},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,v){this.handlers[k]=v},focus(){this.focused=true},select(){this.selected=true}};
const window={handlers:{},addEventListener(k,v){this.handlers[k]=v}};let copied='';const navigator={clipboard:{writeText:async text=>{copied=text}}};
vm.runInNewContext(js,{document:{getElementById:id=>elements[id]},window,navigator,TextEncoder,btoa:s=>Buffer.from(s,'binary').toString('base64'),Error});
const key=elements['api-key'],out=elements['header-value'],generate=elements.generate;
function enter(s){key.value=s;key.handlers.input();generate.handlers.click()}
(async()=>{
 for(const keyValue of ['fka_SYNTHETIC_NOT_A_REAL_KEY','abc','é漢🙂','x'.repeat(4096)]){enter(keyValue);assert.equal(out.value,'Basic '+Buffer.from(keyValue+':','utf8').toString('base64'))}
 for(const bad of ['',':','a:b','a b',' x','x\n','Basic abc','x\0','\ud800','\udc00','x'.repeat(4097)]){enter(bad);assert.equal(out.value,'');assert(elements.result.hidden);assert(elements.copy.disabled)}
 enter('fka_SYNTHETIC_ONE');await elements.copy.handlers.click();assert.equal(copied,out.value);await elements.copy.handlers.click();assert.equal(copied,out.value);
 elements['show-key'].handlers.click();assert.equal(key.type,'text');elements['show-key'].handlers.click();assert.equal(key.type,'password');
 elements['show-header'].handlers.click();assert.equal(out.type,'text');elements['show-header'].handlers.click();assert.equal(out.type,'password');
 key.value='fka_SYNTHETIC_CHANGED';key.handlers.input();assert.equal(out.value,'');assert(elements.result.hidden);
 enter('fka_SYNTHETIC_TWO');navigator.clipboard.writeText=async()=>{throw Error('denied')};await elements.copy.handlers.click();assert(out.selected);assert.equal(out.type,'text');assert(elements.status.textContent.includes('manually'));
 enter('fka_SYNTHETIC_THREE');navigator.clipboard=undefined;await elements.copy.handlers.click();assert(out.selected);
 elements.clear.handlers.click();assert.equal(key.value,'');assert.equal(out.value,'');assert.equal(key.type,'password');assert.equal(out.type,'password');
 enter('fka_SYNTHETIC_FOUR');window.handlers.pagehide();assert.equal(key.value,'');assert.equal(out.value,'');enter('fka_SYNTHETIC_FIVE');window.handlers.pageshow();assert.equal(key.value,'');assert.equal(out.value,'');
 let finish;enter('fka_SYNTHETIC_ASYNC');navigator.clipboard={writeText:()=>new Promise(resolve=>finish=resolve)};const pending=elements.copy.handlers.click();elements.clear.handlers.click();finish();await pending;assert(elements.result.hidden);assert.equal(out.value,'');assert(elements.copy.disabled);assert(elements.status.textContent.startsWith('Fields cleared'));
 console.log('PASS: CSP hashes and no-network/static audit; UTF-8 vectors, rejected input, clipboard, masking, invalidation, lifecycle and async-clear tests. Synthetic data only.');
})().catch(e=>{console.error(e);process.exitCode=1});
