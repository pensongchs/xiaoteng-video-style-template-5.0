import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2];
if (!target) throw Error('请提供学员工作目录的完整路径。');
const output = path.resolve(target);
if (fs.existsSync(output)) throw Error('目标目录已存在，请续接已有母工程，或选择新的空目录：' + output);
fs.mkdirSync(path.dirname(output), {recursive: true});
const template = path.join(skillRoot, 'assets/workspace');
fs.cpSync(template, output, {recursive: true, dereference: false, force: false, errorOnExist: true,
  filter: source => {
    const relative = path.relative(template, source).split(path.sep);
    if (relative.some(part => ['node_modules', '.runtime', 'renders', '检查结果', '预览图'].includes(part))) return false;
    return !['src/AsciiGradientBackground.jsx', 'src/AsciiGradientBackground.css'].includes(relative.join('/'));
  }});
console.log('片头母工程已创建：' + output);
console.log('请进入该目录，运行 node scripts/setup.cjs。');
