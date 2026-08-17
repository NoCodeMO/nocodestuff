'use strict';
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');
const css=fs.readFileSync(path.join(root,'app.css'),'utf8'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),smoke=fs.readFileSync(path.join(root,'scripts','smoke.sh'),'utf8');
const fail=message=>{throw new Error(`Landscape layout: ${message}`)};
for(const [pattern,message] of [
  [/@media\(orientation:landscape\) and \(min-width:560px\) and \(max-height:600px\)/,'dedicated phone-landscape breakpoint is missing'],
  [/--landscape-nav:calc\(58px \+ env\(safe-area-inset-left\)\)/,'landscape navigation must account for notches'],
  [/#tabs\{left:0;right:auto;top:50px;bottom:0;width:var\(--landscape-nav\);height:auto/,'navigation must become a full-height left rail'],
  [/#app:not\(\.bunkerOpen\) #bunker\{display:none\}/,'rooms must stay hidden during landscape combat'],
  [/#app:not\(\.bunkerOpen\) #scene\{right:0!important\}/,'landscape combat must use all space beside the navigation rail'],
  [/#app\.bunkerOpen #bunker\{left:var\(--landscape-nav\)!important;right:0!important/,'BUNKER must become a dedicated landscape screen'],
  [/\.bunkerOpen #rooms\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/,'landscape BUNKER must show four large room columns'],
  [/\.room\{min-height:118px/,'landscape rooms need a compact but touchable card height'],
  [/#drawer,#drawer\.commandDrawer\{z-index:90;left:calc\(var\(--landscape-nav\) \+ 5px\);right:5px;top:55px;bottom:5px/,'system drawers must use the landscape content area'],
  [/grid-template-areas:"detailHeader detailHeader" "detailHero detailIntro" "detailHero detailOperations" "detailHero detailOutputs" "detailMilestones detailPurchase"/,'room intelligence needs its own landscape operations composition']
])if(!pattern.test(css))fail(message);
if(!/app\.css\?build=62/.test(html))fail('index must cache-bust the current responsive stylesheet');
if(!/landscape-probe\.html/.test(smoke)||!/data-landscape-layout="passed"/.test(smoke))fail('browser smoke test must run the computed-layout probe');
if(!fs.existsSync(path.join(root,'scripts','landscape-probe.html')))fail('computed-layout probe is missing');
console.log('Bunkr landscape layout passed: full-width combat, vertical navigation and on-demand four-column BUNKER intelligence.');
