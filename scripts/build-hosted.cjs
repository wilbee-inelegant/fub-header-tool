// Package the standalone tool for hosts that require script-src 'self'.
// There is no runtime server or build dependency. Never use a page containing keys.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const out=path.resolve(process.argv[2]||'hosted');
if(fs.existsSync(out))throw Error('Choose a new output directory');
const source=fs.readFileSync(path.resolve(__dirname,'../muse.html'),'utf8');
const match=source.match(/<script>([\s\S]*?)<\/script>/);if(!match)throw Error('Missing inline script');
const js=match[1],digest=crypto.createHash('sha256').update(js).digest('base64');
const html=source.replace(match[0],'<script src="./muse.js" integrity="sha256-'+digest+'" defer></script>').replace('href="data:,"','href="./favicon.svg"').replace("img-src data:","img-src 'self' data:");
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'index.html'),html);fs.writeFileSync(path.join(out,'muse.js'),js);fs.writeFileSync(path.join(out,'favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#214c3d"/><path d="M10 9h13v4h-9v3h7v4h-7v5h-4z" fill="#fff"/></svg>\n');
console.log('Built hosted HTML with same-origin, integrity-pinned script; JavaScript bytes exactly match muse.html.');
