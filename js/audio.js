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

let context=null,master=null,lastSound=0,lastShot=0;
const AudioContext=window.AudioContext||window.webkitAudioContext;
function unlockUi(){if(!AudioContext)return null;if(!context){context=new AudioContext();master=context.createDynamicsCompressor();master.threshold.value=-12;master.knee.value=10;master.ratio.value=5;master.attack.value=.003;master.release.value=.12;master.connect(context.destination)}if(context.state==='suspended')context.resume().catch(()=>{});return context}
function tone(frequency,duration=.055,volume=.07,delay=0,type='sine',endFrequency=frequency){
  const ctx=unlockUi();if(!ctx)return false;
  const start=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),start+duration);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.004);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain).connect(master);osc.start(start);osc.stop(start+duration+.01);return true;
}
function noise(duration=.09,volume=.16,delay=0,cutoff=1800){
  const ctx=unlockUi();if(!ctx)return false;const length=Math.ceil(ctx.sampleRate*duration),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
  const start=ctx.currentTime+delay,source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=cutoff;gain.gain.setValueAtTime(volume,start);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);source.connect(filter).connect(gain).connect(master);source.start(start);return true;
}
const UI_VOLUME=1.1;
const uiTone=(frequency,duration,volume,delay,type,endFrequency)=>tone(frequency,duration,volume*UI_VOLUME,delay,type,endFrequency);
function uiSound(kind='tap'){
  const now=performance.now();if(kind==='tap'&&now-lastSound<45)return false;lastSound=now;
  if(kind==='confirm'){uiTone(440,.075,.09,0,'triangle',520);uiTone(660,.09,.075,.045,'sine',760);return true}
  if(kind==='close'){uiTone(360,.055,.065,0,'triangle',210);return true}
  if(kind==='nav'){uiTone(420,.05,.07,0,'triangle',510);uiTone(720,.035,.035,.025,'sine',650);return true}
  uiTone(520,.045,.065,0,'triangle',420);uiTone(900,.025,.025,.012,'sine',760);return true;
}
function gunshot(){
  const now=performance.now();if(now-lastShot<38)return false;lastShot=now;noise(.085,.2,0,2400);tone(150,.085,.16,0,'sawtooth',48);noise(.055,.07,.025,800);return true;
}
function buttonKind(target){if(target.matches('#closeDrawer,#missionClose,#appModeX,.installModal button'))return'close';if(target.closest('#tabs')||target.id==='missionNav')return'nav';return'tap'}
function onUiPointer(event){const target=event.target.closest?.('button,[role="button"]');if(!target||target.disabled||target.closest('#scene'))return;unlockUi();uiSound(buttonKind(target))}
document.addEventListener('pointerdown',onUiPointer,true);
window.addEventListener('afterlight:state',event=>{if(['room','special-room','mission'].includes(event.detail?.reason))uiSound('confirm')});
window.addEventListener('afterlight:shot',gunshot);
document.body.dataset.uiAudio='ready';

function unlockMusic(){if(musicUnlocked)return;if(enabled)play();if(musicUnlocked)removeMusicUnlock()}
function removeMusicUnlock(){document.removeEventListener('pointerdown',unlockMusic,true);document.removeEventListener('touchstart',unlockMusic,true)}
document.addEventListener('pointerdown',unlockMusic,true);document.addEventListener('touchstart',unlockMusic,{capture:true,passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(enabled)play()});
window.AfterlightAudio={play,pause,isEnabled:()=>enabled,setEnabled:value=>{enabled=!!value;persist();label();return enabled?play():(pause(),Promise.resolve(false))},unlockUi,uiSound,gunshot};
})();
