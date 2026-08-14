(()=>{'use strict';
const sources={generator:'assets/generator-room.b64?v=3',workshop:'assets/workshop-room.b64?v=3'};
const images={};
async function preload(){await Promise.all(Object.entries(sources).map(async([name,url])=>{try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error(r.status);const b64=(await r.text()).trim();images[name]=`url("data:image/webp;base64,${b64}")`}catch(e){console.warn('room art failed',name,e)}}));apply()}
function apply(){for(const [name,img] of Object.entries(images)){document.querySelectorAll('.roomArt.'+name).forEach(el=>{el.style.setProperty('background-image',img,'important');el.style.setProperty('background-size','100% 100%','important');el.style.setProperty('background-position','center','important');el.style.setProperty('background-repeat','no-repeat','important');el.classList.add('realRoomArt')})}}
const rooms=document.getElementById('rooms');if(rooms)new MutationObserver(apply).observe(rooms,{childList:true,subtree:true});
window.addEventListener('resize',apply);window.addEventListener('orientationchange',()=>setTimeout(apply,120));
preload();
})();