'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),fail=message=>{throw new Error(`Room progression: ${message}`)},assert=(condition,message)=>{if(!condition)fail(message)};
const context={window:{}};vm.runInNewContext(read('js/core/config.js'),context);vm.runInNewContext(read('js/core/economy.js'),context);vm.runInNewContext(read('js/core/room-progression.js'),context);
const cfg=context.window.BunkrConfig,economy=context.window.BunkrEconomy,progress=context.window.BunkrRoomProgression;
assert(cfg.ROOM_ECONOMY.unlimitedRoomLevels===true,'normal rooms must have no designed level cap');
assert(economy.MAX_ROOM_LEVEL===Number.MAX_SAFE_INTEGER,'only the JavaScript safe-integer guard may limit a room level');
for(const level of [99,100,101,105,200,201,5000,5001,100000])assert(economy.sanitizeRoomLevel(level)===level,`level ${level} must survive normalization`);
const expected=[
  [99,75,4,'M1 OVERDRIVEN'],
  [100,100,5,'M1 ASCENDANT'],
  [101,100,5,'M1 ASCENDANT'],
  [104,100,5,'M1 ASCENDANT'],
  [105,105,6.25,'M2 CALIBRATED'],
  [199,175,20,'M2 OVERDRIVEN'],
  [200,200,25,'M2 ASCENDANT'],
  [201,200,25,'M2 ASCENDANT'],
  [300,300,125,'M3 ASCENDANT']
];
for(const [level,absolute,multiplier,label] of expected){const milestone=progress.milestone(level);assert(milestone?.absoluteLevel===absolute,`level ${level} must retain milestone ${absolute}`);assert(Math.abs(milestone.multiplier-multiplier)<1e-9,`level ${level} must have cumulative x${multiplier}`);assert(milestone.label===label,`level ${level} must show ${label}`)}
assert(progress.nextMilestone(100).absoluteLevel===105&&progress.nextMilestone(101).absoluteLevel===105,'Mastery II must continue at absolute level 105 instead of resetting to level 5');
const track=progress.track(101,6);assert(track.some(item=>item.absoluteLevel===100)&&track.some(item=>item.absoluteLevel===105),'the level-101 UI track must show the retained level-100 milestone and upcoming level 105');assert(track.every(item=>item.absoluteLevel>0),'the permanent track may never display level zero');
const rate=(level)=>{const mastery=progress.mastery(level),final=cfg.ROOM_MILESTONES.at(-1),rankScale=mastery.size*Math.pow(cfg.ROOM_ECONOMY.rateGrowth,mastery.size-1)*final.multiplier;return Math.pow(rankScale,mastery.rank-1)*mastery.local*Math.pow(cfg.ROOM_ECONOMY.rateGrowth,Math.max(0,mastery.local-1))*progress.localMultiplier(level)};
assert(Math.abs(rate(101)/rate(100)-1)<1e-12,'crossing level 100 must preserve output before level 101 resumes growth');
assert(rate(105)>rate(104)&&rate(200)>rate(199)&&rate(201)>=rate(200),'production must never drop at a milestone or Mastery boundary');
const distantCost=economy.roomCostAt('generator',6000,1),ten=economy.roomUpgradeQuote('generator',10,6000,1),balance=distantCost*10;
assert(Number.isFinite(distantCost)&&distantCost===economy.MAX_ROOM_COST,'extreme-level prices must use the finite anti-overflow ceiling');
assert(ten.count===10&&Number.isFinite(ten.cost)&&ten.cost===balance,'ten extreme-level upgrades must remain a real finite quote');
assert(economy.validPurchase(ten,balance,6000),'an extreme-level quote must remain transaction-safe');
const game=read('js/core/game.js'),html=read('index.html');
for(const marker of ['js/core/room-progression.js?build=2','rooms=2'])assert(html.includes(marker),`cache/load marker missing: ${marker}`);
assert(html.indexOf('js/core/room-progression.js?build=2')<html.indexOf('js/core/state.js?build=28'),'room progression must load before save normalization');
assert(/PERMANENT MILESTONE CHAIN/.test(game)&&/roomMilestoneTrack/.test(game),'room intelligence must render the permanent absolute milestone chain');
assert(/afterMilestone\?\.absoluteLevel!==beforeMilestone\?\.absoluteLevel/.test(game),'room upgrades must compare absolute milestones across Mastery boundaries');
console.log('Bunkr room progression passed: unlimited safe levels, permanent milestones through Mastery III and finite level-6000 upgrades.');
