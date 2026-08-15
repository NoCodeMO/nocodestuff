'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'app.css'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),smoke=fs.readFileSync(path.join(root,'scripts','smoke.sh'),'utf8');
const fail=message=>{throw new Error(`Landscape layout: ${message}`)};
for(const [pattern,message] of [
  [/@media\(orientation:landscape\) and \(min-width:560px\) and \(max-height:600px\)/,'dedicated phone-landscape breakpoint is missing'],
  [/--landscape-nav:calc\(58px \+ env\(safe-area-inset-left\)\);--landscape-bunker:clamp\(260px,42vw,430px\)/,'landscape sizing must account for notches and cap the room deck'],
  [/#tabs\{left:0;right:auto;top:50px;bottom:0;width:var\(--landscape-nav\);height:auto/,'navigation must become a full-height left rail'],
  [/#scene\{left:var\(--landscape-nav\)!important;right:var\(--landscape-bunker\)!important;top:50px!important;bottom:0!important/,'combat must occupy the left command-deck pane'],
  [/#bunker\{left:calc\(100% - var\(--landscape-bunker\)\);right:0;top:50px;bottom:0/,'rooms must own a permanent full-height right pane'],
  [/#rooms\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/,'landscape room deck must show two columns'],
  [/\.room\{min-height:118px/,'landscape rooms need a compact but touchable card height'],
  [/#drawer,#drawer\.commandDrawer\{z-index:90;left:calc\(var\(--landscape-nav\) \+ 5px\);right:5px;top:55px;bottom:5px/,'system drawers must use the landscape content area'],
  [/grid-template-areas:"detailHeader detailHeader" "detailHero detailIntro" "detailHero detailOutputs" "detailMilestones detailPurchase"/,'room intelligence needs its own landscape composition']
])if(!pattern.test(css))fail(message);
if(!/app\.css\?build=28/.test(html))fail('index must cache-bust the landscape stylesheet');
if(!/landscape-probe\.html/.test(smoke)||!/data-landscape-layout="passed"/.test(smoke))fail('browser smoke test must run the computed-layout probe');
if(!fs.existsSync(path.join(root,'scripts','landscape-probe.html')))fail('computed-layout probe is missing');
console.log('Afterlight landscape layout passed: vertical nav, split combat/room deck, four visible rooms and landscape room intelligence.');
