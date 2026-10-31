const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const {root, systemInfo, platformError, dependencyStatus, resolveTool, mediaEnv, browserPath, glBackend, concurrency} = require('./runtime.cjs');
function doctor() {
  const info = systemInfo(), errors = [];
  const systemError = platformError(info);
  if (systemError) errors.push(systemError);
  const missing = dependencyStatus();
  if (missing.length) errors.push('依赖缺失或版本不符：' + missing.join('、'));
  for (const file of ['src/AsciiGradientBackground.jsx', 'src/AsciiGradientBackground.css', 'public/fonts/JiangChengLvDongSong.ttf', 'public/fonts/AlibabaHealth-Regular.ttf', 'public/fonts/AlibabaHealth-Bold.ttf', '.runtime/resources.json']) {
    if (!fs.existsSync(path.join(root, file))) errors.push('缺少资源：' + file);
  }
  if (!missing.length) {
    for (const name of ['ffmpeg', 'ffprobe']) {
      try {if (cp.spawnSync(resolveTool(name), ['-version'], {stdio: 'ignore', windowsHide: true, env: mediaEnv(name)}).status !== 0) throw Error();}
      catch {errors.push(name + '不可运行');}
    }
    try {if (cp.spawnSync(browserPath(), ['--version'], {stdio: 'ignore', windowsHide: true}).status !== 0) throw Error();}
    catch {errors.push('渲染浏览器不可运行');}
  }
  console.log(JSON.stringify({...info, gl: glBackend(), renderConcurrency: concurrency(info), errors}, null, 2));
  if (errors.length) throw Error('环境检查未通过；运行 npm run setup 后重试。');
  console.log('运行环境检查通过。请继续运行 npm run check 和示例渲染验证。');
}
if (require.main === module) {try {doctor();} catch (error) {console.error(error.message); process.exitCode = 1;}}
module.exports = {doctor};
