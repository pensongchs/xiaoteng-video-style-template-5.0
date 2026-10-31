const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const {root, resolveTool, mediaEnv} = require('./runtime.cjs');
function capture(tool, args) {
  const result = cp.spawnSync(resolveTool(tool), args, {encoding: 'utf8', windowsHide: true, env: mediaEnv(tool), maxBuffer: 10 * 1024 * 1024});
  if (result.error || result.status !== 0) throw result.error || Error(result.stderr);
  return result;
}
async function inspectFrames(input) {
  // Remotion随包FFmpeg不含blackdetect和null默认编码器，使用缩小后的RGB帧逐帧检查。
  const frameBytes = 320 * 180 * 3;
  let pending = Buffer.alloc(0), frames = 0, blackFrames = [], stderr = '';
  await new Promise((resolve, reject) => {
    const child = cp.spawn(resolveTool('ffmpeg'), ['-v', 'error', '-i', input, '-an', '-s', '320x180', '-pix_fmt', 'rgb24', '-c:v', 'rawvideo', '-f', 'image2pipe', '-'], {env: mediaEnv('ffmpeg'), windowsHide: true});
    child.on('error', reject);
    child.stderr.on('data', bytes => {stderr += bytes.toString();});
    child.stdout.on('data', bytes => {
      pending = Buffer.concat([pending, bytes]);
      let offset = 0;
      while (pending.length - offset >= frameBytes) {
        let dark = 0;
        for (let i = offset; i < offset + frameBytes; i += 3) if (0.2126 * pending[i] + 0.7152 * pending[i + 1] + 0.0722 * pending[i + 2] < 10) dark++;
        if (dark / (320 * 180) >= 0.98) blackFrames.push(frames);
        frames++;
        offset += frameBytes;
      }
      pending = Buffer.from(pending.subarray(offset));
    });
    child.on('close', code => code === 0 && pending.length === 0 ? resolve() : reject(Error(stderr || '视频解码失败')));
  });
  return {frames, blackFrames};
}
async function main() {
  const input = path.resolve(root, process.argv[2] || 'renders/示例片头.mp4');
  const media = JSON.parse(capture('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', input]).stdout);
  const video = media.streams.find(stream => stream.codec_type === 'video');
  if (!video || video.width !== 1920 || video.height !== 1080 || video.codec_name !== 'h264') throw Error('成片视频规格不符');
  const config = fs.readFileSync(path.join(root, 'src/openingConfig.ts'), 'utf8');
  const expectedFrames = Number(config.match(/durationInFrames\s*:\s*(\d+)/)?.[1]);
  const expectedFps = Number(config.match(/fps\s*:\s*(\d+)/)?.[1]);
  const [a, b] = video.avg_frame_rate.split('/').map(Number);
  if (!expectedFrames || !expectedFps || Number(video.nb_read_frames) !== expectedFrames || a / b !== expectedFps || Math.abs(Number(video.duration) - expectedFrames / expectedFps) > 1 / expectedFps) throw Error('时长、帧率或帧数与本期配置不符');
  if (media.streams.some(stream => stream.codec_type === 'audio')) throw Error('默认纯画面片头含有音轨，请核对本期要求');
  const decoded = await inspectFrames(input);
  if (decoded.frames !== expectedFrames) throw Error('实际解码帧数与本期配置不符');
  if (decoded.blackFrames.length) throw Error('检测到黑帧，请检查帧号：' + decoded.blackFrames.join('、'));
  const report = {file: path.relative(root, input), width: video.width, height: video.height, fps: a / b, frames: Number(video.nb_read_frames), duration: Number(video.duration), codec: video.codec_name, audioStreams: 0, fullDecode: 'passed', blackFrames: 'none detected', visualReview: 'requires inspection of first, last and transition frames', audioSync: 'pure picture; no audio supplied'};
  fs.mkdirSync(path.join(root, '检查结果'), {recursive: true});
  fs.writeFileSync(path.join(root, '检查结果/媒体检查.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => {console.error(error.message); process.exitCode = 1;});
