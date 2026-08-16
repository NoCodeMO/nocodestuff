(()=>{'use strict';
const CFG=window.AfterlightConfig;if(!CFG)throw new Error('AfterlightConfig must load before state.js');
const ECON=window.AfterlightEconomy;if(!ECON)throw new Error('AfterlightEconomy must load before state.js');
const KEY='afterlight_v4';
const parse=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const defaults=()=>({
  schema:18,coins:0,total:0,food:0,water:0,power:0,scrap:0,science:0,uranium:0,kills:0,level:1,bunker:1,
  rooms:{generator:1,workshop:0,greenhouse:0,purifier:0,lab:0,living:0,storage:0,turret:0},
  research:{tools:0,solar:0,hydro:0,filters:0,automation:0,walls:0},
  researchRuntime:{active:null,ready:null},
  stats:{clicks:0,criticals:0,bestStreak:0,bosses:0,hordes:0,hordePity:0,bruteCores:0,uraniumEarned:0,uraniumSpent:0,lifetimeKills:0,prestigeResets:0,discovered:[],rarityKills:{common:0,uncommon:0,rare:0,epic:0,legendary:0,brute:0}},
  merchant:{active:{},purchases:{},spent:0,freeActivations:0,legacyMissionGrantDone:false},
  carePackage:{nextAt:0,active:null,opened:0,missed:0},
  offline:{pending:null,totalClaims:0,totalSeconds:0},
  missions:{claimed:[],bonuses:{},balanceVersion:0},
  operations:{priorities:{...CFG.OPERATIONS.defaultPriority},paused:{}},
  expeditions:{active:null,survivors:[],pending:null},
  specialRooms:{},
  prestige:{level:0,cores:0,totalResets:0,bestBunker:1,lastAt:0,lastReward:0,rooms:{'legacy-vault':0,'automation-bay':0,'command-relay':0,'war-room':0,'archive-core':0},automation:{enabled:false,targets:[]},archive:[],run:{startedAt:Date.now(),roomUpgrades:0,researchClaims:0,hordes:0,brutes:0,expeditions:0,contractClaimed:false}},
  survivorSkins:{selected:'ranger-male',unlocked:['ranger-male','ranger-female']},
  command:{read:[],claimed:[],lastTab:'guide',account:{loggedIn:false,name:'',createdAt:0}},
  settings:{music:true,uiSfx:true,reducedEffects:false},
  last:Date.now()
});
const loadedAt=Date.now(),base=defaults(),old=parse(KEY)||{},previousLast=Number(old.last)||loadedAt,offlineElapsedMs=Math.max(0,loadedAt-previousLast);
const state={...base,...old,rooms:{...base.rooms,...(old.rooms||{})},research:{...base.research,...(old.research||{})},stats:{...base.stats,...(old.stats||{}),rarityKills:{...base.stats.rarityKills,...(old.stats?.rarityKills||{})}},merchant:{...base.merchant,...(old.merchant||{}),active:{...base.merchant.active,...(old.merchant?.active||{})},purchases:{...base.merchant.purchases,...(old.merchant?.purchases||{})}},carePackage:{...base.carePackage,...(old.carePackage||{})},offline:{...base.offline,...(old.offline||{})},operations:{...base.operations,...(old.operations||{}),priorities:{...base.operations.priorities,...(old.operations?.priorities||{})},paused:{...base.operations.paused,...(old.operations?.paused||{})}},prestige:{...base.prestige,...(old.prestige||{}),rooms:{...base.prestige.rooms,...(old.prestige?.rooms||{})},automation:{...base.prestige.automation,...(old.prestige?.automation||{})},run:{...base.prestige.run,...(old.prestige?.run||{})}},survivorSkins:{...base.survivorSkins,...(old.survivorSkins||{})},command:{...base.command,...(old.command||{}),account:{...base.command.account,...(old.command?.account||{})}},settings:{...base.settings,...(old.settings||{})}};
if((Number(old.schema)||0)<16)state.stats.lifetimeKills=Math.max(Number(state.stats.lifetimeKills)||0,Number(state.kills)||0);
if(['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('lateGameEconomyTest')==='1'){state.coins=5.63e152;state.total=Math.max(5.63e152,Number(state.total)||0);state.rooms.generator=1979}
if(!old.missions){const m=parse('afterlight_missions_v1');if(m)state.missions={claimed:Array.isArray(m.claimed)?m.claimed:[],bonuses:{...(m.bon||{})}}}
if(!old.expeditions){const x=parse('afterlight_expedition_runtime_v1');if(x)state.expeditions={active:x.active||null,survivors:Array.isArray(x.survivors)?x.survivors:[],pending:x.pending||null}}
if(!old.specialRooms){const r=parse('afterlight_special_rooms_v1');if(r?.rooms)state.specialRooms={...r.rooms}}
if(old.settings?.music==null){const legacyMusic=localStorage.getItem('afterlight_music');if(legacyMusic)state.settings.music=legacyMusic!=='off'}
function normalize(){
  state.schema=18;
  state.rooms={...base.rooms,...(state.rooms||{})};for(const id of Object.keys(base.rooms))state.rooms[id]=ECON.sanitizeRoomLevel(state.rooms[id]);state.research={...base.research,...(state.research||{})};state.stats={...base.stats,...(state.stats||{}),rarityKills:{...base.stats.rarityKills,...(state.stats?.rarityKills||{})}};state.stats.discovered=Array.isArray(state.stats.discovered)?[...new Set(state.stats.discovered.filter(id=>base.stats.rarityKills[id]!=null))]:[];for(const [id,count] of Object.entries(state.stats.rarityKills))if(Number(count)>0&&!state.stats.discovered.includes(id))state.stats.discovered.push(id);
  state.missions=state.missions||{claimed:[],bonuses:{}};state.missions.claimed=Array.isArray(state.missions.claimed)?state.missions.claimed:[];state.missions.bonuses=state.missions.bonuses||{};
  state.expeditions=state.expeditions||{active:null,survivors:[],pending:null};state.expeditions.survivors=Array.isArray(state.expeditions.survivors)?state.expeditions.survivors:[];
  state.operations={...base.operations,...(state.operations||{}),priorities:{...base.operations.priorities,...(state.operations?.priorities||{})},paused:{...base.operations.paused,...(state.operations?.paused||{})}};for(const id of Object.keys(base.rooms)){if(!CFG.OPERATIONS.priorities[state.operations.priorities[id]])state.operations.priorities[id]=base.operations.priorities[id];state.operations.paused[id]=state.operations.paused[id]===true}
  if(Array.isArray(state.expeditions.pending?.found))state.expeditions.pending.found=state.expeditions.pending.found[0]||null;
  state.specialRooms=state.specialRooms||{};state.researchRuntime=state.researchRuntime||{active:null,ready:null};state.merchant={...base.merchant,...(state.merchant||{}),active:{...base.merchant.active,...(state.merchant?.active||{})},purchases:{...base.merchant.purchases,...(state.merchant?.purchases||{})}};state.carePackage={...base.carePackage,...(state.carePackage||{})};state.offline={...base.offline,...(state.offline||{})};
  state.prestige={...base.prestige,...(state.prestige||{}),rooms:{...base.prestige.rooms,...(state.prestige?.rooms||{})},automation:{...base.prestige.automation,...(state.prestige?.automation||{})},run:{...base.prestige.run,...(state.prestige?.run||{})}};state.prestige.level=Math.max(0,Math.min(Number(CFG.PRESTIGE?.maximumLevel)||5,Math.floor(Number(state.prestige.level)||0)));state.prestige.cores=Math.max(0,Math.floor(Number(state.prestige.cores)||0));state.prestige.totalResets=Math.max(state.prestige.level,Math.floor(Number(state.prestige.totalResets)||0));state.prestige.bestBunker=Math.max(1,Math.floor(Number(state.prestige.bestBunker)||1));for(const id of Object.keys(base.prestige.rooms))state.prestige.rooms[id]=Math.max(0,Math.min(Number(CFG.PRESTIGE?.roomMaximumLevel)||3,Math.floor(Number(state.prestige.rooms[id])||0)));state.prestige.automation.targets=Array.isArray(state.prestige.automation.targets)?[...new Set(state.prestige.automation.targets.filter(id=>base.rooms[id]!=null))].slice(0,state.prestige.rooms['automation-bay']):[];state.prestige.automation.enabled=state.prestige.automation.enabled===true&&state.prestige.automation.targets.length>0;state.prestige.archive=Array.isArray(state.prestige.archive)?[...new Set(state.prestige.archive.filter(id=>base.research[id]!=null))].slice(0,state.prestige.rooms['archive-core']):[];state.prestige.run.contractClaimed=state.prestige.run.contractClaimed===true;
  const roomTotal=Object.values(state.rooms).reduce((a,b)=>a+(Number(b)||0),0),bunkerStep=CFG.ROOM_ECONOMY?.bunkerLevelEvery||4;state.bunker=1+Math.floor(roomTotal/bunkerStep);
  const selectable=(CFG.SURVIVOR_SKINS||[]).filter(skin=>skin.asset).map(skin=>skin.id),bunkerUnlocks=(CFG.SURVIVOR_SKINS||[]).filter(skin=>skin.asset&&skin.unlock?.type==='bunker'&&state.bunker>=Number(skin.unlock.level)).map(skin=>skin.id),prestigeUnlocks=(CFG.SURVIVOR_SKINS||[]).filter(skin=>skin.asset&&skin.unlock?.type==='prestige'&&state.prestige.level>=Number(skin.unlock.level)).map(skin=>skin.id);state.survivorSkins={...base.survivorSkins,...(state.survivorSkins||{})};state.survivorSkins.unlocked=[...new Set([...base.survivorSkins.unlocked,...(Array.isArray(state.survivorSkins.unlocked)?state.survivorSkins.unlocked:[]),...bunkerUnlocks,...prestigeUnlocks])].filter(id=>selectable.includes(id));if(!state.survivorSkins.unlocked.includes(state.survivorSkins.selected))state.survivorSkins.selected='ranger-male';
  state.command={...base.command,...(state.command||{}),account:{...base.command.account,...(state.command?.account||{})}};state.command.read=Array.isArray(state.command.read)?state.command.read:[];state.command.claimed=Array.isArray(state.command.claimed)?state.command.claimed:[];state.settings={...base.settings,...(state.settings||{})};
  for(const k of ['coins','total','food','water','power','scrap','science','uranium','kills'])state[k]=ECON.sanitizeResource(state[k]);
}
function save(){normalize();state.last=Date.now();localStorage.setItem(KEY,JSON.stringify(state))}
function notify(reason='state'){window.dispatchEvent(new CustomEvent('afterlight:state',{detail:{reason}}))}
function update(reason,fn,{saveNow=true,notifyNow=true}={}){if(typeof fn==='function')fn(state);normalize();if(saveNow)save();if(notifyNow)notify(reason);return state}
function bonus(name){const v=Number(state.missions?.bonuses?.[name]);return Number.isFinite(v)&&v>0?v:1}
function resetAll(token){if(token!=='RESET')return false;for(const key of [KEY,'afterlight_prestige_backup_v1','afterlight_missions_v1','afterlight_expedition_runtime_v1','afterlight_special_rooms_v1','afterlight_music'])localStorage.removeItem(key);location.reload();return true}
normalize();
window.AfterlightState={KEY,get:()=>state,save,update,notify,bonus,resetAll,loadedAt,previousLast,offlineElapsedMs,snapshot:()=>JSON.parse(JSON.stringify(state))};
save();setInterval(save,4000);window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
})();
