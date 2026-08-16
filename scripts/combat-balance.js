'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js','core','config.js'),'utf8'),sandbox,{filename:'config.js'});
const {ENEMIES,COMBAT}=sandbox.window.AfterlightConfig||{};
const fail=message=>{throw new Error(`Combat balance: ${message}`)};
if(!Array.isArray(ENEMIES)||ENEMIES.length!==6)fail('exactly six enemy definitions are required');
const expected={common:55,uncommon:25,rare:12,epic:5,legendary:2,brute:1};
const total=ENEMIES.reduce((sum,type)=>sum+type.chance,0);
if(total!==100)fail(`spawn chances must total 100%, received ${total}%`);
for(const type of ENEMIES){
  if(type.chance!==expected[type.id])fail(`${type.id} must keep its approved ${expected[type.id]}% chance`);
  if(!fs.existsSync(path.join(root,type.asset)))fail(`missing sprite ${type.asset}`);
  const header=fs.readFileSync(path.join(root,type.asset)).subarray(0,12).toString('ascii');
  if(!header.startsWith('RIFF')||!header.endsWith('WEBP'))fail(`${type.asset} is not a WebP asset`);
  if(!(type.hpMultiplier>0&&type.bountyMultiplier>0&&type.scrapMultiplier>0))fail(`${type.id} multipliers must be positive`);
}
const common=ENEMIES.find(type=>type.id==='common');
if(common.deathAsset!=='assets/enemy-common-drifter-death.png')fail('The Drifter must expose its approved three-frame death sheet');
const deathAsset=path.join(root,common.deathAsset);if(!fs.existsSync(deathAsset))fail(`missing death sprite ${common.deathAsset}`);
const deathBuffer=fs.readFileSync(deathAsset);if(!deathBuffer.subarray(1,4).equals(Buffer.from('PNG'))||deathBuffer[25]!==6)fail('The Drifter death sheet must be a real RGBA PNG with transparent alpha');
if(ENEMIES.find(type=>type.id==='common').glow!=='transparent')fail('Common must not have a rarity glow');
if(ENEMIES.find(type=>type.id==='brute').glow!=='transparent')fail('Brute must remain outside the rarity glow system');
for(const id of ['uncommon','rare','epic','legendary'])if(ENEMIES.find(type=>type.id===id).glow==='transparent')fail(`${id} requires an in-game glow color`);
if(COMBAT.hordeVisualCount!==3||COMBAT.hordeMultiplier!==3)fail('hordes must contain at most three infected and pay/scale at exactly x3');
if(!(COMBAT.hordeChance>0&&COMBAT.hordeChance<1))fail('horde chance must be a probability');
if(COMBAT.hordePityEncounters!==8)fail('a horde must be guaranteed by the eighth eligible encounter');
let hordeMisses=0,guaranteedAt=0;
for(let encounter=1;encounter<=COMBAT.hordePityEncounters;encounter++){const horde=hordeMisses>=COMBAT.hordePityEncounters-1||.999999<COMBAT.hordeChance;if(horde){guaranteedAt=encounter;hordeMisses=0;break}hordeMisses++}
if(guaranteedAt!==COMBAT.hordePityEncounters)fail(`maximum-roll pity simulation spawned at ${guaranteedAt||'never'}, expected encounter ${COMBAT.hordePityEncounters}`);
if(COMBAT.criticalChance!==.08||COMBAT.criticalMultiplier!==2)fail('critical hits must stay at a balanced 8% chance and x2 damage');
if(COMBAT.deathAnimationMs!==390||COMBAT.nextSpawnMs!==390||COMBAT.corpseVisibleMs!==1500||COMBAT.corpseLimit!==3)fail('death timing must stay fast, readable and spam-safe');
if(COMBAT.streakWindowMs!==12000||COMBAT.streakStep!==.25||COMBAT.streakMaximum!==3)fail('kill streaks must use the approved 12-second, +25%, x3 cap');
const millionPerHourBounty=1_000_000*COMBAT.bountyHourlyShare;
if(millionPerHourBounty!==800)fail(`1M/hour must produce an 800-coin Common base bounty, received ${millionPerHourBounty}`);
for(const [hourly,expectedBounty] of [[10_000,8],[1_000_000,800],[1_000_000_000,800_000]])if(hourly*COMBAT.bountyHourlyShare!==expectedBounty)fail(`hourly income ${hourly} should scale to ${expectedBounty}`);
let seed=0xA17E51,counts=Object.fromEntries(ENEMIES.map(type=>[type.id,0]));
for(let sample=0;sample<100_000;sample++){seed=(1664525*seed+1013904223)>>>0;let cursor=(seed/2**32)*100;for(const type of ENEMIES){cursor-=type.chance;if(cursor<0){counts[type.id]++;break}}}
for(const type of ENEMIES){const actual=counts[type.id]/1000;if(Math.abs(actual-type.chance)>.35)fail(`${type.id} sampled ${actual.toFixed(2)}%, expected ${type.chance}%`)}
const game=fs.readFileSync(path.join(root,'js','core','game.js'),'utf8');
for(const [pattern,message] of [
  [/function pickEnemy\(roll=Math\.random\(\)\)/,'game must use the configured weighted rarity picker'],
  [/rates\(\)\.coins\*3600/,'bounties must scale from actual hourly coin production'],
  [/COMBAT\.bountyHourlyShare/,'bounties must use the documented hourly share'],
  [/function rollHorde\(type,forcedHorde=null,roll=Math\.random\(\)\)\{if\(type\.brute\)return false;if\(forcedHorde!==null\)return!!forcedHorde;/,'brutes and local forced encounters must bypass persisted pity updates'],
  [/status\.misses>=status\.threshold-1\|\|Math\.max\(0,Math\.min\(\.999999,Number\(roll\)\|\|0\)\)<COMBAT\.hordeChance/,'hordes must use both the base chance and the configured guarantee'],
  [/state\.stats\.hordePity=horde\?0:status\.misses\+1/,'eligible horde misses must persist and successful hordes must reset the counter'],
  [/horde=rollHorde\(type,forcedHorde,override\.hordeRoll\?\?Math\.random\(\)\)/,'every spawned encounter must pass through the reliable horde roller'],
  [/resetHordePity:params\.get\('resetHordePity'\)==='1'/,'localhost must expose a deterministic pity reset for browser regression tests'],
  [/single\*\(horde\?COMBAT\.hordeMultiplier:1\)/,'horde HP and rewards must multiply the already-rounded single-zombie value exactly'],
  [/killCredit:horde\?COMBAT\.hordeMultiplier:1/,'hordes must award x3 kill credit'],
  [/addCoins\(Math\.max\(1,Math\.floor\(baseCoins\*streak\.multiplier\)\),false\)/,'hourly-scaled bounties must not double-apply the coin bonus'],
  [/bruteCores/,'Brute kills must award their exclusive core drop']
  ,[/const baseDamage=tapDamage\(\),critical=criticalHit\(\),criticalMultiplier=critical\?COMBAT\.criticalMultiplier\*\(window\.AfterlightPrestige\?\.criticalMultiplier\?\.\(\)\|\|1\):1,damage=baseDamage\*criticalMultiplier/,'critical damage, including Elara, must be calculated once in core combat']
  ,[/S\.stats\.criticals/,'lifetime critical hits must be tracked']
  ,[/function advanceStreak\(at=Date\.now\(\)\)/,'combat must own one deterministic streak calculator']
  ,[/Math\.floor\(baseCoins\*streak\.multiplier\)/,'streak multiplier must apply to kill rewards only after the kill']
  ,[/streakCount:streak\.count,streakMultiplier:streak\.multiplier/,'kill events must expose their exact streak reward']
  ,[/deathAsset:type\.deathAsset\|\|null/,'encounters must expose their configured death sheet']
  ,[/setTimeout\(spawn,COMBAT\.nextSpawnMs\)/,'the next encounter must wait for the complete death sequence']
])if(!pattern.test(game))fail(message);
const visuals=fs.readFileSync(path.join(root,'js','ui','visuals.js'),'utf8');
for(const [pattern,message] of [
  [/Math\.min\(maxHorde,Math\.max\(1,Number\(detail\.visualCount\)\|\|1\)\)/,'horde rendering must be hard-capped at the configured three zombies'],
  [/detail\.asset/,'spawn visuals must use the selected enemy asset'],
  [/--enemy-glow/,'rarity glow must be rendered by the game'],
  [/function shotFeedback\(event\)\{clearSpawn\(\);/,'shots must clear the completed entrance state before hit feedback'],
  [/spawnClearTimer=setTimeout\(clearSpawn,500\)/,'spawn state requires a fallback cleanup'],
  [/className='enemyUnit'/,'enemy visuals must use one coordinated encounter unit'],
  [/function applySurvivor\(source=selectedSkin\(\),animate=true\)/,'combat must support the configured survivor roster'],
  [/survivorUnit\.append\(survivor,muzzle\)/,'muzzle flash must be anchored inside the survivor coordinate system'],
  [/restart\(survivorUnit,'shoot'\)/,'recoil must move the survivor and muzzle together'],
  [/survivorUnit\.dataset\.muzzleAnchor=anchor/,'the rifle barrel needs one configured normalized muzzle anchor'],
  [/function createDeathSequence\(detail\)/,'visuals must create a dedicated corpse sequence without blocking the next spawn'],
  [/className='enemyDeathSprite'/,'the death sequence must render the approved sprite-sheet frames'],
  [/while\(corpses\.length>limit\)corpses\.shift\(\)\?\.remove\(\)/,'old corpses must be capped for spam safety'],
  [/enemyUnit\.classList\.remove\('dead','hit','defeated'\)/,'a newly spawned infected must always restore the live encounter unit']
])if(!pattern.test(visuals))fail(message);
const css=fs.readFileSync(path.join(root,'app.css'),'utf8');
if(!/float\.className='damageNumber'\+\(detail\.critical/.test(visuals)||!/if\(active\.length>8\)active\[0\]\.remove\(\)/.test(visuals))fail('per-shot damage feedback must exist and remain spam-safe');
if(!/@keyframes damageNumberRise/.test(css))fail('floating damage animation is missing');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(!html.includes('assets/enemy-common-drifter-death.png'))fail('The Drifter death sheet must be preloaded');
if(!/id="hordeSignal"/.test(html)||!/GUARANTEED IN/.test(game)||!/#hordeSignal\.detected/.test(css))fail('players need a visible horde signal and a distinct detected state');
if(!/@keyframes criticalNumberRise/.test(css)||!/CRIT -/.test(visuals))fail('critical hits need distinct visual feedback');
if(!/id='combatStreak'/.test(visuals)||!/afterlight:streak/.test(visuals)||!/@keyframes streakDrain/.test(css))fail('kill streak HUD and timer feedback are missing');
if(!/@keyframes enemyEnter\{from\{opacity:0;transform:translate3d\(calc\(100vw \+ 100%\)/.test(css))fail('spawn entrance must start beyond the right edge');
if(!/\.enemyGlow\{display:none\}/.test(css))fail('the old container-sized glow must remain disabled');
if(!/@keyframes drifterDeathFrames/.test(css)||!/\.enemyDeathUnit\.horde \.enemyDeathSprite:nth-child\(3\)/.test(css))fail('The Drifter death frames must animate for both single encounters and three-member hordes');
if(!/67%,100%\{aspect-ratio:700\/631;background-size:253\.5% auto;background-position:100% 52%\}/.test(css))fail('the corpse frame must include the complete Drifter skull and preserve the shared ground baseline');
if(!/\.enemyUnit:is\([^}]+\) \.enemySprite\{filter:[^}]+var\(--enemy-glow\)/.test(css))fail('rarity glow must follow each sprite alpha instead of its layout container');
const survivorAsset=path.join(root,'assets','survivor-ranger.png');if(!fs.existsSync(survivorAsset))fail('missing approved survivor-ranger.png');
const survivorBuffer=fs.readFileSync(survivorAsset);if(!survivorBuffer.subarray(1,4).equals(Buffer.from('PNG'))||survivorBuffer[25]!==6)fail('survivor-ranger.png must be a real RGBA PNG');
if(!/\.survivorUnit \.muzzleFx\{left:var\(--muzzle-x,77\.5%\);top:var\(--muzzle-y,20\.5%\)/.test(css))fail('muzzle effect must use the selected sprite-relative rifle barrel anchor');
if(!/clip-path:polygon\(/.test(css))fail('muzzle flash must use a sharp pixel burst instead of the old fireball');
console.log(`Afterlight combat balance passed: ${total}% rarity table, ${ENEMIES.length} sprites, 800 coins at 1M/hour, hordes x${COMBAT.hordeMultiplier}.`);
