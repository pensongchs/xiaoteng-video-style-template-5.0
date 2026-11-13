// 为镜头背景抽一帧，算出平均亮度 L 和 P90，写入 src/demo/luma.json。
// 用法：npm run luma
import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync, writeFileSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {SHOTS} from '../src/demo/shots.ts';
import {NEW_GALLERY, OUTRO_INTERACT} from '../src/gallery/shots-mg-new.ts';

const rel = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const Lof = (r, g, b) => 0.2126 * rel(r / 255) + 0.7152 * rel(g / 255) + 0.0722 * rel(b / 255);

export const measureFile = (file, trim = 0) => {
  if (!existsSync(file)) return null;
  const raw = join(mkdtempSync(join(tmpdir(), 'luma-')), 'frame.raw');
  const args = ['-y', '-v', 'error', '-ss', String(Math.max(0, trim)), '-i', file, '-frames:v', '1', '-vf', 'scale=192:108', '-f', 'rawvideo', '-pix_fmt', 'rgb24', raw];
  const r = spawnSync('ffmpeg', args);
  if (r.status !== 0 || !existsSync(raw)) return null;
  const buf = readFileSync(raw);
  const px = Math.floor(buf.length / 3);
  const ls = [];
  for (let i = 0; i < px; i++) ls.push(Lof(buf[i * 3], buf[i * 3 + 1], buf[i * 3 + 2]));
  ls.sort((a, b) => a - b);
  const luma = ls.reduce((s, v) => s + v, 0) / ls.length;
  const p90 = ls[Math.min(ls.length - 1, Math.floor(ls.length * 0.9))];
  return {luma: Math.round(luma * 1000) / 1000, p90: Math.round(p90 * 1000) / 1000};
};

const table = {};
const jobs = [];
for (const s of [...SHOTS, ...NEW_GALLERY, ...OUTRO_INTERACT]) {
  const src = s.bg?.src;
  if (!src || table[src] || jobs.includes(src)) continue;
  jobs.push(src);
  const file = 'public/' + src;
  const got = measureFile(file, s.bg.trim ?? 0);
  if (got) table[src] = got;
  else console.log(`  跳过（文件不在） ${src}`);
}
writeFileSync('src/demo/luma.json', JSON.stringify(table, null, 2) + '\n');
console.log(`✓ 实测亮度 ${Object.keys(table).length} 段 → src/demo/luma.json`);
