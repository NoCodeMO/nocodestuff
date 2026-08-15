(()=>{'use strict';
const scene=document.getElementById('scene');if(!scene)return;
const stage=document.createElement('div');stage.id='spriteStage';stage.innerHTML='<div class="worldSky"></div><div class="worldRuins far"></div><div class="worldRuins near"></div><div class="road"></div><div class="bunkerSilhouette"></div>';
const survivor=document.createElement('img');survivor.className='survivorSprite';survivor.alt='Survivor';survivor.src='assets/survivor-final.webp';
const enemy=document.createElement('img');enemy.className='enemySprite';enemy.alt='Walker';enemy.src='assets/walker-final.webp';enemy.dataset.tier='1';
const muzzle=document.createElement('i');muzzle.className='muzzleFx';const impact=document.createElement('i');impact.className='impactFx';stage.append(survivor,enemy,muzzle,impact);scene.prepend(stage);
function restart(el,cls){el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
function shotFeedback(){restart(survivor,'shoot');restart(enemy,'hit');restart(muzzle,'fire');restart(impact,'pop');setTimeout(()=>{survivor.classList.remove('shoot');enemy.classList.remove('hit')},180)}
const rewardFmt=n=>n<1000?Math.floor(n)+'':n<1e6?(n/1000).toFixed(1)+'K':(n/1e6).toFixed(1)+'M';
function killRewards(event){const detail=event.detail||{};stage.querySelector('.killRewards')?.remove();enemy.classList.remove('hit');restart(enemy,'dead');const rewards=document.createElement('div');rewards.className='killRewards';rewards.innerHTML=`<b>+${rewardFmt(detail.coins||0)} COINS</b><span>+${rewardFmt(detail.scrap||0)} SCRAP</span>`;stage.append(rewards);setTimeout(()=>rewards.remove(),1350)}
window.addEventListener('afterlight:shot',shotFeedback);window.addEventListener('afterlight:enemy-killed',killRewards);window.addEventListener('afterlight:enemy',e=>{const d=e.detail||{},tier=d.boss?5:Math.min(5,1+Math.floor((d.kills||0)/10));enemy.dataset.tier=String(tier);enemy.classList.remove('dead');restart(enemy,'spawn');document.getElementById('enemyCard')?.classList.toggle('bossGlow',!!d.boss)});
const pulsePairs=[['coins','cps'],['food','foodps'],['water','waterps'],['power','powerps'],['science','scienceps']];
function rateFrom(id){const el=document.getElementById(id);if(!el)return 0;const m=(el.textContent||'').replace(',','.').match(/\+([\d.]+)/);return m?parseFloat(m[1]):0}
function pulse(valueId,rateId){const value=document.getElementById(valueId),rate=rateFrom(rateId),card=value?.closest('.resource');if(!card||!(rate>0))return;restart(card,'resourcePulse');setTimeout(()=>card.classList.remove('resourcePulse'),160);const pop=document.createElement('span');pop.className='gainPop';pop.textContent='+'+(rate<10?rate.toFixed(1):Math.round(rate));card.append(pop);setTimeout(()=>pop.remove(),900)}
setInterval(()=>pulsePairs.forEach(pair=>pulse(...pair)),1000);
const direct={generator:'assets/generator-room.webp',workshop:'assets/workshop-room.webp'},fallback={generator:'assets/generator-room.b64',workshop:'assets/workshop-room.b64',greenhouse:'assets/greenhouse-room.b64'},images={};
function applyOne(name){const img=images[name];if(!img)return;document.querySelectorAll('.roomArt.'+name).forEach(el=>{el.style.setProperty('background-image',img,'important');el.style.setProperty('background-size','100% 100%','important');el.style.setProperty('background-position','center center','important');el.style.setProperty('background-repeat','no-repeat','important');el.classList.add('realRoomArt')})}
const apply=()=>Object.keys(images).forEach(applyOne);
function loadDirect(name,url){const img=new Image();img.onload=()=>{images[name]=`url("${url}")`;applyOne(name)};img.onerror=()=>loadFallback(name,fallback[name]);img.src=url}
async function loadFallback(name,url){try{const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error(response.status);const b64=(await response.text()).replace(/\s+/g,'');if(!b64.startsWith('UklG'))throw Error('invalid webp data');images[name]=`url("data:image/webp;base64,${b64}")`;applyOne(name)}catch(error){console.warn('Afterlight room art failed',name,error)}}
const rooms=document.getElementById('rooms');if(rooms)new MutationObserver(()=>requestAnimationFrame(apply)).observe(rooms,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});window.addEventListener('resize',apply);window.addEventListener('orientationchange',()=>setTimeout(apply,120));loadDirect('generator',direct.generator);loadDirect('workshop',direct.workshop);loadFallback('greenhouse',fallback.greenhouse);
window.AfterlightVisuals={applyRoomArt:apply,shotFeedback,killRewards};
})();
