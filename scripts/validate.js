'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');let errors=[];
const fail=m=>errors.push(m),exists=p=>fs.existsSync(path.join(root,p));
function walk(dir,ext,out=[]){if(!fs.existsSync(dir))return out;for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p,ext,out);else if(!ext||p.endsWith(ext))out.push(p)}return out}
for(const file of walk(path.join(root,'js'),'.js')){try{new vm.Script(fs.readFileSync(file,'utf8'),{filename:path.relative(root,file)})}catch(e){fail(`JS syntax: ${path.relative(root,file)}: ${e.message}`)}}
const htmlPath=path.join(root,'index.html');if(!fs.existsSync(htmlPath))fail('Missing index.html');else{
  const html=fs.readFileSync(htmlPath,'utf8');
  const refs=[...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["']/gi)].map(m=>m[1]);
  for(const ref of refs){if(/^(?:https?:|data:|#)/i.test(ref))continue;const clean=ref.split(/[?#]/)[0].replace(/^\.\//,'');if(clean&&!exists(clean))fail(`Missing index reference: ${ref}`)}
}
for(const file of walk(root,'.css')){const css=fs.readFileSync(file,'utf8');for(const m of css.matchAll(/url\(["']?([^"')]+)["']?\)/gi)){const ref=m[1];if(/^(?:https?:|data:|#)/i.test(ref))continue;const target=path.resolve(path.dirname(file),ref.split(/[?#]/)[0]);if(!fs.existsSync(target))fail(`Missing CSS asset: ${path.relative(root,file)} -> ${ref}`)}}
const audioPath=path.join(root,'js','audio.js');if(fs.existsSync(audioPath)){const source=fs.readFileSync(audioPath,'utf8');for(const [pattern,message] of [[/window\.AudioContext\|\|window\.webkitAudioContext/,'UI audio must support the iOS-prefixed AudioContext'],[/document\.addEventListener\('pointerdown',onUiPointer,true\)/,'UI audio must use one delegated user-gesture listener'],[/target\.closest\('#scene'\)/,'UI button audio must leave combat to afterlight:shot'],[/window\.addEventListener\('afterlight:shot',gunshot\)/,'Gun audio must use the existing afterlight:shot event'],[/createDynamicsCompressor/,'Synthesized SFX must use a master compressor'],[/\['room','special-room','mission'\]/,'UI audio must react to the existing state API for confirmations']])if(!pattern.test(source))fail(message)}
const rootNames=fs.readdirSync(root);const legacy=[/^game\d+\.js$/i,/^phase\d+\.css$/i,/^polish\d+\.(?:js|css)$/i,/^sprite\d+\.(?:js|css)$/i];for(const name of rootNames)if(legacy.some(r=>r.test(name)))fail(`Legacy numbered file still present: ${name}`);
if(errors.length){console.error(`Afterlight validation failed (${errors.length})`);for(const e of errors)console.error(' - '+e);process.exit(1)}
console.log(`Afterlight validation passed: ${walk(path.join(root,'js'),'.js').length} JS modules, all local references resolved.`);
