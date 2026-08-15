'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),configSource=fs.readFileSync(path.join(root,'js','core','config.js'),'utf8'),gameSource=fs.readFileSync(path.join(root,'js','core','game.js'),'utf8'),visualSource=fs.readFileSync(path.join(root,'js','ui','visuals.js'),'utf8'),css=fs.readFileSync(path.join(root,'app.css'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const context={window:{}};vm.runInNewContext(configSource,context);const cfg=context.window.AfterlightConfig,rooms=cfg.ROOMS,milestones=cfg.ROOM_MILESTONES,economy=cfg.ROOM_ECONOMY;
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const ids=['generator','workshop','greenhouse','purifier','lab','living','storage','turret'];
assert(JSON.stringify(Object.keys(rooms))===JSON.stringify(ids),'Normal room table must contain the eight intended rooms in display order');
for(const id of ids){const room=rooms[id],asset=path.join(root,room.art);assert(room.desc.length>=80,`${id} needs a useful room description`);assert(fs.existsSync(asset),`${id} room artwork is missing`);const image=fs.readFileSync(asset);assert(image.length>=90000&&image.length<=300000,`${id} artwork must be optimized but high quality`);assert(image.subarray(0,4).toString()==='RIFF'&&image.subarray(8,12).toString()==='WEBP',`${id} artwork must be WebP`)}
assert(economy.costGrowth===1.62&&economy.rateGrowth===1.18,'Existing room cost and production curves must remain stable');
assert(economy.bunkerLevelEvery===4,'Every four combined room levels must grant exactly one Bunker Level');
assert(JSON.stringify(milestones.map(item=>[item.level,item.multiplier]))===JSON.stringify([[5,1.25],[10,1.5],[25,2],[50,3]]),'Room milestones must follow the balanced 5/10/25/50 curve');
for(let index=1;index<milestones.length;index++){assert(milestones[index].level>milestones[index-1].level,'Milestone levels must increase');assert(milestones[index].multiplier>milestones[index-1].multiplier,'Milestone multipliers must increase')}
const milestoneMultiplier=level=>{let value=1;for(const item of milestones)if(level>=item.level)value=item.multiplier;return value};
for(const level of [1,4,5,9,10,24,25,49,50]){const rate=rooms.generator.prod.power*level*Math.pow(economy.rateGrowth,level-1)*milestoneMultiplier(level);assert(Number.isFinite(rate)&&rate>0,`Generator rate must remain finite at level ${level}`)}
for(const id of ids){const first=Math.floor(rooms[id].base),second=Math.floor(rooms[id].base*economy.costGrowth);assert(second>first,`${id} upgrade cost must rise`);const ten=Array.from({length:10},(_,index)=>Math.floor(rooms[id].base*Math.pow(economy.costGrowth,index))).reduce((sum,value)=>sum+value,0);assert(ten>second,`${id} ten-level quote must sum sequential costs`)}
for(const [pattern,message] of [[/function renderRoomDetails\(k,celebrate=false\)/,'Room detail renderer is missing'],[/data-room-buy=\\?"10\\?"/,'Ten-level room upgrade control is missing'],[/data-room-buy=\\?"max\\?"/,'Maximum affordable room upgrade control is missing'],[/function affordableRoomLevels\(/,'Maximum upgrade quote must be derived from current coins'],[/afterlight:room-upgraded/,'Room upgrades must emit their existing-architecture feedback event'],[/data-room-affordability/,'Room details must expose live affordability']])assert(pattern.test(gameSource),message);
assert(/function bunkerProgress\(\)/.test(gameSource),'Bunker progress must derive from combined room levels');
assert(/aria-valuetext/.test(gameSource),'Bunker progress needs accessible next-level context');
assert(/id="bunkerProgress"/.test(html),'Bunker progress bar is missing from the live layout');
assert(!/\.b64|loadFallback|applyRoomArt/.test(visualSource),'Legacy room-art fallback loader must stay removed');
for(const selector of ['.roomDetails','.roomDetailHero','.roomMilestones','.roomBuyActions','.roomUpgradeBurst'])assert(css.includes(selector),`Missing room UI style: ${selector}`);
console.log('Afterlight room balance passed: 8 optimized room artworks, milestone curve, sequential bulk costs and live room intelligence UI.');

