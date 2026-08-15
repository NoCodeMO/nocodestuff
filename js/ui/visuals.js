(()=>{'use strict';
const scene=document.getElementById('scene'),CFG=window.AfterlightConfig,NUM=window.AfterlightNumbers;if(!scene||!CFG||!NUM)return;
const WORLD_LAYERS=[
  ['worldSky','assets/combat-sky.webp'],
  ['worldClouds','assets/combat-clouds.webp'],
  ['worldCity','assets/combat-city.webp'],
  ['worldBunker','assets/combat-bunker-clean.webp'],
  ['worldGround','assets/combat-ground.webp']
];
const stage=document.createElement('div');stage.id='spriteStage';stage.dataset.parallaxLayers=String(WORLD_LAYERS.length);
const world=document.createElement('div');world.className='parallaxWorld';world.setAttribute('aria-hidden','true');
for(const [className,src] of WORLD_LAYERS){const layer=document.createElement('div');layer.className='parallaxLayer '+className;const image=document.createElement('img');image.src=src;image.alt='';image.decoding='async';image.draggable=false;layer.append(image);world.append(layer)}
stage.append(world);
const survivor=document.createElement('img');survivor.className='survivorSprite';survivor.alt='Survivor';survivor.src='assets/survivor-final.webp';
const enemyUnit=document.createElement('div');enemyUnit.className='enemyUnit';enemyUnit.setAttribute('aria-live','polite');
const enemyGlow=document.createElement('i');enemyGlow.className='enemyGlow';enemyGlow.setAttribute('aria-hidden','true');
const enemyStack=document.createElement('div');enemyStack.className='enemyStack';enemyUnit.append(enemyGlow,enemyStack);
const muzzle=document.createElement('i');muzzle.className='muzzleFx';const impact=document.createElement('i');impact.className='impactFx';stage.append(survivor,enemyUnit,muzzle,impact);scene.prepend(stage);
const layerImages=[...world.querySelectorAll('img')];Promise.allSettled(layerImages.map(image=>image.decode?.()||Promise.resolve())).then(()=>stage.classList.add('worldReady'));
for(const type of CFG.ENEMIES||[]){const preload=new Image();preload.src=type.asset}

const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)');let parallaxFrame=0,nextX=0,nextY=0;
function paintParallax(){stage.style.setProperty('--parallax-x',nextX.toFixed(3));stage.style.setProperty('--parallax-y',nextY.toFixed(3));parallaxFrame=0}
function queueParallax(){if(!parallaxFrame)parallaxFrame=requestAnimationFrame(paintParallax)}
function moveParallax(event){if(reducedMotion?.matches||document.documentElement.classList.contains('reducedEffects'))return;const bounds=scene.getBoundingClientRect();if(!bounds.width||!bounds.height)return;nextX=Math.max(-1,Math.min(1,((event.clientX-bounds.left)/bounds.width-.5)*2));nextY=Math.max(-1,Math.min(1,((event.clientY-bounds.top)/bounds.height-.5)*2));queueParallax()}
function resetParallax(){nextX=0;nextY=0;queueParallax()}
scene.addEventListener('pointermove',moveParallax,{passive:true});scene.addEventListener('pointerleave',resetParallax,{passive:true});reducedMotion?.addEventListener?.('change',resetParallax);window.addEventListener('afterlight:settings-changed',resetParallax);

function restart(el,cls){el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls)}
let spawnClearTimer=0;
function clearSpawn(){clearTimeout(spawnClearTimer);spawnClearTimer=0;enemyUnit.classList.remove('spawn')}
enemyUnit.addEventListener('animationend',event=>{if(event.target===enemyUnit&&event.animationName.startsWith('enemyEnter'))clearSpawn()});
function shotFeedback(){clearSpawn();restart(survivor,'shoot');restart(enemyUnit,'hit');restart(muzzle,'fire');restart(impact,'pop');setTimeout(()=>{survivor.classList.remove('shoot');enemyUnit.classList.remove('hit')},180)}
const rewardFmt=NUM.format;
function killRewards(event){const detail=event.detail||{};stage.querySelector('.killRewards')?.remove();enemyUnit.classList.remove('hit');restart(enemyUnit,'dead');const rewards=document.createElement('div');rewards.className='killRewards';rewards.innerHTML=`<b>+${rewardFmt(detail.coins||0)} COINS</b><span>+${rewardFmt(detail.scrap||0)} SCRAP</span>${detail.uranium?`<em class="uraniumDrop">+${detail.uranium} URANIUM CRYSTAL</em>`:''}${detail.core?'<em class="coreDrop">+1 BRUTE CORE</em>':''}`;stage.append(rewards);setTimeout(()=>rewards.remove(),1700)}
function renderEnemy(event){const detail=event.detail||{},maxHorde=CFG.COMBAT?.hordeVisualCount||3,count=Math.min(maxHorde,Math.max(1,Number(detail.visualCount)||1));enemyUnit.dataset.rarity=detail.id||'common';enemyUnit.classList.toggle('horde',!!detail.horde);enemyUnit.classList.toggle('brute',!!detail.brute);enemyUnit.style.setProperty('--enemy-glow',detail.glow||'transparent');enemyUnit.style.setProperty('--enemy-accent',detail.accent||'#b7b4a5');enemyStack.replaceChildren();for(let index=0;index<count;index++){const image=document.createElement('img');image.className='enemySprite';image.src=detail.asset||'assets/enemy-common-drifter.webp';image.alt=index?'':detail.name||'Infected';image.decoding='async';image.draggable=false;enemyStack.append(image)}enemyUnit.dataset.enemyCount=String(count);enemyUnit.classList.remove('dead','hit');restart(enemyUnit,'spawn');clearTimeout(spawnClearTimer);spawnClearTimer=setTimeout(clearSpawn,500);stage.dataset.enemyRarity=detail.id||'common';stage.dataset.enemyHorde=detail.horde?'true':'false';const card=document.getElementById('enemyCard');if(card){card.dataset.rarity=detail.id||'common';card.style.setProperty('--enemy-accent',detail.accent||'#b7b4a5');card.classList.toggle('bossGlow',!!detail.brute)}}
window.addEventListener('afterlight:shot',shotFeedback);window.addEventListener('afterlight:enemy-killed',killRewards);window.addEventListener('afterlight:enemy',renderEnemy);

const pulsePairs=[['coins','cps'],['food','foodps'],['water','waterps'],['power','powerps'],['science','scienceps']];
function rateFrom(id){const el=document.getElementById(id);if(!el)return 0;const match=(el.textContent||'').replace(',','.').match(/\+([\d.]+)/);return match?parseFloat(match[1]):0}
function pulse(valueId,rateId){const value=document.getElementById(valueId),rate=rateFrom(rateId),card=value?.closest('.resource');if(!card||!(rate>0))return;restart(card,'resourcePulse');setTimeout(()=>card.classList.remove('resourcePulse'),160);const pop=document.createElement('span');pop.className='gainPop';pop.textContent='+'+(rate<10?rate.toFixed(1):Math.round(rate));card.append(pop);setTimeout(()=>pop.remove(),900)}
setInterval(()=>pulsePairs.forEach(pair=>pulse(...pair)),1000);

window.AfterlightVisuals={shotFeedback,killRewards,renderEnemy,enemyUnit:()=>enemyUnit,parallaxLayers:()=>WORLD_LAYERS.map(([name,src])=>({name,src}))};
})();
