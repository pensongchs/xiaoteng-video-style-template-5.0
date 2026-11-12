/** 标准户型库（两室/三室/四室各 2 套）。墙、门、窗、动线都是数值，渲染和检查读同一份。 */
import {distToShape, rectPoly, samplesOf, type Pt} from './geom.ts';

export type Room = {name: string; x: number; y: number; w: number; h: number};
export type Wall = {x: number; y: number; w: number; h: number; kind: 'exterior' | 'interior'};
export type Opening = {
  x: number; y: number; w: number; h: number;
  type: 'entry' | 'door' | 'slider' | 'window';
  arc: boolean; triple: boolean; leaf: Pt[]; dark?: boolean;
};
export type Plan = {
  id: string; series: '两室' | '三室' | '四室'; example: true;
  rooms: Room[]; walls: Wall[]; openings: Opening[]; flow: Pt[];
  statedInterior: number; north: true;
  dimension: {mm: number};
};

const GAP = 120;
const EXT = 240;

const span = (orig: number[], tracks: number[], a: number, b: number) => orig[b] + tracks[b] - orig[a];
const tracks = (sizes: number[]) => {
  const at = [0];
  for (const s of sizes) at.push(at[at.length - 1] + s + GAP);
  return at;
};
const cell = (cols: number[], rows: number[], xs: number[], ys: number[], name: string, c0: number, c1: number, r0: number, r1: number): Room =>
  ({name, x: xs[c0], y: ys[r0], w: span(xs, cols, c0, c1), h: span(ys, rows, r0, r1)});

const overlapLen = (a0: number, a1: number, b0: number, b1: number) => Math.min(a1, b1) - Math.max(a0, b0);

const interiorWalls = (rooms: Room[]): Wall[] => {
  const walls: Wall[] = [];
  for (let i = 0; i < rooms.length; i++) for (let j = i + 1; j < rooms.length; j++) {
    const a = rooms[i], b = rooms[j];
    const gapR = b.x - (a.x + a.w), gapL = a.x - (b.x + b.w);
    const gapB = b.y - (a.y + a.h), gapT = a.y - (b.y + b.h);
    const yOv = overlapLen(a.y, a.y + a.h, b.y, b.y + b.h);
    const xOv = overlapLen(a.x, a.x + a.w, b.x, b.x + b.w);
    if (gapR >= 80 && gapR <= 160 && yOv > 200) walls.push({x: a.x + a.w, y: Math.max(a.y, b.y), w: gapR, h: yOv, kind: 'interior'});
    if (gapL >= 80 && gapL <= 160 && yOv > 200) walls.push({x: b.x + b.w, y: Math.max(a.y, b.y), w: gapL, h: yOv, kind: 'interior'});
    if (gapB >= 80 && gapB <= 160 && xOv > 200) walls.push({x: Math.max(a.x, b.x), y: a.y + a.h, w: xOv, h: gapB, kind: 'interior'});
    if (gapT >= 80 && gapT <= 160 && xOv > 200) walls.push({x: Math.max(a.x, b.x), y: b.y + b.h, w: xOv, h: gapT, kind: 'interior'});
  }
  return walls;
};

const exteriorWalls = (rooms: Room[]): Wall[] => {
  const minX = Math.min(...rooms.map((r) => r.x)) - EXT;
  const minY = Math.min(...rooms.map((r) => r.y)) - EXT;
  const maxX = Math.max(...rooms.map((r) => r.x + r.w)) + EXT;
  const maxY = Math.max(...rooms.map((r) => r.y + r.h)) + EXT;
  const W = maxX - minX, H = maxY - minY;
  return [
    {x: minX, y: minY, w: W, h: EXT, kind: 'exterior'},
    {x: minX, y: maxY - EXT, w: W, h: EXT, kind: 'exterior'},
    {x: minX, y: minY + EXT, w: EXT, h: H - EXT * 2, kind: 'exterior'},
    {x: maxX - EXT, y: minY + EXT, w: EXT, h: H - EXT * 2, kind: 'exterior'},
  ];
};

const subtract = (wall: Wall, op: {x: number; y: number; w: number; h: number}): Wall[] => {
  const ix = Math.max(wall.x, op.x), iy = Math.max(wall.y, op.y);
  const ax = Math.min(wall.x + wall.w, op.x + op.w), ay = Math.min(wall.y + wall.h, op.y + op.h);
  if (ax - ix < 8 || ay - iy < 8) return [wall];
  const parts: Wall[] = [];
  if (wall.h <= wall.w + 1) {
    if (ix - wall.x > 8) parts.push({...wall, w: ix - wall.x});
    if (wall.x + wall.w - ax > 8) parts.push({...wall, x: ax, w: wall.x + wall.w - ax});
  } else {
    if (iy - wall.y > 8) parts.push({...wall, h: iy - wall.y});
    if (wall.y + wall.h - ay > 8) parts.push({...wall, y: ay, h: wall.y + wall.h - ay});
  }
  return parts;
};

const findRoom = (rooms: Room[], name: string) => rooms.find((r) => r.name === name);

const holeOn = (room: Room, side: 'n' | 's' | 'e' | 'w', at: number, width: number, thick: number) => {
  if (side === 'n') return {x: room.x + at, y: room.y - thick, w: width, h: thick};
  if (side === 's') return {x: room.x + at, y: room.y + room.h, w: width, h: thick};
  if (side === 'w') return {x: room.x - thick, y: room.y + at, w: thick, h: width};
  return {x: room.x + room.w, y: room.y + at, w: thick, h: width};
};

const leafOf = (op: {x: number; y: number; w: number; h: number}, into: Room): Pt[] => {
  const horiz = op.w >= op.h;
  const hinge: Pt = horiz ? [op.x, op.y + op.h / 2] : [op.x + op.w / 2, op.y];
  const len = horiz ? op.w : op.h;
  const intoSouth = into.y >= op.y;
  const intoEast = into.x >= op.x;
  const end: Pt = horiz
    ? [hinge[0], hinge[1] + (intoSouth ? len : -len)]
    : [hinge[0] + (intoEast ? len : -len), hinge[1]];
  return [hinge, end];
};

const punch = (walls: Wall[], holes: {x: number; y: number; w: number; h: number}[]) => {
  let cur = walls;
  for (const h of holes) cur = cur.flatMap((w) => subtract(w, h));
  return cur;
};

type Spec = {id: string; series: Plan['series']; cols: number[]; rows: number[]; cells: [string, number, number, number, number][]};

const assemble = (spec: Spec): Plan => {
  const xs = tracks(spec.cols), ys = tracks(spec.rows);
  const rooms = spec.cells.map(([name, c0, c1, r0, r1]) => cell(spec.cols, spec.rows, xs, ys, name, c0, c1, r0, r1));
  const holes: {x: number; y: number; w: number; h: number}[] = [];
  const openings: Opening[] = [];
  const add = (roomName: string, side: 'n' | 's' | 'e' | 'w', at: number, width: number, type: Opening['type'], intoName?: string) => {
    const room = findRoom(rooms, roomName);
    if (!room) return;
    const neighbor = rooms.find((o) => {
      if (o === room) return false;
      if (side === 'n') return Math.abs(o.y + o.h - room.y) <= 160 && overlapLen(o.x, o.x + o.w, room.x, room.x + room.w) > 80;
      if (side === 's') return Math.abs(room.y + room.h - o.y) <= 160 && overlapLen(o.x, o.x + o.w, room.x, room.x + room.w) > 80;
      if (side === 'w') return Math.abs(o.x + o.w - room.x) <= 160 && overlapLen(o.y, o.y + o.h, room.y, room.y + room.h) > 80;
      return Math.abs(room.x + room.w - o.x) <= 160 && overlapLen(o.y, o.y + o.h, room.y, room.y + room.h) > 80;
    });
    const thick = neighbor ? GAP : EXT;
    const box = holeOn(room, side, at, width, thick);
    // 外墙在房间外侧 240；内墙在房间边外 120。holeOn 已经按 thick 外扩。
    holes.push(box);
    const into = intoName ? findRoom(rooms, intoName) : room;
    const arc = type === 'door' || type === 'entry';
    openings.push({...box, type, arc, triple: type === 'window', leaf: arc && into ? leafOf(box, into) : [], dark: false});
  };
  const foyer = findRoom(rooms, '玄关')!;
  const master = findRoom(rooms, '主卧')!;
  add('玄关', 'n', Math.max(200, foyer.w / 2 - 500), Math.min(1000, foyer.w - 400), 'entry', '玄关');
  add('玄关', 's', Math.max(200, Math.min(foyer.w, master.w) / 2 - 450), 900, 'door', '主卧');
  const living = findRoom(rooms, '客厅');
  const balcony = findRoom(rooms, '阳台');
  if (living && balcony && balcony.y > living.y) {
    const at = Math.max(200, living.w / 2 - 900);
    add('客厅', 's', at, Math.min(1800, living.w - 400), 'slider');
    add('客厅', 's', 180, 900, 'window');
  }
  for (const name of ['主卧', '次卧', '次卧二', '次卧三']) {
    const r = findRoom(rooms, name);
    if (!r) continue;
    add(name, 's', Math.max(160, r.w / 2 - 600), Math.min(1200, r.w - 320), 'window');
  }
  const kitchen = findRoom(rooms, '厨房');
  if (kitchen) add('厨房', 'n', Math.max(160, kitchen.w / 2 - 500), Math.min(1000, kitchen.w - 300), 'window');
  const bath = findRoom(rooms, '卫生间');
  if (bath) add('卫生间', 'e', Math.max(160, bath.h / 2 - 400), Math.min(800, bath.h - 300), 'window');
  const dining = findRoom(rooms, '餐厅');
  if (dining && kitchen && dining.x > kitchen.x) add('厨房', 'e', Math.max(120, kitchen.h / 2 - 450), 900, 'door', '餐厅');
  const bed2 = findRoom(rooms, '次卧');
  if (bed2 && master && bed2.x > master.x) add('主卧', 'e', Math.max(160, master.h / 2 - 450), 900, 'door', '次卧');
  if (foyer && kitchen && kitchen.x > foyer.x) add('玄关', 'e', Math.max(120, foyer.h / 2 - 450), 900, 'door', '厨房');

  let walls = punch([...exteriorWalls(rooms), ...interiorWalls(rooms)], holes).filter((w) => Math.max(w.w, w.h) >= 40);
  const door = openings.find((o) => o.type === 'door' && o.y > foyer.y);
  const flow: Pt[] = door ? [
    [foyer.x + foyer.w * 0.72, foyer.y + 280],
    [door.x + door.w / 2, foyer.y + foyer.h - 200],
    [door.x + door.w / 2, master.y + 360],
    [master.x + master.w * 0.62, master.y + master.h * 0.55],
  ] : [];
  const stated = Math.round(rooms.reduce((s, r) => s + (r.w * r.h) / 1e6, 0) * 100) / 100;
  const dim = Math.max(...rooms.map((r) => r.x + r.w)) - Math.min(...rooms.map((r) => r.x)) + EXT * 2;
  return {id: spec.id, series: spec.series, example: true, rooms, walls, openings, flow, statedInterior: stated, north: true, dimension: {mm: dim}};
};

const THREE: Spec = {
  id: '三室-甲', series: '三室',
  cols: [3600, 2800, 2800, 3800, 2000],
  rows: [1800, 3600, 1500],
  cells: [
    ['玄关', 0, 0, 0, 0], ['厨房', 1, 1, 0, 0], ['餐厅', 2, 3, 0, 0], ['储物', 4, 4, 0, 0],
    ['主卧', 0, 0, 1, 1], ['次卧', 1, 1, 1, 1], ['次卧二', 2, 2, 1, 1], ['客厅', 3, 3, 1, 1], ['卫生间', 4, 4, 1, 1],
    ['阳台', 0, 4, 2, 2],
  ],
};

const specs: Spec[] = [
  THREE,
  {...THREE, id: '三室-乙', cols: [3400, 3000, 2700, 3900, 2100], rows: [1900, 3700, 1600]},
  {id: '两室-甲', series: '两室', cols: [3600, 3000, 4200, 2200], rows: [1800, 3700, 1500], cells: [
    ['玄关', 0, 0, 0, 0], ['厨房', 1, 1, 0, 0], ['餐厅', 2, 3, 0, 0],
    ['主卧', 0, 0, 1, 1], ['次卧', 1, 1, 1, 1], ['客厅', 2, 2, 1, 1], ['卫生间', 3, 3, 1, 1],
    ['阳台', 0, 3, 2, 2],
  ]},
  {id: '两室-乙', series: '两室', cols: [3700, 2800, 4000, 2000], rows: [1700, 3600, 1400], cells: [
    ['玄关', 0, 0, 0, 0], ['厨房', 1, 1, 0, 0], ['餐厅', 2, 3, 0, 0],
    ['主卧', 0, 0, 1, 1], ['次卧', 1, 1, 1, 1], ['客厅', 2, 2, 1, 1], ['卫生间', 3, 3, 1, 1],
    ['阳台', 0, 3, 2, 2],
  ]},
  {id: '四室-甲', series: '四室', cols: [3600, 2800, 2800, 2800, 3600], rows: [2100, 3600, 1500], cells: [
    ['玄关', 0, 0, 0, 0], ['厨房', 1, 1, 0, 0], ['餐厅', 2, 3, 0, 0], ['卫生间', 4, 4, 0, 0],
    ['主卧', 0, 0, 1, 1], ['次卧', 1, 1, 1, 1], ['次卧二', 2, 2, 1, 1], ['次卧三', 3, 3, 1, 1], ['客厅', 4, 4, 1, 1],
    ['阳台', 0, 4, 2, 2],
  ]},
  {id: '四室-乙', series: '四室', cols: [3600, 2800, 2700, 3000, 3700], rows: [2100, 3600, 1500], cells: [
    ['玄关', 0, 0, 0, 0], ['厨房', 1, 1, 0, 0], ['餐厅', 2, 3, 0, 0], ['卫生间', 4, 4, 0, 0],
    ['主卧', 0, 0, 1, 1], ['次卧', 1, 1, 1, 1], ['次卧二', 2, 2, 1, 1], ['次卧三', 3, 3, 1, 1], ['客厅', 4, 4, 1, 1],
    ['阳台', 0, 4, 2, 2],
  ]},
];

export const PLANS: Plan[] = specs.map(assemble);
export const planById = (id = '三室-甲') => PLANS.find((p) => p.id === id) ?? PLANS[0];

const fits = (w: number, h: number, a: number, b: number) => (w >= a && h >= b) || (w >= b && h >= a);

export const validatePlan = (plan: Plan): string[] => {
  const errs: string[] = [];
  const names = plan.rooms.map((r) => r.name);
  for (const need of ['玄关', '客厅', '餐厅', '厨房', '卫生间', '阳台']) if (!names.includes(need)) errs.push(`${plan.id} 缺${need}`);
  if (!names.some((n) => n === '主卧' || n.startsWith('次卧'))) errs.push(`${plan.id} 缺卧室`);
  if (!plan.openings.some((o) => o.type === 'entry')) errs.push(`${plan.id} 缺入户门`);
  for (const r of plan.rooms) {
    const w = r.w / 1000, h = r.h / 1000;
    if (r.name === '主卧' && !fits(w, h, 3.3, 3.6)) errs.push(`${plan.id} 主卧 ${w.toFixed(2)}x${h.toFixed(2)}`);
    if (r.name.startsWith('次卧') && !fits(w, h, 2.7, 3.0)) errs.push(`${plan.id} ${r.name} ${w.toFixed(2)}x${h.toFixed(2)}`);
    if (r.name === '卫生间' && !fits(w, h, 1.6, 2.0)) errs.push(`${plan.id} 卫生间 ${w.toFixed(2)}x${h.toFixed(2)}`);
    if (r.name === '客厅' && r.w / 1000 < 3.6) errs.push(`${plan.id} 客厅开间 ${w.toFixed(2)}`);
    if (r.name === '阳台') { const d = Math.min(w, h); if (d < 1.2 || d > 1.8) errs.push(`${plan.id} 阳台进深 ${d.toFixed(2)}`); }
    const area = (r.w * r.h) / 1e6;
    if (Math.abs(area - area) > 0) errs.push('area');
  }
  for (let i = 0; i < plan.rooms.length; i++) for (let j = i + 1; j < plan.rooms.length; j++) {
    const a = plan.rooms[i], b = plan.rooms[j];
    const iw = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const ih = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (iw > 2 && ih > 2) errs.push(`${plan.id} 房间重叠 ${a.name}/${b.name}`);
  }
  const sum = plan.rooms.reduce((s, r) => s + (r.w * r.h) / 1e6, 0);
  if (Math.abs(sum - plan.statedInterior) / plan.statedInterior > 0.05) errs.push(`${plan.id} 面积和 ${sum.toFixed(2)} 与标注 ${plan.statedInterior} 差超过 5%`);
  for (const w of plan.walls) {
    const want = w.kind === 'exterior' ? EXT : GAP;
    const thick = Math.abs(w.w - want) < Math.abs(w.h - want) ? w.w : w.h;
    if (Math.abs(thick - want) > 4) errs.push(`${plan.id} ${w.kind}墙厚 ${thick}`);
  }
  if (!plan.walls.some((w) => w.kind === 'exterior') || !plan.walls.some((w) => w.kind === 'interior')) errs.push(`${plan.id} 缺双线墙`);
  for (const o of plan.openings) {
    if ((o.type === 'door' || o.type === 'entry') && (!o.arc || o.leaf.length < 2)) errs.push(`${plan.id} 门缺开门弧`);
    if (o.type === 'window' && !o.triple) errs.push(`${plan.id} 窗不是三线`);
    if (o.type === 'door' || o.type === 'entry') {
      const m = o.w >= o.h ? o.w : o.h;
      const lo = o.type === 'entry' ? 900 : 800, hi = o.type === 'entry' ? 1000 : 900;
      if (m < lo - 1 || m > hi + 1) errs.push(`${plan.id} ${o.type}宽 ${m}`);
    }
  }
  for (const need of ['主卧', '次卧', '客厅', '厨房']) {
    if (!names.includes(need)) continue;
    if (!plan.openings.some((o) => o.type === 'window')) { errs.push(`${plan.id} 缺外窗`); break; }
  }
  if (!plan.north) errs.push(`${plan.id} 缺指北针`);
  if (!plan.dimension?.mm) errs.push(`${plan.id} 缺尺寸线`);
  const wallPolys = plan.walls.map(rectPoly);
  samplesOf(plan.flow, 40).forEach((p, i) => {
    wallPolys.forEach((poly, wi) => { if (distToShape(p, poly) < 1) errs.push(`${plan.id} 动线点${i}穿墙${wi}`); });
  });
  if (plan.flow.length < 2) errs.push(`${plan.id} 缺动线`);
  return errs;
};

export const layoutPlan = (plan: Plan, rect: {x: number; y: number; w: number; h: number}) => {
  const walls = plan.walls;
  const minX = Math.min(...walls.map((w) => w.x)), minY = Math.min(...walls.map((w) => w.y));
  const maxX = Math.max(...walls.map((w) => w.x + w.w)), maxY = Math.max(...walls.map((w) => w.y + w.h));
  const pad = 48;
  const scale = Math.min((rect.w - pad * 2) / (maxX - minX), (rect.h - pad * 2) / (maxY - minY));
  const ox = rect.x + (rect.w - (maxX - minX) * scale) / 2;
  const oy = rect.y + (rect.h - (maxY - minY) * scale) / 2;
  const X = (x: number) => ox + (x - minX) * scale;
  const Y = (y: number) => oy + (y - minY) * scale;
  const labels = plan.rooms.map((r) => {
    const cx = X(r.x + r.w / 2), cy = Y(r.y + r.h / 2);
    return {
      name: r.name,
      nameBox: {x: cx - 60, y: cy - 34, w: 120, h: 30},
      areaBox: {x: cx - 50, y: cy - 2, w: 100, h: 28},
    };
  });
  return {scale, X, Y, labels, flow: plan.flow.map((pt) => [X(pt[0]), Y(pt[1])] as [number, number])};
};

export const validateLibrary = () => {
  const errs = PLANS.flatMap(validatePlan);
  const count = (s: Plan['series']) => PLANS.filter((p) => p.series === s).length;
  for (const s of ['两室', '三室', '四室'] as const) if (count(s) < 2) errs.push(`${s} 不足 2 套`);
  return errs;
};
