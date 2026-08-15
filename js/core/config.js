(()=>{'use strict';
const ROOMS={
  generator:{name:'POWER GENERATOR',icon:'⚡',base:35,unlock:1,prod:{power:1.5,coins:.4},desc:'Keeps the bunker alive and sells spare charge.'},
  workshop:{name:'WORKSHOP',icon:'⚙',base:85,unlock:1,prod:{scrap:.32,coins:1.8},desc:'Turns salvage into parts and trade goods.'},
  greenhouse:{name:'GREENHOUSE',icon:'🌱',base:190,unlock:2,prod:{food:1.2,coins:2.8},desc:'Fresh food underground.'},
  purifier:{name:'WATER PURIFIER',icon:'💧',base:420,unlock:3,prod:{water:1.35,coins:4.2},desc:'Produces clean water.'},
  lab:{name:'RESEARCH LAB',icon:'⚗',base:850,unlock:4,prod:{science:.14,coins:5},desc:'Generates science.'},
  living:{name:'LIVING QUARTERS',icon:'🛏',base:1350,unlock:5,prod:{coins:11},desc:'Houses survivors.'},
  storage:{name:'STORAGE',icon:'📦',base:2200,unlock:6,prod:{coins:17,scrap:.5},desc:'Stores salvage.'},
  turret:{name:'AUTO TURRET',icon:'⌖',base:3600,unlock:7,prod:{coins:12},desc:'Damages infected automatically.'}
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
  store:{id:'store',icon:'🏪',name:'ABANDONED STORE',seconds:60,unlock:1,coins:[75,140],scrap:[8,18],specialistChance:.22},
  blocks:{id:'blocks',icon:'🏚',name:'RUINED BLOCKS',seconds:180,unlock:2,coins:[180,350],scrap:[20,42],specialistChance:.28},
  clinic:{id:'clinic',icon:'🏥',name:'FIELD HOSPITAL',seconds:600,unlock:3,coins:[500,900],scrap:[55,100],specialistChance:.36},
  metro:{id:'metro',icon:'🚇',name:'UNDERGROUND METRO',seconds:1800,unlock:5,coins:[1500,2600],scrap:[140,260],specialistChance:.44},
  checkpoint:{id:'checkpoint',icon:'☣',name:'MILITARY CHECKPOINT',seconds:3600,unlock:7,coins:[4000,7000],scrap:[350,600],specialistChance:.55}
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
window.AfterlightConfig=Object.freeze({ROOMS,RESEARCH,EXPEDITIONS,SPECIALISTS,SPECIAL_ROOMS});
})();
