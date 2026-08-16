'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),css=fs.readFileSync(path.join(root,'app.css'),'utf8'),game=fs.readFileSync(path.join(root,'js','core','game.js'),'utf8');
const fail=message=>{throw new Error(`Bunker layout: ${message}`)};
for(const [pattern,message] of [
  [/data-tab="bunker"[^>]*>[\s\S]*?<span>BUNKER<\/span>/,'BASE navigation must be renamed to BUNKER'],
  [/class="bunkerOverviewHeader"/,'fullscreen bunker command header is missing'],
  [/id="bunkerRoomsOnline"/,'online room counter is missing'],
  [/id="bunkerEfficiency"/,'average room efficiency is missing'],
  [/id="closeBunker"/,'return-to-road control is missing']
])if(!pattern.test(html))fail(message);
for(const [pattern,message] of [
  [/function setBunkerOpen\(open\)/,'one coordinated bunker open/close path is required'],
  [/classList\.toggle\('bunkerOpen',!!open\)/,'the app must own the fullscreen bunker state'],
  [/scene\.inert=!!open/,'fullscreen bunker must block hidden combat interactions'],
  [/matchMedia\('\(orientation:portrait\) and \(max-width:699px\)'\)/,'portrait visibility must be responsive'],
  [/built\.length\+' \/ '\+Object\.keys\(ROOMS\)\.length/,'room counter must use live room state'],
  [/Math\.round\(average\*100\)\+'%'/,'efficiency header must use live operations data']
])if(!pattern.test(game))fail(message);
for(const [pattern,message] of [
  [/\.bunkerOpen #bunker\{display:block!important;z-index:36/,'fullscreen bunker layer is missing'],
  [/@media\(orientation:portrait\) and \(max-width:699px\)\{#bunker\{display:none\}#scene\{bottom:66px!important;height:auto!important\}/,'portrait combat must hide rooms until BUNKER opens'],
  [/\.bunkerOpen #rooms\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,'desktop bunker must use a large three-column overview'],
  [/\.bunkerOpen #rooms\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'portrait bunker must retain a readable two-column overview'],
  [/#app\.bunkerOpen #bunker\{left:var\(--landscape-nav\)!important/,'landscape BUNKER must expand beyond the permanent room deck']
])if(!pattern.test(css))fail(message);
console.log('Afterlight bunker layout passed: renamed navigation, portrait combat separation and fullscreen responsive room deck.');
