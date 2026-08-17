'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(read('js/core/config.js'),sandbox);
const pets=sandbox.window.BunkrConfig.EXPEDITION_COMPANIONS;
function webpInfo(buffer){
  assert(buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP','asset is not WebP');
  for(let offset=12;offset+8<=buffer.length;){const type=buffer.toString('ascii',offset,offset+4),size=buffer.readUInt32LE(offset+4),data=offset+8;
    if(type==='VP8X')return{width:1+buffer.readUIntLE(data+4,3),height:1+buffer.readUIntLE(data+7,3),alpha:Boolean(buffer[data]&16)};
    if(type==='VP8L'){const bits=buffer.readUInt32LE(data+1);return{width:1+(bits&0x3fff),height:1+((bits>>14)&0x3fff),alpha:Boolean(bits&0x10000000)}}
    if(type==='VP8 ')return{width:buffer.readUInt16LE(data+6)&0x3fff,height:buffer.readUInt16LE(data+8)&0x3fff,alpha:false};
    offset=data+size+(size%2);
  }
  throw new Error('WebP dimensions unavailable');
}
assert(pets.length===20,`expected 20 non-exotic companions, received ${pets.length}`);
assert(new Set(pets.map(pet=>pet.id)).size===20,'companion ids must be unique');
assert(new Set(pets.map(pet=>pet.asset)).size===20,'every companion needs its own sprite strip');
assert(pets.every(pet=>pet.frames===3),'every companion must declare exactly three idle frames');
assert(pets.every(pet=>['common','uncommon','rare','epic'].includes(pet.rarity)),'exotic/legendary pets must remain out of this update');
for(const pet of pets){const file=path.join(root,pet.asset);assert(fs.existsSync(file),`${pet.id} sprite is missing`);const buffer=fs.readFileSync(file),info=webpInfo(buffer);assert(info.width===1536&&info.height===512,`${pet.id} must be a 1536x512 high-definition strip, got ${info.width}x${info.height}`);assert(info.width===info.height*3,`${pet.id} frames must be exactly square`);assert(info.alpha,`${pet.id} must declare real WebP alpha transparency`);assert(buffer.length>100000,`${pet.id} sprite looks unexpectedly empty`)}
const visuals=read('js/ui/visuals.js'),expeditions=read('js/systems/expeditions.js'),state=read('js/core/state.js'),css=read('app.css');
for(const [pattern,message] of [[/className='companionUnit hidden'/,'combat companion unit is missing'],[/COMPANION_COMBAT_SCALE=1\.1/,'combat companions need the approved ten-percent size boost'],[/\*COMPANION_COMBAT_SCALE/,'pet-specific scale must be multiplied by the combat size boost'],[/function applyCompanion\(/,'companion renderer is missing'],[/bunkr:companion-selected/,'companion selection event is not connected'],[/COMPANIONS\.map\(item=>item\.asset\)/,'companion assets are not preloaded']])assert(pattern.test(visuals),message);
for(const [pattern,message] of [[/companions:\['ranger-dog'\],selectedCompanion:'ranger-dog'/,'free Ranger companion state is missing'],[/state\.schema=20/,'companion selection migration needs schema 20'],[/validCompanions=/,'old companion saves must be validated']])assert(pattern.test(state),message);
for(const [pattern,message] of [[/function selectCompanion\(/,'expedition pet picker is missing'],[/data-companion-select/,'expedition roster does not expose pet selection'],[/const COMPANION_WEIGHTS=/,'companion rarity weights are missing']])assert(pattern.test(expeditions),message);
for(const [pattern,message] of [[/@keyframes companionIdleFrames\{0%,42%,100%/,'subtle three-frame idle timing is missing'],[/animation:companionIdleFrames 3\.6s/,'companion idle loop must remain calm and slow'],[/background-size:300% 100%/,'sprite strip sizing is missing'],[/\.companionUnit\{[^}]*bottom:10%/,'desktop road alignment is missing'],[/@media\(max-width:760px\)\{\.companionUnit\{[^}]*bottom:27%/,'portrait road alignment is missing'],[/prefers-reduced-motion:reduce[^}]*\.companionSprite/,'reduced motion fallback is missing']])assert(pattern.test(css),message);
console.log(`Companion idle check passed: ${pets.length} pets, ${pets.length*3} transparent frames, rarity-weighted recovery and responsive deployment.`);
