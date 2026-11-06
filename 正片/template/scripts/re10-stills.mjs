// 房产MG已定9种：每镜定格帧（全入场后）→ outputs/mg-gallery-re10/stills
import {mkdirSync} from 'node:fs';
const OUT = process.argv[2]; const FR = +(process.argv[3] || 118); const only = process.argv[4];
mkdirSync(OUT, {recursive: true});
const {bundle} = await import('@remotion/bundler');
const {selectComposition, renderStill} = await import('@remotion/renderer');
const names = ['floorLadder','paymentSplit','amenityOrbit','pitfallBoard','priceStep','decisionFork','districtTags','loanDial','layerReveal'];
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const composition = await selectComposition({serveUrl, id: 'MgGalleryRe10', inputProps: {}});
for (let i = 0; i < names.length; i++) {
  if (only && !only.split(',').includes(String(i + 1))) continue;
  const f = `${OUT}/${String(i + 1).padStart(2, '0')}_${names[i]}.png`;
  await renderStill({serveUrl, composition, frame: i * 135 + FR, output: f, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 120000,
    onBrowserLog: (l) => { if (/CHECK|Error/i.test(l.text)) console.log(l.text); }});
  console.log('✓', f);
}
