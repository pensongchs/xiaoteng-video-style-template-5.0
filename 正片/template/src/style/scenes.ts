/** 17 款新卡的停稳几何。组件和检查读同一份坐标。 */
import {layoutRects, type LayoutName} from './layouts.ts';
import {cubic, rectPoly, type Box, type Pt} from './geom.ts';
import type {FogTone} from './tokens.ts';

export type TextRun = {text: string; size: number; role: 'title' | 'body' | 'label' | 'room' | 'num'; box: Box};
export type CardGeom = {id: string; poly: Pt[]; tone: FogTone; texts: TextRun[]; marks?: Box[]};
export type LineGeom = {id: string; pts: Pt[]; width: number; anchor: 'both' | 'start' | 'end' | 'none'; kind: 'connector' | 'diagram'; color?: string; dot?: boolean};
export type Scene = {cards: CardGeom[]; lines: LineGeom[]; planId?: string};

const box = (x: number, y: number, w: number, h: number): Box => ({x, y, w, h});
const card = (id: string, b: Box, tone: FogTone, texts: TextRun[]): CardGeom => ({id, poly: rectPoly(b), tone, texts});
const T = (text: string, size: number, role: TextRun['role'], b: Box): TextRun => ({text, size, role, box: b});
const inset = (b: Box, p = 32): Box => ({x: b.x + p, y: b.y + p, w: b.w - p * 2, h: b.h - p * 2});

const hexPoly = (b: Box): Pt[] => {
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, rx = b.w / 2, ry = b.h / 2;
  return [[cx - rx * 0.5, cy - ry], [cx + rx * 0.5, cy - ry], [cx + rx, cy], [cx + rx * 0.5, cy + ry], [cx - rx * 0.5, cy + ry], [cx - rx, cy]];
};
const circlePoly = (cx: number, cy: number, r: number, n = 28): Pt[] =>
  Array.from({length: n}, (_, i) => {
    const a = (Math.PI * 2 * i) / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt;
  });
const archPoly = (b: Box): Pt[] => {
  const pts: Pt[] = [[b.x, b.y + b.h], [b.x + b.w, b.y + b.h]];
  const cx = b.x + b.w / 2, rad = b.w / 2, top = b.y + rad;
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI * (1 - i / 16);
    pts.push([cx + Math.cos(a) * rad, top - Math.sin(a) * rad]);
  }
  return pts;
};
const slashPoly = (b: Box, side: 'left' | 'right'): Pt[] => {
  const cut = b.w * 0.14;
  return side === 'left'
    ? [[b.x, b.y], [b.x + b.w - cut, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]]
    : [[b.x + cut, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]];
};

const along = (b: Box, n: number, gap: number, vertical = false): Box[] => {
  if (vertical) {
    const h = (b.h - gap * (n - 1)) / n;
    return Array.from({length: n}, (_, i) => box(b.x, b.y + i * (h + gap), b.w, h));
  }
  const w = (b.w - gap * (n - 1)) / n;
  return Array.from({length: n}, (_, i) => box(b.x + i * (w + gap), b.y, w, b.h));
};

export const HEX_STEPS = [
  {k: '查额度', a: '看缴存', b: '和年限'},
  {k: '选方式', a: '纯公积金', b: '或组合'},
  {k: '交材料', a: '身份证', b: '收入证明'},
  {k: '等审批', a: '审批通过', b: '银行放款'},
];
export const CURVE_STEPS = [
  {k: '网签', s: '签合同'}, {k: '面签', s: '银行见'}, {k: '批贷', s: '等审批'}, {k: '登记', s: '办手续'}, {k: '放款', s: '到卖方'},
];

const scenes: Record<string, () => Scene> = {
  ticketStub: () => {
    const r = layoutRects('ticketStub').ticket;
    const stubW = 420;
    const main = box(r.x, r.y, r.w - stubW - 28, r.h);
    const stub = box(main.x + main.w + 28, r.y, stubW, r.h);
    const inner = inset(main);
    return {cards: [
      card('main', main, 'champ', [
        T('购房杂费', 40, 'title', box(inner.x, inner.y, inner.w, 52)),
        T('契税 1%–3%', 34, 'body', box(inner.x, inner.y + 80, inner.w, 46)),
        T('中介费 看合同', 34, 'body', box(inner.x, inner.y + 136, inner.w, 46)),
        T('维修金 按面积', 34, 'body', box(inner.x, inner.y + 192, inner.w, 46)),
      ]),
      card('stub', stub, 'clay', [
        T('合计', 28, 'label', box(stub.x + 32, stub.y + 48, stub.w - 64, 36)),
        T('3–5%', 72, 'num', box(stub.x + 24, stub.y + 110, stub.w - 48, 90)),
        T('示例', 28, 'label', box(stub.x + 32, stub.y + stub.h - 80, stub.w - 64, 36)),
      ]),
    ], lines: []};
  },
  indexTabs: () => {
    const R = layoutRects('indexTabs');
    const tabs = along(R.tabs, 3, 36);
    const body = R.body;
    const inner = inset(body);
    return {cards: [
      ...tabs.map((b, i) => card('tab' + i, b, i === 2 ? 'champ' : 'paper', [T(['看小区', '看楼栋', '看户型'][i], 34, 'body', inset(b, 16))])),
      card('body', body, 'paper', [
        T('南北通透', 34, 'body', box(inner.x, inner.y, inner.w, 48)),
        T('动静分区', 34, 'body', box(inner.x, inner.y + 64, inner.w, 48)),
        T('方正实用', 34, 'body', box(inner.x, inner.y + 128, inner.w, 48)),
        T('3/3', 28, 'label', box(inner.x + inner.w - 120, inner.y + 200, 88, 36)),
      ]),
    ], lines: []};
  },
  amenityPins: () => {
    const map = layoutRects('amenityPins').map;
    const ring = box(map.x + 24, map.y + 36, 420, 360);
    const labels = [box(980, 300, 460, 130), box(860, 490, 420, 130), box(1080, 680, 420, 130)];
    const names = ['地铁站 步行8分', '小学 过马路', '公园 300米'];
    const dots: Pt[] = [[700, 360], [620, 540], [860, 730]];
    const lines: LineGeom[] = labels.map((b, i) => ({
      id: 'pin' + i, kind: 'connector', width: 4, anchor: 'end',
      pts: [dots[i], [b.x - 3, b.y + b.h / 2]],
    }));
    return {cards: [
      card('ring', ring, 'tea', [T('15分钟', 72, 'num', box(ring.x + 20, ring.y + 70, ring.w - 40, 90)), T('步行可达', 28, 'label', box(ring.x + 32, ring.y + 190, ring.w - 64, 40))]),
      ...labels.map((b, i) => card('lab' + i, b, 'tea', [T(names[i], 34, 'body', inset(b, 28))])),
    ], lines};
  },
  slashCompare: () => {
    const R = layoutRects('slashCompare');
    const left = slashPoly(R.left, 'left'), right = slashPoly(R.right, 'right');
    const safeL = box(R.left.x + 36, R.left.y + 48, R.left.w * 0.72, R.left.h - 96);
    const safeR = box(R.right.x + R.right.w * 0.2, R.right.y + 48, R.right.w * 0.72, R.right.h - 96);
    const badge = box(R.connBadge.x + 48, R.connBadge.y + 20, R.connBadge.w - 96, R.connBadge.h - 40);
    return {cards: [
      {id: 'L', poly: left, tone: 'navy', texts: [T('新房', 40, 'title', box(safeL.x, safeL.y, safeL.w, 52)), T('多数等交付', 34, 'body', box(safeL.x, safeL.y + 80, safeL.w, 48)), T('看样板间', 34, 'body', box(safeL.x, safeL.y + 140, safeL.w, 48))]},
      {id: 'R', poly: right, tone: 'clay', texts: [T('二手房', 40, 'title', box(safeR.x, safeR.y, safeR.w, 52)), T('过户后入住', 34, 'body', box(safeR.x, safeR.y + 80, safeR.w, 48)), T('看实房实景', 34, 'body', box(safeR.x, safeR.y + 140, safeR.w, 48))]},
      card('vs', badge, 'navy', [T('VS', 40, 'title', inset(badge, 16))]),
    ], lines: []};
  },
  archLight: () => {
    const R = layoutRects('archLight');
    const a = R.arch;
    const arcTop = a.y + 36;
    const rad = (a.w - 48) / 2;
    const notes = along(inset(R.notes, 8), 3, 24, true);
    const labels = ['朝南优先', '西晒遮阳', '楼距靠前'];
    return {cards: [
      {id: 'arch', poly: archPoly(box(a.x + 24, arcTop, a.w - 48, a.h - 48)), tone: 'champ', texts: [
        T('5.0小时', 72, 'num', box(a.x + 80, a.y + a.h - 160, a.w - 160, 80)),
        T('冬至示例', 28, 'label', box(a.x + 80, a.y + a.h - 70, a.w - 160, 36)),
      ]},
      ...notes.map((b, i) => card('n' + i, b, 'tea', [T(labels[i], 34, 'body', inset(b, 20))])),
    ], lines: []};
  },
  paymentCup: () => {
    const R = layoutRects('paymentCup');
    const c = R.cup;
    const topW = c.w * 0.78, botW = c.w * 0.5;
    const topY = c.y + 28, botY = c.y + c.h - 28;
    const cx = c.x + c.w / 2;
    const poly: Pt[] = [[cx - topW / 2, topY], [cx + topW / 2, topY], [cx + botW / 2, botY], [cx - botW / 2, botY]];
    const rows = along(inset(R.stats, 4), 3, 28, true);
    const items = [{k: '月供', v: '32%'}, {k: '日常开销', v: '43%'}, {k: '存下来', v: '25%'}];
    const tickY = topY + (botY - topY) * 0.67;
    const tick = box(cx - 70, tickY - 3, 120, 8);
    return {cards: [
      {id: 'cup', poly, tone: 'tea', marks: [tick], texts: [T('1/3 参考', 28, 'label', box(tick.x + tick.w + 24, tickY - 16, 150, 34))]},
      ...rows.map((b, i) => {
        const inn = inset(b, 28);
        return card('row' + i, b, i === 1 ? 'tea' : 'champ', [
          T(items[i].k, 34, 'body', box(inn.x, inn.y + 28, inn.w * 0.46, 48)),
          T(items[i].v, 72, 'num', box(inn.x + inn.w * 0.5, inn.y + 8, inn.w * 0.46, 88)),
        ]);
      }),
    ], lines: []};
  },
  loanCurve: () => {
    // 弯道作主线，卡片交替落在路的上湾 / 下湾，短弧引线接到近边。
    const below = [true, false, true, false, true];
    const nodes: Pt[] = [[230, 640], [530, 470], [830, 620], [1130, 490], [1430, 610]];
    const cw = 250, ch = 148;
    const cardsB = nodes.map((n, i) => below[i]
      ? box(n[0] - cw / 2, n[1] + 28, cw, ch)
      : box(n[0] - cw / 2, n[1] - 28 - ch, cw, ch));
    const roadPts: Pt[] = [];
    let roadD = `M ${nodes[0][0]} ${nodes[0][1]}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i], b = nodes[i + 1];
      const c1: Pt = [a[0] + (b[0] - a[0]) * 0.45, a[1]];
      const c2: Pt = [b[0] - (b[0] - a[0]) * 0.45, b[1]];
      roadD += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${b[0]} ${b[1]}`;
      const seg = cubic(a, c1, c2, b, 5);
      roadPts.push(...(i ? seg.slice(1) : seg));
    }
    const leaders: LineGeom[] = cardsB.map((b, i) => {
      const n = nodes[i];
      const edgeY = below[i] ? b.y - 4 : b.y + b.h + 4;
      const end: Pt = [n[0], edgeY];
      const bow = below[i] ? 18 : -18;
      const c1: Pt = [n[0] + bow, n[1] + (end[1] - n[1]) * 0.35];
      const c2: Pt = [n[0] + bow * 0.4, end[1] - Math.sign(end[1] - n[1]) * 10];
      return {id: 'stem' + i, kind: 'connector' as const, width: 4, anchor: 'end' as const, color: '#C4A15A', dot: false,
        pts: cubic(n, c1, c2, end, 4), d: `M ${n[0]} ${n[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${end[0]} ${end[1]}`};
    });
    return {cards: cardsB.map((b, i) => {
      const inn = inset(b, 20);
      return card('c' + i, b, i % 2 ? 'tea' : 'paper', [
        T(String(i + 1).padStart(2, '0'), 28, 'label', box(inn.x, inn.y, 56, 32)),
        T(CURVE_STEPS[i].k, 34, 'body', box(inn.x + 60, inn.y, inn.w - 60, 36)),
        T(CURVE_STEPS[i].s, 34, 'body', box(inn.x, inn.y + 48, inn.w, 40)),
      ]);
    }), lines: [
      {id: 'path', kind: 'diagram', width: 16, anchor: 'none', color: '#E6C48A', dot: false, pts: roadPts, d: roadD},
      ...leaders,
    ]};
  },
  contractNote: () => {
    const R = layoutRects('contractNote');
    const doc = inset(R.doc, 8);
    const notes = along(inset(R.notes, 4), 3, 28, true);
    const labels = ['交房日期', '违约责任', '贷款条款'];
    return {cards: [
      card('doc', doc, 'paper', [T('合同里先看这三处', 34, 'body', box(doc.x + 32, doc.y + 36, doc.w - 64, 80))]),
      ...notes.map((b, i) => card('n' + i, b, 'navy', [T(labels[i], 34, 'body', inset(b, 24))])),
    ], lines: notes.map((b, i) => ({id: 'c' + i, kind: 'connector' as const, width: 4, anchor: 'both' as const, pts: [[doc.x + doc.w + 3, b.y + b.h / 2], [b.x - 3, b.y + b.h / 2]] as Pt[]}))};
  },
  planSplit: () => {
    const R = layoutRects('planSplit');
    const stats = inset(R.stats, 6);
    const s = inset(stats, 20);
    return {planId: '三室-甲', cards: [
      card('stats', stats, 'champ', [
        T('套内', 28, 'label', box(s.x, s.y, s.w, 36)),
        T('示例', 28, 'label', box(s.x, s.y + 40, s.w, 36)),
        T('得房率', 34, 'body', box(s.x, s.y + 100, s.w, 44)),
        T('动线经门', 34, 'body', box(s.x, s.y + 156, s.w, 44)),
      ]),
    ], lines: []};
  },
  buildingSection: () => {
    const R = layoutRects('buildingSection');
    const tags = along(inset(R.tags, 4), 3, 36, true);
    const names = [
      {k: '顶部几层', s: '晒得多要隔热'},
      {k: '中间几层', s: '光线和安静均衡'},
      {k: '底部几层', s: '离车流近看遮挡'},
    ];
    const tower = box(R.section.x + 36, R.section.y + 16, 720, R.section.h - 32);
    return {cards: tags.map((b, i) => {
      const inn = inset(b, 24);
      return card('f' + i, b, i === 2 ? 'tea' : 'paper', [
        T(names[i].k, 34, 'body', box(inn.x, inn.y + 8, inn.w, 44)),
        T(names[i].s, 34, 'body', box(inn.x, inn.y + 56, inn.w, 44)),
      ]);
    }), lines: tags.map((b, i) => ({
      id: 'f' + i, kind: 'connector' as const, width: 4, anchor: 'end' as const,
      pts: [[tower.x + tower.w + 4, b.y + b.h / 2], [b.x - 3, b.y + b.h / 2]] as Pt[],
    }))};
  },
  pitfallLens: () => {
    const stage = layoutRects('pitfallLens').stage;
    const cx = stage.x + 460, cy = stage.y + stage.h / 2, rad = 150;
    const calls = [box(980, 300, 480, 140), box(980, 480, 480, 140), box(980, 660, 480, 140)];
    const words = ['窗角水渍', '空鼓轻敲', '下水试水'];
    const poly = circlePoly(cx, cy, rad);
    return {cards: [
      {id: 'lens', poly, tone: 'clay', texts: [T('放大看', 34, 'body', box(cx - 70, cy - 24, 140, 48))]},
      ...calls.map((b, i) => card('c' + i, b, 'paper', [T(words[i], 34, 'body', inset(b, 28))])),
    ], lines: calls.map((b, i) => {
      const ty = b.y + b.h / 2;
      const ang = Math.atan2(ty - cy, (b.x - 3) - cx);
      return {id: 'l' + i, kind: 'connector' as const, width: 4, anchor: 'both' as const, pts: [[cx + Math.cos(ang) * (rad + 3), cy + Math.sin(ang) * (rad + 3)], [b.x - 3, ty]] as Pt[]};
    })};
  },
  parkingLines: () => {
    const R = layoutRects('parkingLines');
    const lot = inset(R.lot, 16);
    const notes = along(inset(R.notes, 6), 3, 24, true);
    const words = ['车位 1:0.8', '先看归属', '再问租金'];
    const bays: LineGeom[] = [0, 1, 2, 3].map((i) => ({
      id: 'bay' + i, kind: 'diagram', width: 4, anchor: 'none',
      pts: [[lot.x + 40 + i * 150, lot.y + 80], [lot.x + 40 + i * 150, lot.y + lot.h - 80]] as Pt[],
    }));
    return {cards: notes.map((b, i) => card('n' + i, b, 'tea', [T(words[i], 34, 'body', inset(b, 16))])), lines: bays};
  },
  hexSteps: () => {
    // 01/03 略高、02/04 略低。一条圆角流程线贴着空隙把四枚连起来。
    const W = 332, H = 280, pitch = 368, x0 = 120, yHi = 368, yLo = 488;
    const cells = [0, 1, 2, 3].map((i) => box(x0 + i * pitch, i % 2 ? yLo : yHi, W, H));
    const polys = cells.map(hexPoly);
    const bridges: LineGeom[] = [];
    for (let i = 0; i < 3; i++) {
      const left = Math.max(...polys[i].map((p) => p[0]));
      const right = Math.min(...polys[i + 1].map((p) => p[0]));
      const yA = polys[i].reduce((s, p) => s + p[1], 0) / polys[i].length;
      const yB = polys[i + 1].reduce((s, p) => s + p[1], 0) / polys[i + 1].length;
      const from: Pt = [left + 4, yA];
      const to: Pt = [right - 4, yB];
      const c1: Pt = [from[0] + (to[0] - from[0]) * 0.35, from[1] + (to[1] - from[1]) * 0.2];
      const c2: Pt = [from[0] + (to[0] - from[0]) * 0.65, from[1] + (to[1] - from[1]) * 0.8];
      bridges.push({id: 'flow' + i, kind: 'connector', width: 4, anchor: 'both', color: '#C4A15A', dot: false,
        pts: cubic(from, c1, c2, to, 1.5),
        d: `M ${from[0]} ${from[1]} C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${to[0]} ${to[1]}`});
    }
    return {cards: cells.map((b, i) => {
      const safe = box(b.x + b.w * 0.2, b.y + b.h * 0.26, b.w * 0.6, b.h * 0.5);
      return {id: 'hex' + i, poly: polys[i], tone: (i % 2 ? 'tea' : 'paper') as FogTone, texts: [
        T(String(i + 1).padStart(2, '0'), 28, 'label', box(safe.x, safe.y, safe.w, 32)),
        T(HEX_STEPS[i].k, 34, 'body', box(safe.x, safe.y + 34, safe.w, 36)),
        T(HEX_STEPS[i].a, 34, 'body', box(safe.x, safe.y + 74, safe.w, 36)),
        T(HEX_STEPS[i].b, 34, 'body', box(safe.x, safe.y + 114, safe.w, 36)),
      ]};
    }), lines: bridges};
  },
  inspectTags: () => {
    const rail = layoutRects('inspectTags').rail;
    const tags = along(box(rail.x, rail.y + 150, rail.w, 360), 4, 40);
    const words = ['窗边', '墙角', '地漏', '插座'];
    const subs = ['看水渍', '看空鼓', '放水试', '逐个试'];
    return {cards: tags.map((b, i) => card('tag' + i, b, 'clay', [
      T(words[i], 40, 'title', box(b.x + 28, b.y + 36, b.w - 56, 52)),
      T(subs[i], 34, 'body', box(b.x + 28, b.y + 110, b.w - 56, 48)),
    ])), lines: tags.map((b, i) => ({id: 'str' + i, kind: 'connector' as const, width: 3, anchor: 'end' as const, pts: [[b.x + b.w / 2, rail.y + 36], [b.x + b.w / 2, b.y - 3]] as Pt[]}))};
  },
  familyPlan: () => {
    const R = layoutRects('familyPlan');
    const people = inset(R.people, 8);
    const unit = inset(R.unit, 8);
    const p = inset(people, 28), u = inset(unit, 28);
    const figY = p.y + 88, figH = 210, gap = 22;
    const figW = (p.w - gap * 3) / 4;
    const marks = [0, 1, 2, 3].map((i) => box(p.x + i * (figW + gap), figY, figW, figH));
    const capY = figY + figH + 28;
    return {cards: [
      {id: 'people', poly: rectPoly(people), tone: 'champ', marks, texts: [
        T('家里常住', 34, 'body', box(p.x, p.y, p.w, 44)),
        T('2大1小 +1位老人', 34, 'body', box(p.x, capY, p.w, 44)),
      ]},
      card('unit', unit, 'tea', [
        T('三室更合适', 40, 'title', box(u.x, u.y + 24, u.w, 52)),
        T('主卧给老人', 34, 'body', box(u.x, u.y + 100, u.w, 44)),
        T('孩子单独一间', 34, 'body', box(u.x, u.y + 160, u.w, 44)),
      ]),
    ], lines: []};
  },
  policyNotes: () => {
    const wall = layoutRects('policyNotes').wall;
    const notes = [box(wall.x, wall.y + 20, 460, 250), box(wall.x + 520, wall.y + 80, 460, 250), box(wall.x + 180, wall.y + 340, 500, 240)];
    const words = ['认定看材料', '限购先问清', '资格以当地为准'];
    return {cards: notes.map((b, i) => card('note' + i, b, i === 2 ? 'navy' : 'paper', [T(words[i], 34, 'body', inset(b, 32))])), lines: []};
  },
  qaBubbles: () => {
    const R = layoutRects('qaBubbles');
    const q = R.q, a = R.a;
    return {cards: [
      card('q', q, 'navy', [T('顶楼能买吗', 40, 'title', box(q.x + 36, q.y + 48, q.w - 72, 56)), T('先看防水隔热', 34, 'body', box(q.x + 36, q.y + 130, q.w - 72, 48))]),
      card('a', a, 'champ', [T('能买要核验', 40, 'title', box(a.x + 36, a.y + 48, a.w - 72, 56)), T('夏天去现场', 34, 'body', box(a.x + 36, a.y + 130, a.w - 72, 48))]),
    ], lines: [{id: 'qa', kind: 'connector', width: 4, anchor: 'both', pts: [[q.x + q.w + 3, q.y + q.h / 2], [a.x - 3, a.y + a.h / 2]]}]};
  },
};

export const sceneOf = (name: LayoutName | string): Scene => (scenes[name] ?? scenes.ticketStub)();
export const NEW_SCENE_NAMES = Object.keys(scenes);
