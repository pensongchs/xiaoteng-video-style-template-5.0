// 用法: node scripts/concat.mjs <片头.mp4> <正片.mp4> <输出.mp4>
// 两段先统一为 1920x1080 / 30fps / H.264 + AAC 48k 立体声（片头无音轨时补静音），再无损拼接。
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os'; import { join, resolve } from 'node:path';
const [a, b, out] = process.argv.slice(2);
if (!a || !b || !out) { console.error('用法: node scripts/concat.mjs 片头.mp4 正片.mp4 输出.mp4'); process.exit(1); }
const run = args => { const r = spawnSync('ffmpeg', ['-y','-v','error',...args], { stdio: 'inherit' }); if (r.status) process.exit(r.status); };
const hasAudio = f => spawnSync('ffprobe',['-v','error','-select_streams','a','-show_entries','stream=index','-of','csv=p=0',f]).stdout.toString().trim() !== '';
const tmp = mkdtempSync(join(tmpdir(), 'xt50-'));
const vf = 'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p,setsar=1';
const enc = ['-c:v','libx264','-crf','18','-preset','medium','-c:a','aac','-b:a','192k','-ar','48000','-ac','2'];
const norm = (src, dst) => hasAudio(src)
  ? run(['-i', src, '-vf', vf, ...enc, dst])
  : run(['-i', src, '-f','lavfi','-i','anullsrc=r=48000:cl=stereo', '-vf', vf, '-map','0:v','-map','1:a','-shortest', ...enc, dst]);
const p1 = join(tmp,'1.mp4'), p2 = join(tmp,'2.mp4'); norm(a,p1); norm(b,p2);
const list = join(tmp,'list.txt'); writeFileSync(list, `file '${p1}'\nfile '${p2}'\n`);
run(['-f','concat','-safe','0','-i',list,'-c','copy','-movflags','+faststart', resolve(out)]);
rmSync(tmp, { recursive: true, force: true }); console.log('✓ 已拼接：', resolve(out));
