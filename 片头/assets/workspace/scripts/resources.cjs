const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {root, sharedHome} = require('./runtime.cjs');
const sources = require('./sources.json');
const hash = (bytes, algorithm = 'sha256') => crypto.createHash(algorithm).update(bytes).digest('hex');
async function download(url, expected, algorithm = 'sha256') {
  const folder = path.join(sharedHome, 'resource-cache');
  fs.mkdirSync(folder, {recursive: true});
  const file = path.join(folder, expected);
  if (fs.existsSync(file) && hash(fs.readFileSync(file), algorithm) === expected) return fs.readFileSync(file);
  const response = await fetch(url, {headers: {'User-Agent': 'Mozilla/5.0', Referer: 'https://fonts.zeoseven.com/'}, signal: AbortSignal.timeout(120000)});
  if (!response.ok) throw Error(`下载失败 ${response.status}：${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (hash(bytes, algorithm) !== expected) throw Error('下载校验失败：' + url);
  const temporary = file + '.tmp-' + process.pid;
  fs.writeFileSync(temporary, bytes);
  fs.renameSync(temporary, file);
  return bytes;
}
async function prepareResources() {
  const fonts = path.join(root, 'public/fonts');
  fs.mkdirSync(fonts, {recursive: true});
  fs.mkdirSync(path.join(root, '.runtime'), {recursive: true});
  const upstream = (await download(sources.background.url, sources.background.sha256)).toString('utf8');
  fs.writeFileSync(path.join(root, 'src/AsciiGradientBackground.jsx'), require('./adapt-background.cjs')(upstream));
  fs.writeFileSync(path.join(root, 'src/AsciiGradientBackground.css'), await download(sources.background.cssUrl, sources.background.cssSha256));
  fs.writeFileSync(path.join(root, '.runtime/React-Bits-LICENSE.md'), await download(sources.background.licenseUrl, sources.background.licenseSha256));
  const fontsManifest = require('./fonts.json');
  for (const font of fontsManifest.fonts) {
    const file = path.join(fonts, font.file);
    if (!fs.existsSync(file) || hash(fs.readFileSync(file)) !== font.sha256) throw Error('随包字体缺失或校验不符：' + font.file);
  }
  fs.writeFileSync(path.join(root, '.runtime/resources.json'), JSON.stringify({sourcesHash: hash(fs.readFileSync(path.join(__dirname, 'sources.json'))), bundledFonts: fontsManifest.fonts.length}, null, 2));
  console.log('三款随包字体校验通过，官方背景已就绪。');
}
module.exports = {prepareResources, download, hash};
