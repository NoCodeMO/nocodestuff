'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(`Casing feedback: ${message}`)};
function webpInfo(buffer){
  assert(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP','sprite must be WebP');
  for(let offset=12;offset+8<=buffer.length;){const type=buffer.toString('ascii',offset,offset+4),size=buffer.readUInt32LE(offset+4),data=offset+8;
    if(type==='VP8X')return{width:1+buffer.readUIntLE(data+4,3),height:1+buffer.readUIntLE(data+7,3),alpha:Boolean(buffer[data]&16)};
    if(type==='VP8L'){const bits=buffer.readUInt32LE(data+1);return{width:1+(bits&0x3fff),height:1+((bits>>14)&0x3fff),alpha:Boolean(bits&0x10000000)}}
    offset=data+size+(size%2);
  }
  throw new Error('Casing feedback: WebP dimensions unavailable');
}
const asset='assets/combat-brass-casing.webp',assetPath=path.join(root,asset);
assert(fs.existsSync(assetPath),'production casing sprite is missing');
const buffer=fs.readFileSync(assetPath),info=webpInfo(buffer);
assert(info.width===128&&info.height===128,`sprite must be a compact 128x128 square, got ${info.width}x${info.height}`);
assert(info.alpha,'sprite must retain real transparency');
assert(buffer.length>1500,'sprite is unexpectedly empty');
const visuals=read('js/ui/visuals.js'),audio=read('js/audio.js'),css=read('app.css'),html=read('index.html'),smoke=read('scripts/smoke.sh');
for(const [pattern,message] of [[/CASING_ASSET='assets\/combat-brass-casing\.webp'/,'visuals must preload the production sprite'],[/CASING_LIMIT=12/,'spam cap must remain twelve active casings'],[/function ejectCasing\(\)/,'casing emitter is missing'],[/dataset\.ejectAnchor=ejectAnchor/,'survivor-relative ejection anchor is missing'],[/while\(active\.length>CASING_LIMIT\)/,'old casings must be removed during spam'],[/ejectCasing\(\);restart\(survivorUnit,'shoot'\)/,'every accepted shot must eject before recoil'],[/ejectCasing,shotFeedback/,'casing emitter must remain testable through the visual API']])assert(pattern.test(visuals),message);
for(const [pattern,message] of [[/function casingSound\(\)/,'metal casing sound is missing'],[/now-lastCasing<70/,'casing sound needs its own spam limiter'],[/channelSound\('combat'/,'casing sound must follow the combat volume channel'],[/window\.addEventListener\('afterlight:shot',casingSound\)/,'casing sound must use the shot event'],[/\.24,'triangle'/,'metal impact should land after the visual fall begins']])assert(pattern.test(audio),message);
for(const [pattern,message] of [[/\.shellCasing\{[^}]*combat-brass-casing\.webp/,'sprite styling is missing'],[/@keyframes casingFlight\{/,'fall and bounce animation is missing'],[/--casing-ground-y/,'animation must land on the survivor ground line'],[/html\.reducedEffects \.shellCasing\{display:none\}/,'reduced-effects fallback is missing']])assert(pattern.test(css),message);
for(const marker of ['app.css?build=58&pets=1&casing=1','js/ui/visuals.js?build=29&casing=1','js/audio.js?build=15&casing=1'])assert(html.includes(marker),`cache marker missing: ${marker}`);
assert(/casing-feedback-probe\.html/.test(smoke)&&/data-casing-feedback-probe="passed"/.test(smoke),'browser spam probe must block deployment failures');
console.log('Afterlight casing feedback passed: detailed alpha sprite, survivor-relative trajectory, twelve-casing spam cap and subtle combat-channel clink.');
