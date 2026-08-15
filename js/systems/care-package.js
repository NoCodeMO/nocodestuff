(()=>{'use strict';
const CFG=window.AfterlightConfig,ST=window.AfterlightState,NUM=window.AfterlightNumbers,MERCHANT=window.AfterlightMerchant,GAME=window.AfterlightGame;
if(!CFG||!ST||!NUM||!MERCHANT||!GAME)throw new Error('Care package dependencies missing');
const RULES=CFG.CARE_PACKAGE,S=ST.get(),scene=document.getElementById('scene'),fmt=NUM.format;
if(!RULES||!scene)return;
const testParams=new URLSearchParams(location.search),isLocal=['localhost','127.0.0.1'].includes(location.hostname);
const AIRBORNE_ASSET='assets/care-package-airborne.png',LANDED_ASSET='assets/care-package-crate.png';
const RESOURCE_META={food:{icon:'🌿',label:'FOOD'},water:{icon:'💧',label:'WATER'},power:{icon:'⚡',label:'POWER'},science:{icon:'✦',label:'SCIENCE'}};
let landingTimer=0,tickTimer=0;
const now=()=>Date.now();
const randomBetween=(min,max)=>min+Math.random()*(max-min);
const randomInt=(min,max)=>Math.floor(randomBetween(min,max+1));
const choose=list=>list[Math.floor(Math.random()*list.length)];
function intervalMs(){
  if(isLocal&&testParams.has('carePackageDelay'))return Math.max(200,Math.min(20000,Number(testParams.get('carePackageDelay'))*1000||200));
  return Math.round(randomBetween(RULES.minimumIntervalMs,RULES.maximumIntervalMs));
}
function permanentRate(resource){
  const live=Math.max(0,Number(GAME.rates?.()?.[resource])||0),temporary=Math.max(1,Number(MERCHANT.multiplier?.(resource))||1);
  return live/temporary;
}
function scaledReward(resource,seconds,minValue){
  const rate=permanentRate(resource),amount=rate*randomBetween(seconds[0],seconds[1]);
  return Math.max(minValue,Math.floor(amount));
}
function rollReward(){
  const bunker=Math.max(1,Number(S.bunker)||1),secondary=choose(RULES.secondaryResources),candidates=MERCHANT.freeCandidates?.()||[];
  const forcedBoost=isLocal&&testParams.get('carePackageReward')==='boost',boost=(forcedBoost||Math.random()<RULES.dealerBoostChance)&&candidates.length?choose(candidates).id:null;
  return {
    coins:scaledReward('coins',RULES.coinSeconds,60+bunker*20),
    scrap:scaledReward('scrap',RULES.scrapSeconds,8+Math.ceil(bunker*.6)),
    secondary:{resource:secondary,amount:scaledReward(secondary,RULES.secondarySeconds,4+bunker)},
    uranium:Math.random()<RULES.uraniumChance?randomInt(RULES.uranium[0],RULES.uranium[1]):0,
    boost
  };
}
function scheduleNext(at=now()){
  S.carePackage.nextAt=at+intervalMs();
  ST.save();
  return S.carePackage.nextAt;
}
function active(){return S.carePackage?.active||null}
function removeDrop(){clearTimeout(landingTimer);landingTimer=0;document.getElementById('carePackageDrop')?.remove()}
function spawn(){
  if(active())return false;
  const started=now(),drop={id:`drop-${started}`,spawnedAt:started,landAt:started+RULES.fallMs,expiresAt:started+RULES.fallMs+RULES.visibleMs,reward:rollReward()};
  ST.update('care-package-spawned',state=>{state.carePackage.active=drop;state.carePackage.nextAt=0});
  renderDrop(false);
  window.dispatchEvent(new CustomEvent('afterlight:care-package-spawned',{detail:{id:drop.id,landAt:drop.landAt,expiresAt:drop.expiresAt}}));
  return true;
}
function dustMarkup(){return `<span class="carePackageDust" aria-hidden="true">${'<i></i>'.repeat(9)}</span>`}
function renderDrop(restored=true){
  const drop=active();if(!drop)return false;removeDrop();
  const landed=now()>=drop.landAt,element=document.createElement('button');
  element.id='carePackageDrop';element.type='button';element.className=`carePackageDrop ${landed?'landed':'falling'}`;element.dataset.dropId=drop.id;element.dataset.phase=landed?'landed':'falling';
  element.style.setProperty('--care-fall',Math.max(120,drop.landAt-now())+'ms');element.setAttribute('aria-label',landed?'Open supply drop before it expires':'Supply drop descending');element.disabled=!landed;
  element.innerHTML=`<i class="carePackageGlow" aria-hidden="true"></i><img src="${landed?LANDED_ASSET:AIRBORNE_ASSET}" alt=""><div class="carePackageTimer" aria-live="polite"><small>SUPPLY DROP</small><b data-care-seconds>5.0</b><span>TAP TO OPEN</span><em><i data-care-progress></i></em></div>${landed?'':dustMarkup()}`;
  scene.append(element);element.onclick=open;
  if(!landed)landingTimer=setTimeout(()=>land(drop.id),Math.max(0,drop.landAt-now()));
  else updateTimer(element,drop);
  if(restored)element.dataset.restored='true';
  return true;
}
function land(id){
  const drop=active(),element=document.getElementById('carePackageDrop');if(!drop||drop.id!==id||!element)return false;
  element.disabled=false;element.dataset.phase='landed';element.classList.remove('falling');element.classList.add('landed');element.setAttribute('aria-label','Open supply drop before it expires');
  const image=element.querySelector('img');if(image)image.src=LANDED_ASSET;
  element.querySelector('.carePackageDust')?.remove();element.insertAdjacentHTML('beforeend',dustMarkup());
  window.dispatchEvent(new CustomEvent('afterlight:care-package-landed',{detail:{id:drop.id,expiresAt:drop.expiresAt}}));
  updateTimer(element,drop);return true;
}
function updateTimer(element,drop){
  const remaining=Math.max(0,drop.expiresAt-now()),seconds=element.querySelector('[data-care-seconds]'),progress=element.querySelector('[data-care-progress]');
  if(seconds)seconds.textContent=(remaining/1000).toFixed(1)+'s';if(progress)progress.style.width=(remaining/RULES.visibleMs*100)+'%';
  element.classList.toggle('urgent',remaining<=2000);return remaining;
}
function miss(){
  const drop=active();if(!drop)return false;
  const element=document.getElementById('carePackageDrop');if(element){element.disabled=true;element.classList.add('expired');setTimeout(()=>element.remove(),260)}
  ST.update('care-package-missed',state=>{state.carePackage.active=null;state.carePackage.missed=(state.carePackage.missed||0)+1;state.carePackage.nextAt=now()+intervalMs()});
  window.dispatchEvent(new CustomEvent('afterlight:care-package-missed',{detail:{id:drop.id}}));return true;
}
function rewardRows(reward,offer){
  const secondary=RESOURCE_META[reward.secondary.resource];
  return `<div class="careRewardRows"><article><i>◉</i><span><small>COINS</small><b>+${fmt(reward.coins)}</b></span></article><article><i>⚙</i><span><small>SCRAP</small><b>+${fmt(reward.scrap)}</b></span></article><article><i>${secondary.icon}</i><span><small>${secondary.label}</small><b>+${fmt(reward.secondary.amount)}</b></span></article>${reward.uranium?`<article class="uraniumReward"><i>◆</i><span><small>URANIUM CRYSTAL</small><b>+${reward.uranium}</b></span></article>`:''}${offer?`<article class="dealerReward" style="--care-offer:${offer.accent}"><i>${offer.icon}</i><span><small>FREE DEALER BOOST · 05:00</small><b>${offer.value}</b><em>${offer.name} IS ACTIVE</em></span></article>`:''}</div>`;
}
function reveal(reward,offer){
  document.querySelector('.carePackageReveal')?.remove();const modal=document.createElement('section');modal.className='carePackageReveal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Supply cache rewards');
  modal.innerHTML=`<div class="careRevealCard"><div class="careRevealBeam"></div><img src="${LANDED_ASSET}" alt="Supply crate"><small>SUPPLY CACHE SECURED</small><h2>${offer?'JACKPOT TRANSMISSION':'RESOURCES RECOVERED'}</h2>${rewardRows(reward,offer)}<p>${offer?'The Dealer contract activated immediately. Its timer is already running.':'All recovered supplies are already stored in your bunker.'}</p><button type="button">CONTINUE</button><div class="careRevealParticles" aria-hidden="true">${'<i></i>'.repeat(18)}</div></div>`;
  document.body.append(modal);requestAnimationFrame(()=>modal.classList.add('show'));modal.querySelector('button').onclick=()=>{modal.classList.remove('show');setTimeout(()=>modal.remove(),320)};
}
function open(){
  const drop=active(),element=document.getElementById('carePackageDrop');if(!drop||!element||now()<drop.landAt||now()>=drop.expiresAt)return false;
  element.disabled=true;let offer=drop.reward.boost?MERCHANT.activateFree?.(drop.reward.boost,'care-package'):null;const reward=JSON.parse(JSON.stringify(drop.reward));
  if(drop.reward.boost&&!offer)reward.uranium+=1;
  ST.update('care-package-opened',state=>{
    state.coins=(state.coins||0)+reward.coins;state.total=(state.total||0)+reward.coins;state.scrap=(state.scrap||0)+reward.scrap;
    state[reward.secondary.resource]=(state[reward.secondary.resource]||0)+reward.secondary.amount;state.uranium=(state.uranium||0)+reward.uranium;
    state.stats.uraniumEarned=(state.stats.uraniumEarned||0)+reward.uranium;state.carePackage.active=null;state.carePackage.opened=(state.carePackage.opened||0)+1;state.carePackage.nextAt=now()+intervalMs();
  });
  element.classList.add('opening');setTimeout(()=>element.remove(),360);GAME.hud?.();reveal(reward,offer||null);
  window.dispatchEvent(new CustomEvent('afterlight:care-package-opened',{detail:{id:drop.id,reward,offer:offer||null}}));return true;
}
function tick(){
  const drop=active();
  if(drop){const element=document.getElementById('carePackageDrop');if(!element&&drop.expiresAt>now())renderDrop(true);if(now()>=drop.expiresAt)return miss();if(element&&element.dataset.phase==='landed')updateTimer(element,drop);return}
  if(!Number.isFinite(Number(S.carePackage.nextAt))||S.carePackage.nextAt<=0)scheduleNext();
  if(!document.hidden&&now()>=S.carePackage.nextAt)spawn();
}
function init(){
  if(active()&&active().expiresAt<=now()){S.carePackage.active=null;S.carePackage.missed=(S.carePackage.missed||0)+1;S.carePackage.nextAt=0;ST.save()}
  if(active())renderDrop(true);else if(isLocal&&testParams.get('forceCarePackage')==='1'){S.carePackage.nextAt=now()+120;ST.save()}else if(!S.carePackage.nextAt)scheduleNext();
  tickTimer=setInterval(tick,80);tick();document.body.dataset.carePackageSystem='ready';
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick()});
window.AfterlightCarePackage={spawn,open,miss,rollReward,nextAt:()=>S.carePackage.nextAt,active:()=>active()?JSON.parse(JSON.stringify(active())):null,rules:()=>({...RULES}),assets:()=>({airborne:AIRBORNE_ASSET,landed:LANDED_ASSET})};
init();
})();
