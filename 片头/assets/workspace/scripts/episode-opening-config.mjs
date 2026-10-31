// 5.0 定版：由「时间码字幕2.0」输出的第 1 句逐字时间码生成 src/episodeOpeningConfig.ts（片头时长 = 第 1 句 endMs）
// 用法: node scripts/episode-opening-config.mjs <校对后_动效时间轴_绝对.json> --title=期名 \
//        --keys=slam:选,tilt:照,x0:很,x1:可能,x2:把,title:带
//  keys = 动效节拍 → 第 1 句里的关键词（取该词首字 startMs）。slam=卡片落地，tilt=倾斜，x0-x2=三个红叉，title=金色扫光标题
import fs from 'node:fs';
const [file, ...rest] = process.argv.slice(2);
const opt = Object.fromEntries(rest.map((a) => a.replace(/^--/, '').split(/=(.*)/s).slice(0, 2)));
if (!file || !opt.keys) { console.error('用法见文件头'); process.exit(1); }
const s0 = JSON.parse(fs.readFileSync(file, 'utf8'))[0]; const toks = s0.tokens;
const find = (w) => { for (let i = 0; i < toks.length; i++) if (toks.slice(i, i + w.length).map((t) => t.text).join('') === w || toks[i].text.startsWith(w)) return toks[i].startMs; throw Error('第 1 句里找不到关键词：' + w); };
const timing = Object.fromEntries(opt.keys.split(',').map((kv) => { const [k, w] = kv.split(':'); return [k, find(w)]; }));
const fps = 50, endMs = s0.endMs;
const out = `export const episodeOpeningConfig={
 projectTitle:${JSON.stringify(opt.title ?? '新一期')},fps:${fps},
 source:{timingBasis:'时间码字幕2.0 · 第1句',openingStartMs:0,openingEndMs:${endMs}},
 durationInFrames:${Math.round(endMs / 1000 * fps)},
 // 绝对 tokens.startMs：${opt.keys}
 timingMs:${JSON.stringify(timing).replace(/"/g, '')},
 text:{identity:'极限小滕 房产科普'},
 colors:{background:'#07090f',accent:'#7aa2ff',silver:'#c5b89a',mist:'#a8b4c8',ink:'#0c1220'},
} as const;
`;
fs.writeFileSync(new URL('../src/episodeOpeningConfig.ts', import.meta.url), out); console.log(out);
