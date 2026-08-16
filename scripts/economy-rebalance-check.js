'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),assert=(condition,message)=>{if(!condition)throw new Error(`Economy rebalance: ${message}`)};
const context={window:{}};vm.runInNewContext(read('js/core/config.js'),context,{filename:'config.js'});vm.runInNewContext(read('js/core/economy.js'),context,{filename:'economy.js'});
const cfg=context.window.AfterlightConfig,economy=context.window.AfterlightEconomy,rules=cfg.ROOM_ECONOMY,rooms=cfg.ROOMS,milestones=cfg.ROOM_MILESTONES;
assert(rules.masterySize===100&&rules.maximumRoomLevel>=5000,'rooms need repeatable 100-level Mastery ranks and future Prestige headroom');
assert(JSON.stringify([...cfg.PRESTIGE.targets])===JSON.stringify([100,200,325,525,850]),'Prestige I–V target curve drifted');
assert(cfg.PRESTIGE.targetFormula.growth>1.5&&cfg.PRESTIGE.targetFormula.growth<1.7,'future Prestige growth must remain near-exponential but tunable');
assert(JSON.stringify(milestones.map(item=>item.level))===JSON.stringify([5,10,25,50,75,100]),'each Mastery rank needs six readable milestones');
assert(economy.roomCostAt('generator',2)>economy.roomCostAt('generator',1)&&economy.roomCostAt('generator',101)>economy.roomCostAt('generator',100),'room prices must grow across Mastery boundaries');
function milestone(local){let result=1;for(const entry of milestones)if(local>=entry.level)result=entry.multiplier;return result}
function roomRate(id,level,multiplier=1){if(!level)return 0;const size=rules.masterySize,rank=Math.floor((level-1)/size),local=1+(level-1)%size,last=milestones[milestones.length-1],rankScale=size*Math.pow(rules.rateGrowth,size-1)*last.multiplier;return (rooms[id].prod.coins||0)*Math.pow(rankScale,rank)*local*Math.pow(rules.rateGrowth,local-1)*milestone(local)*multiplier}
function simulatedHours(target,productionMultiplier=1,costMultiplier=1){const levels=Object.fromEntries(Object.keys(rooms).map(id=>[id,id==='generator'?1:0]));let coins=0,seconds=0;const bunker=()=>1+Math.floor(Object.values(levels).reduce((a,b)=>a+b,0)/rules.bunkerLevelEvery),rate=()=>.1*productionMultiplier+Object.keys(rooms).reduce((sum,id)=>sum+roomRate(id,levels[id],productionMultiplier),0);while(bunker()<target){const available=Object.keys(rooms).filter(id=>bunker()>=rooms[id].unlock),choice=available.map(id=>({id,cost:economy.roomCostAt(id,levels[id],costMultiplier)})).sort((a,b)=>a.cost-b.cost)[0],income=Math.max(.1,rate()),wait=Math.max(0,(choice.cost-coins)/income);seconds+=wait;coins+=wait*income-choice.cost;levels[choice.id]++;assert(Number.isFinite(seconds)&&seconds<365*86400,'simulation exceeded one year or overflowed')}return seconds/3600}
const hours=cfg.PRESTIGE.targets.map((target,index)=>simulatedHours(target,Math.pow(cfg.PRESTIGE.economyPerLevel,index)*(1+index*cfg.PRESTIGE.rosterBonusPerLevel),index?.9:1));
assert(hours[0]>=5&&hours[0]<=12,`fresh Prestige I passive baseline should be 5–12 active hours, got ${hours[0].toFixed(1)}`);
assert(hours.slice(1).every(value=>value>=12&&value<=120),`Prestige II–V passive baselines must fit the 1–3 day design band before active rewards: ${hours.map(v=>v.toFixed(1)).join(', ')}`);
const offers=Object.fromEntries(cfg.MERCHANT_OFFERS.map(offer=>[offer.id,offer]));
assert(offers.gold5.cost===25&&offers.gold10.cost===60&&offers.all3.cost===75&&offers.scrap5.cost===30&&offers.hunter.cost===40&&offers.lure.cost===50,'Dealer costs must stay in the approved 6–9x rebalance');
assert(offers.gold5.group===offers.gold10.group&&offers.gold10.group===offers.all3.group,'Coin and everything boosts must be mutually exclusive');
const missions=read('js/systems/missions.js');
for(const marker of ['BONUS_LIMITS','balanceVersion','rebuiltBonuses','boundedBonus'])assert(missions.includes(marker),`mission normalization is missing ${marker}`);
assert(/prodMult:2\.5/.test(missions)&&/costMult:\.75/.test(missions),'mission production and discount caps changed');
const state=read('js/core/state.js'),command=read('js/systems/command-center.js'),css=read('app.css');
assert(/schema:17/.test(state)&&/function resetAll\(token\)/.test(state),'schema 17 and owned-key full reset API are required');
assert(/TYPE RESET TO ARM THE BUTTON/.test(command)&&/3000\)/.test(command)&&/data-command-reset-open/.test(command),'Account reset needs typed confirmation and a three-second hold');
assert(css.includes('.accountResetModal')&&css.includes('@keyframes accountResetHold'),'Account reset presentation is missing');
console.log(`Afterlight economy rebalance passed: P1–V passive baselines ${hours.map(value=>value.toFixed(1)+'h').join(' / ')}, 100-level Masteries and bounded Dealer/missions.`);
