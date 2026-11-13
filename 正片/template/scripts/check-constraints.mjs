// 排版硬约束：字体实测 + 几何函数。不截图。
import opentype from 'opentype.js';
import {readFileSync} from 'node:fs';
import {SAFE} from '../src/style/grid.ts';
import {DEFAULT_LAYOUTS, ESTATE_LAYOUTS, NEW_LAYOUTS, POOL_LAYOUTS, layoutRects} from '../src/style/layouts.ts';
import {sceneOf, NEW_SCENE_NAMES} from '../src/style/scenes.ts';
import {connectorFaults, gapBetween, overlapArea, samplesOf} from '../src/style/geom.ts';
import {validateLibrary, planById, layoutPlan} from '../src/style/floorplans.ts';
import {contrastRatio, inkContrast, parseRgb, textTreatment} from '../src/style/readability.ts';
import {FOG, glassEnter, GLASS_ENTER_FRAMES} from '../src/style/tokens.ts';
import {matchEpisode, quotaFaults} from '../src/match/matchCopy.ts';
import {SUB} from '../src/style/subtitle-tokens.ts';

const errs = [];
const font = opentype.loadSync(new URL('../public/fonts/AlibabaHealthFont2.0CN-85B.ttf', import.meta.url));
const widthOf = (text, size) => font.getAdvanceWidth(text, size);

if (DEFAULT_LAYOUTS.length !== 26) errs.push(`默认版式 ${DEFAULT_LAYOUTS.length} ≠ 26`);
if (ESTATE_LAYOUTS.length !== 9) errs.push(`房产 MG ${ESTATE_LAYOUTS.length} ≠ 9`);
if (NEW_LAYOUTS.length !== 17) errs.push(`新卡 ${NEW_LAYOUTS.length} ≠ 17`);
if (POOL_LAYOUTS.length !== 43) errs.push(`选卡池 ${POOL_LAYOUTS.length} ≠ 43`);
for (const name of NEW_LAYOUTS) if (DEFAULT_LAYOUTS.includes(name)) errs.push(`${name} 不应替换默认 26`);

if (SUB.size !== 40 || SUB.color !== '#F4EEE4' || SUB.hi !== '#F3D79E' || SUB.bottom !== 44) {
  errs.push(`字幕定版被改动 ${JSON.stringify({size: SUB.size, color: SUB.color, hi: SUB.hi, bottom: SUB.bottom})}`);
}

const lib = validateLibrary();
lib.forEach((e) => errs.push(e));

const planRect = layoutRects('planSplit').plan;
const plan = planById('三室-甲');
const laid = layoutPlan(plan, planRect);
plan.rooms.forEach((r) => {
  const room = {x: laid.X(r.x), y: laid.Y(r.y), w: r.w * laid.scale, h: r.h * laid.scale};
  const nw = widthOf(r.name, 30);
  const nameBox = {x: laid.X(r.x + r.w / 2) - nw / 2, y: laid.Y(r.y + r.h / 2) - 32, w: nw, h: 30};
  if (nameBox.x < room.x + 2 || nameBox.x + nameBox.w > room.x + room.w - 2 || nameBox.y < room.y + 2) errs.push(`户型「${r.name}」字压到墙或房间外`);
  const near = samplesOf(laid.flow, 2).some((p) => Math.hypot(p[0] - (nameBox.x + nameBox.w / 2), p[1] - (nameBox.y + 15)) < 12);
  if (near) errs.push(`房间名「${r.name}」离动线 < 12px`);
});

for (const name of NEW_SCENE_NAMES) {
  const sc = sceneOf(name);
  const tones = new Set(sc.cards.map((c) => c.tone));
  if (tones.size > 2) errs.push(`${name} 色调 ${tones.size}`);
  const shapes = sc.cards.map((c) => c.poly);
  for (const c of sc.cards) for (const t of c.texts) {
    if (/投资|一定|必涨/.test(t.text)) errs.push(`${name} 禁用词「${t.text}」`);
    const min = t.role === 'room' ? 30 : t.role === 'label' ? 28 : t.role === 'num' ? 28 : 34;
    if (t.size < min) errs.push(`${name} ${t.role} ${t.size}px「${t.text}」`);
    const chars = [...t.text.replace(/\s/g, '')].length;
    if (t.role === 'title' && chars > 8) errs.push(`${name} 卡标题超 8 字「${t.text}」`);
    if (t.role === 'body' && chars > 16) errs.push(`${name} 正文超 16 字「${t.text}」`);
    if (t.role === 'label' && chars > 6 && t.size <= 28) errs.push(`${name} 标签超 6 字「${t.text}」`);
    const measured = widthOf(t.text, t.size);
    if (measured > t.box.w * 0.75 + 1) errs.push(`${name}「${t.text}」实测 ${measured.toFixed(0)}px > 容器 ${t.box.w.toFixed(0)} 的 75%`);
    if (t.box.x < SAFE.left || t.box.x + t.box.w > SAFE.right + 1 || t.box.y < 248 || t.box.y + t.box.h > 880) errs.push(`${name} 文字越出内容区「${t.text}」`);
  }
  for (const ln of sc.lines) {
    const faults = connectorFaults(ln.pts, ln.width, shapes, 2, ln.kind === 'diagram' ? 'none' : ln.anchor)
      .filter((f) => ln.kind === 'diagram' ? /进入|内部/.test(f) : true);
    faults.forEach((f) => errs.push(`${name}/${ln.id} ${f}`));
  }
  if (name === 'loanCurve' || name === 'hexSteps') {
    const flows = sc.lines.filter((l) => l.id === 'path' || l.id.startsWith('flow') || l.id.startsWith('stem'));
    if (flows.some((l) => l.pts.length < 6)) errs.push(`${name} 流程线不够顺`);
  }
  for (const c of sc.cards) {
    const texts = c.texts.map((t) => t.box);
    for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
      if (overlapArea(texts[i], texts[j]) > 0) errs.push(`${name}/${c.id} 文字互相重叠`);
    }
    for (const m of c.marks ?? []) for (const t of c.texts) {
      const gap = gapBetween(t.box, m);
      if (gap < 24) errs.push(`${name}/${c.id} 文字「${t.text}」与图形间距 ${gap.toFixed(0)}px < 24`);
    }
  }
  if (name === 'hexSteps') {
    const caps = sc.cards.flatMap((c) => c.texts.filter((t) => t.role === 'body').slice(1));
    caps.forEach((t) => { if ([...t.text].length > 6) errs.push(`六边形说明超 6 字「${t.text}」`); });
  }
}

for (const [L, p90, want] of [[0.3, 0.3, 'legacy'], [0.5, 0.5, 'tx2'], [0.7, 0.8, 'bar'], [0.4, 0.8, 'tx2']]) {
  if (textTreatment(L, p90) !== want) errs.push(`文字处理 L=${L} P90=${p90} 应为 ${want}`);
}
for (const tone of Object.keys(FOG)) {
  const dark = inkContrast([8, 8, 8], tone);
  const bright = inkContrast([245, 245, 245], tone);
  if (!dark.ok || contrastRatio(parseRgb(FOG[tone].ink), [250, 243, 231]) < 4.5) errs.push(`${tone} 深墨对比不足`);
  if (!bright.ok) errs.push(`${tone} 亮底对比不足`);
}
for (const kind of ['enter', 'shaped', 'soft', 'chip']) {
  let prev = -1;
  for (let f = -5; f <= 40; f += 0.5) {
    const p = glassEnter(f, 0, kind);
    if (p < prev || p < 0 || p > 1) errs.push(`${kind} 入场不单调 ${f}`);
    prev = p;
  }
  if (glassEnter(GLASS_ENTER_FRAMES[kind], 0, kind) !== 1) errs.push(`${kind} 到位不是 1`);
  if (glassEnter(GLASS_ENTER_FRAMES[kind] + 8, 0, kind) !== 1) errs.push(`${kind} 到位后还在变`);
}

const demo = [
  {text: '你知道吗，很多人第一步就看错了', count: 1},
  {text: '月供大概占收入的30%', count: 1, evidenced: true},
  {text: '新房还是二手，差在入住时间', count: 2, struct: 'A/B 两组'},
  {text: '从签约到放款要过几关', count: 5, struct: '带时间的节点'},
  {text: '先看小区，然后看楼栋，接着看户型', count: 3, struct: '3–5 个有序项'},
  {text: '地铁步行八分钟，学校过一条马路', count: 3},
  {text: '这个户型得房率和动线怎么样', count: 1},
  {text: '窗角有没有水渍，空鼓要小心', count: 3},
  {text: '契税和维修金都要提前留出来', count: 3},
  {text: '总之记住，月供别超过收入的三分之一', count: 3},
];
const picks = matchEpisode(demo, {episode: '12', title: '月供和户型'});
quotaFaults(picks).forEach((f) => errs.push(`匹配配额 ${f}`));
const again = matchEpisode(demo, {episode: '12', title: '月供和户型'});
if (picks.map((p) => p.layout).join() !== again.map((p) => p.layout).join()) errs.push('同一期号匹配结果不稳定');
const banned = matchEpisode([{text: '这套房一定投资必涨', title: '投资必涨'}], {title: '投资'});
if (banned[0].status !== 'manual') errs.push('禁用词没有拦下');
const cooled = matchEpisode(demo, {episode: '6', title: '月供和户型', history: {media: (picks.map((p) => p.media).filter(Boolean)).map((id) => ({id, episode: 5}))}});
if (cooled.some((p) => p.media && picks.some((q) => q.media === p.media) && !p.mediaRelaxed)) errs.push('3 期冷却没有拦住刚用过的素材');
if (readFileSync(new URL('../src/style/subtitle-tokens.ts', import.meta.url), 'utf8').includes('size: 42')) errs.push('字幕被改回 42');

export const constraintErrors = errs;
if (process.argv[1] && process.argv[1].endsWith('check-constraints.mjs')) {
  if (errs.length) { console.log('✗ 约束\n' + errs.join('\n')); process.exit(1); }
  console.log(`✓ 约束通过：26+9 仍在，新卡 ${NEW_LAYOUTS.length}，户型库，连线，字体实测，对比度，匹配`);
}
