(()=>{'use strict';
const direct={generator:'assets/generator-room.webp?v=6',workshop:'assets/workshop-room.webp?v=6'};
const fallback={generator:'assets/generator-room.b64?v=6',workshop:'assets/workshop-room.b64?v=6'};
const images={};
function applyOne(name){const img=images[name];if(!img)return;document.querySelectorAll('.roomArt.'+name).forEach(el=>{el.style.setProperty('background-image',img,'important');el.style.setProperty('background-size','100% 100%','important');el.style.setProperty('background-position','center center','important');el.style.setProperty('background-repeat','no-repeat','important');el.classList.add('realRoomArt')})}
function apply(){Object.keys(images).forEach(applyOne)}
function loadDirect(name,url){const img=new Image();img.onload=()=>{images[name]=`url("${url}")`;applyOne(name)};img.onerror=()=>loadFallback(name,fallback[name]);img.src=url}
async function loadFallback(name,url){try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error(r.status);const b64=(await r.text()).replace(/\s+/g,'');if(!b64.startsWith('UklG'))throw Error('invalid webp data');images[name]=`url("data:image/webp;base64,${b64}")`;applyOne(name)}catch(e){console.warn('room art failed',name,e)}}
const rooms=document.getElementById('rooms');if(rooms)new MutationObserver(()=>requestAnimationFrame(apply)).observe(rooms,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.addEventListener('resize',apply);window.addEventListener('orientationchange',()=>setTimeout(apply,120));
loadDirect('generator',direct.generator);loadDirect('workshop',direct.workshop);
})();