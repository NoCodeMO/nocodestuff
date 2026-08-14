(()=>{'use strict';
const scene=document.getElementById('scene'),tap=document.getElementById('clickCore');if(!scene)return;
const ASSETS=['survivor2','walker2','runner2','brute2','spitter2','tank2','boss2'];
const urls={};
async function load(name){try{const t=await fetch(`assets/${name}.b64?v=8`).then(r=>{if(!r.ok)throw Error(r.status);return r.text()});urls[name]=`data:image/webp;base64,${t.trim()}`}catch(e){console.warn('sprite load failed',name,e)}}
const stage=document.createElement('div');stage.id='spriteStage';
stage.innerHTML='<div class="worldSky"></div><div class="worldRuins far"></div><div class="worldRuins near"></div><div class="road"></div><div class="bunkerSilhouette"></div>';
const survivor=document.createElement('img');survivor.className='survivorSprite';survivor.alt='Survivor';
const enemy=document.createElement('img');enemy.className='enemySprite';enemy.alt='Infected';
const muzzle=document.createElement('i');muzzle.className='muzzleFx';
const impact=document.createElement('i');impact.className='impactFx';
stage.append(survivor,enemy,muzzle,impact);scene.prepend(stage);
let current='';
function getVisual(){const type=(document.getElementById('enemyType')?.textContent||'').toUpperCase();const lvl=(document.getElementById('enemyLevel')?.textContent||'').toUpperCase();if(type==='BRUTE'&&!/MUTATION\s+\d/.test(lvl))return ['boss2',5,'MUTATION BOSS'];const m=parseInt((lvl.match(/(\d+)/)||[])[1]||'1',10);const cycle=['walker2','runner2','brute2','spitter2','tank2'];const labels=['WALKER','RUNNER','BRUTE','SPITTER','TANK'];const i=(Math.max(1,m)-1)%cycle.length;return [cycle[i],i+1,labels[i]]}
function sync(){const [name,tier,label]=getVisual();if(name===current)return;current=name;enemy.dataset.tier=tier;enemy.classList.remove('spawn');void enemy.offsetWidth;enemy.classList.add('spawn');if(urls[name])enemy.src=urls[name];const et=document.getElementById('enemyType');if(et&&name!=='boss2')et.textContent=label}
function feedback(){survivor.classList.remove('shoot');enemy.classList.remove('hit');muzzle.classList.remove('fire');impact.classList.remove('pop');void stage.offsetWidth;survivor.classList.add('shoot');enemy.classList.add('hit');muzzle.classList.add('fire');impact.classList.add('pop');setTimeout(()=>{survivor.classList.remove('shoot');enemy.classList.remove('hit')},180)}
tap?.addEventListener('pointerdown',feedback);scene.addEventListener('pointerdown',e=>{if(e.target===scene||e.target.id==='game')feedback()});
Promise.all(ASSETS.map(load)).then(()=>{survivor.src=urls.survivor2||'';sync();setInterval(sync,160)});
})();