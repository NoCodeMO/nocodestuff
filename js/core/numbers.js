(()=>{'use strict';
const SUFFIXES=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd','Td','Qad','Qid','Sxd','Spd','Ocd','Nod','Vg'];
function trim(value){return value.includes('.')?value.replace(/0+$/,'').replace(/\.$/,''):value}
function format(value){const number=Number(value);if(Number.isNaN(number))return'0';if(!Number.isFinite(number))return number<0?'-∞':'∞';const sign=number<0?'-':'',absolute=Math.abs(number);if(absolute<1000)return sign+Math.floor(absolute);const tier=Math.floor(Math.log10(absolute)/3);if(tier>=SUFFIXES.length)return sign+absolute.toExponential(2).replace('+','');const scaled=absolute/Math.pow(1000,tier),decimals=scaled>=100?0:scaled>=10?1:2;return sign+trim(scaled.toFixed(decimals))+SUFFIXES[tier]}
function formatRate(value){const number=Number(value)||0,absolute=Math.abs(number);if(absolute>=1000)return format(number);if(absolute<.1)return number.toFixed(3);if(absolute<10)return number.toFixed(2);return number.toFixed(1)}
function name(value){const tier=Math.floor(Math.log10(Math.max(1,Math.abs(Number(value)||0)))/3);return ['','THOUSAND','MILLION','BILLION','TRILLION','QUADRILLION','QUINTILLION','SEXTILLION','SEPTILLION','OCTILLION','NONILLION','DECILLION'][tier]||'MASSIVE'}
window.BunkrNumbers=Object.freeze({format,formatRate,name,suffixes:()=>[...SUFFIXES]});
})();
