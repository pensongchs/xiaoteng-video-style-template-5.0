// Portable local-template regression: real TS modules, mocked Remotion clock/assets (not a DOM pixel test).
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const realReact = require(path.join(root, 'node_modules/react'));
const React = {...realReact, useContext: c => c._currentValue};
const remotion = require(path.join(root, 'node_modules/remotion'));
let frame = 0; const cache = new Map();
const asset = props => React.createElement('asset', {src: props.src});
function load(file) {
  file = path.resolve(root, file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = {exports: {}}; cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, esModuleInterop: true}}).outputText;
  const req = name => {
    if (name === 'react') return React;
    if (name === 'remotion') return {...remotion, useCurrentFrame: () => frame, useVideoConfig: () => ({fps: 30, width: 1920, height: 1080}), getInputProps: () => ({}), Img: asset, OffthreadVideo: asset, Freeze: p => p.children};
    if (name.startsWith('.')) {
      const b = path.resolve(path.dirname(file), name);
      const f = [b, b+'.ts', b+'.tsx', b+'.json'].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
      if (f?.endsWith('.json')) return JSON.parse(fs.readFileSync(f, 'utf8'));
      if (f) return load(f);
    }
    throw new Error('Unexpected module '+name);
  };
  new Function('require','module','exports',code)(req,module,module.exports);
  return module.exports;
}
const token = load('src/style/tokens.ts'), comp = load('src/style/components.tsx');
const layouts = load('src/style/layouts.ts');
const {GALLERY, ARCHIVE_GALLERY} = load('src/gallery/shots-mg-gallery.ts');
const {NEW_GALLERY} = load('src/gallery/shots-mg-new.ts');
const {RE10} = load('src/gallery/shots-mg-re10.ts');
const {ShotView} = load('src/style/archetypes.tsx');
const {frost} = load('src/style/mgEstate.tsx');
assert.equal(token.FROST, token.GLASS_V6);
assert.equal(token.GLASS.dark.fill, token.FROST.fill);
assert.equal(token.GLASS.light.fill, token.FROST.fill);
assert.equal(token.FROST.fill, 'linear-gradient(165deg, rgba(250,243,231,0.74), rgba(236,224,204,0.64))');
assert.equal(token.FROST.blur, 'blur(26px) saturate(1.3) brightness(1.12)');
assert.equal(token.FROST.hair, 'rgba(255,248,240,0.78)');
assert.equal(token.FROST.ink, '#2A1E12');
for (const tone of ['none','gold','coral','green','blue']) for (const soft of [false,true]) {
  const a = comp.glassMat('dark', token.FROST.tint[tone], undefined, soft), b = frost(tone, soft);
  for (const k of ['background','border','boxShadow','textShadow','backdropFilter','WebkitBackdropFilter','color']) assert.equal(a[k],b[k],tone+' '+k);
}
assert.equal(comp.glassMat('light').background, comp.glassMat().background);
assert.match(comp.glassMat('dark','rgba(224,113,92,0.42)').background, /rgba\(224,113,92,0.1\)/);
assert.equal(comp.Sheen({at: 0}), null);
for (let f=-20; f<=240; f+=0.25) assert.equal(comp.bump(f), 0);
for (const kind of ['enter','soft','chip']) {
  let prev = -1;
  for (let f=-30;f<=240;f+=0.25) {
    const p = token.glassEnter(f,0,kind); assert(p>=prev && p>=0 && p<=1); prev=p;
    frame=f; const L = comp.useLiquid(0, kind==='soft'?token.SPRING.soft:kind==='chip'?token.SPRING.snappy:token.SPRING.enter);
    assert.equal(L.p,p); assert.equal(L.sx,1); assert.equal(L.sy,1);
  }
  assert.equal(token.glassEnter(token.GLASS_ENTER_FRAMES[kind],0,kind),1);
}
{ let prev=-1; for (let f=-30;f<=80;f+=0.25) { const p=token.glassEnter(f,0,'shaped'); assert(p>=prev&&p>=0&&p<=1); prev=p; }
  assert.equal(token.glassEnter(18,0,'shaped'),1); }
assert.equal(layouts.DEFAULT_LAYOUTS.length,26);
assert.equal(new Set(layouts.DEFAULT_LAYOUTS).size,26);
assert.deepEqual([...new Set(GALLERY.map(s=>s.layout))].sort(), [...layouts.DEFAULT_LAYOUTS].sort());
assert.equal(GALLERY.length,26); assert.equal(RE10.length,9); assert.equal(ARCHIVE_GALLERY.length,6);
assert.deepEqual(RE10.map(s=>s.layout), [...layouts.ESTATE_LAYOUTS]);
assert.equal(layouts.canonicalLayout('outroAir'),'outroHost');
assert(!layouts.isDefaultLayout('unitCompare'));
assert.deepEqual(layouts.layoutRects('unitCompare'),{});
for (const s of ARCHIVE_GALLERY) assert(!layouts.isDefaultLayout(s.layout));
const geomKeys=['left','top','right','bottom','width','height','transform','transformOrigin','padding','gap','fontSize','filter'];
const take = st => Object.fromEntries(geomKeys.filter(k=>k in st).map(k=>[k,st[k]]));
function walk(node, out, p='0', parents=[]) {
  if (node == null || typeof node === 'boolean' || typeof node !== 'object') return;
  if (Array.isArray(node)) return node.forEach((n,i)=>walk(n,out,p+'.'+i,parents));
  if (typeof node.type === 'function') return walk(node.type(node.props),out,p+'.fn',parents);
  const st = node.props?.style || {}, chain=[...parents,take(st)];
  const fog = typeof st.backdropFilter === 'string' && st.backdropFilter.includes('blur(26px)');
  if (fog) {
    const fills = [token.FROST.fill, token.FROST.fillSoft, ...Object.values(token.FOG).flatMap((x) => [x.fill0, x.fill1])];
    assert(fills.some((f) => st.background?.includes(f)), 'Noncanonical card '+p);
    assert(!st.background?.includes('rgba(62,64,72'), 'Cold gray card returned '+p);
    out.push({path:p, ancestors:chain});
  }
  const ctx = node.type && typeof node.type === 'object' && '_currentValue' in node.type ? node.type : null;
  const prev=ctx?ctx._currentValue:null;
  if(ctx) ctx._currentValue=node.props.value;
  walk(node.props?.children,out,p+'.child',chain);
  if(ctx) ctx._currentValue=prev;
}
function sample(s,f) { frame=f; const out=[]; walk(ShotView({s,dur:210}),out); return out; }
const stable=[];
assert.equal(NEW_GALLERY.length, 17);
assert.deepEqual(NEW_GALLERY.map(s=>s.layout), [...layouts.NEW_LAYOUTS]);
for (const s of [...GALLERY,...ARCHIVE_GALLERY,...NEW_GALLERY]) {
  const ref=JSON.stringify(sample(s,185));
  for(let f=186;f<209;f++) assert.equal(JSON.stringify(sample(s,f)),ref,s.layout+' card/ancestor moved after settling at '+f);
  stable.push({layout:s.layout, glassElements:JSON.parse(ref).length, stableFrames:[185,208]});
}
const project=path.resolve(root,'../..');
assert.equal(fs.readFileSync(path.join(root,'风格设计规范.md'),'utf8'),fs.readFileSync(path.join(project,'正片/references/风格设计规范.md'),'utf8'));
for(const f of ['SKILL.md','正片/SKILL.md','正片/references/版式目录.md','正片/references/风格设计规范.md']) {
 const text=fs.readFileSync(path.join(project,f),'utf8');
 assert(text.includes('5.0 新定版（玻璃v6 + 房产MG）'),f);
 assert(!/至少 2 种来自「MG 卡片新增 6」|9 套，未定版|卡片入场后必须持续有动作/.test(text),f+' stale policy');
}
const report={version:'5.0.0-glass-v6-estate',status:'approved',timezone:'Asia/Shanghai',testedAt:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}),defaultCount:26,defaultLayouts:layouts.DEFAULT_LAYOUTS,estateLayouts:layouts.ESTATE_LAYOUTS,archiveLayouts:layouts.ARCHIVE_LAYOUTS,estateCount:9,archiveCount:6,unitCompareDefault:false,material:'GLASS_V6 = FROST; GLASS.dark/light and glassMat/frost/LG same source',baseAlpha:[0.68,0.74],entryFrames:token.GLASS_ENTER_FRAMES,overshoot:false,scanbar:false,settledGeometry:stable,scope:'TS/React-tree parameter regression; actual rendered stills checked separately, not a DOM pixel measurement'};
const dest=path.join(project,'定版记录');fs.mkdirSync(dest,{recursive:true});fs.writeFileSync(path.join(dest,'freeze-regression.json'),JSON.stringify(report,null,2)+'\n');
console.log(`PASS: warm-fog glass; monotonic 16/18/20/12f; 26 default + 6 archive + 17 new settled; 9 estate kept; unitCompare excluded`);
