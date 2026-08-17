const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const assetRoot=path.join(root,'assets');
const fail=message=>{throw new Error(message)};
const walk=directory=>fs.readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
  const absolute=path.join(directory,entry.name);
  return entry.isDirectory()?walk(absolute):[absolute];
});

const runtimeSources=[
  path.join(root,'index.html'),
  path.join(root,'app.css'),
  path.join(root,'manifest.webmanifest'),
  ...walk(path.join(root,'js')).filter(file=>file.endsWith('.js'))
];
const source=runtimeSources.map(file=>fs.readFileSync(file,'utf8')).join('\n');
const referenced=new Set(source.match(/assets\/[a-zA-Z0-9_./-]+\.(?:png|webp|jpe?g|wav|mp3|ogg)/g)||[]);

for(const asset of [...referenced]){
  const match=asset.match(/^assets\/expedition-(?!map-|world-)([a-z-]+)\.webp$/);
  if(match)referenced.add(`assets/expedition-map-${match[1]}.webp`);
}

const intentionalSources=new Set([
  'assets/branding/bunkr-icon-master.png',
  'assets/branding/bunkr-last-shelter-logo.jpg'
]);
const compatibilityAssets=new Set([
  'assets/survivor-final.webp',
  'assets/walker-final.webp'
]);
const allAssets=walk(assetRoot)
  .map(file=>path.relative(root,file).replaceAll('\\','/'))
  .filter(file=>/\.(?:png|webp|jpe?g|wav|mp3|ogg)$/i.test(file))
  .sort();
const missing=[...referenced].filter(file=>!fs.existsSync(path.join(root,file)));
const unused=allAssets.filter(file=>!referenced.has(file)&&!intentionalSources.has(file)&&!compatibilityAssets.has(file));
const supersededPets=allAssets.filter(file=>/^assets\/pets\/pet-.+-idle\.webp$/.test(file));

if(missing.length)fail(`Runtime references missing assets:\n${missing.join('\n')}`);
if(unused.length)fail(`Untracked runtime assets found:\n${unused.join('\n')}`);
if(supersededPets.length)fail(`Superseded pet sheets must not return:\n${supersededPets.join('\n')}`);

console.log(`Asset audit passed: ${allAssets.length} files, ${referenced.size} runtime references, ${intentionalSources.size} source masters and ${compatibilityAssets.size} compatibility assets.`);
