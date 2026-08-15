(()=>{'use strict';
const ST=window.AfterlightState,S=ST?.get?.();
const SRC='https://opengameart.org/sites/default/files/biohazardsextended.ogg';
const audio=new Audio(SRC);audio.loop=true;audio.preload='auto';audio.volume=.18;audio.playsInline=true;
let enabled=S?.settings?.music!==false,musicUnlocked=false;
const button=document.createElement('button');button.id='musicToggle';button.type='button';
function label(){button.textContent=enabled?'♫ MUSIC ON':'♫ MUSIC OFF';button.classList.toggle('off',!enabled)}
async function play(){if(!enabled)return false;try{await audio.play();musicUnlocked=true;return true}catch{return false}}
function pause(){audio.pause()}
function persist(){if(S?.settings)S.settings.music=enabled;ST?.save?.();localStorage.setItem('afterlight_music',enabled?'on':'off')}
button.onclick=async event=>{event.stopPropagation();enabled=!enabled;persist();label();if(enabled)await play();else pause()};document.body.append(button);label();

let context=null,lastSound=0;
const AudioContext=window.AudioContext||window.webkitAudioContext;
function unlockUi(){if(!AudioContext)return null;if(!context)context=new AudioContext();if(context.state==='suspended')context.resume().catch(()=>{});return context}
function tone(frequency,duration=.045,volume=.025,delay=0,type='sine'){
  const ctx=unlockUi();if(!ctx)return false;
  const start=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.006);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain).connect(ctx.destination);osc.start(start);osc.stop(start+duration+.01);return true;
}
function uiSound(kind='tap'){
  const now=performance.now();if(kind==='tap'&&now-lastSound<45)return false;lastSound=now;
  if(kind==='confirm'){tone(420,.055,.022,0,'triangle');tone(630,.07,.018,.045,'triangle');return true}
  if(kind==='close')return tone(250,.04,.018,0,'triangle');
  if(kind==='nav')return tone(380,.038,.018,0,'sine');
  return tone(320,.035,.016,0,'triangle');
}
function buttonKind(target){if(target.matches('#closeDrawer,#missionClose,#appModeX,.installModal button'))return'close';if(target.closest('#tabs')||target.id==='missionNav')return'nav';return'tap'}
function onUiPointer(event){const target=event.target.closest?.('button,[role="button"]');if(!target||target.disabled||target.closest('#scene'))return;unlockUi();uiSound(buttonKind(target))}
document.addEventListener('pointerdown',onUiPointer,true);
window.addEventListener('afterlight:state',event=>{if(['room','special-room','mission'].includes(event.detail?.reason))uiSound('confirm')});
document.body.dataset.uiAudio='ready';

function unlockMusic(){if(musicUnlocked)return;if(enabled)play();if(musicUnlocked)removeMusicUnlock()}
function removeMusicUnlock(){document.removeEventListener('pointerdown',unlockMusic,true);document.removeEventListener('touchstart',unlockMusic,true)}
document.addEventListener('pointerdown',unlockMusic,true);document.addEventListener('touchstart',unlockMusic,{capture:true,passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(enabled)play()});
window.AfterlightAudio={play,pause,isEnabled:()=>enabled,setEnabled:value=>{enabled=!!value;persist();label();return enabled?play():(pause(),Promise.resolve(false))},unlockUi,uiSound};
})();
