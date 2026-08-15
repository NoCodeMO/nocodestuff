(()=>{'use strict';
const CFG=window.AfterlightConfig,ST=window.AfterlightState;if(!CFG||!ST)throw new Error('Special room dependencies missing');
const S=ST.get(),ROOMS=CFG.SPECIAL_ROOMS;
const found=()=>window.AfterlightExpeditions?.survivors?.()||S.expeditions?.survivors||[];
const fmt=n=>n<1000?Math.floor(n)+'':(n/1000).toFixed(1)+'K';
const level=r=>Number(S.specialRooms[r.id]||0);
const unlocked=r=>found().includes(r.specialist)&&S.bunker>=r.unlock;
const cost=r=>Math.max(1,Math.floor(r.baseCost*Math.pow(1.7,level(r))*ST.bonus('costMult')));
function status(r){if(!found().includes(r.specialist))return 'FIND SPECIALIST ON EXPEDITION';if(S.bunker<r.unlock)return 'BUNKER LEVEL '+r.unlock+' REQUIRED';return 'SPECIALIST READY'}
function buy(id){const r=ROOMS.find(x=>x.id===id);if(!r||!unlocked(r))return false;const price=cost(r);if(S.coins<price)return false;ST.update('special-room',s=>{s.coins-=price;s.specialRooms[id]=(s.specialRooms[id]||0)+1});renderAll();window.AfterlightGame?.hud?.();return true}
function rates(){const out={coins:0,food:0,water:0,power:0,scrap:0,science:0};for(const r of ROOMS){const lv=level(r);if(!lv)continue;for(const [key,value] of Object.entries(r.prod))out[key]=(out[key]||0)+value*lv}return out}
function mainCard(r){const lv=level(r),ok=unlocked(r),st=status(r);return `<article class="room specialMainCard ${ok?'specialReady':'specialLocked'}"><div class="roomHead"><b>${r.name}</b><span>${lv?'LV '+lv:'CLASSIFIED'}</span></div><div class="roomArt specialArt ${r.id}"><div class="specialVisualIcon">${r.icon}</div>${ok?'':`<div class="bigRoomLock"><span>🔒</span><b>LOCKED</b><small>${st}</small></div>`}</div><div class="roomFoot"><span>${ok?(lv?r.desc:'READY TO BUILD'):st}</span><button ${ok?'':'disabled'} onclick="buySpecialRoom('${r.id}')">${ok?(lv?'UP ':'BUILD ')+fmt(cost(r)):'LOCKED'}</button></div></article>`}
function sideCard(r){const lv=level(r),ok=unlocked(r);return `<article class="specialRoom ${ok?'ready':'locked'}"><div class="specialLock">${ok?'':'🔒'}</div><i>${r.icon}</i><div><b>${r.name} ${lv?'LV '+lv:''}</b><small>${r.desc}</small><em>${status(r)}</em></div><button ${ok?'':'disabled'} onclick="buySpecialRoom('${r.id}')">${ok?(lv?'UP ':'BUILD ')+fmt(cost(r)):'LOCKED'}</button></article>`}
function renderBuild(){const body=document.getElementById('drawerBody'),tab=document.querySelector('#tabs .active')?.dataset.tab;if(tab!=='build'||!body)return;document.getElementById('specialRooms')?.remove();const sec=document.createElement('section');sec.id='specialRooms';sec.innerHTML='<h3>CLASSIFIED ROOMS <small>EXPEDITION UNLOCKS</small></h3>'+ROOMS.map(sideCard).join('');body.append(sec)}
function renderMain(){const root=document.getElementById('rooms');if(!root)return;root.querySelectorAll('.specialMainCard').forEach(x=>x.remove());root.insertAdjacentHTML('beforeend',ROOMS.map(mainCard).join(''))}
function renderAll(){renderMain();renderBuild()}
window.buySpecialRoom=buy;window.AfterlightSpecialRooms={buy,rates,renderMain,renderBuild,renderAll,levels:()=>({...S.specialRooms})};
window.addEventListener('afterlight:survivors',renderAll);window.addEventListener('afterlight:state',e=>{if(['room','special-room','expedition'].includes(e.detail?.reason))renderAll()});setTimeout(renderAll,150);
})();