'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'app.css'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),smoke=fs.readFileSync(path.join(root,'scripts','smoke.sh'),'utf8');
const fail=message=>{throw new Error(`Portrait combat: ${message}`)};
for(const [pattern,message] of [
  [/\/\* 23\. Safe portrait combat formations \*\//,'dedicated safe-formation section is missing'],
  [/#scene:has\(\.enemyUnit\.horde\) #enemyCard\{left:12px;right:auto\}/,'horde intel card must move away from the formation'],
  [/\.enemyUnit\.horde\{right:0;bottom:27%;width:min\(61%,285px\);height:min\(64%,330px\)\}/,'horde container must share the survivor road baseline'],
  [/\.enemyUnit\.horde \.enemySprite:nth-child\(2\)\{right:18%;bottom:0!important;z-index:2;transform:scale\(\.86\)\}/,'middle horde member needs the grounded depth preset'],
  [/\.enemyUnit\.horde \.enemySprite:nth-child\(3\)\{right:32%;bottom:0!important;z-index:1;transform:scale\(\.76\)\}/,'rear horde member needs the grounded depth preset'],
  [/\.enemyDeathUnit\.horde \.enemyDeathSprite:nth-child\(3\)\{right:32%;bottom:0;z-index:1;transform:scale\(\.76\)\}/,'corpse formation must mirror the grounded live formation'],
  [/\.enemyUnit\[data-rarity="brute"\]\{right:4px\}/,'brutes must retain a protected screen edge']
])if(!pattern.test(css))fail(message);
if(!/app\.css\?build=53/.test(html))fail('index must cache-bust the portrait stylesheet');
if(!/portrait-combat-probe\.html/.test(smoke)||!/data-portrait-combat="passed"/.test(smoke))fail('browser smoke test must run the portrait geometry probe');
if(!fs.existsSync(path.join(root,'scripts','portrait-combat-probe.html')))fail('computed portrait probe is missing');
console.log('Afterlight portrait combat passed: fixed solo, brute, horde and corpse formations are protected by responsive geometry checks.');
