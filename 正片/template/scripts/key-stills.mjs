// 新卡关键镜的中帧定格，写到仓库预览目录 previews/v6.1/
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const outDir = join(process.cwd(), '../../previews/v6.1');
mkdirSync(outDir, {recursive: true});

const {bundle} = await import('@remotion/bundler');
const {selectComposition, renderStill} = await import('@remotion/renderer');
const browserExecutable = process.env.REMOTION_BROWSER || '/opt/google/chrome/chrome';
const serveUrl = await bundle({entryPoint: 'src/index.ts'});
const inputProps = {};
const composition = await selectComposition({serveUrl, id: 'MgGalleryNew', inputProps, browserExecutable});
const shot = 150;
const picks = [
  ['X01_月供水位杯', 5],
  ['X02_贷款弯道', 6],
  ['X04_户型拆解', 8],
  ['X05_楼栋剖面', 9],
  ['X08_六边形步骤', 12],
  ['X10_家庭配户型', 14],
  ['片尾_托房投出小结', 17],
];
const files = [];
for (const [name, index] of picks) {
  const frame = index * shot + 120;
  const output = join(outDir, `${name}.png`);
  await renderStill({serveUrl, composition, inputProps, frame, output, browserExecutable});
  files.push(output);
  console.log('✓', output);
}
const contact = join(outDir, '关键镜中帧联系表.png');
const args = ['-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex', 'tile=4x2:padding=12:color=0x121110', contact];
const tiled = spawnSync('ffmpeg', args, {stdio: 'inherit'});
if (tiled.status !== 0) process.exit(tiled.status ?? 1);
console.log('✓', contact);
