(()=>{'use strict';
const CFG=window.AfterlightConfig;if(!CFG)throw new Error('AfterlightConfig must load before state.js');
const KEY='afterlight_v4';
const parse=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
const defaults=()=>({
  schema:6,coins:0,total:0,food:0,water:0,power:0,scrap:0,science:0,kills:0,level:1,bunker:1,
  rooms:{generator:1,workshop:0,greenhouse:0,purifier:0,lab:0,living:0,storage:0,turret:0},
  research:{tools:0,solar:0,hydro:0,filters:0,automation:0,walls:0},
  researchRuntime:{active:null,ready:null},
  stats:{clicks:0,bosses:0},
  missions:{claimed:[],bonuses:{}},
  expeditions:{active:null,survivors:[],pending:null},
  specialRooms:{},
  settings:{music:true},
  last:Date.now()
});
const base=defaults(),old=parse(KEY)||{};
const state={...base,...old,rooms:{...base.rooms,...(old.rooms||{})},research:{...base.research,...(old.research||{})},stats:{...base.stats,...(old.stats||{})},settings:{...base.settings,...(old.settings||{})}};
if(!old.missions){const m=parse('afterlight_missions_v1');if(m)state.missions={claimed:Array.isArray(m.claimed)?m.claimed:[],bonuses:{...(m.bon||{})}}}
if(!old.expeditions){const x=parse('afterlight_expedition_runtime_v1');if(x)state.expeditions={active:x.active||null,survivors:Array.isArray(x.survivors)?x.survivors:[],pending:x.pending||null}}
if(!old.specialRooms){const r=parse('afterlight_special_rooms_v1');if(r?.rooms)state.specialRooms={...r.rooms}}
if(old.settings?.music==null){const legacyMusic=localStorage.getItem('afterlight_music');if(legacyMusic)state.settings.music=legacyMusic!=='off'}
function normalize(){
  state.schema=6;
  state.rooms={...base.rooms,...(state.rooms||{})};state.research={...base.research,...(state.research||{})};state.stats={...base.stats,...(state.stats||{})};
  state.missions=state.missions||{claimed:[],bonuses:{}};state.missions.claimed=Array.isArray(state.missions.claimed)?state.missions.claimed:[];state.missions.bonuses=state.missions.bonuses||{};
  state.expeditions=state.expeditions||{active:null,survivors:[],pending:null};state.expeditions.survivors=Array.isArray(state.expeditions.survivors)?state.expeditions.survivors:[];
  if(Array.isArray(state.expeditions.pending?.found))state.expeditions.pending.found=state.expeditions.pending.found[0]||null;
  state.specialRooms=state.specialRooms||{};state.researchRuntime=state.researchRuntime||{active:null,ready:null};state.settings={...base.settings,...(state.settings||{})};
  for(const k of ['coins','total','food','water','power','scrap','science','kills'])if(!Number.isFinite(Number(state[k])))state[k]=0;
  const roomTotal=Object.values(state.rooms).reduce((a,b)=>a+(Number(b)||0),0);state.bunker=1+Math.floor(roomTotal/4);
}
function save(){normalize();state.last=Date.now();localStorage.setItem(KEY,JSON.stringify(state))}
function notify(reason='state'){window.dispatchEvent(new CustomEvent('afterlight:state',{detail:{reason}}))}
function update(reason,fn,{saveNow=true,notifyNow=true}={}){if(typeof fn==='function')fn(state);normalize();if(saveNow)save();if(notifyNow)notify(reason);return state}
function bonus(name){const v=Number(state.missions?.bonuses?.[name]);return Number.isFinite(v)&&v>0?v:1}
normalize();
window.AfterlightState={KEY,get:()=>state,save,update,notify,bonus,snapshot:()=>JSON.parse(JSON.stringify(state))};
save();setInterval(save,4000);window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
})();
