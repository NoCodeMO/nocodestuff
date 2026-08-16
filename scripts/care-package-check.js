'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8'),fail=message=>{throw new Error(`Care package: ${message}`)};
const sandbox={window:{}};vm.runInNewContext(read('js/core/config.js'),sandbox,{filename:'config.js'});
const rules=sandbox.window.AfterlightConfig?.CARE_PACKAGE;
if(!rules)fail('shared CARE_PACKAGE balance configuration is missing');
if(rules.minimumIntervalMs!==90000||rules.maximumIntervalMs!==150000)fail('drops must stay on the approved 90–150 second random interval');
if(rules.visibleMs!==5000)fail('the landed crate must remain claimable for exactly five seconds');
if(rules.fallMs<1000||rules.fallMs>1800)fail('the drop animation must feel quick without teleporting');
if(rules.uraniumChance!==.04)fail('care-package Uranium chance must stay at the scarce 4% target');
if(rules.dealerBoostChance!==.012)fail('the free five-minute Dealer jackpot must remain a rare 1.2% roll');
const expectedHourlyBoosts=3600000/((rules.minimumIntervalMs+rules.maximumIntervalMs)/2)*rules.dealerBoostChance;
if(expectedHourlyBoosts<.3||expectedHourlyBoosts>.4)fail(`Dealer jackpots drifted to ${expectedHourlyBoosts.toFixed(2)} expected activations/hour`);
for(const asset of ['care-package-airborne.png','care-package-crate.png']){
  const file=path.join(root,'assets',asset);if(!fs.existsSync(file))fail(`missing ${asset}`);const png=fs.readFileSync(file);
  if(png.length<100000)fail(`${asset} appears to be a placeholder`);if(png.toString('ascii',1,4)!=='PNG')fail(`${asset} is not a PNG`);if(png[25]!==6)fail(`${asset} must retain a true RGBA alpha channel`);
}
const state=read('js/core/state.js');
for(const [pattern,message] of [[/schema:19/,'save schema must migrate to 19'],[/carePackage:\{nextAt:0,active:null,opened:0,missed:0\}/,'care-package schedule and active reward need persisted state'],[/carePackage:\{\.\.\.base\.carePackage/,'old saves need care-package state migration'],[/freeActivations:0/,'free Dealer activations need tracking']])if(!pattern.test(state))fail(message);
const source=read('js/systems/care-package.js');
for(const [pattern,message] of [
  [/useReserves:false,cache:false/,'reward math must use sustainable room production'],
  [/permanentRate\(resource\).*MERCHANT\.multiplier/s,'reward math must divide out temporary Dealer boosts'],
  [/expiresAt:started\+RULES\.fallMs\+RULES\.visibleMs/,'five-second claim window must begin after landing'],
  [/assets\/care-package-airborne\.png/,'airborne sprite is not wired'],
  [/assets\/care-package-crate\.png/,'landed sprite is not wired'],
  [/afterlight:care-package-landed/,'landing event is missing'],
  [/afterlight:care-package-opened/,'opening reward event is missing'],
  [/state\.coins=.*reward\.coins/,'coins are not awarded through unified state'],
  [/state\.stats\.uraniumEarned=.*reward\.uranium/,'Uranium totals are not tracked'],
  [/MERCHANT\.activateFree/,'Dealer jackpots must use the shared Merchant API'],
  [/data-care-seconds/,'visible tenths timer is missing'],
  [/document\.hidden/,'background tabs must not create unseen drops']
])if(!pattern.test(source))fail(message);
const merchant=read('js/systems/merchant.js');
if(!/function activateFree\(id,source='care-package'\)/.test(merchant)||!/afterlight:merchant-free-activated/.test(merchant))fail('Merchant needs a no-cost, immediate activation API');
if(/function activateFree[\s\S]*?state\.uranium-=/.test(merchant.match(/function activateFree[\s\S]*?function pruneExpired/)?.[0]||''))fail('free Dealer drops must never spend Uranium');
const css=read('app.css'),audio=read('js/audio.js'),html=read('index.html');
for(const marker of ['.carePackageDrop.falling','.carePackageDrop.landed','.carePackageGlow','.carePackageTimer','.carePackageDust','.carePackageReveal','.dealerReward'])if(!css.includes(marker))fail(`missing presentation rule ${marker}`);
if(!/afterlight:care-package-landed',carePackageLandSound/.test(audio)||!/afterlight:care-package-opened',carePackageOpenSound/.test(audio))fail('landing and reward events need dedicated audio');
for(const marker of ['app.css?build=41','js/core/config.js?build=28','js/core/economy.js?build=2','js/core/state.js?build=21','js/systems/operations.js?build=2','js/systems/merchant.js?build=4','js/systems/care-package.js?build=2','js/audio.js?build=13'])if(!html.includes(marker))fail(`cache/build marker missing: ${marker}`);
if(!(html.indexOf('js/core/game.js')<html.indexOf('js/systems/care-package.js')&&html.indexOf('js/systems/care-package.js')<html.indexOf('js/audio.js')))fail('care-package load order must follow the economy and precede audio registration completion');
console.log('Afterlight care-package balance passed: 90–150s drops, five-second claims, responsive alpha assets, scarce jackpots and unified rewards.');
