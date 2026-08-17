'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),assert=(value,message)=>{if(!value)throw new Error(`BUNKR rebrand: ${message}`)};
class StorageMock{constructor(entries={}){this.values=new Map(Object.entries(entries))}get length(){return this.values.size}key(index){return [...this.values.keys()][index]??null}getItem(key){return this.values.has(key)?this.values.get(key):null}setItem(key,value){this.values.set(String(key),String(value))}removeItem(key){this.values.delete(String(key))}}
const legacySave={schema:20,coins:456789,total:900000,food:321,water:654,power:987,scrap:222,science:111,uranium:17,kills:88,rooms:{generator:44,workshop:12},prestige:{level:2,cores:5},survivorSkins:{selected:'ranger-female',unlocked:['ranger-male','ranger-female']},last:Date.now()-60000};
const localStorage=new StorageMock({afterlight_v4:JSON.stringify(legacySave),afterlight_prestige_backup_v1:'legacy-backup',afterlight_music:'off','unrelated-key':'keep'}),sessionStorage=new StorageMock(),listeners={};
const window={addEventListener:(name,fn)=>{(listeners[name]||(listeners[name]=[])).push(fn)},removeEventListener(){},dispatchEvent:event=>{for(const fn of listeners[event.type]||[])fn(event);return true}};
const document={hidden:false,documentElement:{dataset:{}},body:{dataset:{}},addEventListener(){},removeEventListener(){}};
const location={hostname:'example.com',search:'',href:'https://example.com/game/',replace(){}};
function CustomEvent(type,options={}){this.type=type;this.detail=options.detail}
const sandbox={window,document,location,localStorage,sessionStorage,URL,URLSearchParams,CustomEvent,setInterval:()=>91,clearInterval(){},Date,Math,console};
for(const file of ['js/core/brand.js','js/core/config.js','js/core/economy.js','js/core/state.js'])vm.runInNewContext(read(file),sandbox,{filename:file});
const api=window.BunkrState,migrated=JSON.parse(localStorage.getItem('bunkr_last_shelter_v1')||'null');
assert(window.BunkrBrand?.fullName==='Bunkr: Last Shelter'&&document.documentElement.dataset.brand==='bunkr-last-shelter','central brand identity is missing');
assert(api?.KEY==='bunkr_last_shelter_v1'&&api.LEGACY_KEY==='afterlight_v4','canonical and legacy save contracts are incorrect');
assert(api.migratedFrom==='afterlight_v4','legacy source must be reported during the one-time migration');
assert(migrated?.coins===legacySave.coins&&migrated?.rooms?.generator===44&&migrated?.prestige?.level===2&&migrated?.survivorSkins?.selected==='ranger-female','legacy progress was not preserved exactly');
assert(localStorage.getItem('afterlight_v4')!==null,'legacy save must remain as a rollback snapshot');
assert(localStorage.getItem('bunkr_prestige_backup_v1')==='legacy-backup','Prestige recovery backup was not migrated');
assert(api.get().settings.music===false,'legacy music preference was not migrated');
assert(window.AfterlightState===window.BunkrState&&window.AfterlightConfig===window.BunkrConfig,'temporary public API aliases are missing');
let legacyShots=0;window.addEventListener('afterlight:shot',()=>legacyShots++);window.dispatchEvent(new CustomEvent('bunkr:shot',{detail:{damage:7}}));assert(legacyShots===1,'canonical events must bridge to legacy listeners exactly once');
assert(localStorage.getItem('unrelated-key')==='keep','migration touched unrelated same-origin storage');
console.log('BUNKR rebrand migration passed: legacy progress, backups, settings, APIs and events remain compatible.');
