// 5.0 定版 一键出片：片头 + 正片 → 拼接 → 配音混流（setpts 修正）
// 用法: node scripts/build-episode.mjs <期名> [--audio=配音.mp4] [--dur=98.0] [--skip-opening] [--skip-main]
// 需要：正片/template/episodes/<期名>/{shots.ts, 音频, subs.srt/captions.json, 片头/{校对后_动效时间轴_绝对.json, keys.txt}}
//       片头工程 outputs/片头制作专用（node scripts/setup.cjs 过一次）
// 复现参考期： node scripts/build-episode.mjs 选楼层口诀 --audio=episodes_work/选楼层口诀/配音v2.mp4 --dur=98.0
import {spawnSync} from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [name, ...rest] = process.argv.slice(2); if (!name) { console.error('用法: node scripts/build-episode.mjs <期名>'); process.exit(1); }
const opt = Object.fromEntries(rest.map((a) => { const [k, v] = a.replace(/^--/, '').split(/=(.*)/s); return [k, v ?? true]; }));
const T = path.join(ROOT, '正片/template'), O = path.join(ROOT, 'outputs/片头制作专用'), EP = path.join(T, 'episodes', name);
const W = path.join(ROOT, 'episodes_work', name); fs.mkdirSync(W, {recursive: true});
const run = (cmd, args, cwd) => { console.log('›', cmd, args.join(' ')); const r = spawnSync(cmd, args, {cwd, stdio: 'inherit'}); if (r.status) process.exit(r.status); };
const npx = (cwd, args) => run('npx', ['remotion', ...args, '--gl=swangle', '--timeout=120000'], cwd);
const opening = path.join(O, 'renders', `${name}_横屏片头.mp4`), main = path.join(T, 'out', `${name}_正片.mp4`);
if (!opt['skip-opening']) {
  const keys = fs.readFileSync(path.join(EP, '片头/keys.txt'), 'utf8').trim();
  run('node', [path.join(O, 'scripts/episode-opening-config.mjs'), path.join(EP, '片头/校对后_动效时间轴_绝对.json'), `--title=${name}`, `--keys=${keys}`], O);
  const custom = path.join(EP, '片头/EpisodeOpening.tsx'); if (fs.existsSync(custom)) fs.copyFileSync(custom, path.join(O, 'src/EpisodeOpening.tsx'));
  npx(O, ['render', 'src/index.ts', 'EpisodeOpening', opening, '--codec=h264', '--crf=16', '--pixel-format=yuv420p']);
}
if (!opt['skip-main']) {
  const demo = path.join(T, 'src/demo'), bk = fs.mkdtempSync('/tmp/xt50demo-'); fs.cpSync(demo, bk, {recursive: true});
  try {
    fs.copyFileSync(path.join(EP, 'shots.ts'), path.join(demo, 'shots.ts'));
    run('node', ['scripts/episode.mjs', name], T);
    npx(T, ['render', 'src/index.ts', 'Style50-Demo', main, '--codec=h264', '--crf=18', '--audio-codec=aac', '--audio-bitrate=192k']);
  } finally { fs.cpSync(bk, demo, {recursive: true}); }
}
const cat = path.join(W, '_concat.mp4'), out = path.join(W, `${name}_成品.mp4`);
run('node', [path.join(ROOT, 'scripts/concat.mjs'), opening, main, cat], ROOT);
const audio = opt.audio ? path.resolve(ROOT, opt.audio) : null;
const dur = opt.dur ?? spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio ?? cat]).stdout.toString().trim();
run('ffmpeg', ['-y', '-v', 'error', '-i', cat, ...(audio ? ['-i', audio, '-map', '0:v:0', '-map', '1:a:0'] : []), '-vf', 'setpts=PTS-STARTPTS',
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-t', String(dur), '-r', '30', '-movflags', '+faststart', out], ROOT);
const D = path.join(ROOT, 'outputs/成片', name); fs.mkdirSync(D, {recursive: true});
fs.copyFileSync(out, path.join(D, '成片.mp4')); fs.copyFileSync(main, path.join(D, '正片.mp4')); fs.copyFileSync(opening, path.join(D, '片头.mp4')); fs.rmSync(cat);
console.log('✓ 成品：', out, '\n✓ 已复制到：', D);
