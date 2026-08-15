(()=>{'use strict';
const ROOM_ECONOMY=Object.freeze({costGrowth:1.62,rateGrowth:1.18,maximumBulk:500});
const ROOM_MILESTONES=Object.freeze([
  Object.freeze({level:5,multiplier:1.25,tier:'CALIBRATED'}),
  Object.freeze({level:10,multiplier:1.5,tier:'INDUSTRIAL'}),
  Object.freeze({level:25,multiplier:2,tier:'FORTIFIED'}),
  Object.freeze({level:50,multiplier:3,tier:'MASTERWORK'})
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
  {id:'tools',icon:'🔧',name:'KINETIC TOOLING',desc:'+18% manual damage per level',baseCost:8,baseSeconds:25,costGrowth:1.58,timeGrowth:1.3,effect:1.18},
  {id:'solar',icon:'☀',name:'MICROGRID THEORY',desc:'+8% all passive production per level',baseCost:12,baseSeconds:35,costGrowth:1.6,timeGrowth:1.31,effect:1.08},
  {id:'hydro',icon:'🌿',name:'HYDROPONIC YIELDS',desc:'+15% food production per level',baseCost:10,baseSeconds:30,costGrowth:1.57,timeGrowth:1.29,effect:1.15},
  {id:'filters',icon:'💧',name:'MOLECULAR FILTRATION',desc:'+15% water production per level',baseCost:11,baseSeconds:32,costGrowth:1.57,timeGrowth:1.29,effect:1.15},
  {id:'automation',icon:'🤖',name:'BUNKER AUTOMATION',desc:'+10% passive coin production per level',baseCost:16,baseSeconds:45,costGrowth:1.61,timeGrowth:1.32,effect:1.1},
  {id:'walls',icon:'🧱',name:'THREAT ANALYSIS',desc:'+12% infected bounty per level',baseCost:14,baseSeconds:40,costGrowth:1.59,timeGrowth:1.31,effect:1.12}
];
const EXPEDITIONS={
  store:{id:'store',icon:'🏪',name:'ABANDONED STORE',seconds:60,unlock:1,coins:[75,140],scrap:[8,18],uranium:[1,1],uraniumChance:.2,specialistChance:.22},
  blocks:{id:'blocks',icon:'🏚',name:'RUINED BLOCKS',seconds:180,unlock:2,coins:[180,350],scrap:[20,42],uranium:[1,1],uraniumChance:.35,specialistChance:.28},
  clinic:{id:'clinic',icon:'🏥',name:'FIELD HOSPITAL',seconds:600,unlock:3,coins:[500,900],scrap:[55,100],uranium:[1,2],uraniumChance:.6,specialistChance:.36},
  metro:{id:'metro',icon:'🚇',name:'UNDERGROUND METRO',seconds:1800,unlock:5,coins:[1500,2600],scrap:[140,260],uranium:[2,3],uraniumChance:.8,specialistChance:.44},
  checkpoint:{id:'checkpoint',icon:'☣',name:'MILITARY CHECKPOINT',seconds:3600,unlock:7,coins:[4000,7000],scrap:[350,600],uranium:[4,6],uraniumChance:1,specialistChance:.55}
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
  {id:'gold5',group:'coins',tier:'UNCOMMON',icon:'◉',name:'GILDED MINUTES',tagline:'Five minutes of accelerated bunker trade.',value:'×5 COINS',cost:3,seconds:300,accent:'#c88738',effect:{coins:5}},
  {id:'gold10',group:'coins',tier:'RARE',icon:'◆',name:'KINGMAKER CONTRACT',tagline:'The Dealer opens his highest-value routes.',value:'×10 COINS',cost:7,seconds:300,accent:'#4f9ee8',effect:{coins:10}},
  {id:'all3',group:'everything',tier:'LEGENDARY',icon:'☢',name:'REACTOR BLACKOUT',tagline:'Production, damage and infected bounties all surge at once.',value:'×3 EVERYTHING',cost:10,seconds:300,accent:'#dfb744',effect:{all:3}},
  {id:'scrap5',group:'scrap',tier:'UNCOMMON',icon:'⚙',name:'SALVAGE MAGNET',tagline:'Priority access to the Dealer’s salvage crews.',value:'×5 SCRAP',cost:4,seconds:300,accent:'#bd7137',effect:{scrap:5}},
  {id:'hunter',group:'combat',tier:'EPIC',icon:'⌖',name:'REDLINE AMMO',tagline:'Hot rounds hit harder and increase every infected bounty.',value:'×3 DAMAGE · ×2 BOUNTY',cost:5,seconds:300,accent:'#a45bd8',effect:{damage:3,zombie:2}},
  {id:'lure',group:'lure',tier:'LEGENDARY',icon:'☣',name:'BLACKLIGHT LURE',tagline:'Pulls rarer infected and Brutes toward the bunker.',value:'BOOSTED RARITY ODDS',cost:8,seconds:300,accent:'#d8b643',effect:{rarityLuck:true}}
];
const COMMAND_MESSAGES=[
  {id:'command-center-launch',type:'UPDATE',date:'AUG 15 · BUILD 277',title:'COMMAND CENTER ONLINE',body:'The old Stats terminal has been rebuilt. Guides, statistics, settings, local Commander profiles and official Afterlight transmissions now share one secure hub.'},
  {id:'room-intelligence-release',type:'UPDATE',date:'AUG 15 · ROOM SYSTEMS',title:'ROOM INTELLIGENCE DEPLOYED',body:'Every normal bunker room now has unique art, live output intelligence, level milestones and exact x1, x10 and MAX upgrade quotes.'},
  {id:'founder-supply-cache',type:'EVENT',date:'FOUNDING SIGNAL · ONE-TIME',title:'AFTERLIGHT FOUNDERS CACHE',body:'Command recovered a sealed launch cache for every active bunker. Claim it once; the coin portion scales with your current bunker economy.',reward:{minimumCoins:500,coinHours:.2,scrap:50,uranium:2}}
];
const ENEMIES=[
  {id:'common',rarity:'COMMON',name:'THE DRIFTER',chance:55,asset:'assets/enemy-common-drifter.webp',hpMultiplier:1,bountyMultiplier:1,scrapMultiplier:1,glow:'transparent',accent:'#b7b4a5'},
  {id:'uncommon',rarity:'UNCOMMON',name:'CINDERBACK',chance:25,asset:'assets/enemy-uncommon-cinderback.webp',hpMultiplier:1.4,bountyMultiplier:1.6,scrapMultiplier:1.35,glow:'#a75d26',accent:'#c57a32'},
  {id:'rare',rarity:'RARE',name:'BLUE SHIELD',chance:12,asset:'assets/enemy-rare-blue-shield.webp',hpMultiplier:2.1,bountyMultiplier:2.6,scrapMultiplier:2,glow:'#3f86d8',accent:'#64a8f2'},
  {id:'epic',rarity:'EPIC',name:'THE BLOATER',chance:5,asset:'assets/enemy-epic-bloater.webp',hpMultiplier:3.2,bountyMultiplier:4.5,scrapMultiplier:3,glow:'#8747c9',accent:'#b76bea'},
  {id:'legendary',rarity:'LEGENDARY',name:'GILDED WARDEN',chance:2,asset:'assets/enemy-legendary-gilded-warden.webp',hpMultiplier:5,bountyMultiplier:8,scrapMultiplier:5,glow:'#d5a936',accent:'#edca59'},
  {id:'brute',rarity:'BRUTE',name:'THE BREAKER',chance:1,asset:'assets/enemy-brute-breaker.webp',hpMultiplier:9,bountyMultiplier:16,scrapMultiplier:10,glow:'transparent',accent:'#d76a50',brute:true}
];
const COMBAT=Object.freeze({
  criticalChance:.08,
  criticalMultiplier:2,
  hordeChance:.12,
  hordeVisualCount:3,
  hordeMultiplier:3,
  bountyHourlyShare:.0008,
  minimumBaseBounty:6,
  minimumHits:6,
  maximumHits:18
});
window.AfterlightConfig=Object.freeze({ROOMS,ROOM_ECONOMY,ROOM_MILESTONES,RESEARCH,EXPEDITIONS,SPECIALISTS,SPECIAL_ROOMS,MERCHANT_OFFERS,COMMAND_MESSAGES,ENEMIES,COMBAT});
})();

