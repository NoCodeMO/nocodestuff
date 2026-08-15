(()=>{'use strict';
const ST=window.AfterlightState,S=ST?.get?.();
const SRC='https://opengameart.org/sites/default/files/biohazardsextended.ogg';
const audio=new Audio(SRC);audio.loop=true;audio.preload='auto';audio.volume=.18;audio.playsInline=true;
let enabled=S?.settings?.music!==false,unlocked=false;
const button=document.createElement('button');button.id='musicToggle';button.type='button';
function label(){button.textContent=enabled?'♫ MUSIC ON':'♫ MUSIC OFF';button.classList.toggle('off',!enabled)}
async function play(){if(!enabled)return false;try{await audio.play();unlocked=true;return true}catch{return false}}
function pause(){audio.pause()}
function persist(){if(S?.settings)S.settings.music=enabled;ST?.save?.();localStorage.setItem('afterlight_music',enabled?'on':'off')}
button.onclick=async event=>{event.stopPropagation();enabled=!enabled;persist();label();if(enabled)await play();else pause()};document.body.append(button);label();
function unlock(){if(unlocked)return;if(enabled)play();if(unlocked)removeUnlock()}
function removeUnlock(){document.removeEventListener('pointerdown',unlock,true);document.removeEventListener('touchstart',unlock,true)}
document.addEventListener('pointerdown',unlock,true);document.addEventListener('touchstart',unlock,{capture:true,passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(enabled)play()});
window.AfterlightAudio={play,pause,isEnabled:()=>enabled,setEnabled:value=>{enabled=!!value;persist();label();return enabled?play():(pause(),Promise.resolve(false))}};
})();