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
if(ENEMIES.find(type=>type.id==='common').glow!=='transparent')fail('Common must not have a rarity glow');
if(ENEMIES.find(type=>type.id==='brute').glow!=='transparent')fail('Brute must remain outside the rarity glow system');
for(const id of ['uncommon','rare','epic','legendary'])if(ENEMIES.find(type=>type.id===id).glow==='transparent')fail(`${id} requires an in-game glow color`);
if(COMBAT.hordeVisualCount!==3||COMBAT.hordeMultiplier!==3)fail('hordes must contain at most three infected and pay/scale at exactly x3');
if(!(COMBAT.hordeChance>0&&COMBAT.hordeChance<1))fail('horde chance must be a probability');
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
  [/horde=!type\.brute&&\(forcedHorde===null\?Math\.random\(\)<COMBAT\.hordeChance:/,'brutes must not become hordes'],
  [/single\*\(horde\?COMBAT\.hordeMultiplier:1\)/,'horde HP and rewards must multiply the already-rounded single-zombie value exactly'],
  [/killCredit:horde\?COMBAT\.hordeMultiplier:1/,'hordes must award x3 kill credit'],
  [/addCoins\(defeated\.reward,false\)/,'hourly-scaled bounties must not double-apply the coin bonus'],
  [/bruteCores/,'Brute kills must award their exclusive core drop']
])if(!pattern.test(game))fail(message);
const visuals=fs.readFileSync(path.join(root,'js','ui','visuals.js'),'utf8');
for(const [pattern,message] of [
  [/Math\.min\(maxHorde,Math\.max\(1,Number\(detail\.visualCount\)\|\|1\)\)/,'horde rendering must be hard-capped at the configured three zombies'],
  [/detail\.asset/,'spawn visuals must use the selected enemy asset'],
  [/--enemy-glow/,'rarity glow must be rendered by the game'],
  [/function shotFeedback\(\)\{clearSpawn\(\);/,'shots must clear the completed entrance state before hit feedback'],
  [/spawnClearTimer=setTimeout\(clearSpawn,500\)/,'spawn state requires a fallback cleanup'],
  [/className='enemyUnit'/,'enemy visuals must use one coordinated encounter unit'],
  [/survivor\.src='assets\/survivor-ranger\.png'/,'combat must use the approved ranger survivor'],
  [/survivorUnit\.append\(survivor,muzzle\)/,'muzzle flash must be anchored inside the survivor coordinate system'],
  [/restart\(survivorUnit,'shoot'\)/,'recoil must move the survivor and muzzle together'],
  [/dataset\.muzzleAnchor='77\.5% 20\.5%'/,'the rifle barrel needs one explicit normalized muzzle anchor']
])if(!pattern.test(visuals))fail(message);
const css=fs.readFileSync(path.join(root,'app.css'),'utf8');
if(!/@keyframes enemyEnter\{from\{opacity:0;transform:translate3d\(calc\(100vw \+ 100%\)/.test(css))fail('spawn entrance must start beyond the right edge');
if(!/\.enemyGlow\{display:none\}/.test(css))fail('the old container-sized glow must remain disabled');
if(!/\.enemyUnit:is\([^}]+\) \.enemySprite\{filter:[^}]+var\(--enemy-glow\)/.test(css))fail('rarity glow must follow each sprite alpha instead of its layout container');
const survivorAsset=path.join(root,'assets','survivor-ranger.png');if(!fs.existsSync(survivorAsset))fail('missing approved survivor-ranger.png');
const survivorBuffer=fs.readFileSync(survivorAsset);if(!survivorBuffer.subarray(1,4).equals(Buffer.from('PNG'))||survivorBuffer[25]!==6)fail('survivor-ranger.png must be a real RGBA PNG');
if(!/\.survivorUnit \.muzzleFx\{[^}]*left:77\.5%;top:20\.5%/.test(css))fail('muzzle effect must use the sprite-relative rifle barrel anchor');
if(!/clip-path:polygon\(/.test(css))fail('muzzle flash must use a sharp pixel burst instead of the old fireball');
console.log(`Afterlight combat balance passed: ${total}% rarity table, ${ENEMIES.length} sprites, 800 coins at 1M/hour, hordes x${COMBAT.hordeMultiplier}.`);
