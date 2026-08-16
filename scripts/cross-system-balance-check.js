'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),assert=(value,message)=>{if(!value)throw new Error(`Cross-system balance: ${message}`)};
const element=()=>({dataset:{},classList:{add(){},remove(){},toggle(){}},querySelector(){return null},querySelectorAll(){return[]},append(){},remove(){},innerHTML:''});
function baseWindow(state){return{AfterlightState:{get:()=>state,update:(reason,fn)=>{fn(state);return state},save(){},notify(){},offlineElapsedMs:0,bonus:()=>1},addEventListener(){},dispatchEvent(){}}}
function loadCore(sandbox){vm.runInNewContext(read('js/core/config.js'),sandbox,{filename:'config.js'});vm.runInNewContext(read('js/core/numbers.js'),sandbox,{filename:'numbers.js'})}

const researchState={scrap:8,science:2,research:{tools:0,solar:0,hydro:0,filters:0,automation:0,walls:0},researchRuntime:{active:null,ready:null}};
const researchSandbox={window:baseWindow(researchState),document:{body:{dataset:{}},getElementById(){return null},querySelector(){return null},querySelectorAll(){return[]}},CustomEvent:function(){},setInterval(){},setTimeout(){},console};
loadCore(researchSandbox);vm.runInNewContext(read('js/systems/research.js'),researchSandbox,{filename:'research.js'});
const research=researchSandbox.window.AfterlightResearch;
assert(research.cost('tools')===8&&research.scienceCost('tools')===2,'the first tooling project must cost 8 Scrap and 2 Science');
assert(research.start('tools'),'a fully funded research project must start');
assert(researchState.scrap===0&&researchState.science===0,'research must deduct Scrap and Science in one transaction');
assert(researchState.researchRuntime.active?.scrapCost===8&&researchState.researchRuntime.active?.scienceCost===2,'the active project must persist both paid costs');

const expeditionState={bunker:10,food:500,water:500,expeditions:{active:null,survivors:[],pending:null}};
const expeditionWindow=baseWindow(expeditionState);expeditionWindow.AfterlightGame={rates:()=>({coins:100,scrap:20,food:2,water:3})};expeditionWindow.AfterlightMerchant={multiplier:resource=>resource==='coins'?5:1};
const expeditionSandbox={window:expeditionWindow,document:{body:{append(){}},getElementById(){return null},querySelector(){return null},createElement:element},location:{hostname:'example.com',search:''},URLSearchParams,CustomEvent:function(){},setInterval(){},setTimeout(){},Math,console};
loadCore(expeditionSandbox);vm.runInNewContext(read('js/systems/expeditions.js'),expeditionSandbox,{filename:'expeditions.js'});
const expeditions=expeditionSandbox.window.AfterlightExpeditions,cost=expeditions.deploymentCost(expeditionSandbox.window.AfterlightConfig.EXPEDITIONS.store),coinRange=expeditions.rewardRange(expeditionSandbox.window.AfterlightConfig.EXPEDITIONS.store,'coins');
assert(cost.food===90&&cost.water===135,'store rations must scale to 45 seconds of sustained Food and Water');
assert(coinRange[0]===1800&&coinRange[1]===3000,'expedition coin previews must remove the active 5x Dealer multiplier');
assert(expeditions.start('store'),'a supplied expedition must deploy');
assert(expeditionState.food===410&&expeditionState.water===365,'deployment must atomically spend the displayed rations');
assert(expeditionState.expeditions.active?.rewardRates?.coins===20,'the run must snapshot sustainable, Dealer-free reward rates');

const offlineState={offline:{pending:null,totalClaims:0,totalSeconds:0}};
const offlineWindow=baseWindow(offlineState);offlineWindow.AfterlightGame={operationsSnapshot:()=>({rates:{coins:100,food:2,water:3,power:4,scrap:20,science:1},summary:{alerts:2,efficiency:.72}})};offlineWindow.AfterlightMerchant={multiplier:resource=>resource==='coins'?5:1};
const offlineSandbox={window:offlineWindow,document:{body:{dataset:{}},getElementById(){return null}},location:{hostname:'example.com',search:''},URLSearchParams,console};
loadCore(offlineSandbox);vm.runInNewContext(read('js/systems/offline.js'),offlineSandbox,{filename:'offline.js'});
const offline=offlineSandbox.window.AfterlightOffline.calculate(3600000);
assert(offline.limitedRooms===2&&offline.operationsEfficiency===.72,'offline claims must preserve the sustained operation warning context');
assert(offline.gains.coins===25200,'one offline hour must earn 35% of permanent Dealer-free coin production');

const cfg=researchSandbox.window.AfterlightConfig,expectedCareCrystals=3600000/((cfg.CARE_PACKAGE.minimumIntervalMs+cfg.CARE_PACKAGE.maximumIntervalMs)/2)*cfg.CARE_PACKAGE.uraniumChance,expectedCareBoosts=3600000/((cfg.CARE_PACKAGE.minimumIntervalMs+cfg.CARE_PACKAGE.maximumIntervalMs)/2)*cfg.CARE_PACKAGE.dealerBoostChance;
assert(Math.abs(expectedCareCrystals-1.2)<1e-9&&Math.abs(expectedCareBoosts-.36)<1e-9,'care packages must average 1.2 crystals and 0.36 free boosts per active hour');
console.log('Afterlight cross-system balance passed: dual-cost research, ration-funded expeditions, sustainable offline rates and scarce attention rewards.');
