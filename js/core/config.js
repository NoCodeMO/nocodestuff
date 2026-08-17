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
  generator:{name:'POWER GENERATOR',icon:'⚡',base:35,unlock:1,art:'assets/room-generator.webp',prod:{power:1.5,coins:.4},desc:'The mechanical heart of Bunkr. It keeps every bunker system powered and sells surplus charge to nearby settlements.'},
  workshop:{name:'WORKSHOP',icon:'⚙',base:85,unlock:1,art:'assets/room-workshop.webp',prod:{scrap:.32,coins:1.8},desc:'A hard-used fabrication bay where salvage becomes repair parts, ammunition and valuable trade goods.'},
  greenhouse:{name:'GREENHOUSE',icon:'🌱',base:190,unlock:2,art:'assets/room-greenhouse.webp',prod:{food:1.2,coins:2.8},desc:'Protected hydroponic racks keep the bunker fed and turn rare fresh produce into dependable trade income.'},
  purifier:{name:'WATER PURIFIER',icon:'💧',base:420,unlock:3,art:'assets/room-purifier.webp',prod:{water:1.35,coins:4.2},desc:'Industrial filters strip poison and radiation from groundwater, producing clean reserves and sealed water rations.'},
  lab:{name:'RESEARCH LAB',icon:'⚗',base:850,unlock:4,art:'assets/room-lab.webp',prod:{science:.14,coins:5},desc:'Recovered instruments and protected sample chambers generate the science needed to push the bunker forward.'},
  living:{name:'LIVING QUARTERS',icon:'🛏',base:1350,unlock:5,art:'assets/room-living.webp',prod:{coins:11},desc:'Safe bunks, lockers and a warm mess area attract skilled survivors who strengthen the bunker economy.'},
  storage:{name:'STORAGE',icon:'📦',base:2200,unlock:6,art:'assets/room-storage.webp',prod:{coins:17,scrap:.5},desc:'A guarded logistics vault that sorts high-value salvage and keeps profitable supply routes running smoothly.'},
  turret:{name:'AUTO TURRET',icon:'⌖',base:3600,unlock:7,art:'assets/room-turret.webp',prod:{coins:12},desc:'A rebuilt sentry cannon protects the perimeter and earns security contracts from settlements under Bunkr protection.'}
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
  store:{id:'store',order:1,parent:'bunker',prestige:0,icon:'▣',landmark:'STORE',name:'ABANDONED STORE',position:[17,68],art:'assets/expedition-store.webp',artPosition:'50% 50%',threat:'LOW',seconds:60,unlock:1,coins:[75,140],scrap:[8,18],coinSeconds:[90,150],scrapSeconds:[50,90],supplySeconds:45,supplies:{food:5,water:5},uranium:[1,1],uraniumChance:.05,specialistChance:.08,companionChance:0,lore:'The shelves were stripped years ago, but a sealed delivery cage still transmits a weak inventory beacon.',intel:'Light infected presence. A safe first run for learning the roads beyond Bunkr.'},
  blocks:{id:'blocks',order:2,parent:'bunker',prestige:0,icon:'⌂',landmark:'HOUSING',name:'RUINED HOUSING',position:[24,43],art:'assets/expedition-blocks.webp',artPosition:'50% 48%',threat:'LOW',seconds:180,unlock:2,coins:[180,350],scrap:[20,42],coinSeconds:[240,420],scrapSeconds:[120,210],supplySeconds:90,supplies:{food:12,water:12},uranium:[1,1],uraniumChance:.12,specialistChance:.14,companionChance:0,lore:'A collapsed survivor block sits around an intact courtyard and a maintenance shelter hidden beneath it.',intel:'Narrow streets create ambush points, but the old homes contain dependable salvage.'},
  clinic:{id:'clinic',order:3,parent:'blocks',prestige:0,icon:'✚',landmark:'CLINIC',name:'FIELD CLINIC',position:[34,30],art:'assets/expedition-clinic.webp',artPosition:'50% 48%',threat:'GUARDED',seconds:600,unlock:3,coins:[500,900],scrap:[55,100],coinSeconds:[720,1200],scrapSeconds:[360,600],supplySeconds:180,supplies:{food:30,water:40},uranium:[1,1],uraniumChance:.25,specialistChance:.22,companionChance:0,lore:'Emergency lights still blink inside a military triage post abandoned during the first evacuation.',intel:'Medical lockers draw scavengers and infected. Trauma specialists may still answer the beacon.'},
  gas:{id:'gas',order:4,parent:'store',prestige:0,icon:'⌁',landmark:'FUEL',name:'ASHWAY GAS STATION',position:[35,67],art:'assets/expedition-gas.webp',artPosition:'50% 52%',threat:'GUARDED',seconds:900,unlock:4,coins:[800,1450],scrap:[80,145],coinSeconds:[1050,1650],scrapSeconds:[520,820],supplySeconds:220,supplies:{food:42,water:55},uranium:[1,1],uraniumChance:.3,specialistChance:.24,companionChance:0,lore:'The forecourt is burned out, but underground service tunnels connect to a protected trade cache.',intel:'Volatile ground and roaming packs make a fast search essential.'},
  factory:{id:'factory',order:5,parent:'clinic',prestige:1,icon:'⚙',landmark:'FACTORY',name:'DEAD FACTORY',position:[47,29],art:'assets/expedition-factory.webp',artPosition:'50% 46%',threat:'HIGH',seconds:1800,unlock:1,coins:[2400,4200],scrap:[230,410],coinSeconds:[2400,3900],scrapSeconds:[1150,1850],supplySeconds:340,supplies:{food:100,water:130},uranium:[1,2],uraniumChance:.5,specialistChance:.32,companionChance:0,lore:'A pre-fall machining plant whose automated presses still cycle beneath the ash.',intel:'Prestige I route. Dense machinery hides rare components and dangerous blind corners.'},
  rail:{id:'rail',order:6,parent:'gas',prestige:1,icon:'▤',landmark:'RAIL YARD',name:'DROWNED RAIL YARD',position:[53,78],art:'assets/expedition-rail.webp',artPosition:'50% 50%',threat:'HIGH',seconds:2400,unlock:1,coins:[3400,5900],scrap:[330,560],coinSeconds:[3300,5100],scrapSeconds:[1550,2400],supplySeconds:410,supplies:{food:130,water:170},uranium:[1,2],uraniumChance:.6,specialistChance:.36,companionChance:0,lore:'Floodwater swallowed the freight terminal, leaving sealed cargo cars above the black waterline.',intel:'Prestige I route. The raised track is the only reliable path in and out.'},
  police:{id:'police',order:7,parent:'factory',prestige:2,icon:'⬟',landmark:'PRECINCT',name:'LOCKDOWN PRECINCT',position:[59,45],art:'assets/expedition-police.webp',artPosition:'50% 48%',threat:'SEVERE',seconds:3600,unlock:1,coins:[6200,10800],scrap:[600,980],coinSeconds:[4800,7200],scrapSeconds:[2250,3400],supplySeconds:520,supplies:{food:190,water:240},uranium:[2,3],uraniumChance:.7,specialistChance:.43,companionChance:0,lore:'The district precinct sealed itself during the riots. Its armory signal never went dark.',intel:'Prestige II route. Armored infected patrol the barricaded central avenue.'},
  hospital:{id:'hospital',order:8,parent:'police',prestige:2,icon:'✚',landmark:'HOSPITAL',name:'GRAND HOSPITAL',position:[66,24],art:'assets/expedition-hospital.webp',artPosition:'50% 42%',threat:'SEVERE',seconds:5400,unlock:1,coins:[9800,16800],scrap:[920,1550],coinSeconds:[6900,10200],scrapSeconds:[3250,4800],supplySeconds:650,supplies:{food:270,water:360},uranium:[3,4],uraniumChance:.8,specialistChance:.5,companionChance:0,lore:'A fortified hospital tower rises above the dead city, its upper wards untouched since quarantine.',intel:'Prestige II route. High-value medicine and the strongest specialist signal in the district.'},
  metro:{id:'metro',order:9,parent:'rail',prestige:3,icon:'▥',landmark:'METRO',name:'BLACKLINE METRO',position:[70,73],art:'assets/expedition-metro.webp',artPosition:'50% 50%',threat:'EXTREME',seconds:7200,unlock:1,coins:[16000,27000],scrap:[1500,2500],coinSeconds:[9300,13800],scrapSeconds:[4400,6500],supplySeconds:820,supplies:{food:390,water:510},uranium:[4,5],uraniumChance:.85,specialistChance:.56,companionChance:.005,lore:'The flooded rail line descends into a sealed civil-defense interchange beneath the exclusion zone.',intel:'Prestige III route. The return path is long, dark and impossible to shortcut.'},
  radio:{id:'radio',order:10,parent:'hospital',prestige:3,icon:'⌁',landmark:'RADIO',name:'LAST SIGNAL TOWER',position:[77,19],art:'assets/expedition-radio.webp',artPosition:'50% 38%',threat:'EXTREME',seconds:9000,unlock:1,coins:[23000,39000],scrap:[2200,3600],coinSeconds:[12000,17700],scrapSeconds:[5600,8300],supplySeconds:980,supplies:{food:500,water:650},uranium:[5,6],uraniumChance:.9,specialistChance:.62,companionChance:.008,lore:'A mountain relay continues broadcasting one repeating call sign through the storm.',intel:'Prestige III route. Valuable intelligence, survivor contacts and brutal wind exposure.'},
  checkpoint:{id:'checkpoint',order:11,parent:'metro',prestige:4,icon:'☣',landmark:'CHECKPOINT',name:'MILITARY CHECKPOINT',position:[81,60],art:'assets/expedition-checkpoint.webp',artPosition:'50% 48%',threat:'LETHAL',seconds:10800,unlock:1,coins:[34000,58000],scrap:[3200,5300],coinSeconds:[15300,22500],scrapSeconds:[7200,10600],supplySeconds:1180,supplies:{food:680,water:870},uranium:[6,8],uraniumChance:.95,specialistChance:.68,companionChance:.012,lore:'A frozen military cordon guards the only stable crossing into the red zone.',intel:'Prestige IV route. Brute tracks surround intact supply bunkers and encrypted manifests.'},
  prison:{id:'prison',order:12,parent:'radio',prestige:4,icon:'▦',landmark:'PRISON',name:'OVERRUN PRISON',position:[85,35],art:'assets/expedition-prison.webp',artPosition:'50% 43%',threat:'LETHAL',seconds:14400,unlock:1,coins:[47000,79000],scrap:[4400,7300],coinSeconds:[19800,28800],scrapSeconds:[9300,13600],supplySeconds:1420,supplies:{food:850,water:1100},uranium:[8,10],uraniumChance:.95,specialistChance:.72,companionChance:.016,lore:'The mountain prison became a final shelter, then a locked tomb. Something still moves behind its walls.',intel:'Prestige IV route. Survivor distress calls compete with a massive infected concentration.'},
  reactor:{id:'reactor',order:13,parent:'prison',prestige:5,icon:'☢',landmark:'REACTOR',name:'REACTOR RUINS',position:[93,20],art:'assets/expedition-reactor.webp',artPosition:'50% 45%',threat:'APOCALYPTIC',seconds:18000,unlock:1,coins:[68000,115000],scrap:[6400,10500],coinSeconds:[25200,36600],scrapSeconds:[11800,17200],supplySeconds:1720,supplies:{food:1100,water:1450},uranium:[10,14],uraniumChance:1,specialistChance:.78,companionChance:.022,lore:'The reactor crater glows through permanent night. Pre-fall vaults remain embedded beneath the molten shell.',intel:'Prestige V route. Exceptional crystal yield, elite survivor signals and catastrophic exposure.'},
  blacksite:{id:'blacksite',order:14,parent:'checkpoint',prestige:5,icon:'◆',landmark:'BLACKSITE',name:'RESEARCH BLACKSITE',position:[94,65],art:'assets/expedition-blacksite.webp',artPosition:'50% 46%',threat:'APOCALYPTIC',seconds:21600,unlock:1,coins:[95000,160000],scrap:[9000,14800],coinSeconds:[30600,44400],scrapSeconds:[14400,21000],supplySeconds:2050,supplies:{food:1400,water:1850},uranium:[14,18],uraniumChance:1,specialistChance:.84,companionChance:.03,lore:'The last Bunkr precursor lab hides beyond the irradiated marsh, protected by autonomous defenses.',intel:'Prestige V route. The richest known haul and the only confirmed companion habitat.'}
};
const COMPANION_FIND_CHANCES=Object.freeze({store:.02,blocks:.03,clinic:.04,gas:.05,factory:.06,rail:.07,police:.08,hospital:.09,metro:.10,radio:.11,checkpoint:.12,prison:.13,reactor:.15,blacksite:.17});
for(const [id,chance] of Object.entries(COMPANION_FIND_CHANCES))EXPEDITIONS[id].companionChance=chance;
const SPECIALISTS=[
  {id:'maya',name:'MAYA REYES',role:'REACTOR ENGINEER',icon:'☢',unlocks:'NUCLEAR REACTOR'},
  {id:'nora',name:'NORA VALE',role:'TRAUMA SURGEON',icon:'✚',unlocks:'TRAUMA CENTER'},
  {id:'sam',name:'SAM KELLER',role:'SIGNALS OFFICER',icon:'◉',unlocks:'LONG-RANGE COMMS'},
  {id:'cole',name:'COLE MERCER',role:'ORDNANCE SPECIALIST',icon:'⌖',unlocks:'HEAVY ARMORY'},
  {id:'elias',name:'DR. ELIAS VOSS',role:'EXPERIMENTAL PHYSICIST',icon:'✦',unlocks:'EXPERIMENTAL LAB'}
];
const EXPEDITION_COMPANIONS=[
  {id:'ranger-dog',icon:'◆',name:'RANGER',role:'COMMON TRACKER',rarity:'common',accent:'#b8b4a2',asset:'assets/pets/pet-ranger-dog-idle-v2.webp',frames:3,scale:.9,description:'A steady shepherd that never lets the road out of sight.'},
  {id:'bolt',icon:'◆',name:'BOLT',role:'COMMON CARRIER',rarity:'common',accent:'#b8b4a2',asset:'assets/pets/pet-bolt-idle-v2.webp',frames:3,scale:.9,description:'A bunker Labrador who carries supplies without complaint.'},
  {id:'patch',icon:'◆',name:'PATCH',role:'COMMON SCROUNGER',rarity:'common',accent:'#b8b4a2',asset:'assets/pets/pet-patch-idle-v2.webp',frames:3,scale:.72,description:'A fearless little terrier with a nose for hidden salvage.'},
  {id:'rook-dog',icon:'◆',name:'ROOK',role:'COMMON GUARD',rarity:'common',accent:'#b8b4a2',asset:'assets/pets/pet-rook-dog-idle-v2.webp',frames:3,scale:.92,description:'A powerful guard dog that owns every bunker doorway.'},
  {id:'drift',icon:'◆',name:'DRIFT',role:'COMMON PATHFINDER',rarity:'common',accent:'#b8b4a2',asset:'assets/pets/pet-drift-idle-v2.webp',frames:3,scale:.88,description:'A cold-weather husky that finds the safest path home.'},
  {id:'ash-hound',icon:'◆',name:'ASH HOUND',role:'RARE WASTELAND TRACKER',rarity:'rare',accent:'#4f9ee8',asset:'assets/pets/pet-ash-hound-idle-v2.webp',frames:3,scale:.95,description:'A loyal tracker recovered from the red-zone kennels.'},
  {id:'bluefang',icon:'◆',name:'BLUEFANG',role:'RARE ARMORED SCOUT',rarity:'rare',accent:'#4f9ee8',asset:'assets/pets/pet-bluefang-idle-v2.webp',frames:3,scale:1,description:'A steel-blue wolfdog trained to cross hostile ground.'},
  {id:'ember',icon:'◆',name:'EMBER',role:'RARE BREACH HOUND',rarity:'rare',accent:'#c87b38',asset:'assets/pets/pet-ember-idle-v2.webp',frames:3,scale:1.08,description:'A massive mastiff protected by heat-scarred salvage armor.'},
  {id:'ghostwire',icon:'◆',name:'GHOSTWIRE',role:'RARE SIGNAL RUNNER',rarity:'rare',accent:'#67b8d5',asset:'assets/pets/pet-ghostwire-idle-v2.webp',frames:3,scale:.88,description:'A silent greyhound linked to Bunkr radio frequencies.'},
  {id:'k9-xiii',icon:'◆',name:'K-9 XIII',role:'RARE RIOT GUARD',rarity:'rare',accent:'#d85a43',asset:'assets/pets/pet-k9-xiii-idle-v2.webp',frames:3,scale:.96,description:'An elite police dog still following its final command.'},
  {id:'rad-cat',icon:'✦',name:'RAD-CAT',role:'UNCOMMON BUNKER CAT',rarity:'uncommon',accent:'#c88738',asset:'assets/pets/pet-rad-cat-idle-v2.webp',frames:3,scale:.62,description:'An impossible little survivor with bright uranium eyes.'},
  {id:'switch-cat',icon:'✦',name:'SWITCH',role:'UNCOMMON TECH CAT',rarity:'uncommon',accent:'#c88738',asset:'assets/pets/pet-switch-cat-idle-v2.webp',frames:3,scale:.62,description:'A tabby that appears whenever bunker wiring needs attention.'},
  {id:'cinder-cat',icon:'✦',name:'CINDER',role:'UNCOMMON ASH CAT',rarity:'uncommon',accent:'#c88738',asset:'assets/pets/pet-cinder-cat-idle-v2.webp',frames:3,scale:.63,description:'A confident orange cat that sleeps beside warm generators.'},
  {id:'nocturne',icon:'✦',name:'NOCTURNE',role:'UNCOMMON NIGHT CAT',rarity:'uncommon',accent:'#9d78c9',asset:'assets/pets/pet-nocturne-idle-v2.webp',frames:3,scale:.61,description:'A silent black scout with eyes made for dead cities.'},
  {id:'snowdrop',icon:'✦',name:'SNOWDROP',role:'UNCOMMON MEDIC CAT',rarity:'uncommon',accent:'#79b8d8',asset:'assets/pets/pet-snowdrop-idle-v2.webp',frames:3,scale:.66,description:'A calm white cat that refuses to leave the medics behind.'},
  {id:'signal-crow',icon:'⌁',name:'SIGNAL CROW',role:'SPECIAL RADIO SCOUT',rarity:'epic',accent:'#a45bd8',asset:'assets/pets/pet-signal-crow-idle-v2.webp',frames:3,scale:.68,description:'A sharp-eyed bird that follows working radio towers.'},
  {id:'scrap-ferret',icon:'⌁',name:'SCRAP FERRET',role:'SPECIAL SALVAGE SCOUT',rarity:'epic',accent:'#a45bd8',asset:'assets/pets/pet-scrap-ferret-idle-v2.webp',frames:3,scale:.52,description:'Small enough for vents and fearless enough for ruins.'},
  {id:'tunnel-rat',icon:'⌁',name:'TUNNEL RAT',role:'SPECIAL ROUTE SCOUT',rarity:'epic',accent:'#a45bd8',asset:'assets/pets/pet-tunnel-rat-idle-v2.webp',frames:3,scale:.57,description:'A clever map carrier that remembers every underground route.'},
  {id:'salvage-fox',icon:'⌁',name:'SALVAGE FOX',role:'SPECIAL CACHE SCOUT',rarity:'epic',accent:'#a45bd8',asset:'assets/pets/pet-salvage-fox-idle-v2.webp',frames:3,scale:.76,description:'A quick red fox that can smell sealed supply caches.'},
  {id:'watch-owl',icon:'⌁',name:'WATCH OWL',role:'SPECIAL NIGHT SCOUT',rarity:'epic',accent:'#a45bd8',asset:'assets/pets/pet-watch-owl-idle-v2.webp',frames:3,scale:.66,description:'A silent lookout carrying pre-fall reconnaissance optics.'}
];
const COMPANION_PROGRESSION=Object.freeze({
  'ranger-dog':{unlockPrestige:0,starter:true,benefit:null,benefitLabel:'COSMETIC COMPANION · NO BENEFIT',benefitDescription:'Ranger is your free loyal companion and never changes the game economy.'},
  bolt:{unlockPrestige:0,benefit:{coinMultiplier:1.05},benefitLabel:'+5% EXPEDITION COINS',benefitDescription:'Carries extra valuables home from every completed expedition.'},
  patch:{unlockPrestige:0,benefit:{scrapMultiplier:1.06},benefitLabel:'+6% EXPEDITION SCRAP',benefitDescription:'Sniffs out small components hidden beneath ruined floors.'},
  'rook-dog':{unlockPrestige:0,benefit:{supplyMultiplier:.94},benefitLabel:'-6% EXPEDITION RATIONS',benefitDescription:'Guards the supply pack so less Food and Water is lost on the road.'},
  drift:{unlockPrestige:0,benefit:{timeMultiplier:.95},benefitLabel:'-5% EXPEDITION TIME',benefitDescription:'Finds a safer and faster route back to Bunkr.'},
  'ash-hound':{unlockPrestige:1,benefit:{companionChanceAdd:.025},benefitLabel:'+2.5% PET FIND CHANCE',benefitDescription:'Tracks living animal trails that other scouts miss.'},
  bluefang:{unlockPrestige:1,benefit:{specialistChanceAdd:.03},benefitLabel:'+3% SPECIALIST CHANCE',benefitDescription:'Detects survivor movement across hostile terrain.'},
  ember:{unlockPrestige:1,benefit:{coinMultiplier:1.12},benefitLabel:'+12% EXPEDITION COINS',benefitDescription:'Breaks open heavy trade caches before the team returns.'},
  ghostwire:{unlockPrestige:1,benefit:{timeMultiplier:.88},benefitLabel:'-12% EXPEDITION TIME',benefitDescription:'Runs silent routes through the fastest radio corridors.'},
  'k9-xiii':{unlockPrestige:1,benefit:{scrapMultiplier:1.14},benefitLabel:'+14% EXPEDITION SCRAP',benefitDescription:'Recovers military salvage from guarded locations.'},
  'rad-cat':{unlockPrestige:1,benefit:{uraniumChanceAdd:.04},benefitLabel:'+4% CRYSTAL FIND CHANCE',benefitDescription:'Its glowing eyes react near Uranium Crystal deposits.'},
  'switch-cat':{unlockPrestige:1,benefit:{timeMultiplier:.94},benefitLabel:'-6% EXPEDITION TIME',benefitDescription:'Keeps field equipment running and prevents route delays.'},
  'cinder-cat':{unlockPrestige:1,benefit:{coinMultiplier:1.08},benefitLabel:'+8% EXPEDITION COINS',benefitDescription:'Finds warm, inhabited caches worth more to traders.'},
  nocturne:{unlockPrestige:1,benefit:{companionChanceAdd:.015},benefitLabel:'+1.5% PET FIND CHANCE',benefitDescription:'Spots quiet animals hiding in dark ruins.'},
  snowdrop:{unlockPrestige:1,benefit:{supplyMultiplier:.9},benefitLabel:'-10% EXPEDITION RATIONS',benefitDescription:'Keeps the team calm and conserves Food and Water.'},
  'signal-crow':{unlockPrestige:3,benefit:{specialistChanceAdd:.08},benefitLabel:'+8% SPECIALIST CHANCE',benefitDescription:'Carries a clear rescue signal far beyond the atlas route.'},
  'scrap-ferret':{unlockPrestige:3,benefit:{scrapMultiplier:1.25},benefitLabel:'+25% EXPEDITION SCRAP',benefitDescription:'Reaches sealed vents packed with rare components.'},
  'tunnel-rat':{unlockPrestige:3,benefit:{timeMultiplier:.8},benefitLabel:'-20% EXPEDITION TIME',benefitDescription:'Remembers underground shortcuts through every sector.'},
  'salvage-fox':{unlockPrestige:3,benefit:{coinMultiplier:1.2,companionChanceAdd:.03},benefitLabel:'+20% COINS · +3% PET CHANCE',benefitDescription:'Locates valuable caches and the animals sheltering nearby.'},
  'watch-owl':{unlockPrestige:3,benefit:{uraniumChanceAdd:.08,specialistChanceAdd:.04},benefitLabel:'+8% CRYSTALS · +4% SPECIALISTS',benefitDescription:'Surveys crystal light and survivor signals from above.'}
});
for(const pet of EXPEDITION_COMPANIONS)Object.assign(pet,COMPANION_PROGRESSION[pet.id]);
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
  {id:'ranger-male',order:1,name:'RANGER // MALE',callsign:'RANGER-01',tier:'STARTER',asset:'assets/survivor-ranger.png',muzzleAnchor:{x:77.5,y:20.5},description:'The original Bunkr perimeter ranger. A balanced cosmetic survivor with the standard combat rig.',starter:true},
  {id:'ranger-female',order:2,name:'RANGER // FEMALE',callsign:'RANGER-02',tier:'STARTER',asset:'assets/survivor-ranger-female.webp',muzzleAnchor:{x:77.5,y:20.5},description:'A veteran scout rebuilt in the same responsive combat rig, with full recoil and muzzle feedback.',starter:true},
  {id:'architect',order:3,name:'GIDEON ROOK',callsign:'THE ARCHITECT',tier:'LEVEL 100',asset:'assets/survivor-architect.webp',muzzleAnchor:{x:79.3,y:14.8},description:'Bunkr’s master engineer deploys an amber exo-rig that permanently converts bunker progress into stronger passive output.',unlock:{type:'bunker',level:100},perk:{type:'passiveProductionPerBunkerLevel',perLevel:.005,maxBonus:1}},
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
    Object.freeze({level:5,title:'BUNKR PROTOCOL',survivor:'prestige-5',room:'archive-core',accent:'#dfb744'})
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
  {id:'command-center-launch',type:'UPDATE',date:'AUG 15 · BUILD 277',title:'COMMAND CENTER ONLINE',body:'The old Stats terminal has been rebuilt. Guides, statistics, settings, local Commander profiles and official Bunkr transmissions now share one secure hub.'},
  {id:'room-intelligence-release',type:'UPDATE',date:'AUG 15 · ROOM SYSTEMS',title:'ROOM INTELLIGENCE DEPLOYED',body:'Every normal bunker room now has unique art, live output intelligence, level milestones and exact x1, x10 and MAX upgrade quotes.'},
  {id:'founder-supply-cache',type:'EVENT',date:'FOUNDING SIGNAL · ONE-TIME',title:'BUNKR FOUNDERS CACHE',body:'Command recovered a sealed launch cache for every active bunker. Claim it once; the coin portion scales with your current bunker economy.',reward:{minimumCoins:500,coinHours:.2,scrap:50,uranium:2}}
];
const ENEMIES=[
  {id:'common',rarity:'COMMON',name:'THE DRIFTER',chance:55,asset:'assets/enemy-common-drifter.webp',idleAsset:'assets/enemy-common-drifter-idle.png',walkAsset:'assets/enemy-common-drifter-walk.png',hitAsset:'assets/enemy-common-drifter-hit.png',deathAsset:'assets/enemy-common-drifter-death.png',hpMultiplier:1,bountyMultiplier:1,scrapMultiplier:1,accent:'#b7b4a5'},
  {id:'uncommon',rarity:'UNCOMMON',name:'CINDERBACK',chance:25,asset:'assets/enemy-uncommon-cinderback.webp',hitAsset:'assets/enemy-uncommon-cinderback-hit.png',deathAsset:'assets/enemy-uncommon-cinderback-death.png',hpMultiplier:1.4,bountyMultiplier:1.6,scrapMultiplier:1.35,accent:'#c57a32'},
  {id:'rare',rarity:'RARE',name:'BLUE SHIELD',chance:12,asset:'assets/enemy-rare-blue-shield.webp',hitAsset:'assets/enemy-rare-blue-shield-hit.png',deathAsset:'assets/enemy-rare-blue-shield-death.png',hpMultiplier:2.1,bountyMultiplier:2.6,scrapMultiplier:2,accent:'#64a8f2'},
  {id:'epic',rarity:'EPIC',name:'THE BLOATER',chance:5,asset:'assets/enemy-epic-bloater.webp',hitAsset:'assets/enemy-epic-bloater-hit.png',deathAsset:'assets/enemy-epic-bloater-death.png',hpMultiplier:3.2,bountyMultiplier:4.5,scrapMultiplier:3,accent:'#b76bea'},
  {id:'legendary',rarity:'LEGENDARY',name:'GILDED WARDEN',chance:2,asset:'assets/enemy-legendary-gilded-warden.webp',hitAsset:'assets/enemy-legendary-gilded-warden-hit.png',deathAsset:'assets/enemy-legendary-gilded-warden-death.png',hpMultiplier:5,bountyMultiplier:8,scrapMultiplier:5,accent:'#edca59'},
  {id:'brute',rarity:'BRUTE',name:'THE BREAKER',chance:1,asset:'assets/enemy-brute-breaker.webp',hitAsset:'assets/enemy-brute-breaker-hit.png',deathAsset:'assets/enemy-brute-breaker-death.png',hpMultiplier:9,bountyMultiplier:16,scrapMultiplier:10,accent:'#d76a50',brute:true}
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
window.BunkrConfig=Object.freeze({ROOMS,ROOM_ECONOMY,ROOM_MILESTONES,RESEARCH,EXPEDITIONS,SPECIALISTS,EXPEDITION_COMPANIONS,SPECIAL_ROOMS,MERCHANT_OFFERS,SURVIVOR_SKINS,PRESTIGE,SURVIVOR_DIALOGUE,COMMAND_MESSAGES,ENEMIES,COMBAT,CARE_PACKAGE,OFFLINE,OPERATIONS});
})();
