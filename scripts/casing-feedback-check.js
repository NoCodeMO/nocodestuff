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
const audioAsset='assets/audio/casing-drop-real.wav',audioPath=path.join(root,audioAsset);
assert(fs.existsSync(audioPath),'real casing recording is missing');
const wav=fs.readFileSync(audioPath);
assert(wav.toString('ascii',0,4)==='RIFF'&&wav.toString('ascii',8,12)==='WAVE','casing recording must be a valid WAV');
assert(wav.readUInt16LE(20)===1&&wav.readUInt16LE(22)===1&&wav.readUInt16LE(34)===16,'casing recording must be mono 16-bit PCM');
const sampleRate=wav.readUInt32LE(24),sampleCount=wav.readUInt32LE(40)/2,duration=sampleCount/sampleRate;
assert(sampleRate===48000,'casing recording must use the verified 48 kHz source rate');
assert(duration>=.95&&duration<=1.01,`casing recording should be one compact impact-and-bounce take, got ${duration.toFixed(3)}s`);
assert(wav.length<120000,'casing recording must stay lightweight for mobile');
const windowPeak=(from,to)=>{let peak=0;for(let index=Math.floor(from*sampleRate);index<Math.min(sampleCount,Math.ceil(to*sampleRate));index++)peak=Math.max(peak,Math.abs(wav.readInt16LE(44+index*2))/32768);return peak};
assert(windowPeak(.05,.3)>.65,'real recording needs a clear first metal impact');
assert(windowPeak(.34,.58)>.12&&windowPeak(.62,.94)>.07,'real recording needs two audible natural bounces');
const visuals=read('js/ui/visuals.js'),audio=read('js/audio.js'),state=read('js/core/state.js'),command=read('js/systems/command-center.js'),probe=read('scripts/casing-feedback-probe.html'),css=read('app.css'),html=read('index.html'),smoke=read('scripts/smoke.sh');
for(const [pattern,message] of [[/CASING_ASSET='assets\/combat-brass-casing\.webp'/,'visuals must preload the production sprite'],[/CASING_LIMIT=12/,'spam cap must remain twelve active casings'],[/function ejectCasing\(\)/,'casing emitter is missing'],[/dataset\.ejectAnchor=ejectAnchor/,'survivor-relative ejection anchor is missing'],[/while\(active\.length>CASING_LIMIT\)/,'old casings must be removed during spam'],[/ejectCasing\(\);restart\(survivorUnit,'shoot'\)/,'every accepted shot must eject before recoil'],[/ejectCasing,shotFeedback/,'casing emitter must remain testable through the visual API']])assert(pattern.test(visuals),message);
for(const [pattern,message] of [[/CASING_AUDIO_SRC='assets\/audio\/casing-drop-real\.wav'/,'audio must load the real casing recording'],[/fetch\(CASING_AUDIO_SRC,\{cache:'force-cache'\}\)/,'recording must preload before the first shot'],[/decodeAudioData\(bytes\.slice\(0\)\)/,'recording must decode through the unlocked Web Audio context'],[/casing:volumeValue\('casingVolume',\.1\)/,'casing channel must default to 10%'],[/function casingSound\(\)/,'metal casing sound is missing'],[/now-lastCasing<70/,'casing sound needs its own spam limiter'],[/level=effectsEnabled\?volumes\.casing:0/,'casing sound must follow only its dedicated volume channel'],[/CASING_VOLUME=\.75/,'casing extra must stay exactly 25% below its original designed maximum'],[/gains\[variant\]\*CASING_VOLUME\*level/,'casing attenuation must apply before its channel scaling'],[/while\(casingVoices\.length>=6\)/,'overlapping casing sounds need a hard voice cap'],[/startDelay=Math\.max\(0,\.16-elapsed\)/,'real impact must remain synchronized with the visual landing'],[/playbackRate\.value=rates\[variant\]/,'repeated shots need natural pitch variation'],[/channel==='casing'/,'mixer TEST button must preview only the casing channel'],[/casingStatus:\(\)=>\(\{loaded:/,'browser smoke test needs decoded sample diagnostics'],[/window\.addEventListener\('afterlight:shot',casingSound\)/,'casing sound must use the shot event']])assert(pattern.test(audio),message);
assert(/casingVolume:\.1/.test(state)&&/mixerRow\('casing','casingVolume'/.test(command),'fresh saves and Settings UI must expose the 10% casing control');
assert(/data-audio-volume="casing"/.test(probe)&&/changedVolume===\.35/.test(probe)&&/mixer\.restored===\.1/.test(probe),'browser smoke must verify default, live adjustment, persistence and restore for the casing slider');
assert(!/2180,2460,1920,2640/.test(audio),'legacy synthetic casing tones must be removed');
for(const [pattern,message] of [[/\.shellCasing\{[^}]*combat-brass-casing\.webp/,'sprite styling is missing'],[/@keyframes casingFlight\{/,'fall and bounce animation is missing'],[/--casing-ground-y/,'animation must land on the survivor ground line'],[/html\.reducedEffects \.shellCasing\{display:none\}/,'reduced-effects fallback is missing']])assert(pattern.test(css),message);
for(const marker of ['app.css?build=58&pets=1&casing=1','js/core/state.js?build=25&pets=1&casing=1','js/systems/command-center.js?build=8&pets=1&casing=1','js/ui/visuals.js?build=29&casing=1','js/audio.js?build=18&casing=2&realcasing=2'])assert(html.includes(marker),`cache marker missing: ${marker}`);
const credits=read('assets/audio/CREDITS.md');
assert(credits.includes('https://freesound.org/people/kmmediafactory/sounds/580287/')&&credits.includes('Creative Commons Zero'),'real recording source and CC0 license must stay documented');
assert(/casing-feedback-probe\.html/.test(smoke)&&/data-casing-feedback-probe="passed"/.test(smoke),'browser spam probe must block deployment failures');
console.log('Afterlight casing feedback passed: untouched visuals, real impact and bounces, a dedicated 10% default mixer channel and mobile voice cap.');
