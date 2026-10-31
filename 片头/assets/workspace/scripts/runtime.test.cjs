const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const {platformError, concurrency, glBackend, fingerprint, run} = require('./runtime.cjs');
const baseline = {platform: 'darwin', release: '24.0.0', arch: 'arm64', node: '24.14.0', cpuThreads: 8, totalMemoryGB: 16, freeMemoryGB: 8};
test('匹配组复用；系统、架构、Node主版本与任一清单变化都隔离', () => {
  const key = fingerprint('package', 'lock', baseline);
  assert.equal(key, fingerprint('package', 'lock', {...baseline, node: '24.22.0'}));
  for (const patch of [{platform: 'win32'}, {arch: 'x64'}, {node: '22.0.0'}]) assert.notEqual(key, fingerprint('package', 'lock', {...baseline, ...patch}));
  assert.notEqual(key, fingerprint('changed', 'lock', baseline));
  assert.notEqual(key, fingerprint('package', 'changed', baseline));
});
test('识别Mac双芯片与Windows x64；阻止不支持环境', () => {
  for (const arch of ['arm64', 'x64']) assert.equal(platformError({...baseline, arch}), null);
  assert.equal(platformError({...baseline, platform: 'win32', release: '10.0.26100', arch: 'x64'}), null);
  for (const info of [{node: '20.0.0'}, {release: '23.0.0'}, {platform: 'win32', release: '10.0.26100', arch: 'arm64'}]) assert.ok(platformError({...baseline, ...info}));
  assert.equal(concurrency({...baseline, totalMemoryGB: 8}, {}), 1);
  assert.equal(concurrency(baseline, {}), 2);
});
test('云端无显卡环境使用兼容渲染并限制并发；桌面保持原效果渲染', () => {
  assert.equal(glBackend({}), 'angle');
  assert.equal(glBackend({GITHUB_ACTIONS: 'true'}), 'swangle');
  assert.equal(concurrency(baseline, {CI: 'true'}), 1);
  assert.equal(glBackend({XIAOTENG_GL: 'swangle'}), 'swangle');
  assert.throws(() => glBackend({XIAOTENG_GL: 'unknown'}));
});
test('中文和空格路径保留；子进程失败能传出', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), '小滕 学员 '));
  try {
    const result = run(process.execPath, ['-e', 'process.stdout.write(process.argv[1])', '带 空格与中文'], dir, {stdio: 'pipe', encoding: 'utf8'});
    assert.equal(result.stdout, '带 空格与中文');
    assert.throws(() => run(process.execPath, ['-e', 'process.exit(3)'], dir, {stdio: 'pipe'}));
    const script = path.resolve(__dirname, '../../..', 'scripts/create-project.mjs');
    if (fs.existsSync(script)) {
      const project = path.join(dir, '片头 工程');
      assert.equal(cp.spawnSync(process.execPath, [script, project]).status, 0);
      assert.ok(fs.existsSync(path.join(project, 'src/Opening.tsx')));
      fs.writeFileSync(path.join(project, '用户素材.txt'), '保留');
      assert.notEqual(cp.spawnSync(process.execPath, [script, project]).status, 0);
      assert.equal(fs.readFileSync(path.join(project, '用户素材.txt'), 'utf8'), '保留');
    }
  } finally {fs.rmSync(dir, {recursive: true, force: true});}
});
