'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),assert=(value,message)=>{if(!value)throw new Error(`Research network: ${message}`)};
const configSource=read('js/core/config.js'),researchSource=read('js/systems/research.js'),stateSource=read('js/core/state.js'),gameSource=read('js/core/game.js'),expeditionSource=read('js/systems/expeditions.js'),css=read('app.css'),html=read('index.html'),smoke=read('scripts/smoke.sh');
const sandbox={window:{},console};
vm.runInNewContext(configSource,sandbox,{filename:'config.js'});
const config=sandbox.window.BunkrConfig,branches=config.RESEARCH_BRANCHES,nodes=config.RESEARCH;
assert(branches.length===4,'exactly four coherent research branches are required');
assert(nodes.length===17,'the launch tree must contain 17 projects');
assert(new Set(nodes.map(node=>node.id)).size===nodes.length,'research IDs must be unique');
assert(nodes.reduce((sum,node)=>sum+node.maxLevel,0)===97,'the first complete network must contain 97 meaningful levels');
for(const node of nodes){
  assert(branches.some(branch=>branch.id===node.branch),`${node.id} points to an unknown branch`);
  assert(node.maxLevel>0&&node.baseCost>0&&node.scienceCost>0&&node.baseSeconds>0,`${node.id} needs positive progression math`);
  for(const requirement of node.requires||[]){
    const parent=nodes.find(candidate=>candidate.id===requirement.id);
    assert(parent,`${node.id} has a missing prerequisite ${requirement.id}`);
    assert(parent.branch===node.branch,`${node.id} crosses branches without an explicit junction`);
    assert(parent.tier<node.tier,`${node.id} prerequisite order must move forward`);
  }
}
for(const id of ['tools','solar','hydro','filters','automation','walls'])assert(nodes.some(node=>node.id===id),`legacy project ${id} must keep its save-compatible ID`);
assert(nodes.find(node=>node.id==='archiveProtocol')?.prestige===1,'Archive Protocol must gate at Prestige I');
assert(nodes.find(node=>node.id==='fortressGrid')?.prestige===3,'Fortress Grid must gate at Prestige III');
assert(nodes.find(node=>node.id==='geneticArchive')?.prestige===5,'Genetic Archive must gate at Prestige V');
assert(/Object\.fromEntries\(\(CFG\.RESEARCH\|\|\[\]\)\.map/.test(stateSource),'fresh and migrated saves must initialize every configured node');
assert(/for\(const id of Object\.keys\(base\.research\)\)state\.research\[id\]=Math\.max/.test(stateSource),'research levels must be normalized without deleting old progress');
assert(/researchNetworkTest/.test(stateSource)&&/state\.rooms\.lab=Math\.max\(5/.test(stateSource),'localhost browser QA needs a funded, unlocked Research fixture');

const state={scrap:100,science:100,rooms:{lab:1},research:Object.fromEntries(nodes.map(node=>[node.id,0])),researchRuntime:{active:null,ready:null},prestige:{level:0}};
const document={body:{dataset:{}},getElementById(){return null},querySelector(){return null},querySelectorAll(){return[]}};
const runtime={window:{BunkrConfig:config,BunkrNumbers:{format:value=>String(value)},BunkrState:{get:()=>state,update:(reason,fn)=>{fn(state);return state}}},document,CustomEvent:function(type,options){this.type=type;this.detail=options?.detail},setInterval(){},setTimeout(){},console,Date,Math};
runtime.window.addEventListener=()=>{};runtime.window.dispatchEvent=()=>{};
vm.runInNewContext(researchSource,runtime,{filename:'research.js'});
const api=runtime.window.BunkrResearch;
assert(api.cost('tools')===8&&api.scienceCost('tools')===2,'legacy first-project pricing must remain 8 Scrap and 2 Science');
assert(api.lockReason(nodes.find(node=>node.id==='hydro'))==='WATER RECYCLING LEVEL 1 REQUIRED','prerequisite feedback must explain the exact missing project');
state.research.filters=1;
assert(api.lockReason(nodes.find(node=>node.id==='hydro'))==='', 'meeting a prerequisite must unlock the next node');
assert(api.start('tools'),'a funded root project must start');
assert(state.scrap===92&&state.science===98,'starting Research must atomically deduct both resources');
state.researchRuntime.active.end=0;
assert(api.finish(),'elapsed Research must become claimable');
assert(api.claim()&&state.research.tools===1,'claiming must install exactly one level');
state.research.armorPiercing=2;state.research.hordeControl=2;state.research.walls=2;state.research.fortressGrid=2;state.research.routeMapping=2;state.research.rapidDeployment=2;state.research.advancedRecovery=2;state.research.companionRescue=2;state.research.geneticArchive=1;
assert(Math.abs(api.criticalChanceAdd()-.03)<1e-12,'Armor Piercing critical chance math is wrong');
assert(api.hordeDamageMultiplier()===1.5&&api.bruteDamageMultiplier()===1.3,'special infected damage math is wrong');
assert(Math.abs(api.roomCostMultiplier()-.8836)<1e-12,'Fortress Grid room-cost math is wrong');
assert(Math.abs(api.expeditionTimeMultiplier()-.8836)<1e-12,'Rapid Deployment time math is wrong');
assert(Math.abs(api.companionChanceAdd()-.05)<1e-12&&Math.abs(api.specialistChanceAdd()-.04)<1e-12,'field discovery bonuses are wrong');

for(const [pattern,message] of [
  [/dataset\.researchCommand='ready'/,'fullscreen root marker is missing'],
  [/class="researchWorkspace"/,'tree and inspector workspace is missing'],
  [/data-research-node=/,'interactive research nodes are missing'],
  [/data-research-branch=/,'branch navigation is missing'],
  [/PROJECT FUNDING/,'dual-cost inspector is missing'],
  [/PREREQUISITES/,'prerequisite inspector is missing'],
  [/setInterval\(tick,500\)/,'offline-safe timer ticker is missing']
])assert(pattern.test(researchSource),message);
for(const [pattern,message] of [
  [/#drawer\.researchDrawer\{[^}]*inset:0/,'Research drawer must be fullscreen'],
  [/\.researchWorkspace\{display:grid;grid-template-columns:/,'desktop tree/inspector split is missing'],
  [/@media\(max-width:820px\)/,'phone layout breakpoint is missing'],
  [/\.researchBranch\.mobileActive\{display:block/,'portrait branch focus mode is missing'],
  [/border-left:2px solid #4c553d/,'portrait vertical research route is missing'],
  [/@media\(orientation:landscape\) and \(min-width:560px\) and \(max-height:600px\)/,'phone landscape layout is missing'],
  [/grid-template-columns:repeat\(auto-fit,minmax\(90px,1fr\)\)/,'landscape branch fitting is missing'],
  [/@media\(prefers-reduced-motion:reduce\)/,'reduced-motion support is missing']
])assert(pattern.test(css),message);
assert(/classList\.toggle\('researchDrawer',tab==='research'\)/.test(gameSource),'drawer routing must activate the Research fullscreen class');
assert(/BunkrResearch\?\.productionBonus/.test(gameSource)&&/BunkrResearch\?\.hordeDamageMultiplier/.test(gameSource),'core production and combat must consume Research effects');
assert(/BunkrResearch\?\.expeditionTimeMultiplier/.test(expeditionSource)&&/BunkrResearch\?\.companionChanceAdd/.test(expeditionSource),'expeditions must consume Field Operations research');
assert(/data-tab="research"/.test(html)&&/id="researchBadge"/.test(html),'Research navigation and completion badge must remain available');
assert(/research-network-probe\.html/.test(smoke)&&/landscape=1/.test(smoke)&&/data-research-network-probe="passed"/.test(smoke),'real-browser smoke must verify portrait and landscape lifecycle geometry');
console.log('Bunkr Research Network passed: 17 projects, 97 levels, coherent prerequisites, Prestige gates, economy effects and responsive fullscreen UI.');
