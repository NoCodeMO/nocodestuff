(()=>{'use strict';
const ids=[['coins','cps'],['food','foodps'],['water','waterps'],['power','powerps'],['science','scienceps']];
function rateFrom(id){const el=document.getElementById(id);if(!el)return 0;const m=(el.textContent||'').replace(',','.').match(/\+([\d.]+)/);return m?parseFloat(m[1]):0}
function pulse(valueId,rateId){const v=document.getElementById(valueId);if(!v)return;const card=v.closest('.resource');if(!card)return;const r=rateFrom(rateId);if(!(r>0))return;card.classList.remove('resourcePulse');void card.offsetWidth;card.classList.add('resourcePulse');setTimeout(()=>card.classList.remove('resourcePulse'),160);const p=document.createElement('span');p.className='gainPop';p.textContent='+'+(r<10?r.toFixed(1):Math.round(r));card.appendChild(p);setTimeout(()=>p.remove(),900)}
setInterval(()=>ids.forEach(x=>pulse(...x)),1000);
})();