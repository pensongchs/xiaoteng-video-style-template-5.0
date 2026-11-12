/** 17 款新卡的停稳几何。组件和检查读同一份坐标。 */
import {layoutRects, type LayoutName} from './layouts.ts';
import {rectPoly, type Box, type Pt} from './geom.ts';
import type {FogTone} from './tokens.ts';

export type TextRun = {text: string; size: number; role: 'title' | 'body' | 'label' | 'room' | 'num'; box: Box};
export type CardGeom = {id: string; poly: Pt[]; tone: FogTone; texts: TextRun[]};
export type LineGeom = {id: string; pts: Pt[]; width: number; anchor: 'both' | 'start' | 'end' | 'none'; kind: 'connector' | 'diagram'};
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
        T('3/3', 28, 'label', box(inner.x + inner.w - 120, inner.y, 88, 40)),
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
    const cup = inset(R.cup, 12);
    const stats = inset(R.stats, 12);
    const s = inset(stats, 28);
    return {cards: [
      card('cup', cup, 'navy', [T('月供', 28, 'label', box(cup.x + 32, cup.y + 36, cup.w - 64, 36)), T('30%', 96, 'num', box(cup.x + 32, cup.y + 180, cup.w - 64, 110))]),
      card('stats', stats, 'champ', [
        T('收入三分一', 34, 'body', box(s.x, s.y, s.w, 48)),
        T('月供 4500', 34, 'body', box(s.x, s.y + 64, s.w, 48)),
        T('示例口径', 28, 'label', box(s.x, s.y + 130, s.w, 36)),
      ]),
    ], lines: []};
  },
  loanCurve: () => {
    const R = layoutRects('loanCurve');
    const cards = along(box(R.cards.x, R.cards.y, R.cards.w, R.cards.h), 5, 36);
    const pathY = R.path.y + R.path.h * 0.55;
    const nodes = cards.map((b) => [b.x + b.w / 2, pathY] as Pt);
    const lines: LineGeom[] = [
      {id: 'path', kind: 'diagram', width: 8, anchor: 'none', pts: nodes},
      ...cards.map((b, i) => ({id: 'stem' + i, kind: 'connector' as const, width: 4, anchor: 'end' as const, pts: [nodes[i], [b.x + b.w / 2, b.y - 3]] as Pt[]})),
    ];
    return {cards: cards.map((b, i) => {
      const inn = inset(b, 24);
      return card('c' + i, b, i === 2 ? 'navy' : 'paper', [
        T(String(i + 1).padStart(2, '0'), 28, 'label', box(inn.x, inn.y, 64, 36)),
        T(CURVE_STEPS[i].k, 34, 'body', box(inn.x, inn.y + 44, inn.w, 44)),
        T(CURVE_STEPS[i].s, 34, 'body', box(inn.x, inn.y + 96, inn.w, 44)),
      ]);
    }), lines};
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
    const tags = along(inset(R.tags, 4), 3, 28, true);
    const names = ['顶楼看防水', '中间层安静', '一楼看排水'];
    const tower = box(R.section.x + 80, R.section.y + 40, 420, R.section.h - 80);
    return {cards: tags.map((b, i) => card('f' + i, b, 'paper', [T(names[i], 34, 'body', inset(b, 22))])),
      lines: tags.map((b, i) => {
        const y = tower.y + 80 + i * ((tower.h - 120) / 2);
        return {id: 'f' + i, kind: 'connector' as const, width: 4, anchor: 'end' as const, pts: [[tower.x + tower.w + 16, y], [b.x - 3, b.y + b.h / 2]] as Pt[]};
      })};
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
    const board = layoutRects('hexSteps').board;
    const row = box(board.x, board.y + 56, board.w, board.h - 112);
    const cells = along(row, 4, 40);
    const lines: LineGeom[] = [];
    const cards = cells.map((b, i) => {
      const poly = hexPoly(b);
      const safe = box(b.x + b.w * 0.22, b.y + b.h * 0.3, b.w * 0.56, b.h * 0.4);
      if (i < cells.length - 1) {
        const n = cells[i + 1];
        lines.push({id: 'h' + i, kind: 'connector', width: 4, anchor: 'both', pts: [[b.x + b.w + 3, b.y + b.h / 2], [n.x - 3, n.y + n.h / 2]]});
      }
      return {id: 'hex' + i, poly, tone: (i === 3 ? 'clay' : 'paper') as FogTone, texts: [
        T(HEX_STEPS[i].k, 34, 'body', box(safe.x, safe.y, safe.w, 44)),
        T(HEX_STEPS[i].a, 34, 'body', box(safe.x, safe.y + 50, safe.w, 44)),
        T(HEX_STEPS[i].b, 34, 'body', box(safe.x, safe.y + 98, safe.w, 44)),
      ]};
    });
    return {cards, lines};
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
    const people = inset(R.people, 10);
    const unit = inset(R.unit, 10);
    const p = inset(people, 28), u = inset(unit, 28);
    return {cards: [
      card('people', people, 'tea', [T('三口之家', 40, 'title', box(p.x, p.y, p.w, 56)), T('两位成人', 34, 'body', box(p.x, p.y + 80, p.w, 48)), T('一个孩子', 34, 'body', box(p.x, p.y + 140, p.w, 48))]),
      card('unit', unit, 'champ', [T('三室两厅', 40, 'title', box(u.x, u.y, u.w, 56)), T('主卧给老人', 34, 'body', box(u.x, u.y + 80, u.w, 48)), T('示例户型', 28, 'label', box(u.x, u.y + 150, u.w, 40))]),
    ], lines: [{id: 'link', kind: 'connector', width: 4, anchor: 'both', pts: [[people.x + people.w + 3, people.y + people.h / 2], [unit.x - 3, unit.y + unit.h / 2]]}]};
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
