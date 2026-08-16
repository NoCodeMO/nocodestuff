(()=>{'use strict';
const ROOM_ECONOMY=Object.freeze({costGrowth:1.142,costScale:125,costScaleRamp:25,rateGrowth:1.07,masterySize:100,maximumBulk:500,maximumRoomLevel:5000,maximumValue:1e300,bunkerLevelEvery:4});
const ROOM_MILESTONES=Object.freeze([
  Object.freeze({level:5,multiplier:1.25,tier:'CALIBRATED'}),
  Object.freeze({level:10,multiplier:1.5,tier:'INDUSTRIAL'}),
  Object.freeze({level:25,multiplier:2,tier:'FORTIFIED'}),
  Object.freeze({level:50,multiplier:3,tier:'MASTERWORK'}),
  Object.freeze({level:75,multiplier:4,tier:'OVERDRIVEN'}),
  Object.freeze({level:100,multiplier:5,tier:'ASCENDANT'})
]);
const ROOMS={
  generator:{name:'POWER GENERATOR',icon:'⚡',base:35,unlock:1,art:'assets/room-generator.webp',prod:{power:1.5,coins:.4},desc:'The mechanical heart of Afterlight. It keeps every bunker system powered and sells surplus charge to nearby settlements.'},
  workshop:{name:'WORKSHOP',icon:'⚙',base:85,unlock:1,art:'assets/room-workshop.webp',prod:{scrap:.32,coins:1.8},desc:'A hard-used fabrication bay where salvage becomes repair parts, ammunition and valuable trade goods.'},
  greenhouse:{name:'GREENHOUSE',icon:'🌱',base:190,unlock:2,art:'assets/room-greenhouse.webp',prod:{food:1.2,coins:2.8},desc:'Protected hydroponic racks keep the bunker fed and turn rare fresh produce into dependable trade income.'},
  purifier:{name:'WATER PURIFIER',icon:'💧',base:420,unlock:3,art:'assets/room-purifier.webp',prod:{water:1.35,coins:4.2},desc:'Industrial filters strip poison and radiation from groundwater, producing clean reserves and sealed water rations.'},
  lab:{name:'RESEARCH LAB',icon:'⚗',base:850,unlock:4,art:'assets/room-lab.webp',prod:{science:.14,coins:5},desc:'Recovered instruments and protected sample chambers generate the science needed to push the bunker forward.'},
  living:{name:'LIVING QUARTERS',icon:'🛏',base:1350,unlock:5,art:'assets/room-living.webp',prod:{coins:11},desc:'Safe bunks, lockers and a warm mess area attract skilled survivors who strengthen the bunker economy.'},
  storage:{name:'STORAGE',icon:'📦',base:2200,unlock:6,art:'assets/room-storage.webp',prod:{coins:17,scrap:.5},desc:'A guarded logistics vault that sorts high-value salvage and keeps profitable supply routes running smoothly.'},
  turret:{name:'AUTO TURRET',icon:'⌖',base:3600,unlock:7,art:'assets/room-turret.webp',prod:{coins:12},desc:'A rebuilt sentry cannon protects the perimeter and earns security contracts from settlements under Afterlight protection.'}
};
const RESEARCH=[
  {id:'tools',icon:'🔧',name:'KINETIC TOOLING',desc:'+18% manual damage per level',baseCost:8,scienceCost:2,baseSeconds:25,costGrowth:1.58,scienceGrowth:1.46,timeGrowth:1.3,effect:1.18},
  {id:'solar',icon:'☀',name:'MICROGRID THEORY',desc:'+8% all passive production per level',baseCost:12,scienceCost:4,baseSeconds:35,costGrowth:1.6,scienceGrowth:1.48,timeGrowth:1.31,effect:1.08},
  {id:'hydro',icon:'🌿',name:'HYDROPONIC YIELDS',desc:'+15% food production per level',baseCost:10,scienceCost:3,baseSeconds:30,costGrowth:1.57,scienceGrowth:1.46,timeGrowth:1.29,effect:1.15},
  {id:'filters',icon:'💧',name:'MOLECULAR FILTRATION',desc:'+15% water production per level',baseCost:11,scienceCost:3,baseSeconds:32,costGrowth:1.57,scienceGrowth:1.46,timeGrowth:1.29,effect:1.15},
  {id:'automation',icon:'🤖',name:'BUNKER AUTOMATION',desc:'+10% passive coin production per level',baseCost:16,scienceCost:6,baseSeconds:45,costGrowth:1.61,scienceGrowth:1.5,timeGrowth:1.32,effect:1.1},
  {id:'walls',icon:'🧱',name:'THREAT ANALYSIS',desc:'+12% infected bounty per level',baseCost:14,scienceCost:5,baseSeconds:40,costGrowth:1.59,scienceGrowth:1.49,timeGrowth:1.31,effect:1.12}
];
const EXPEDITIONS={
  store:{id:'store',icon:'🏪',name:'ABANDONED STORE',seconds:60,unlock:1,coins:[75,140],scrap:[8,18],coinSeconds:[90,150],scrapSeconds:[50,90],supplySeconds:45,supplies:{food:5,water:5},uranium:[1,1],uraniumChance:.05,specialistChance:.22},
  blocks:{id:'blocks',icon:'🏚',name:'RUINED BLOCKS',seconds:180,unlock:2,coins:[180,350],scrap:[20,42],coinSeconds:[240,420],scrapSeconds:[120,210],supplySeconds:90,supplies:{food:12,water:12},uranium:[1,1],uraniumChance:.12,specialistChance:.28},
  clinic:{id:'clinic',icon:'🏥',name:'FIELD HOSPITAL',seconds:600,unlock:3,coins:[500,900],scrap:[55,100],coinSeconds:[720,1200],scrapSeconds:[360,600],supplySeconds:180,supplies:{food:30,water:40},uranium:[1,1],uraniumChance:.25,specialistChance:.36},
  metro:{id:'metro',icon:'🚇',name:'UNDERGROUND METRO',seconds:1800,unlock:5,coins:[1500,2600],scrap:[140,260],coinSeconds:[1800,3000],scrapSeconds:[900,1500],supplySeconds:300,supplies:{food:90,water:120},uranium:[1,2],uraniumChance:.4,specialistChance:.44},
  checkpoint:{id:'checkpoint',icon:'☣',name:'MILITARY CHECKPOINT',seconds:3600,unlock:7,coins:[4000,7000],scrap:[350,600],coinSeconds:[5400,9000],scrapSeconds:[2700,4500],supplySeconds:480,supplies:{food:200,water:250},uranium:[2,3],uraniumChance:.6,specialistChance:.55}
};
const SPECIALISTS=[
  {id:'maya',name:'MAYA REYES',role:'REACTOR ENGINEER',icon:'☢',unlocks:'NUCLEAR REACTOR'},
  {id:'nora',name:'NORA VALE',role:'TRAUMA SURGEON',icon:'✚',unlocks:'TRAUMA CENTER'},
  {id:'sam',name:'SAM KELLER',role:'SIGNALS OFFICER',icon:'◉',unlocks:'LONG-RANGE COMMS'},
  {id:'cole',name:'COLE MERCER',role:'ORDNANCE SPECIALIST',icon:'⌖',unlocks:'HEAVY ARMORY'},
  {id:'elias',name:'DR. ELIAS VOSS',role:'EXPERIMENTAL PHYSICIST',icon:'✦',unlocks:'EXPERIMENTAL LAB'}
];
const SPECIAL_ROOMS=[
  {id:'reactor',icon:'☢',name:'NUCLEAR REACTOR',specialist:'maya',unlock:3,baseCost:2500,desc:'Massive power core. Requires a Reactor Engineer.',prod:{power:18,coins:8}},
  {id:'medbay',icon:'✚',name:'TRAUMA CENTER',specialist:'nora',unlock:5,baseCost:5000,desc:'Advanced medical facility. Requires a Trauma Surgeon.',prod:{coins:16}},
  {id:'comms',icon:'◉',name:'LONG-RANGE COMMS',specialist:'sam',unlock:7,baseCost:9000,desc:'Coordinates distant salvage teams. Requires a Signals Officer.',prod:{coins:30,scrap:1.8}},
  {id:'armory',icon:'⌖',name:'HEAVY ARMORY',specialist:'cole',unlock:9,baseCost:16000,desc:'Military-grade weapon systems. Requires an Ordnance Specialist.',prod:{coins:25}},
  {id:'quantum',icon:'✦',name:'EXPERIMENTAL LAB',specialist:'elias',unlock:12,baseCost:30000,desc:'High-risk science wing. Requires an Experimental Physicist.',prod:{science:1.5,coins:40}}
];
const MERCHANT_OFFERS=[
  {id:'gold5',group:'overdrive',tier:'UNCOMMON',icon:'◉',name:'GILDED MINUTES',tagline:'Five minutes of accelerated bunker trade.',value:'×5 COINS',cost:25,seconds:300,accent:'#c88738',effect:{coins:5}},
  {id:'gold10',group:'overdrive',tier:'RARE',icon:'◆',name:'KINGMAKER CONTRACT',tagline:'The Dealer opens his highest-value routes.',value:'×10 COINS',cost:60,seconds:300,accent:'#4f9ee8',effect:{coins:10}},
  {id:'all3',group:'overdrive',tier:'LEGENDARY',icon:'☢',name:'REACTOR BLACKOUT',tagline:'Production, damage and infected bounties all surge at once.',value:'×3 EVERYTHING',cost:75,seconds:300,accent:'#dfb744',effect:{all:3}},
  {id:'scrap5',group:'scrap',tier:'UNCOMMON',icon:'⚙',name:'SALVAGE MAGNET',tagline:'Priority access to the Dealer’s salvage crews.',value:'×5 SCRAP',cost:30,seconds:300,accent:'#bd7137',effect:{scrap:5}},
  {id:'hunter',group:'combat',tier:'EPIC',icon:'⌖',name:'REDLINE AMMO',tagline:'Hot rounds hit harder and increase every infected bounty.',value:'×3 DAMAGE · ×2 BOUNTY',cost:40,seconds:300,accent:'#a45bd8',effect:{damage:3,zombie:2}},
  {id:'lure',group:'lure',tier:'LEGENDARY',icon:'☣',name:'BLACKLIGHT LURE',tagline:'Pulls rarer infected and Brutes toward the bunker.',value:'BOOSTED RARITY ODDS',cost:50,seconds:300,accent:'#d8b643',effect:{rarityLuck:true}}
];
const SURVIVOR_SKINS=[
  {id:'ranger-male',order:1,name:'RANGER // MALE',callsign:'RANGER-01',tier:'STARTER',asset:'assets/survivor-ranger.png',muzzleAnchor:{x:77.5,y:20.5},description:'The original Afterlight perimeter ranger. A balanced cosmetic survivor with the standard combat rig.',starter:true},
  {id:'ranger-female',order:2,name:'RANGER // FEMALE',callsign:'RANGER-02',tier:'STARTER',asset:'assets/survivor-ranger-female.webp',muzzleAnchor:{x:77.5,y:20.5},description:'A veteran scout rebuilt in the same responsive combat rig, with full recoil and muzzle feedback.',starter:true},
  {id:'architect',order:3,name:'GIDEON ROOK',callsign:'THE ARCHITECT',tier:'LEVEL 100',asset:'assets/survivor-architect.webp',muzzleAnchor:{x:79.3,y:14.8},description:'Afterlight’s master engineer deploys an amber exo-rig that permanently converts bunker progress into stronger passive output.',unlock:{type:'bunker',level:100},perk:{type:'passiveProductionPerBunkerLevel',perLevel:.005,maxBonus:1}},
  {id:'prestige-1',order:4,name:'MARA VOSS',callsign:'ASHBLADE',tier:'RARE · PRESTIGE I',rarity:'rare',accent:'#4f9ee8',asset:'assets/survivor-prestige-mara.webp',muzzleAnchor:{x:73.5,y:29.8},description:'A disciplined salvage runner with an orange field scarf, a rifle up front and a katana ready for close work.',unlock:{type:'prestige',level:1},perk:{type:'prestige',id:'salvage-discipline',label:'+40% ALL SCRAP',description:'Passive, combat and expedition Scrap rewards are multiplied by 1.40 while Mara is deployed.'}},
  {id:'prestige-2',order:5,name:'KNOX WARD',callsign:'LONG ROAD',tier:'RARE · PRESTIGE II',rarity:'rare',accent:'#4f9ee8',asset:'assets/survivor-prestige-knox.webp',muzzleAnchor:{x:77,y:38.8},description:'A long-haired road veteran whose weathered coat and shotgun have survived every settlement he could not save.',unlock:{type:'prestige',level:2},perk:{type:'prestige',id:'master-builder',label:'-12% ROOM COST',description:'Every normal and specialist room upgrade costs 12% fewer Coins while Knox is deployed.'}},
  {id:'prestige-3',order:6,name:'MALIK GRAVES',callsign:'THE KING',tier:'EPIC · PRESTIGE III',rarity:'epic',accent:'#a45bd8',asset:'assets/survivor-prestige-malik.webp',muzzleAnchor:{x:78.9,y:25},description:'A dark-skinned wasteland leader with long locs, a calm voice and the authority to bring every expedition home stronger.',unlock:{type:'prestige',level:3},perk:{type:'prestige',id:'field-command',label:'-25% EXPEDITION TIME · +30% LOOT',description:'Expeditions finish 25% faster and return 30% more Coins and Scrap while Malik is deployed.'}},
  {id:'prestige-4',order:7,name:'COLE ASH',callsign:'HORDEBREAKER',tier:'EPIC · PRESTIGE IV',rarity:'epic',accent:'#a45bd8',asset:'assets/survivor-prestige-cole.webp',muzzleAnchor:{x:76.9,y:21.2},description:'A broad-shouldered horde hunter carrying enough ammunition to turn a charging pack into a quiet road.',unlock:{type:'prestige',level:4},perk:{type:'prestige',id:'hordebreaker',label:'+50% DAMAGE & INFECTED LOOT',description:'Manual damage and all infected Coin and Scrap drops are multiplied by 1.50 while Cole is deployed.'}},
  {id:'prestige-5',order:8,name:'DR. ELARA SABLE',callsign:'LAST LIGHT',tier:'LEGENDARY · PRESTIGE V',rarity:'legendary',accent:'#dfb744',asset:'assets/survivor-prestige-elara.webp',muzzleAnchor:{x:68.2,y:15.3},description:'A legendary field scientist in a white armored coat who carries a steel revolver and the final archive key.',unlock:{type:'prestige',level:5},perk:{type:'prestige',id:'last-light',label:'-25% RESEARCH COST & TIME · +50% CRITS',description:'Research costs and timers drop by 25%; critical-hit damage is multiplied by a further 1.50 while Elara is deployed.'}}
];
const PRESTIGE=Object.freeze({
  maximumLevel:5,targets:Object.freeze([100,200,325,525,850]),targetFormula:Object.freeze({first:100,second:200,growth:1.62,roundTo:25}),economyPerLevel:1.65,damagePerLevel:1.25,rosterBonusPerLevel:.05,extraCorePercent:.1,extraCoreMinimum:25,maximumCoreReward:3,roomMaximumLevel:3,roomCosts:Object.freeze([1,2,3]),
  levels:Object.freeze([
    Object.freeze({level:1,title:'ASH PROTOCOL',survivor:'prestige-1',room:'legacy-vault',accent:'#4f9ee8'}),
    Object.freeze({level:2,title:'IRON PROTOCOL',survivor:'prestige-2',room:'automation-bay',accent:'#4f9ee8'}),
    Object.freeze({level:3,title:'CROWN PROTOCOL',survivor:'prestige-3',room:'command-relay',accent:'#a45bd8'}),
    Object.freeze({level:4,title:'WAR PROTOCOL',survivor:'prestige-4',room:'war-room',accent:'#a45bd8'}),
    Object.freeze({level:5,title:'AFTERLIGHT PROTOCOL',survivor:'prestige-5',room:'archive-core',accent:'#dfb744'})
  ]),
  rooms:Object.freeze([
    Object.freeze({id:'legacy-vault',level:1,icon:'▣',name:'LEGACY VAULT',effect:'Preserve 8% of Scrap per room level when a new cycle begins.'}),
    Object.freeze({id:'automation-bay',level:2,icon:'⚙',name:'AUTOMATION BAY',effect:'Assign one automatic room-upgrade target per room level.'}),
    Object.freeze({id:'command-relay',level:3,icon:'⌁',name:'COMMAND RELAY',effect:'Expeditions finish 10% faster and return 10% more resources per room level.'}),
    Object.freeze({id:'war-room',level:4,icon:'⌖',name:'WAR ROOM',effect:'Gain 8% manual damage and infected loot per room level.'}),
    Object.freeze({id:'archive-core',level:5,icon:'✦',name:'ARCHIVE CORE',effect:'Preserve one selected completed research project per room level.'})
  ]),
  contracts:Object.freeze([
    Object.freeze({id:'rebuild',icon:'⌂',name:'REBUILD THE LINE',metric:'roomUpgrades'}),
    Object.freeze({id:'purge',icon:'☠',name:'PURGE PROTOCOL',metric:'kills'}),
    Object.freeze({id:'discover',icon:'⚗',name:'RECOVER KNOWLEDGE',metric:'researchClaims'}),
    Object.freeze({id:'packs',icon:'☣',name:'BREAK THE PACKS',metric:'hordes'}),
    Object.freeze({id:'reach',icon:'▲',name:'RECLAIM THE BUNKER',metric:'bunker'})
  ])
});
const SURVIVOR_DIALOGUE=Object.freeze({
  killChance:.46,hordeChance:.82,streakChance:.68,killCooldownMs:7200,idleMinimumMs:24000,idleMaximumMs:42000,typeMs:31,holdMs:2100,killDelayMs:180,
  profiles:Object.freeze({
    'ranger-male':Object.freeze({accent:'#e3c468',voice:Object.freeze({base:164,spread:54,wave:'square'}),idle:Object.freeze(["Quiet road. I don't trust it.",'Keep the gate behind me.','Still here. Still loaded.',"Wind's carrying ash again.",'Command, eyes on the east.','Nothing moves for long.']),kill:Object.freeze(['Target down.','One less at the gate.','Back to the dirt.','Road stays ours.','Not getting past me.','Clean enough.','Stay down.','Next.']),streak:Object.freeze(['Keep them coming.',"Rhythm's good.",'One shot at a time.',"Don't blink."]),horde:Object.freeze(['Three down. Road clear.',"That's the whole pack.",'They came together. Left together.','More targets. Same result.']),brute:Object.freeze(['Big one down.',"That's for the bunker.",'Heavy target neutralized.','Even giants fall.'])}),
    'ranger-female':Object.freeze({accent:'#79bde7',voice:Object.freeze({base:218,spread:66,wave:'square'}),idle:Object.freeze(['Too quiet. Watch the rooftops.','East road is clear. For now.','Check the mag. Check it twice.','Ash storm on the horizon.','Bunker lights are still on.','I can hear them out there.']),kill:Object.freeze(['Clean shot.','Dropped before the line.','You picked the wrong road.','Threat removed.','Not today.','Keep moving.','Stay down.','Got you.']),streak:Object.freeze(['Locked in.','Keep the tempo.','No wasted rounds.','Eyes up.']),horde:Object.freeze(['Pack erased.','Three targets. Zero problems.','Road is clear again.','Crowd control complete.']),brute:Object.freeze(["Armor didn't save it.",'Heavy down.','Tell Command the road is clear.','Size only makes a bigger target.'])}),
    architect:Object.freeze({accent:'#e8a941',voice:Object.freeze({base:118,spread:38,wave:'square'}),idle:Object.freeze(['Every wall tells you where it will fail.','The bunker breathes. Listen.','Pressure is stable. For now.','Steel remembers every impact.','Measure twice. Fire once.','This road needs reinforcement.']),kill:Object.freeze(['Structural threat removed.','Failure point eliminated.','A predictable collapse.','Hostile load reduced.','Correction applied.','System stable.','Problem solved.','Next variable.']),streak:Object.freeze(['Efficiency rising.','Maintain the sequence.','Optimal cadence.','No deviation.']),horde:Object.freeze(['Multiple failures. One correction.','Three weak points removed.','Crowd load neutralized.','The equation balances.']),brute:Object.freeze(['Load-bearing problem solved.','Mass is not resilience.','Critical failure achieved.','Even giants have weak joints.'])}),
    'prestige-1':Object.freeze({accent:'#e78a36',voice:Object.freeze({base:198,spread:48,wave:'square'}),idle:Object.freeze(['Steel on my back. Eyes on the road.','Salvage never finds itself.','The ash hides useful things.','One clean run. Then another.','Blade is sharp. Rifle is cleaner.','Command always needs more parts.']),kill:Object.freeze(['Paid in full.','I can use that scrap.','Road tax collected.','Waste nothing.','Parts secured.','Another useful corpse.','Quick cut. Clean exit.','Leave the metal.']),streak:Object.freeze(['Keep the edge sharp.','Fast hands. Clean work.','Salvage route is open.','Do not slow me down.']),horde:Object.freeze(['Three bodies. Triple salvage.','Pack stripped clean.','That is a profitable pile.','Three cuts on the ledger.']),brute:Object.freeze(['Big corpse. Better parts.','Katana stays clean. Mostly.','That armor belongs to us now.','Heavy salvage secured.'])}),
    'prestige-2':Object.freeze({accent:'#70aee6',voice:Object.freeze({base:142,spread:34,wave:'square'}),idle:Object.freeze(['Long road made me patient.','This coat has seen worse weather.','A bunker is only as strong as its hands.','Build it right. Build it once.','Old roads remember everyone.','Shotgun is cheaper than a funeral.']),kill:Object.freeze(['Road gets quieter.','One shell. One answer.','Keep walking.','That will do.','Wrong end of the road.','Nothing personal.','Stay where you fell.','Gate stays standing.']),streak:Object.freeze(['Found the rhythm.','No hurry. No mercy.','Steady hands win.','Long road. Short fight.']),horde:Object.freeze(['Crowd cleared.','Three fewer footsteps.','Roadblock removed.','That pack picked poorly.']),brute:Object.freeze(['Took the long way down.','Even the big ones break.','Built heavy. Fell easy.','One expensive shell.'])}),
    'prestige-3':Object.freeze({accent:'#b16ee0',voice:Object.freeze({base:126,spread:42,wave:'square'}),idle:Object.freeze(['A leader returns with everyone.','Listen first. Then move.','The road respects preparation.','Command is a promise.','Fear is loud. Purpose is louder.','No one survives alone.']),kill:Object.freeze(['Judgment delivered.','Our people move forward.','The dead do not rule here.','Stand tall.','The line advances.','Order restored.','We claim this road.','Your reign is over.']),streak:Object.freeze(['Hold the formation.','This is how kingdoms survive.','Advance together.','Let them see resolve.']),horde:Object.freeze(['The pack broke first.','Three threats. One command.','Our line did not bend.','A crowd without a leader.']),brute:Object.freeze(['A false king falls.','Strength without purpose is nothing.','No giant outranks the people.','The crown remains ours.'])}),
    'prestige-4':Object.freeze({accent:'#a95ada',voice:Object.freeze({base:104,spread:28,wave:'square'}),idle:Object.freeze(['I count magazines, not monsters.','Hordes are just crowded targets.','Let them hear the belt feed.','Quiet means reload.','This road needs more targets.','Ammo is a planning problem.']),kill:Object.freeze(['Add one to the pile.','Next target.','Too slow.','Road meat.','Barely worth a round.','Target recycled.','Keep the lane full.','I saw you first.']),streak:Object.freeze(['Barrel is warm now.','This is the fun part.','Feed the rhythm.','The belt keeps moving.']),horde:Object.freeze(['That was the horde?','Three in. None out.','Crowd control is easy.','Send a bigger pack.']),brute:Object.freeze(['Heavy target. Heavier fall.','I needed the exercise.','Big body. Same ending.','Worth half a magazine.'])}),
    'prestige-5':Object.freeze({accent:'#edca59',voice:Object.freeze({base:236,spread:58,wave:'square'}),idle:Object.freeze(['Knowledge outlives every bunker.','The archive remembers.','Every failure leaves data.','Last light is still light.','The revolver is peer reviewed.','History needs witnesses.']),kill:Object.freeze(['Conclusion: terminal.','Hypothesis confirmed.','Precise enough.','Record the result.','Sample resolved.','Expected outcome.','Archive entry complete.','Data point acquired.']),streak:Object.freeze(['Variables controlled.','The pattern is obvious now.','Confidence interval: lethal.','Results are repeatable.']),horde:Object.freeze(['Three samples concluded.','A statistically brief encounter.','Group trial complete.','All three controls failed.']),brute:Object.freeze(['Exceptional mass. Ordinary weakness.','Archive that specimen.','Large sample. Clear result.','The revolver settles debate.'])})
  })
});
const COMMAND_MESSAGES=[
  {id:'operations-network-release',type:'UPDATE',date:'AUG 16 · OPERATIONS',title:'BUNKER OPERATIONS ONLINE',body:'Rooms now draw Power, Water, Food, Scrap, Science and Workforce from one shared network. Protect essential systems, keep five-minute reserves and open any warning room for an exact recovery order.'},
  {id:'command-center-launch',type:'UPDATE',date:'AUG 15 · BUILD 277',title:'COMMAND CENTER ONLINE',body:'The old Stats terminal has been rebuilt. Guides, statistics, settings, local Commander profiles and official Afterlight transmissions now share one secure hub.'},
  {id:'room-intelligence-release',type:'UPDATE',date:'AUG 15 · ROOM SYSTEMS',title:'ROOM INTELLIGENCE DEPLOYED',body:'Every normal bunker room now has unique art, live output intelligence, level milestones and exact x1, x10 and MAX upgrade quotes.'},
  {id:'founder-supply-cache',type:'EVENT',date:'FOUNDING SIGNAL · ONE-TIME',title:'AFTERLIGHT FOUNDERS CACHE',body:'Command recovered a sealed launch cache for every active bunker. Claim it once; the coin portion scales with your current bunker economy.',reward:{minimumCoins:500,coinHours:.2,scrap:50,uranium:2}}
];
const ENEMIES=[
  {id:'common',rarity:'COMMON',name:'THE DRIFTER',chance:55,asset:'assets/enemy-common-drifter.webp',deathAsset:'assets/enemy-common-drifter-death.png',hpMultiplier:1,bountyMultiplier:1,scrapMultiplier:1,glow:'transparent',accent:'#b7b4a5'},
  {id:'uncommon',rarity:'UNCOMMON',name:'CINDERBACK',chance:25,asset:'assets/enemy-uncommon-cinderback.webp',deathAsset:'assets/enemy-uncommon-cinderback-death.png',hpMultiplier:1.4,bountyMultiplier:1.6,scrapMultiplier:1.35,glow:'#a75d26',accent:'#c57a32'},
  {id:'rare',rarity:'RARE',name:'BLUE SHIELD',chance:12,asset:'assets/enemy-rare-blue-shield.webp',deathAsset:'assets/enemy-rare-blue-shield-death.png',hpMultiplier:2.1,bountyMultiplier:2.6,scrapMultiplier:2,glow:'#3f86d8',accent:'#64a8f2'},
  {id:'epic',rarity:'EPIC',name:'THE BLOATER',chance:5,asset:'assets/enemy-epic-bloater.webp',deathAsset:'assets/enemy-epic-bloater-death.png',hpMultiplier:3.2,bountyMultiplier:4.5,scrapMultiplier:3,glow:'#8747c9',accent:'#b76bea'},
  {id:'legendary',rarity:'LEGENDARY',name:'GILDED WARDEN',chance:2,asset:'assets/enemy-legendary-gilded-warden.webp',deathAsset:'assets/enemy-legendary-gilded-warden-death.png',hpMultiplier:5,bountyMultiplier:8,scrapMultiplier:5,glow:'#d5a936',accent:'#edca59'},
  {id:'brute',rarity:'BRUTE',name:'THE BREAKER',chance:1,asset:'assets/enemy-brute-breaker.webp',hpMultiplier:9,bountyMultiplier:16,scrapMultiplier:10,glow:'transparent',accent:'#d76a50',brute:true}
];
const COMBAT=Object.freeze({
  criticalChance:.08,
  criticalMultiplier:2,
  streakWindowMs:12000,
  streakStep:.25,
  streakMaximum:3,
  hordeChance:.12,
  hordePityEncounters:8,
  hordeVisualCount:3,
  hordeMultiplier:3,
  bountyHourlyShare:.0008,
  minimumBaseBounty:6,
  minimumHits:6,
  maximumHits:18,
  deathAnimationMs:390,
  nextSpawnMs:390,
  corpseVisibleMs:1500,
  corpseLimit:3
});
const CARE_PACKAGE=Object.freeze({
  minimumIntervalMs:90000,
  maximumIntervalMs:150000,
  fallMs:1350,
  visibleMs:5000,
  coinSeconds:[35,65],
  scrapSeconds:[20,40],
  secondarySeconds:[18,36],
  uraniumChance:.04,
  uranium:[1,1],
  dealerBoostChance:.012,
  secondaryResources:['food','water','power','science']
});
const OFFLINE=Object.freeze({minimumAwayMs:60000,maximumAwayMs:43200000,baseEfficiency:.35,maximumEfficiency:.9});
const OPERATIONS=Object.freeze({
  reserveSeconds:300,warningEfficiency:.9,criticalEfficiency:.5,workforceBase:1.25,workforcePerLoad:1.4,
  priorities:Object.freeze({essential:3,normal:2,low:1}),
  defaultPriority:Object.freeze({generator:'essential',purifier:'essential',greenhouse:'essential',living:'essential',workshop:'normal',lab:'normal',turret:'normal',storage:'low'}),
  recoveryFloor:Object.freeze({purifier:.35,greenhouse:.3,living:.25}),
  roomNeeds:Object.freeze({
    generator:Object.freeze({}),
    workshop:Object.freeze({power:.32,workforce:.32}),
    greenhouse:Object.freeze({power:.25,water:.18}),
    purifier:Object.freeze({power:.22}),
    lab:Object.freeze({power:.4,water:.22,workforce:.38}),
    living:Object.freeze({power:.26,water:.16,food:.22}),
    storage:Object.freeze({power:.2,science:.008,workforce:.24}),
    turret:Object.freeze({power:.3,scrap:.018,science:.012,workforce:.26})
  }),
  recommendations:Object.freeze({power:'Upgrade the Power Generator or lower another room priority.',water:'Upgrade the Water Purifier or protect its priority.',food:'Upgrade the Greenhouse before expanding survivor capacity.',workforce:'Upgrade Living Quarters or lower a non-essential room priority.',scrap:'Keep a Scrap reserve or upgrade the Workshop before running defenses.',science:'Upgrade the Research Lab or pause an advanced room until Science recovers.'})
});
window.AfterlightConfig=Object.freeze({ROOMS,ROOM_ECONOMY,ROOM_MILESTONES,RESEARCH,EXPEDITIONS,SPECIALISTS,SPECIAL_ROOMS,MERCHANT_OFFERS,SURVIVOR_SKINS,PRESTIGE,SURVIVOR_DIALOGUE,COMMAND_MESSAGES,ENEMIES,COMBAT,CARE_PACKAGE,OFFLINE,OPERATIONS});
})();
