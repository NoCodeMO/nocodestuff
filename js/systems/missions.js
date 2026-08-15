(()=>{'use strict';
const ST=window.AfterlightState,NUM=window.AfterlightNumbers;if(!ST||!NUM)throw new Error('Mission state dependency missing');
const S=ST.get(),M=S.missions,fmt=NUM.format;

// The original 50 IDs remain unchanged so every existing save keeps its progress.
const LEGACY_MISSIONS=[['k5','Kill 5 infected','kills',5,'coins',75,1],['g2','Generator Level 2','generator',2,'coins',120,1],['w1','Build the Workshop','workshop',1,'scrap',15,1],['b2','Reach Bunker Level 2','bunker',2,'coinMult',1.15,1],['k15','Kill 15 infected','kills',15,'coins',300,2],['g5','Generator Level 5','generator',5,'powerMult',1.25,2],['w5','Workshop Level 5','workshop',5,'scrapMult',1.25,2],['gh1','Build the Greenhouse','greenhouse',1,'food',100,2],['b3','Reach Bunker Level 3','bunker',3,'prodMult',1.15,2],['k50','Kill 50 infected','kills',50,'zombieMult',2,3],['g10','Generator Level 10','generator',10,'powerMult',2,3],['w10','Workshop Level 10','workshop',10,'scrapMult',2,3],['gh5','Greenhouse Level 5','greenhouse',5,'foodMult',1.25,3],['p5','Water Purifier Level 5','purifier',5,'waterMult',1.25,3],['b5','Reach Bunker Level 5','bunker',5,'prodMult',1.25,3],['k100','Kill 100 infected','kills',100,'damageMult',1.25,4],['lab5','Research Lab Level 5','lab',5,'scienceMult',1.5,4],['g25','Generator Level 25','generator',25,'prodMult',1.25,4],['w25','Workshop Level 25','workshop',25,'costMult',.9,4],['b7','Reach Bunker Level 7','bunker',7,'offlineMult',1.25,4],['k250','Kill 250 infected','kills',250,'zombieMult',1.5,5],['gh10','Greenhouse Level 10','greenhouse',10,'foodMult',2,5],['p10','Water Purifier Level 10','purifier',10,'waterMult',2,5],['l10','Living Quarters Level 10','living',10,'coinMult',1.5,5],['b10','Reach Bunker Level 10','bunker',10,'prodMult',1.5,5],['boss10','Defeat 10 Brutes','bosses',10,'damageMult',1.5,6],['lab10','Research Lab Level 10','lab',10,'scienceMult',2,6],['s10','Storage Level 10','storage',10,'prodMult',1.25,6],['t10','Auto Turret Level 10','turret',10,'damageMult',1.5,6],['b15','Reach Bunker Level 15','bunker',15,'zombieMult',2,6],['k500','Kill 500 infected','kills',500,'damageMult',1.5,7],['g50','Generator Level 50','generator',50,'powerMult',3,7],['w50','Workshop Level 50','workshop',50,'prodMult',1.5,7],['gh25','Greenhouse Level 25','greenhouse',25,'foodMult',2,7],['p25','Water Purifier Level 25','purifier',25,'waterMult',2,7],['b20','Reach Bunker Level 20','bunker',20,'prodMult',2,7],['k1000','Kill 1,000 infected','kills',1000,'zombieMult',2,8],['lab25','Research Lab Level 25','lab',25,'scienceMult',2,8],['s25','Storage Level 25','storage',25,'costMult',.85,8],['t25','Auto Turret Level 25','turret',25,'damageMult',2,8],['b25','Reach Bunker Level 25','bunker',25,'offlineMult',2,8],['boss50','Defeat 50 Brutes','bosses',50,'zombieMult',2,9],['l25','Living Quarters Level 25','living',25,'coinMult',2,9],['rooms250','Reach 250 combined room levels','roomtotal',250,'prodMult',2,9],['k5000','Kill 5,000 infected','kills',5000,'damageMult',2,9],['b50','Reach Bunker Level 50','bunker',50,'prodMult',3,10],['rooms500','Reach 500 combined room levels','roomtotal',500,'costMult',.75,10],['boss100','Defeat 100 Brutes','bosses',100,'zombieMult',3,10],['k25000','Kill 25,000 infected','kills',25000,'zombieMult',3,10],['master','Reach Bunker Level 100','bunker',100,'prodMult',5,10]];

const CHAPTER_NAMES=['PERIMETER WATCH','RUST BELT','ASH DISTRICT','NIGHT SIGNAL','DEAD HIGHWAY','IRON QUARANTINE','BLACK RAIN','SILENT METRO','RED HORIZON','BROKEN CITADEL','FALLOUT FRONTIER','VOID SECTOR','LAST FREQUENCY','OMEGA TERRITORY','AFTERLIGHT ETERNAL'];
const CHAPTER_LEVELS=[12,16,20,25,30,36,43,51,60,72,86,103,123,148,180];
const CHAPTER_KILLS=[40000,65000,105000,170000,275000,450000,750000,1250000,2100000,3500000,6000000,10000000,17000000,29000000,50000000];
const ROOM_PAIRS=[['generator','workshop'],['greenhouse','purifier'],['lab','living'],['storage','turret']];
const ROOM_NAMES={generator:'Power Generator',workshop:'Workshop',greenhouse:'Greenhouse',purifier:'Water Purifier',lab:'Research Lab',living:'Living Quarters',storage:'Storage',turret:'Auto Turret'};
const RARITY_ROTATION=[['uncommon',.12],['rare',.06],['epic',.025],['legendary',.01],['rare',.06]];

function chapterMissions(index){
  const number=index+1,id=String(number).padStart(2,'0'),name=CHAPTER_NAMES[index],level=CHAPTER_LEVELS[index],kills=CHAPTER_KILLS[index],unlock=index?CHAPTER_LEVELS[index-1]:10;
  const rooms=ROOM_PAIRS[index%ROOM_PAIRS.length],roomLevel=Math.ceil(level*.58),roomTotal=(level-1)*4+12,research=Math.round(6+Math.pow(number,1.55)*4),bosses=Math.ceil(kills*.006),hordes=Math.ceil(kills*.07),shots=Math.ceil(kills*5);
  const [rarity,rarityShare]=RARITY_ROTATION[index%RARITY_ROTATION.length],rarityTarget=Math.ceil(kills*rarityShare),coinHours=.18+number*.025,scrapHours=.12+number*.012;
  return [
    [`ops-${id}-kills`,`${name}: Thin the Dead`,'kills',kills,'coinCache',coinHours,unlock,name],
    [`ops-${id}-bunker`,`${name}: Raise Command`,'bunker',level,'prodMult',1.025,unlock,name],
    [`ops-${id}-rooms`,`${name}: Expand Infrastructure`,'roomtotal',roomTotal,'scrapCache',scrapHours,unlock,name],
    [`ops-${id}-${rooms[0]}`,`${name}: Overclock ${ROOM_NAMES[rooms[0]]}`,rooms[0],roomLevel,'coinCache',.12+number*.012,unlock,name],
    [`ops-${id}-${rooms[1]}`,`${name}: Reinforce ${ROOM_NAMES[rooms[1]]}`,rooms[1],roomLevel+3,'scrapCache',.1+number*.01,unlock,name],
    [`ops-${id}-brutes`,`${name}: Break the Brutes`,'bosses',bosses,'zombieMult',1.03,unlock,name],
    [`ops-${id}-hordes`,`${name}: Scatter the Hordes`,'hordes',hordes,'damageMult',1.03,unlock,name],
    [`ops-${id}-${rarity}`,`${name}: Track ${rarity.toUpperCase()}`,'rarity:'+rarity,rarityTarget,'coinMult',1.02,unlock,name],
    [`ops-${id}-research`,`${name}: Complete Research`,'researchtotal',research,'scienceMult',1.025,unlock,name],
    [`ops-${id}-shots`,`${name}: Maintain Fire`,'shots',shots,'costMult',.995,unlock,name]
  ];
}

const OPERATIONS_MISSIONS=CHAPTER_NAMES.flatMap((_,index)=>chapterMissions(index));
const Q=[...LEGACY_MISSIONS,...OPERATIONS_MISSIONS].sort((a,b)=>a[6]-b[6]);
const roomTotal=()=>Object.values(S.rooms||{}).reduce((sum,value)=>sum+(Number(value)||0),0);
const researchTotal=()=>Object.values(S.research||{}).reduce((sum,value)=>sum+(Number(value)||0),0);
const val=q=>q[2]==='kills'?(S.kills||0):q[2]==='bosses'?(S.stats?.bosses||0):q[2]==='hordes'?(S.stats?.hordes||0):q[2]==='shots'?(S.stats?.clicks||0):q[2]==='bunker'?(S.bunker||1):q[2]==='roomtotal'?roomTotal():q[2]==='researchtotal'?researchTotal():q[2].startsWith('rarity:')?(S.stats?.rarityKills?.[q[2].slice(7)]||0):(S.rooms?.[q[2]]||0);

function baseRate(resource){const rate=Number(window.AfterlightGame?.rates?.()?.[resource]||0),dealer=Math.max(1,Number(window.AfterlightMerchant?.multiplier?.(resource)||1));return rate/dealer}
function cachePayout(q){
  if(!['coinCache','scrapCache'].includes(q[4]))return null;
  const resource=q[4]==='coinCache'?'coins':'scrap',unlock=Math.max(1,q[6]),floor=resource==='coins'?350*Math.pow(unlock,2.3):8*Math.pow(unlock,1.55);
  return {resource,amount:Math.max(1,Math.floor(floor),Math.floor(baseRate(resource)*3600*q[5]))};
}
function reduction(value){const percent=(1-value)*100;return percent<1?percent.toFixed(1):String(Math.round(percent))}
function reward(q,payout=cachePayout(q)){if(payout)return `${fmt(payout.amount)} ${payout.resource.toUpperCase()} · ECONOMY CACHE`;return ({coins:`${fmt(q[5])} COINS`,scrap:`${fmt(q[5])} SCRAP`,food:`${fmt(q[5])} FOOD`,coinMult:`x${q[5]} ALL COINS`,zombieMult:`x${q[5]} ZOMBIE BOUNTY`,prodMult:`x${q[5]} ALL PRODUCTION`,powerMult:`x${q[5]} POWER`,scrapMult:`x${q[5]} SCRAP`,foodMult:`x${q[5]} FOOD`,waterMult:`x${q[5]} WATER`,scienceMult:`x${q[5]} SCIENCE`,damageMult:`x${q[5]} DAMAGE`,costMult:`${reduction(q[5])}% CHEAPER UPGRADES`,offlineMult:`x${q[5]} OFFLINE GAINS`}[q[4]]||q[4])}
const uraniumReward=q=>Math.max(1,Math.min(6,1+Math.floor((Math.max(1,q[6])-1)/25)));
const eligible=q=>(S.bunker||1)>=q[6]&&!M.claimed.includes(q[0]);
const completion=q=>Math.min(1,val(q)/q[3]);
function activeMissions(){return Q.filter(eligible).sort((a,b)=>{const readyA=completion(a)>=1,readyB=completion(b)>=1;if(readyA!==readyB)return readyA?-1:1;return a[6]-b[6]||completion(b)-completion(a)}).slice(0,5)}
function celebrate(q,label){const crystals=uraniumReward(q),element=document.createElement('div');element.className='missionWin';element.innerHTML=`<small>MISSION COMPLETE</small><b>${q[1]}</b><span>REWARDS SECURED</span><strong>${label}</strong><em>◆ +${crystals} URANIUM CRYSTAL${crystals===1?'':'S'}</em>`;document.body.append(element);setTimeout(()=>element.classList.add('show'),20);setTimeout(()=>{element.classList.remove('show');setTimeout(()=>element.remove(),400)},2900)}
function grant(q,state){const crystals=uraniumReward(q),payout=cachePayout(q),label=reward(q,payout);M.claimed.push(q[0]);state.uranium=(state.uranium||0)+crystals;state.stats.uraniumEarned=(state.stats.uraniumEarned||0)+crystals;if(payout){state[payout.resource]=(state[payout.resource]||0)+payout.amount;if(payout.resource==='coins')state.total=(state.total||0)+payout.amount}else if(['coins','scrap','food'].includes(q[4])){state[q[4]]=(state[q[4]]||0)+q[5];if(q[4]==='coins')state.total=(state.total||0)+q[5]}else M.bonuses[q[4]]=(M.bonuses[q[4]]||1)*q[5];return{q,crystals,payout,label}}
function claim(q){
  if(!q||M.claimed.includes(q[0])||val(q)<q[3])return false;
  let result;ST.update('mission',state=>{result=grant(q,state)});
  window.dispatchEvent(new CustomEvent('afterlight:mission-claimed',{detail:{id:q[0],reward:result.label,uranium:result.crystals,batch:false}}));celebrate(q,result.label);render();window.AfterlightGame?.hud?.();window.AfterlightGame?.renderRooms?.();return true;
}
function celebrateAll(results,totals){document.querySelector('.missionWin')?.remove();const summary=[[totals.coins,'COINS'],[totals.scrap,'SCRAP'],[totals.food,'FOOD']].filter(([amount])=>amount>0).map(([amount,label])=>fmt(amount)+' '+label).join(' · ')||(totals.permanent+' PERMANENT UPGRADES'),element=document.createElement('div');element.className='missionWin missionWinBatch';element.innerHTML=`<small>MISSION CACHE OPENED</small><b>${results.length} MISSIONS CLAIMED</b><span>ALL REWARDS SECURED</span><strong>${summary}</strong><em>◆ +${totals.uranium} URANIUM CRYSTALS</em>`;document.body.append(element);setTimeout(()=>element.classList.add('show'),20);setTimeout(()=>{element.classList.remove('show');setTimeout(()=>element.remove(),400)},3200)}
function claimAll(){const ready=Q.filter(eligible).filter(q=>val(q)>=q[3]);if(!ready.length)return false;const results=[];ST.update('missions-batch',state=>ready.forEach(q=>results.push(grant(q,state))));const totals=results.reduce((out,result)=>{out.uranium+=result.crystals;if(result.payout)out[result.payout.resource]+=result.payout.amount;else if(['coins','scrap','food'].includes(result.q[4]))out[result.q[4]]+=result.q[5];else out.permanent+=1;return out},{coins:0,scrap:0,food:0,uranium:0,permanent:0});window.dispatchEvent(new CustomEvent('afterlight:mission-claimed',{detail:{batch:true,count:results.length,ids:results.map(result=>result.q[0]),uranium:totals.uranium,reward:results.length+' mission rewards'}}));celebrateAll(results,totals);render();window.AfterlightGame?.hud?.();window.AfterlightGame?.renderRooms?.();return true}
function render(){
  const qs=activeMissions(),ready=Q.filter(eligible).filter(q=>val(q)>=q[3]).length,complete=M.claimed.length,progress=Math.min(100,complete/Q.length*100);let box=document.getElementById('missionBox');
  if(!box){box=document.createElement('aside');box.id='missionBox';box.className='navMissionBox';document.body.append(box)}
  const badge=document.getElementById('missionBadge');if(badge){badge.textContent=ready||'';badge.classList.toggle('visible',!!ready)}
  box.dataset.missionCount=String(Q.length);box.innerHTML=`<div class="missionPanel"><header><b>MISSION LOG</b><small>${complete}/${Q.length} COMPLETE</small><button id="missionClose">×</button></header><div class="missionCampaign"><span><b>200 AFTERLIGHT DIRECTIVES</b><small>15 NEW OPERATIONS CHAPTERS · 150 NEW MISSIONS</small></span><div><i style="width:${progress}%"></i></div></div>${ready?`<div class="missionClaimBar"><span><b>${ready} REWARD${ready===1?'':'S'} READY</b><small>SECURE EVERY COMPLETED DIRECTIVE AT ONCE</small></span><button id="missionClaimAll">CLAIM ALL · ${ready}</button></div>`:''}${qs.map(q=>{const value=Math.min(q[3],val(q)),done=value>=q[3],crystals=uraniumReward(q);return `<article class="${done?'done':''}"><em>${q[7]||'FOUNDATION'}</em><b>${q[1]}</b><small>${fmt(value)} / ${fmt(q[3])}</small><div><i style="width:${Math.min(100,value/q[3]*100)}%"></i></div><span>${reward(q)} <em>◆ +${crystals}</em></span>${done?`<button data-q="${q[0]}">CLAIM</button>`:''}</article>`}).join('')||'<p>Raise your Bunker Level to discover new missions.</p>'}</div>`;
  box.querySelector('#missionClose').onclick=()=>box.classList.remove('open');const claimAllButton=box.querySelector('#missionClaimAll');if(claimAllButton)claimAllButton.onclick=claimAll;box.querySelectorAll('[data-q]').forEach(button=>button.onclick=()=>claim(Q.find(q=>q[0]===button.dataset.q)));
}

if(!S.merchant.legacyMissionGrantDone){const legacy=M.claimed.reduce((sum,id)=>{const mission=Q.find(q=>q[0]===id);return sum+(mission?uraniumReward(mission):0)},0);ST.update('mission-crystal-migration',state=>{state.merchant.legacyMissionGrantDone=true;if(legacy){state.uranium=(state.uranium||0)+legacy;state.stats.uraniumEarned=(state.stats.uraniumEarned||0)+legacy}})}
window.AfterlightBonuses=()=>({...M.bonuses});window.AfterlightMissions={render,claim,claimAll,all:()=>Q.map(mission=>[...mission]),crystalReward:mission=>uraniumReward(mission),progress:()=>({complete:M.claimed.length,total:Q.length})};
const nav=document.getElementById('missionNav');if(nav)nav.onclick=()=>{document.querySelectorAll('#tabs button').forEach(button=>button.classList.remove('active'));nav.classList.add('active');document.getElementById('drawer')?.classList.add('hidden');render();document.getElementById('missionBox')?.classList.add('open')};
window.addEventListener('afterlight:state',render);setInterval(render,1000);render();
})();

