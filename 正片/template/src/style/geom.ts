/** 纯几何：连线、户型、安全区都用这些函数判断，不看截图。 */
export type Pt = [number, number];
export type Box = {x: number; y: number; w: number; h: number};

export const rectPoly = (b: Box): Pt[] => [[b.x, b.y], [b.x + b.w, b.y], [b.x + b.w, b.y + b.h], [b.x, b.y + b.h]];

const vsub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const vadd = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const vmul = (a: Pt, s: number): Pt => [a[0] * s, a[1] * s];
const vlen = (a: Pt) => Math.hypot(a[0], a[1]);
const vnorm = (a: Pt): Pt => { const l = vlen(a) || 1; return [a[0] / l, a[1] / l]; };

/** 凸多边形圆角采样。碰撞和画面共用，角被削圆，边的中点不动。 */
export const roundPoly = (pts: Pt[], radius: number, samples = 5): Pt[] => {
  const n = pts.length;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const inDir = vnorm(vsub(curr, prev));
    const outDir = vnorm(vsub(next, curr));
    const trim = Math.min(radius, vlen(vsub(curr, prev)) / 2.15, vlen(vsub(next, curr)) / 2.15);
    const p1 = vsub(curr, vmul(inDir, trim));
    const p2 = vadd(curr, vmul(outDir, trim));
    for (let s = 0; s <= samples; s++) {
      const t = s / samples, u = 1 - t;
      out.push([
        u * u * p1[0] + 2 * u * t * curr[0] + t * t * p2[0],
        u * u * p1[1] + 2 * u * t * curr[1] + t * t * p2[1],
      ]);
    }
  }
  return out;
};

export const pointInPoly = (p: Pt, poly: Pt[]): boolean => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    const hit = ((yi > p[1]) !== (yj > p[1])) && (p[0] < ((xj - xi) * (p[1] - yi)) / ((yj - yi) || 1e-9) + xi);
    if (hit) inside = !inside;
  }
  return inside;
};

const distToSeg = (p: Pt, a: Pt, b: Pt) => {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy || 1e-9;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
};

/** 点到多边形边界的距离；点在内部时为 0。 */
export const distToShape = (p: Pt, poly: Pt[]): number => {
  if (pointInPoly(p, poly)) return 0;
  let d = Infinity;
  for (let i = 0; i < poly.length; i++) d = Math.min(d, distToSeg(p, poly[i], poly[(i + 1) % poly.length]));
  return d;
};

/** 三次贝塞尔采样，供「一条顺线」和穿模检查共用。 */
export const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, step = 6): Pt[] => {
  const rough = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) + Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) + Math.hypot(p3[0] - p2[0], p3[1] - p2[1]);
  const n = Math.max(8, Math.ceil(rough / step));
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
};

export const samplesOf = (pts: Pt[], step = 2): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out.length ? out : pts.slice();
};

export const boxesOverlap = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
export const overlapArea = (a: Box, b: Box) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
};
export const gapBetween = (a: Box, b: Box) => Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w), b.y - (a.y + a.h), a.y - (b.y + a.h));

/** 连线采样（含半线宽）不得进入卡片真实形状。anchor 标出哪一端必须落在卡外 0–6px。 */
export const connectorFaults = (line: Pt[], width: number, shapes: Pt[][], step = 2, anchor: 'both' | 'start' | 'end' | 'none' = 'both'): string[] => {
  const faults: string[] = [];
  const half = width / 2;
  const pts = samplesOf(line, step);
  if (pts.length < 2) return ['连线过短'];
  pts.forEach((p, i) => {
    shapes.forEach((poly, s) => {
      if (distToShape(p, poly) < half - 0.05) faults.push(`采样${i}进入形状${s}`);
    });
  });
  const ends: [number, Pt][] = [[0, pts[0]], [1, pts[pts.length - 1]]];
  ends.forEach(([ei, p]) => {
    const meet = anchor === 'both' || (anchor === 'start' && ei === 0) || (anchor === 'end' && ei === 1);
    const best = shapes.reduce((d, poly) => Math.min(d, distToShape(p, poly)), Infinity);
    if (shapes.some((poly) => pointInPoly(p, poly))) faults.push(`端点${ei}在卡片内部`);
    if (meet && (best < half - 0.05 || best > 6.01)) faults.push(`端点${ei}离卡边 ${best.toFixed(1)}px，应在 ${half.toFixed(0)}–6`);
  });
  return faults;
};
