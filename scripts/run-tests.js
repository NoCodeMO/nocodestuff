const {spawnSync}=require('child_process');
const path=require('path');

const tests=[
  'format-css.js',
  'validate.js',
  'asset-audit-check.js',
  'rebrand-migration-check.js',
  'bunker-layout-check.js',
  'landscape-layout-check.js',
  'portrait-combat-check.js',
  'static-world-check.js',
  'survivor-roster-check.js',
  'survivor-dialogue-check.js',
  'economy-rebalance-check.js',
  'account-reset-check.js',
  'operations-balance-check.js',
  'cross-system-balance-check.js',
  'research-network-check.js',
  'expedition-atlas-check.js',
  'companion-idle-check.js',
  'pet-command-check.js',
  'prestige-balance-check.js',
  'combat-balance.js',
  'casing-feedback-check.js',
  'merchant-balance.js',
  'care-package-check.js',
  'room-balance.js',
  'room-progression-check.js',
  'late-game-economy-check.js',
  'mission-balance.js',
  'command-center-check.js',
  'offline-balance.js',
  'codex-check.js'
];

const filters=process.argv.slice(2).map(value=>value.toLowerCase());
const selected=filters.length?tests.filter(file=>filters.some(filter=>file.toLowerCase().includes(filter))):tests;
if(!selected.length){
  console.error(`No tests match: ${filters.join(', ')}`);
  console.error(`Available tests:\n${tests.join('\n')}`);
  process.exit(1);
}

const started=Date.now();
for(const [index,file] of selected.entries()){
  console.log(`\n[${index+1}/${selected.length}] ${file}`);
  const result=spawnSync(process.execPath,[path.join(__dirname,file)],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status||1);
}

console.log(`\nBUNKR test suite passed: ${selected.length}/${selected.length} checks in ${((Date.now()-started)/1000).toFixed(1)}s.`);
