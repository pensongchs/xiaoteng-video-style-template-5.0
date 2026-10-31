const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
const sharedHome = path.join(codexHome, 'shared-node-dependencies');
function systemInfo() {
  return {platform: process.platform, release: os.release(), arch: process.arch,
    hardwareArch: process.env.PROCESSOR_ARCHITEW6432 || process.env.PROCESSOR_ARCHITECTURE || process.arch,
    node: process.versions.node, cpuThreads: os.availableParallelism?.() || os.cpus().length,
    totalMemoryGB: Math.round(os.totalmem() / 2 ** 30), freeMemoryGB: Math.round(os.freemem() / 2 ** 30)};
}
function platformError(info = systemInfo()) {
  if (Number(info.node.split('.')[0]) < 22) return '需要 Node.js 22 以上，建议安装 Node.js 24 LTS。';
  if (info.platform === 'darwin') {
    if (!['arm64', 'x64'].includes(info.arch)) return 'Mac 仅支持 Apple 芯片 arm64 和 Intel x64。';
    if (Number(info.release.split('.')[0]) < 24) return '当前支持 macOS 15 及以上，请先升级系统。';
    return null;
  }
  if (info.platform === 'win32') {
    if (Number(info.release.split('.')[0]) < 10) return '需要 Windows 10/11 64 位系统。';
    if (info.arch !== 'x64') return '当前 Remotion 编码器需要 Windows x64 Node.js；ARM 电脑请在 Windows 11 的 x64 兼容环境使用 x64 Node.js。';
    return null;
  }
  return '本模板面向 macOS 和 Windows，当前系统尚未验证。';
}
function glBackend(env = process.env) {
  if (env.XIAOTENG_GL) {
    if (!['angle', 'swangle'].includes(env.XIAOTENG_GL)) throw Error('XIAOTENG_GL只支持angle或swangle');
    return env.XIAOTENG_GL;
  }
  return env.CI === 'true' || env.GITHUB_ACTIONS === 'true' ? 'swangle' : 'angle';
}
function concurrency(info = systemInfo(), env = process.env) {
  if (glBackend(env) === 'swangle') return 1;
  return info.cpuThreads < 4 || info.totalMemoryGB <= 8 || info.freeMemoryGB < 3 ? 1 : 2;
}
function fingerprint(pkg, lock, info = systemInfo()) {
  return crypto.createHash('sha256').update(`npm|node-${info.node.split('.')[0]}|${info.platform}|${info.arch}`)
    .update('\0').update(pkg).update('\0').update(lock).digest('hex');
}
function run(file, args, cwd = root, extra = {}) {
  const result = cp.spawnSync(file, args, {cwd, stdio: 'inherit', windowsHide: true, ...extra});
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error(`执行失败：${path.basename(file)}，退出码 ${result.status}`);
  return result;
}
function npmCi(cwd, cache) {
  const args = ['ci', '--include=dev', '--include=optional', '--prefer-offline', '--no-audit', '--no-fund'];
  const extra = {env: {...process.env, npm_config_cache: cache}};
  if (process.env.npm_execpath && /npm-cli\.js$/.test(process.env.npm_execpath)) {
    return run(process.execPath, [process.env.npm_execpath, ...args], cwd, extra);
  }
  if (process.platform === 'win32') return run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `npm ${args.join(' ')}`], cwd, extra);
  return run('npm', args, cwd, extra);
}
function dependencyStatus() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'))), missing = [];
  for (const [name, expected] of Object.entries({...pkg.dependencies, ...pkg.devDependencies})) {
    try {
      if (JSON.parse(fs.readFileSync(path.join(root, 'node_modules', name, 'package.json'))).version !== expected) missing.push(name);
    } catch {missing.push(name);}
  }
  if (!missing.length) {
    try {
      const executable = require('@remotion/renderer').RenderInternals.getExecutablePath({type: 'compositor', indent: false, logLevel: 'error', binariesDirectory: null});
      if (!fs.existsSync(executable)) missing.push('本机编码器');
    } catch {missing.push('本机编码器');}
  }
  return missing;
}
function prepareDependencies() {
  const pkg = fs.readFileSync(path.join(root, 'package.json'));
  const lock = fs.readFileSync(path.join(root, 'package-lock.json'));
  const key = fingerprint(pkg, lock), group = path.join(sharedHome, 'runtimes', key);
  const modules = path.join(group, 'node_modules'), local = path.join(root, 'node_modules');
  const marker = path.join(group, 'runtime.json');
  const existing = fs.lstatSync(local, {throwIfNoEntry: false});
  if (existing && !existing.isSymbolicLink()) throw Error('工程已有实体 node_modules。请先由 Codex 核对并迁移到共享运行组，不自动删除。');
  // Mac 优先兼容已有全局管理器；Windows 使用 junction，无需管理员符号链接权限。
  const helper = path.join(sharedHome, 'ensure.mjs');
  if (process.platform !== 'win32' && fs.existsSync(helper)) {
    run(process.execPath, [helper, root]);
  } else {
    fs.mkdirSync(group, {recursive: true});
    if (!fs.existsSync(marker) || !fs.existsSync(path.join(modules, '.package-lock.json'))) {
      const guard = path.join(group, 'preparing');
      try {fs.mkdirSync(guard);} catch {throw Error('相同依赖正在安装。稍后重试；若上次中断，请先确认无安装进程再移除：' + guard);}
      try {
        fs.writeFileSync(path.join(group, 'package.json'), pkg);
        fs.writeFileSync(path.join(group, 'package-lock.json'), lock);
        npmCi(group, path.join(sharedHome, 'npm-cache'));
        fs.writeFileSync(marker, JSON.stringify({digest: key, packageManager: 'npm', ...systemInfo()}, null, 2));
      } finally {fs.rmdirSync(guard);}
    }
    let linked = false;
    if (existing) {
      try {linked = fs.realpathSync(local) === fs.realpathSync(modules);} catch {}
      if (!linked) fs.unlinkSync(local);
    }
    if (!linked) fs.symlinkSync(modules, local, process.platform === 'win32' ? 'junction' : 'dir');
  }
  const missing = dependencyStatus();
  if (missing.length) throw Error('共享依赖不完整：' + missing.join('、'));
  console.log('已复用共享运行组：' + fs.realpathSync(local));
}
function resolveTool(type) {
  if (!['ffmpeg', 'ffprobe'].includes(type)) throw Error('未知媒体工具');
  return require('@remotion/renderer').RenderInternals.getExecutablePath({type, indent: false, logLevel: 'error', binariesDirectory: null});
}
function mediaEnv(type) {
  return process.platform === 'darwin' ? {...process.env, DYLD_LIBRARY_PATH: path.dirname(resolveTool(type))} : process.env;
}
function browserPath() {
  const record = JSON.parse(fs.readFileSync(path.join(root, '.runtime/browser.json')));
  if (!fs.existsSync(record.path)) throw Error('渲染浏览器不存在，请重新运行 npm run setup');
  return record.path;
}
module.exports = {root, sharedHome, systemInfo, platformError, glBackend, concurrency, fingerprint, run, npmCi, dependencyStatus, prepareDependencies, resolveTool, mediaEnv, browserPath};
