(()=>{'use strict';
const BRAND=Object.freeze({
  shortName:'BUNKR',
  displayName:'Bunkr',
  fullName:'Bunkr: Last Shelter',
  subtitle:'LAST SHELTER',
  commandName:'BUNKR COMMAND',
  storageKey:'bunkr_last_shelter_v1',
  legacyStorageKey:'afterlight_v4'
});
const apiNames=['Config','Economy','Numbers','State','Prestige','Operations','Game','Missions','Expeditions','SpecialRooms','Research','Merchant','CommandCenter','Codex','CarePackage','Visuals','SurvivorDialogue','Audio','Platform','Offline','Bonuses','Survivors'];
for(const name of apiNames){const canonical='Bunkr'+name,legacy='Afterlight'+name;if(Object.prototype.hasOwnProperty.call(window,legacy))continue;Object.defineProperty(window,legacy,{configurable:true,get:()=>window[canonical],set:value=>{window[canonical]=value}})}
if(!Object.prototype.hasOwnProperty.call(window,'startAfterlightExpedition'))Object.defineProperty(window,'startAfterlightExpedition',{configurable:true,get:()=>window.startBunkrExpedition,set:value=>{window.startBunkrExpedition=value}});
const eventNames=['account','care-package-landed','care-package-missed','care-package-opened','care-package-spawned','companion-selected','dev-reward-claimed','enemy','enemy-killed','expedition-complete','expedition-roster','expedition-started','merchant-expired','merchant-free-activated','merchant-purchase','mission-claimed','offline-collected','operations-changed','prestige-complete','prestige-contract','prestige-room','research-claimed','research-complete','room-upgraded','settings-changed','shot','state','streak','survivor-dialogue-complete','survivor-dialogue-letter','survivor-dialogue-start','survivor-selected','survivors','uranium'];
for(const name of eventNames)window.addEventListener('bunkr:'+name,event=>window.dispatchEvent(new CustomEvent('afterlight:'+name,{detail:event.detail})));
window.BunkrBrand=BRAND;
document.documentElement.dataset.brand='bunkr-last-shelter';
})();
