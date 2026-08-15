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
if(COMBAT.hordeVisualCount!==3||COMBAT.hordeMultiplier!==5)fail('hordes must render three infected and pay/scale at x5');
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
  [/killCredit:horde\?COMBAT\.hordeMultiplier:1/,'hordes must award x5 kill credit'],
  [/addCoins\(defeated\.reward,false\)/,'hourly-scaled bounties must not double-apply the coin bonus'],
  [/bruteCores/,'Brute kills must award their exclusive core drop']
])if(!pattern.test(game))fail(message);
const visuals=fs.readFileSync(path.join(root,'js','ui','visuals.js'),'utf8');
for(const [pattern,message] of [
  [/detail\.visualCount/,'hordes must render their configured visual count'],
  [/detail\.asset/,'spawn visuals must use the selected enemy asset'],
  [/--enemy-glow/,'rarity glow must be rendered by the game'],
  [/className='enemyUnit'/,'enemy visuals must use one coordinated encounter unit']
])if(!pattern.test(visuals))fail(message);
const css=fs.readFileSync(path.join(root,'app.css'),'utf8');
if(!/@keyframes enemyEnter\{from\{opacity:0;transform:translate3d\(calc\(100vw \+ 100%\)/.test(css))fail('spawn entrance must start beyond the right edge');
if(!/\.enemyGlow\{/.test(css))fail('rarity glow CSS is missing');
console.log(`Afterlight combat balance passed: ${total}% rarity table, ${ENEMIES.length} sprites, 800 coins at 1M/hour, hordes x${COMBAT.hordeMultiplier}.`);
