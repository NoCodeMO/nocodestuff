(()=>{'use strict';
const ST=window.AfterlightState,S=ST?.get?.();
const SRC='https://opengameart.org/sites/default/files/biohazardsextended.ogg';
const audio=new Audio(SRC);audio.loop=true;audio.preload='auto';audio.volume=.18;audio.playsInline=true;
let enabled=S?.settings?.music!==false,effectsEnabled=S?.settings?.uiSfx!==false,musicUnlocked=false;
const button=document.createElement('button');button.id='musicToggle';button.type='button';
function label(){button.textContent=enabled?'♫ MUSIC ON':'♫ MUSIC OFF';button.classList.toggle('off',!enabled)}
async function play(){if(!enabled)return false;try{await audio.play();musicUnlocked=true;return true}catch{return false}}
function pause(){audio.pause()}
function persist(){if(S?.settings)S.settings.music=enabled;ST?.save?.();localStorage.setItem('afterlight_music',enabled?'on':'off')}
button.onclick=async event=>{event.stopPropagation();enabled=!enabled;persist();label();if(enabled)await play();else pause()};document.body.append(button);label();

let context=null,master=null,lastSound=0,lastShot=0,lastVoice=0;
const AudioContext=window.AudioContext||window.webkitAudioContext;
function unlockUi(){if(!AudioContext)return null;if(!context){context=new AudioContext();master=context.createDynamicsCompressor();master.threshold.value=-12;master.knee.value=10;master.ratio.value=5;master.attack.value=.003;master.release.value=.12;master.connect(context.destination)}if(context.state==='suspended')context.resume().catch(()=>{});return context}
function tone(frequency,duration=.055,volume=.07,delay=0,type='sine',endFrequency=frequency){
  if(!effectsEnabled)return false;
  const ctx=unlockUi();if(!ctx)return false;
  const start=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(Math.max(20,endFrequency),start+duration);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.004);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain).connect(master);osc.start(start);osc.stop(start+duration+.01);return true;
}
function noise(duration=.09,volume=.16,delay=0,cutoff=1800){
  if(!effectsEnabled)return false;const ctx=unlockUi();if(!ctx)return false;const length=Math.ceil(ctx.sampleRate*duration),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
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
function cashSound(){tone(740,.07,.075,0,'square',980);tone(1100,.09,.07,.055,'sine',1420);tone(1560,.12,.055,.11,'sine',1900);noise(.045,.035,.03,4200);return true}
function bruteDeathSound(event){if(!event.detail?.brute)return false;noise(.28,.19,.24,520);tone(58,.32,.17,.24,'sine',31);noise(.12,.07,.29,1600);return true}
function rewardSound(kind='mission'){
  if(kind==='expedition'){tone(130,.32,.11,0,'triangle',195);tone(392,.28,.075,.12,'sine',523);tone(523,.3,.075,.3,'sine',659);tone(659,.38,.08,.48,'sine',880);tone(988,.46,.055,.68,'sine',1320);noise(.7,.025,.18,5200);return true}
  tone(330,.2,.085,0,'triangle',440);tone(440,.22,.075,.12,'sine',554);tone(554,.26,.08,.25,'sine',659);tone(740,.38,.065,.4,'sine',988);noise(.38,.02,.18,4600);return true;
}
function researchSound(){tone(262,.22,.07,0,'sine',392);tone(392,.26,.075,.14,'triangle',523);tone(523,.3,.07,.3,'sine',784);tone(1047,.42,.05,.48,'sine',1319);noise(.42,.018,.22,6200);return true}
function merchantSound(){tone(110,.2,.1,0,'sawtooth',165);noise(.16,.045,.02,900);tone(440,.16,.08,.1,'triangle',660);tone(660,.2,.075,.2,'sine',990);tone(990,.28,.065,.34,'sine',1480);tone(1480,.38,.045,.52,'sine',1975);noise(.52,.018,.22,6500);return true}
function carePackageLandSound(){noise(.2,.16,0,720);tone(72,.22,.15,0,'sine',44);tone(185,.24,.055,.045,'triangle',112);noise(.08,.045,.12,2600);return true}
function carePackageOpenSound(){noise(.09,.07,0,2100);tone(180,.12,.09,0,'square',260);tone(392,.18,.075,.08,'triangle',523);tone(523,.2,.075,.19,'sine',698);tone(698,.24,.07,.31,'sine',988);tone(1047,.34,.06,.47,'sine',1480);tone(1568,.45,.045,.67,'sine',2093);noise(.6,.022,.2,6200);return true}
function roomMilestoneSound(event){if(!event.detail?.milestone)return false;tone(196,.18,.07,0,'triangle',294);tone(392,.2,.065,.1,'sine',523);tone(587,.24,.065,.22,'sine',784);tone(988,.34,.05,.36,'sine',1319);noise(.32,.014,.18,5200);return true}
function prestigeSound(){tone(82,.65,.12,0,'sawtooth',123);noise(.42,.055,.02,1150);tone(196,.45,.09,.18,'triangle',294);tone(392,.5,.085,.48,'sine',523);tone(587,.55,.08,.76,'sine',784);tone(784,.62,.075,1.05,'sine',1175);tone(1175,.78,.06,1.38,'sine',1760);tone(1760,.9,.045,1.75,'sine',2349);noise(1.1,.018,.48,6800);return true}
function survivorVoiceBleep(event){const now=performance.now(),detail=event.detail||{},voice=detail.voice||{};if(!effectsEnabled||!context||context.state!=='running'||now-lastVoice<42)return false;lastVoice=now;const base=Math.max(70,Number(voice.base)||170),spread=Math.max(1,Number(voice.spread)||50),code=String(detail.character||'A').charCodeAt(0)||65,index=Math.max(0,Number(detail.index)||0),frequency=base+(code*17+index*29)%spread,wave=['square','triangle','sine'].includes(voice.wave)?voice.wave:'square';return tone(frequency,.038,.021,0,wave,frequency*.91)}
function buttonKind(target){if(target.matches('#closeDrawer,#missionClose,#appModeX,.installModal button'))return'close';if(target.closest('#tabs')||target.id==='missionNav')return'nav';return'tap'}
function onUiPointer(event){const target=event.target.closest?.('button,[role="button"]');if(!target||target.disabled||target.closest('#scene'))return;unlockUi();uiSound(buttonKind(target))}
document.addEventListener('pointerdown',onUiPointer,true);
window.addEventListener('afterlight:state',event=>{if(['room','special-room'].includes(event.detail?.reason))uiSound('confirm')});
window.addEventListener('afterlight:shot',gunshot);
window.addEventListener('afterlight:enemy-killed',cashSound);
window.addEventListener('afterlight:enemy-killed',bruteDeathSound);
window.addEventListener('afterlight:mission-claimed',()=>rewardSound('mission'));
window.addEventListener('afterlight:expedition-complete',()=>rewardSound('expedition'));
window.addEventListener('afterlight:research-complete',researchSound);
window.addEventListener('afterlight:merchant-purchase',merchantSound);
window.addEventListener('afterlight:care-package-landed',carePackageLandSound);
window.addEventListener('afterlight:care-package-opened',carePackageOpenSound);
window.addEventListener('afterlight:room-upgraded',roomMilestoneSound);
window.addEventListener('afterlight:dev-reward-claimed',()=>rewardSound('expedition'));
window.addEventListener('afterlight:survivor-dialogue-letter',survivorVoiceBleep);
window.addEventListener('afterlight:prestige-complete',prestigeSound);
window.addEventListener('afterlight:prestige-contract',()=>rewardSound('mission'));
window.addEventListener('afterlight:prestige-room',()=>uiSound('confirm'));
document.body.dataset.uiAudio='ready';

function unlockMusic(){if(musicUnlocked)return;if(enabled)play();if(musicUnlocked)removeMusicUnlock()}
function removeMusicUnlock(){document.removeEventListener('pointerdown',unlockMusic,true);document.removeEventListener('touchstart',unlockMusic,true)}
document.addEventListener('pointerdown',unlockMusic,true);document.addEventListener('touchstart',unlockMusic,{capture:true,passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(enabled)play()});
window.AfterlightAudio={play,pause,isEnabled:()=>enabled,isEffectsEnabled:()=>effectsEnabled,setEnabled:value=>{enabled=!!value;persist();label();return enabled?play():(pause(),Promise.resolve(false))},setEffectsEnabled:value=>{effectsEnabled=!!value;if(S?.settings)S.settings.uiSfx=effectsEnabled;ST?.save?.();if(effectsEnabled)setTimeout(()=>uiSound('confirm'),0);return effectsEnabled},unlockUi,uiSound,gunshot,cashSound,bruteDeathSound,rewardSound,researchSound,merchantSound,carePackageLandSound,carePackageOpenSound,roomMilestoneSound,prestigeSound,survivorVoiceBleep};
})();
