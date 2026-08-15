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
const survivorUnit=document.createElement('div');survivorUnit.className='survivorUnit';survivorUnit.dataset.muzzleAnchor='77.5% 20.5%';
const survivor=document.createElement('img');survivor.className='survivorSprite';survivor.alt='Survivor';survivor.src='assets/survivor-ranger.png';survivor.decoding='async';survivor.draggable=false;
const enemyUnit=document.createElement('div');enemyUnit.className='enemyUnit';enemyUnit.setAttribute('aria-live','polite');
const enemyGlow=document.createElement('i');enemyGlow.className='enemyGlow';enemyGlow.setAttribute('aria-hidden','true');
const enemyStack=document.createElement('div');enemyStack.className='enemyStack';enemyUnit.append(enemyGlow,enemyStack);
const muzzle=document.createElement('i');muzzle.className='muzzleFx';muzzle.setAttribute('aria-hidden','true');survivorUnit.append(survivor,muzzle);const impact=document.createElement('i');impact.className='impactFx';const streakHud=document.createElement('aside');streakHud.id='combatStreak';streakHud.setAttribute('aria-live','polite');stage.append(survivorUnit,enemyUnit,impact,streakHud);scene.prepend(stage);
stage.dataset.survivorAsset='survivor-ranger.png';
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
let damageFloatIndex=0;
function damageFloat(event){const detail=event.detail||{},damage=Math.max(0,Number(detail.damage)||0);if(!damage)return;const stageRect=stage.getBoundingClientRect(),enemyRect=enemyUnit.getBoundingClientRect();if(!stageRect.width||!enemyRect.width)return;const float=document.createElement('b'),offsets=[-.14,.08,-.04,.16,-.1,0];float.className='damageNumber'+(detail.critical?' critical':'');float.setAttribute('aria-hidden','true');float.textContent=(detail.critical?'CRIT -':'-')+NUM.format(damage);float.style.left=(enemyRect.left-stageRect.left+enemyRect.width*(.5+offsets[damageFloatIndex%offsets.length]))+'px';float.style.top=(enemyRect.top-stageRect.top+enemyRect.height*.28)+'px';damageFloatIndex+=1;stage.append(float);const active=stage.querySelectorAll('.damageNumber');if(active.length>8)active[0].remove();setTimeout(()=>float.remove(),760)}
function shotFeedback(event){clearSpawn();const critical=!!event.detail?.critical;impact.classList.toggle('critical',critical);restart(survivorUnit,'shoot');restart(enemyUnit,'hit');restart(muzzle,'fire');restart(impact,'pop');damageFloat(event);setTimeout(()=>{survivorUnit.classList.remove('shoot');enemyUnit.classList.remove('hit');impact.classList.remove('critical')},180)}
const rewardFmt=NUM.format;
function killRewards(event){const detail=event.detail||{};stage.querySelector('.killRewards')?.remove();enemyUnit.classList.remove('hit');restart(enemyUnit,'dead');const rewards=document.createElement('div');rewards.className='killRewards';rewards.innerHTML=`<b>+${rewardFmt(detail.coins||0)} COINS</b><span>+${rewardFmt(detail.scrap||0)} SCRAP</span>${detail.streakMultiplier>1?`<em class="streakDrop">CHAIN ×${Number(detail.streakMultiplier).toFixed(2)}</em>`:''}${detail.uranium?`<em class="uraniumDrop">+${detail.uranium} URANIUM CRYSTAL</em>`:''}${detail.core?'<em class="coreDrop">+1 BRUTE CORE</em>':''}`;stage.append(rewards);setTimeout(()=>rewards.remove(),1700)}
let streakTimer=0,streakExpiry=0;
function renderStreak(event){const detail=event.detail||{},count=Math.max(1,Number(detail.count)||1),multiplier=Math.max(1,Number(detail.multiplier)||1),windowMs=Math.max(1000,Number(detail.windowMs)||12000);streakExpiry=Number(detail.expiresAt)||Date.now()+windowMs;clearTimeout(streakTimer);streakHud.style.setProperty('--streak-duration',windowMs+'ms');streakHud.innerHTML=`<small>${count===1?'CHAIN START':'KILL CHAIN · '+count}</small><b>×${multiplier.toFixed(2)}</b><div><i></i></div>`;restart(streakHud,'show');streakTimer=setTimeout(()=>{if(Date.now()>=streakExpiry)streakHud.classList.remove('show')},windowMs+80)}
function roomMilestoneCelebrate(event){const detail=event.detail||{},milestone=detail.milestone,room=CFG.ROOMS?.[detail.id];if(!milestone||!room)return false;document.querySelector('.roomMilestoneWin')?.remove();const colors={CALIBRATED:'#9fbd50',INDUSTRIAL:'#62a6dc',FORTIFIED:'#ab6bd6',MASTERWORK:'#e8bd47'},element=document.createElement('section');element.className='roomMilestoneWin';element.style.setProperty('--milestone-color',colors[milestone.tier]||'#d8b84d');element.innerHTML=`<div class="roomMilestoneCard"><div class="roomMilestoneArt" style="background-image:url('${room.art}')"></div><small>ROOM MILESTONE REACHED</small><b>${room.icon} ${room.name}</b><strong>LEVEL ${milestone.level}</strong><span>${milestone.tier} · PERMANENT ×${milestone.multiplier} OUTPUT</span><div class="roomMilestoneParticles">${'<i></i>'.repeat(14)}</div></div>`;document.body.append(element);requestAnimationFrame(()=>element.classList.add('show'));setTimeout(()=>{element.classList.remove('show');setTimeout(()=>element.remove(),450)},3000);return true}
function renderEnemy(event){const detail=event.detail||{},maxHorde=CFG.COMBAT?.hordeVisualCount||3,count=Math.min(maxHorde,Math.max(1,Number(detail.visualCount)||1));enemyUnit.dataset.rarity=detail.id||'common';enemyUnit.classList.toggle('horde',!!detail.horde);enemyUnit.classList.toggle('brute',!!detail.brute);enemyUnit.style.setProperty('--enemy-glow',detail.glow||'transparent');enemyUnit.style.setProperty('--enemy-accent',detail.accent||'#b7b4a5');enemyStack.replaceChildren();for(let index=0;index<count;index++){const image=document.createElement('img');image.className='enemySprite';image.src=detail.asset||'assets/enemy-common-drifter.webp';image.alt=index?'':detail.name||'Infected';image.decoding='async';image.draggable=false;enemyStack.append(image)}enemyUnit.dataset.enemyCount=String(count);enemyUnit.classList.remove('dead','hit');restart(enemyUnit,'spawn');clearTimeout(spawnClearTimer);spawnClearTimer=setTimeout(clearSpawn,500);stage.dataset.enemyRarity=detail.id||'common';stage.dataset.enemyHorde=detail.horde?'true':'false';const card=document.getElementById('enemyCard');if(card){card.dataset.rarity=detail.id||'common';card.style.setProperty('--enemy-accent',detail.accent||'#b7b4a5');card.classList.toggle('bossGlow',!!detail.brute)}}
window.addEventListener('afterlight:shot',shotFeedback);window.addEventListener('afterlight:enemy-killed',killRewards);window.addEventListener('afterlight:enemy',renderEnemy);window.addEventListener('afterlight:streak',renderStreak);window.addEventListener('afterlight:room-upgraded',roomMilestoneCelebrate);

const pulsePairs=[['coins','cps'],['food','foodps'],['water','waterps'],['power','powerps'],['science','scienceps']];
function rateFrom(id){const el=document.getElementById(id);if(!el)return 0;const match=(el.textContent||'').replace(',','.').match(/\+([\d.]+)/);return match?parseFloat(match[1]):0}
function pulse(valueId,rateId){const value=document.getElementById(valueId),rate=rateFrom(rateId),card=value?.closest('.resource');if(!card||!(rate>0))return;restart(card,'resourcePulse');setTimeout(()=>card.classList.remove('resourcePulse'),160);const pop=document.createElement('span');pop.className='gainPop';pop.textContent='+'+(rate<10?rate.toFixed(1):Math.round(rate));card.append(pop);setTimeout(()=>pop.remove(),900)}
setInterval(()=>pulsePairs.forEach(pair=>pulse(...pair)),1000);

window.AfterlightVisuals={shotFeedback,damageFloat,killRewards,renderEnemy,renderStreak,roomMilestoneCelebrate,enemyUnit:()=>enemyUnit,survivorUnit:()=>survivorUnit,parallaxLayers:()=>WORLD_LAYERS.map(([name,src])=>({name,src}))};
})();

