'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'app.css'),'utf8'),visuals=fs.readFileSync(path.join(root,'js','ui','visuals.js'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),smoke=fs.readFileSync(path.join(root,'scripts','smoke.sh'),'utf8');
const fail=message=>{throw new Error(`Static combat world: ${message}`)};
for(const [source,pattern,message] of [
  [visuals,/stage\.dataset\.worldMotion='clouds-only'/,'world must declare cloud-only motion'],
  [css,/\.worldSky\{[^}]*transform:scale\(1\.035\)/,'sky must use a fixed transform'],
  [css,/\.worldCity\{[^}]*transform:scale\(1\.055\)/,'city must use a fixed transform'],
  [css,/\.worldBunker\{[^}]*transform:scale\(1\.025\)/,'bunker must use a fixed transform'],
  [css,/\.worldGround\{[^}]*transform:scale\(1\.015\)/,'road must use a fixed transform'],
  [css,/\.worldClouds img\{[^}]*animation:cloudDrift 42s ease-in-out infinite alternate/,'clouds must retain the faster slow drift'],
  [css,/#spriteStage\.bruteDeathImpact \.survivorUnit,#spriteStage\.bruteDeathImpact \.enemyDeathUnit\{animation:bruteCombatImpact/,'Brute impact must affect combatants instead of the world']
])if(!pattern.test(source))fail(message);
if(/pointermove|--parallax-x|--parallax-y/.test(visuals)||/--parallax-x|--parallax-y/.test(css))fail('pointer-driven background motion still exists');
if(/#spriteStage\.bruteDeathImpact\{animation:/.test(css))fail('Brute impact must not transform the entire world stage');
if(!html.includes('app.css?build=60')||!html.includes('js/ui/visuals.js?build=30'))fail('world asset cache markers are stale');
if(!/static-world-probe\.html/.test(smoke)||!/data-static-world="passed"/.test(smoke))fail('browser smoke must run the world stability probe');
if(!fs.existsSync(path.join(root,'scripts','static-world-probe.html')))fail('world stability browser probe is missing');
console.log('Bunkr static world passed: pointer and combat interactions cannot move the sky, city, bunker or road; only 42s cloud drift remains.');
