const path = require('node:path');
const fs = require('node:fs');
const {root, run, concurrency, glBackend, browserPath} = require('./runtime.cjs');
const [mode, ...args] = process.argv.slice(2);
try {
  if (mode === 'check') {
    run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '--noEmit']);
  } else {
    require('./doctor.cjs').doctor();
    const cli = path.join(root, 'node_modules/@remotion/cli/remotion-cli.js');
    const browser = '--browser-executable=' + browserPath();
    const graphics = '--gl=' + glBackend();
    if (mode === 'studio') run(process.execPath, [cli, 'studio', 'src/index.ts', '--no-open', ...args]);
    else if (mode === 'render') {
      if (args.length > 1) throw Error('用法：npm run render -- 成片路径.mp4');
      const output = args[0] || 'renders/示例片头.mp4';
      fs.mkdirSync(path.dirname(path.resolve(root, output)), {recursive: true});
      run(process.execPath, [cli, 'render', 'src/index.ts', 'Opening', output, '--codec=h264', '--crf=16', '--pixel-format=yuv420p', graphics, '--concurrency=' + concurrency(), '--timeout=120000', browser]);
    } else if (mode === 'still') {
      const frame = Number(args[0] || 0), output = args[1] || '预览图/示例片头.png';
      if (args.length > 2 || !Number.isInteger(frame) || frame < 0) throw Error('用法：npm run still -- 帧号 图片路径.png');
      fs.mkdirSync(path.dirname(path.resolve(root, output)), {recursive: true});
      run(process.execPath, [cli, 'still', 'src/index.ts', 'Opening', output, '--frame=' + frame, graphics, '--timeout=120000', browser]);
    } else throw Error('未知命令：' + mode);
  }
} catch (error) {console.error(error.message); process.exitCode = 1;}
