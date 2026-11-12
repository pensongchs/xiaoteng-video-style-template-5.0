// 5.0 房产 MG 已定9套 v6：对齐经典参考图的冷灰、薄边、轻高光玻璃，基础透射较原GLASS降低。
// 无厚斜面/重影/颗粒/扫描光条；单调入场后固定。UnitCompare仅存档，不登记、不预览。
import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Count, glassMat} from './components';
import {FONT, FROST, glassEnter as enter, type GlassEnterKind as EnterKind} from './tokens';
import type {Rect} from './grid.ts';

export type Starts = (i: number) => number;
type Tone = 'gold' | 'coral' | 'green' | 'blue' | 'none';
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const c01 = (x: number) => Math.max(0, Math.min(1, x));
/** 与原核心/存档卡片共享同一个有限时长入场。 */
const useEnter = (st: number, kind: EnterKind = 'enter') => enter(useCurrentFrame(), st, kind);
const enterScale = (p: number, k = 0.03) => 1 - k + k * p;

/** 经典薄玻璃：原冷灰半透明色相，略增不透明度；只保留细白边、1px轻顶高光与轻柔阴影。 */
export const frost = (tone: Tone = 'none', soft = false, radius = 26): React.CSSProperties => ({
  position: 'absolute', boxSizing: 'border-box', overflow: 'hidden', borderRadius: radius, color: FROST.ink, textShadow: FROST.textShadow,
  ...glassMat('dark', FROST.tint[tone], undefined, soft),
});
const ACC: Record<Tone, string> = {gold: FROST.gold, coral: FROST.coral, green: FROST.green, blue: FROST.blue, none: FROST.ink};
const T: React.CSSProperties = {fontFamily: FONT.title, fontWeight: 900, lineHeight: 1.3};
const B: React.CSSProperties = {fontFamily: FONT.body, fontWeight: 700, lineHeight: 1.35};
const N: React.CSSProperties = {fontFamily: FONT.num, fontWeight: 700, lineHeight: 1.1};
const Sub: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) =>
  <div data-role="body" style={{...B, fontSize: 34, color: FROST.sub, ...style}}>{children}</div>;
const Pill: React.FC<{tone?: Tone; children: React.ReactNode; style?: React.CSSProperties}> = ({tone = 'gold', children, style}) =>
  <span style={{display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', padding: '6px 20px', borderRadius: 999, ...B, fontSize: 28,
    color: ACC[tone], background: `linear-gradient(165deg, ${FROST.tint[tone]}, rgba(255,255,255,0.05))`, border: `1px solid ${ACC[tone]}66`, ...style}}>{children}</span>;
/** 当前项：最后一个已到时刻的下标 */
const actOf = (f: number, n: number, st: Starts) => { let k = -1; for (let i = 0; i < n; i++) if (f >= st(i)) k = i; return k; };
/** 0→1 平滑高亮量：自己入场时亮起，下一项入场时退回 */
const hiOf = (f: number, i: number, n: number, st: Starts) => c01(enter(f, st(i), 'soft')) * (i < n - 1 ? 1 - c01(enter(f, st(i + 1), 'soft')) : 1);

/* ============ 1 floorLadder 楼层阶梯逐级亮 ============ */
export const FloorLadder: React.FC<{r: Rect; floors: {f: string; k: string; s: string; tone?: Tone}[]; st: Starts}> = ({r, floors, st}) => {
  const f = useCurrentFrame(); const n = floors.length; const gap = 22; const h = (r.h - gap * (n - 1)) / n; const w = 700; const dx = (r.w - w) / Math.max(1, n - 1);
  const pos = (i: number) => ({x: r.x + i * dx, y: r.y + (n - 1 - i) * (h + gap)});
  const lineP = interpolate(f, [st(0), st(n - 1) + 20], [0, 1], clamp);
  const pts = floors.map((_, i) => { const p = pos(i); return `${p.x + 36},${p.y + h + 10} ${p.x + w * 0.5},${p.y + h + 10}`; }).join(' ');
  return <>
    <svg data-deco style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible'}}>
      <polyline points={pts} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={3} strokeDasharray="10 10" pathLength={1}
        style={{strokeDasharray: `${lineP} 1`}} />
    </svg>
    {floors.map((fl, i) => { const p = useEnter(st(i)); const hi = hiOf(f, i, n, st); const lit = f >= st(i); const q = pos(i);
      const tone: Tone = fl.tone ?? (['blue', 'green', 'gold', 'blue', 'gold'] as Tone[])[i % 5];
      return <div key={i} style={{...frost(tone), left: q.x, top: q.y, width: w, height: h, display: 'flex', alignItems: 'center', gap: 28, padding: '0 36px 0 0',
        opacity: c01(p), transform: `translate(${(1 - p) * -50}px, ${(1 - p) * 40}px) scale(${enterScale(p)})`, transformOrigin: '0% 50%', zIndex: n - i}}>
        <div style={{width: 168, alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: lit ? `linear-gradient(160deg, ${FROST.tint[tone]}, ${FROST.well})` : FROST.well, borderRight: `1px solid ${FROST.line}`}}>
          <span style={{...N, fontSize: 40, color: ACC[tone]}}>{fl.f}</span></div>
        <div style={{...T, fontSize: 44, flexShrink: 0}}>{fl.k}</div>
        <Sub style={{whiteSpace: 'nowrap', overflow: 'hidden'}}>{fl.s}</Sub>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, background: FROST.goldFill, opacity: hi}} />
        
      </div>; })}
  </>;
};

/* ============ 2 paymentSplit 首付 / 贷款(月供) / 税费 拆分 ============ */
type Part = {k: string; v: number; dec?: number; unit: string; pct: number; s: string; tone?: Tone; sep?: boolean};
export const PaymentSplit: React.FC<{R: Record<string, Rect>; total: {k: string; v: number; unit: string; s?: string}; parts: Part[]; st: Starts}> = ({R, total, parts, st}) => {
  const f = useCurrentFrame(); const top = R.total, low = R.parts; const n = parts.length;
  const p0 = useEnter(st(0) - 12); const split = c01(enter(f, st(0) + 4, 'soft'));
  const barX = top.x + 560, barW = top.w - 560 - 48, sum = parts.reduce((a, b) => a + b.pct, 0); const g = 14 * split;
  const segW = parts.map((p) => (barW - g * (n - 1)) * p.pct / sum); const segX = segW.map((_, i) => barX + segW.slice(0, i).reduce((a, b) => a + b, 0) + g * i);
  const cw = (low.w - 40 * (n - 1)) / n; const fill = c01(enter(f, st(0) - 6, 'soft'));
  const segBg = (t?: Tone) => t === 'coral' ? 'linear-gradient(90deg,#F0A08C,#D9735E)' : t === 'gold' ? FROST.goldFill : 'linear-gradient(90deg,#C9C4BA,#9C978E)';
  return <>
    <div style={{...frost('blue'), left: top.x, top: top.y, width: top.w, height: top.h, opacity: c01(p0), transform: `translateY(${(1 - p0) * 30}px) scale(${enterScale(p0)})`}}>
      <div style={{position: 'absolute', left: 44, top: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{...B, fontSize: 34, color: FROST.sub}}>{total.k}</div>
        <div style={{...N, fontSize: 84, color: FROST.ink}}><Count to={total.v} start={st(0) - 10} /><span style={{...B, fontSize: 36, marginLeft: 8}}>{total.unit}</span></div>
      </div>
      
    </div>
    {parts.map((p, i) => <div key={'b' + i} data-deco style={{position: 'absolute', left: segX[i], top: top.y + top.h / 2 - 22, width: segW[i] * fill, height: 44, borderRadius: 14,
      background: segBg(p.tone), boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)', opacity: c01(p0)}} />)}
    <svg data-deco style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible'}}>
      {parts.map((p, i) => { const a = c01(enter(f, st(i), 'soft')); const x0 = segX[i] + segW[i] / 2, y0 = top.y + top.h / 2 + 24, x1 = low.x + i * (cw + 40) + cw / 2, y1 = low.y - 4;
        return <path key={i} d={`M${x0},${y0} C${x0},${y0 + 120} ${x1},${y1 - 120} ${x1},${y1}`} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={2.5} pathLength={1}
          strokeDasharray="1 1" strokeDashoffset={1 - a} />; })}
    </svg>
    {parts.map((p, i) => { const q = useEnter(st(i) + 6); const hi = hiOf(f, i, n, st); const tone = p.tone ?? 'blue';
      return <div key={i} style={{...frost(tone), left: low.x + i * (cw + 40), top: low.y, width: cw, height: low.h, padding: '36px 40px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: c01(q), transform: `translateY(${(1 - q) * 60}px) scale(${enterScale(q)})`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}><div style={{width: 18, height: 18, borderRadius: 9, background: segBg(p.tone)}} /><div style={{...T, fontSize: 44}}>{p.k}</div></div>
          <Pill tone={tone === 'none' ? 'gold' : tone}>约 {p.pct}%</Pill>
        </div>
        <div style={{...N, fontSize: 88, color: tone === 'coral' ? FROST.coral : tone === 'gold' ? FROST.gold : FROST.ink}}>
          <Count to={p.v} start={st(i) + 8} dec={p.dec} sep={p.sep} /><span style={{...B, fontSize: 36, marginLeft: 8, color: FROST.ink}}>{p.unit}</span></div>
        <Sub>{p.s}</Sub>
        
      </div>; })}
  </>;
};

/* ============ 3 amenityOrbit 配套标签绕核心 ============ */
export const AmenityOrbit: React.FC<{r: Rect; core: {t: string; s?: string}; tags: {t: string; s: string; tone?: Tone}[]; st: Starts}> = ({r, core, tags, st}) => {
  const f = useCurrentFrame(); const n = tags.length; const cx = r.x + r.w / 2, cy = r.y + r.h / 2; const RX = 590, RY = 236;
  const c = useEnter(st(0) - 14); const rot = 0; const act = actOf(f, n, st);
  return <>
    <svg data-deco style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible', opacity: c01(c)}}>
      <ellipse cx={cx} cy={cy} rx={RX} ry={RY} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeDasharray="6 14" strokeDashoffset={0} />
      <ellipse cx={cx} cy={cy} rx={RX * 0.62} ry={RY * 0.62} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
      {tags.map((_, i) => { const p = c01(enter(f, st(i))); const a = -Math.PI / 2 + i * 2 * Math.PI / n + rot;
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * RX * p} y2={cy + Math.sin(a) * RY * p} stroke={i === act ? 'rgba(243,215,158,0.95)' : 'rgba(255,255,255,0.55)'} strokeWidth={i === act ? 3 : 2} />; })}
    </svg>
    <div style={{...frost('gold'), left: cx - 140, top: cy - 140, width: 280, height: 280, borderRadius: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: c01(c), transform: `scale(${0.96 + 0.04 * c})`}}>
      <div style={{...T, fontSize: 60}}>{core.t}</div>{core.s && <div style={{...B, fontSize: 28, color: FROST.sub, marginTop: 4}}>{core.s}</div>}
      
    </div>
    {tags.map((tg, i) => { const p = enter(f, st(i)); const a = -Math.PI / 2 + i * 2 * Math.PI / n + rot; const hi = i === act ? c01(enter(f, st(i), 'soft')) : 0;
      const x = cx + Math.cos(a) * RX * p, y = cy + Math.sin(a) * RY * p; const W = 300, H = 104;
      return <div key={i} style={{...frost(tg.tone ?? (i % 2 ? 'green' : 'blue')), left: x - W / 2, top: y - H / 2, width: W, height: H, borderRadius: 999, display: 'flex', alignItems: 'center', gap: 16, padding: '0 28px',
        opacity: c01(p), transform: `scale(${0.96 + 0.04 * p})`, zIndex: Math.round(y)}}>
        <div style={{width: 18, height: 18, borderRadius: 9, flexShrink: 0, background: ACC[tg.tone ?? 'gold']}} />
        <div style={{...T, fontSize: 40, whiteSpace: 'nowrap'}}>{tg.t}</div>
        <div style={{...B, fontSize: 28, color: FROST.sub, whiteSpace: 'nowrap', marginLeft: 'auto'}}>{tg.s}</div>
        
      </div>; })}
  </>;
};

/* ============ 4 pitfallBoard 买房避坑警示逐条 ============ */
export const PitfallBoard: React.FC<{R: Record<string, Rect>; head: {t: string; s?: string}; items: {t: string; s: string}[]; st: Starts}> = ({R, head, items, st}) => {
  const f = useCurrentFrame(); const H = R.head, L = R.list; const n = items.length; const gap = 20; const h = (L.h - gap * (n - 1)) / n;
  const p0 = useEnter(st(0) - 14); const act = actOf(f, n, st);
  return <>
    <div style={{...frost('coral'), left: H.x, top: H.y, width: H.w, height: H.h, padding: 44, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      opacity: c01(p0), transform: `translateX(${(1 - p0) * -50}px) scale(${enterScale(p0)})`}}>
      <svg data-deco width={120} height={108} viewBox="0 0 120 108">
        <path d="M60 6 L114 100 H6 Z" fill="rgba(224,113,92,0.25)" stroke={FROST.coral} strokeWidth={6} strokeLinejoin="round" />
        <rect x={55} y={36} width={10} height={36} rx={5} fill={FROST.coral} /><circle cx={60} cy={86} r={6} fill={FROST.coral} />
      </svg>
      <div><div style={{...T, fontSize: 56}}>{head.t}</div>{head.s && <Sub style={{marginTop: 10}}>{head.s}</Sub>}</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 10}}>
        <span style={{...N, fontSize: 132, color: FROST.coral}}>{String(Math.max(0, act + 1)).padStart(2, '0')}</span>
        <span style={{...N, fontSize: 48, color: FROST.faint}}>/ {String(n).padStart(2, '0')}</span></div>
      
    </div>
    {items.map((it, i) => { const p = useEnter(st(i)); const hi = hiOf(f, i, n, st); const past = act > i;
      return <div key={i} style={{...frost(past ? 'green' : 'coral'), left: L.x, top: L.y + i * (h + gap), width: L.w, height: h, padding: '0 40px', display: 'flex', alignItems: 'center', gap: 26,
        opacity: c01(p), transform: `translateX(${(1 - p) * 90}px) scale(${enterScale(p, 0.03)})`, transformOrigin: '0 50%'}}>
        <div style={{width: 56, height: 56, borderRadius: 28, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...N, fontSize: 32, color: '#fff',
          background: past ? FROST.badge.green : FROST.badge.coral, boxShadow: '0 4px 10px rgba(0,0,0,0.12)'}}>{past ? '✓' : '!'}</div>
        <div style={{...T, fontSize: 42, whiteSpace: 'nowrap'}}>{it.t}</div>
        <Sub style={{marginLeft: 'auto', whiteSpace: 'nowrap'}}>{it.s}</Sub>
        
      </div>; })}
  </>;
};

/* ============ 存档：unitCompare（已撤出待审/推荐/预览，不调用） ============ */
type Unit = {name: string; area: number; tag: string; plan: 'a' | 'b'; rows: {k: string; v: string; win?: boolean}[]};
const PLANS: Record<string, {x: number; y: number; w: number; h: number; t: string}[]> = {
  a: [{x: 0, y: 0, w: 200, h: 120, t: '主卧'}, {x: 200, y: 0, w: 150, h: 120, t: '次卧'}, {x: 350, y: 0, w: 170, h: 120, t: '书房'}, {x: 0, y: 120, w: 340, h: 110, t: '客餐厅'}, {x: 340, y: 120, w: 180, h: 110, t: '厨卫'}],
  b: [{x: 0, y: 0, w: 260, h: 230, t: '客厅'}, {x: 260, y: 0, w: 260, h: 110, t: '主卧'}, {x: 260, y: 110, w: 140, h: 120, t: '次卧'}, {x: 400, y: 110, w: 120, h: 120, t: '卫'}],
};
export const UnitCompare: React.FC<{R: Record<string, Rect>; A: Unit; B: Unit; st: Starts}> = ({R, A, B, st}) => {
  const f = useCurrentFrame(); const M = R.connMid;
  const card = (u: Unit, r: Rect, j: number) => { const p = enter(f, st(j * 2)); const draw = c01(enter(f, st(j * 2) + 6, 'soft')); const winTone: Tone = j ? 'green' : 'gold';
    return <div key={j} style={{...frost(), left: r.x, top: r.y, width: r.w, height: r.h, padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 18,
      opacity: c01(p), transform: `translateX(${(1 - p) * (j ? 120 : -120)}px) rotate(${(1 - p) * (j ? 2 : -2)}deg) scale(${enterScale(p)})`}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 18}}><div style={{...T, fontSize: 48}}>{u.name}</div>
          <div style={{...N, fontSize: 48, color: ACC[winTone]}}><Count to={u.area} start={st(j * 2) + 4} /><span style={{...B, fontSize: 30, marginLeft: 4}}>m²</span></div></div>
        <Pill tone={winTone}>{u.tag}</Pill>
      </div>
      <svg data-deco width={r.w - 80} height={236} viewBox="-6 -6 532 242" style={{flexShrink: 0}}>
        {PLANS[u.plan].map((q, k) => <g key={k}>
          <rect x={q.x} y={q.y} width={q.w} height={q.h} fill={`rgba(255,255,255,${0.06 * draw})`} stroke={FROST.ink} strokeOpacity={0.5} strokeWidth={3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          <text x={q.x + q.w / 2} y={q.y + q.h / 2 + 10} textAnchor="middle" fontFamily="Health" fontWeight={700} fontSize={28} fill={FROST.sub} opacity={draw}>{q.t}</text></g>)}
      </svg>
      {u.rows.map((rw, k) => { const q = c01(enter(f, st(j * 2 + 1) + k * 5));
        return <div key={k} style={{display: 'flex', alignItems: 'center', gap: 16, height: 52, borderTop: `1px solid ${FROST.line}`, paddingTop: 10, opacity: q, transform: `translateX(${(1 - q) * 30}px)`}}>
          <div style={{...B, fontSize: 34, color: FROST.sub, width: 150}}>{rw.k}</div>
          <div style={{...T, fontSize: 38, color: rw.win ? ACC[winTone] : FROST.ink}}>{rw.v}</div>
          {rw.win && <Pill tone={winTone} style={{marginLeft: 'auto'}}>更优</Pill>}</div>; })}
      
    </div>; };
  const v = c01(enter(f, st(1)));
  return <>{card(A, R.A, 0)}{card(B, R.B, 1)}
    <div style={{...frost('gold', false, 60), left: M.x + M.w / 2 - 60, top: M.y + M.h / 2 - 60, width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: v, transform: `scale(${0.5 + 0.5 * v})`}}><span style={{...N, fontSize: 44, color: FROST.gold}}>VS</span></div></>;
};

/* ============ 6 priceStep 单价 × 面积 = 总价 台阶 ============ */
type Step = {k: string; v: number; dec?: number; unit: string; s: string};
export const PriceStep: React.FC<{r: Rect; steps: Step[]; ops?: string[]; st: Starts}> = ({r, steps, ops = ['×', '='], st}) => {
  const f = useCurrentFrame(); const n = steps.length; const opW = 150; const w = (r.w - opW * (n - 1)) / n; const base = r.y + r.h;
  const hs = steps.map((_, i) => 300 + (r.h - 300) * (i / Math.max(1, n - 1)));
  const topOf = (i: number) => base - hs[i];
  return <>
    {steps.map((s, i) => { const p = c01(enter(f, st(i), 'soft')); const pe = enter(f, st(i)); const last = i === n - 1; const x = r.x + i * (w + opW);
      return <div key={i} style={{...frost(last ? 'gold' : i === 0 ? 'blue' : 'green'), left: x, top: topOf(i), width: w, height: hs[i], padding: '30px 36px', display: 'flex', flexDirection: 'column', gap: 10,
        clipPath: p === 1 ? undefined : `inset(${(1 - p) * 100}% 0 0 0 round 26px)`, transform: `translateY(${(1 - pe) * 40}px)`, borderBottomLeftRadius: 10, borderBottomRightRadius: 10}}>
        <div style={{...B, fontSize: 34, color: FROST.sub}}>{s.k}</div>
        <div style={{...N, fontSize: last ? 96 : 80, color: last ? FROST.gold : FROST.ink}}><Count to={s.v} start={st(i) + 4} dec={s.dec} /><span style={{...B, fontSize: 34, marginLeft: 8, color: FROST.ink}}>{s.unit}</span></div>
        <Sub style={{marginTop: 'auto'}}>{s.s}</Sub>
        
      </div>; })}
    {ops.slice(0, n - 1).map((o, i) => { const p = enter(f, st(i + 1) - 4, 'chip'); const x = r.x + (i + 1) * w + i * opW + opW / 2;
      return <div key={'o' + i} style={{...frost('none', true, 40), left: x - 40, top: base - 220, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: c01(p), transform: `scale(${enterScale(p)})`}}><span style={{...N, fontSize: 44, color: FROST.gold}}>{o}</span></div>; })}

  </>;
};

/* ============ 7 decisionFork 能不能买 分叉 ============ */
type Branch = {k: string; tone: Tone; mark: string; items: string[]; tag?: string};
export const DecisionFork: React.FC<{R: Record<string, Rect>; q: string; yes: Branch; no: Branch; st: Starts}> = ({R, q, yes, no, st}) => {
  const f = useCurrentFrame(); const Q = R.q, C = R.connFork; const p0 = useEnter(st(0) - 14);
  const x0 = Q.x + Q.w / 2, y0 = Q.y + Q.h; const ends = [R.L, R.R].map((b) => ({x: b.x + b.w / 2, y: b.y}));
  const path = (e: {x: number; y: number}) => `M${x0},${y0} C${x0},${y0 + 110} ${e.x},${e.y - 110} ${e.x},${e.y}`;
  const br = (b: Branch, r: Rect, j: number) => { const p = enter(f, st(1 + j)); const hi = hiOf(f, 1 + j, 3, st);
    return <div key={j} style={{...frost(b.tone), left: r.x, top: r.y, width: r.w, height: r.h, padding: '32px 40px', display: 'flex', flexDirection: 'column', gap: 16,
      opacity: c01(p), transform: `translateY(${(1 - p) * 50}px) scale(${enterScale(p)})`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}><div style={{width: 52, height: 52, borderRadius: 26, background: FROST.badge[b.tone], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...N, fontSize: 30}}>{b.mark}</div>
        <div style={{...T, fontSize: 50, color: ACC[b.tone]}}>{b.k}</div></div>
      {b.items.map((t, k) => { const q2 = c01(enter(f, st(1 + j) + 8 + k * 6)); return <div key={k} style={{display: 'flex', alignItems: 'center', gap: 14, opacity: q2, transform: `translateX(${(1 - q2) * 24}px)`}}>
        <div style={{width: 10, height: 10, borderRadius: 5, background: ACC[b.tone], flexShrink: 0}} /><div data-role="body" style={{...B, fontSize: 36, color: FROST.ink}}>{t}</div></div>; })}
      
    </div>; };
  return <>
    <div style={{...frost('gold'), left: Q.x, top: Q.y, width: Q.w, height: Q.h, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: c01(p0), transform: `scale(${enterScale(p0)})`}}>
      <div style={{...T, fontSize: 56}}>{q}</div></div>
    <svg data-deco style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible'}}>
      {ends.map((e, j) => { const d = c01(enter(f, st(1 + j) - 10, 'soft')); const tone = j ? no.tone : yes.tone; return <g key={j}>
        <path d={path(e)} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - d} />
        {d > 0.98 && <path d={path(e)} fill="none" stroke={ACC[tone]} strokeWidth={6} strokeLinecap="round" pathLength={100} strokeDasharray="4 22" strokeDashoffset={0} />}</g>; })}
    </svg>
    {[yes, no].map((b, j) => b.tag && (() => { const p = c01(enter(f, st(1 + j) - 4, 'chip')); const x = j ? C.x + C.w * 0.72 : C.x + C.w * 0.28;
      return <div key={'t' + j} style={{position: 'absolute', left: x, top: C.y + C.h / 2, transform: `translate(-50%,-50%) scale(${0.96 + 0.04 * p})`, opacity: p}}><Pill tone={b.tone} style={{background: 'rgba(46,48,57,0.88)'}}>{b.tag}</Pill></div>; })())}
    {br(yes, R.L, 0)}{br(no, R.R, 1)}
  </>;
};

/* ============ 8 districtTags 片区/板块标签热力 ============ */
const heatTone = (h: number): Tone => (h >= 0.75 ? 'coral' : h >= 0.5 ? 'gold' : h >= 0.3 ? 'green' : 'blue');
export const DistrictTags: React.FC<{R: Record<string, Rect>; tags: {t: string; heat: number; s?: string}[]; st: Starts; legend?: [string, string]}> = ({R, tags, st, legend = ['热', '冷']}) => {
  const f = useCurrentFrame(); const C = R.cloud, G = R.legend; const n = tags.length;
  const act = actOf(f, n, st); const lp = useEnter(st(0) - 12);
  const mk = act >= 0 ? tags[act].heat : 0.5; const prev = act > 0 ? tags[act - 1].heat : 0.5;
  const mkY = 1 - (prev + (mk - prev) * enter(f, st(Math.max(0, act)), 'soft'));
  const barTop = G.y + 90, barH = G.h - 180;
  return <>
    <div style={{position: 'absolute', left: C.x, top: C.y, width: C.w, height: C.h, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: '30px 28px'}}>
      {tags.map((tg, i) => { const p = enter(f, st(i)); const tone = heatTone(tg.heat); const on = i === act; const fs = 36 + Math.round(tg.heat * 20); const hot = tg.heat >= 0.75;
        return <div key={i} style={{...frost(tone, false, 999), position: 'relative', display: 'flex', alignItems: 'center', gap: 14, padding: `${16 + tg.heat * 10}px 34px`,
          opacity: c01(p), transform: `scale(${0.96 + 0.04 * p})`,
          boxShadow: `${frost(tone).boxShadow}${on ? ', 0 0 0 1px rgba(243,215,158,0.45)' : ''}`}}>
          <div style={{width: 14, height: 14, borderRadius: 7, background: ACC[tone === 'none' ? 'gold' : tone]}} />
          <span style={{...T, fontSize: fs, whiteSpace: 'nowrap'}}>{tg.t}</span>
          {tg.s && <span style={{...B, fontSize: 28, color: FROST.sub, whiteSpace: 'nowrap'}}>{tg.s}</span>}
          
        </div>; })}
    </div>
    <div style={{...frost('none', true), left: G.x, top: G.y, width: G.w, height: G.h, opacity: c01(lp), transform: `translateX(${(1 - lp) * 40}px)`}}>
      <div style={{position: 'absolute', top: 24, width: '100%', textAlign: 'center', ...T, fontSize: 40, color: FROST.coral}}>{legend[0]}</div>
      <div style={{position: 'absolute', bottom: 24, width: '100%', textAlign: 'center', ...T, fontSize: 40, color: FROST.blue}}>{legend[1]}</div>
      <div data-deco style={{position: 'absolute', left: G.w / 2 - 14, top: barTop - G.y, width: 28, height: barH, borderRadius: 14, background: 'linear-gradient(180deg,#D9826E,#E9C88A 45%,#EDE6DA 70%,#9DB6CF)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)'}} />
      <div data-deco style={{position: 'absolute', left: G.w / 2 - 34, top: barTop - G.y + barH * mkY - 10, width: 68, height: 20, borderRadius: 10, background: '#fff', boxShadow: '0 3px 8px rgba(0,0,0,0.25)'}} />
      
    </div>
  </>;
};

/* ============ 9 loanDial 贷款利率仪表 + 指标环 ============ */
type Stat = {k: string; v: number; dec?: number; sep?: boolean; unit: string; ratio: number; rl?: string; hi?: boolean};
export const LoanDial: React.FC<{R: Record<string, Rect>; dial: {k: string; v: number; dec?: number; unit: string; min: number; max: number; s?: string}; stats: Stat[]; st: Starts}> = ({R, dial, stats, st}) => {
  const f = useCurrentFrame(); const D = R.dial, S = R.stats; const p0 = useEnter(st(0) - 14); const nd = enter(f, st(0), 'soft');
  const cx = D.w / 2, cy = 330, rad = 230; const ratio = (dial.v - dial.min) / (dial.max - dial.min);
  const ang = -180 + 180 * ratio * nd;
  const arc = (a0: number, a1: number, rr: number) => { const p = (a: number) => [cx + rr * Math.cos(a * Math.PI / 180), cy + rr * Math.sin(a * Math.PI / 180)];
    const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0},${y0} A${rr},${rr} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`; };
  const n = stats.length; const g = 28; const h = (S.h - g * (n - 1)) / n;
  return <>
    <div style={{...frost('blue'), left: D.x, top: D.y, width: D.w, height: D.h, opacity: c01(p0), transform: `scale(${enterScale(p0)})`}}>
      <div style={{position: 'absolute', left: 44, top: 32, ...B, fontSize: 34, color: FROST.sub}}>{dial.k}</div>
      <svg data-deco width={D.w} height={D.h} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={arc(-180, 0, rad)} fill="none" stroke={FROST.track} strokeWidth={26} strokeLinecap="round" />
        <path d={arc(-180, -180 + Math.max(0.5, 180 * ratio * Math.min(1, nd)), rad)} fill="none" stroke="url(#dg)" strokeWidth={26} strokeLinecap="round" />
        <defs><linearGradient id="dg" x1="0" x2="1"><stop offset="0" stopColor="#EBCB8E" /><stop offset="1" stopColor="#C99A52" /></linearGradient></defs>
        {Array.from({length: 9}, (_, k) => { const a = (-180 + k * 22.5) * Math.PI / 180; return <line key={k} x1={cx + (rad - 40) * Math.cos(a)} y1={cy + (rad - 40) * Math.sin(a)} x2={cx + (rad - 58) * Math.cos(a)} y2={cy + (rad - 58) * Math.sin(a)} stroke={FROST.tick} strokeWidth={3} />; })}
        <g transform={`rotate(${ang} ${cx} ${cy})`}><line x1={cx} y1={cy} x2={cx + rad - 70} y2={cy} stroke={FROST.ink} strokeWidth={6} strokeLinecap="round" /></g>
        <circle cx={cx} cy={cy} r={16} fill={FROST.ink} />
      </svg>
      <div style={{position: 'absolute', left: cx - rad - 13 - 20, top: cy + 26, ...N, fontSize: 30, color: FROST.sub}}>{dial.min}%</div>
      <div style={{position: 'absolute', left: cx + rad - 30, top: cy + 26, ...N, fontSize: 30, color: FROST.sub}}>{dial.max}%</div>
      <div style={{position: 'absolute', left: 0, width: '100%', top: cy + 70, textAlign: 'center', ...N, fontSize: 104, color: FROST.gold}}><Count to={dial.v} start={st(0)} dec={dial.dec ?? 2} /><span style={{...B, fontSize: 40, marginLeft: 6}}>{dial.unit}</span></div>
      {dial.s && <Sub style={{position: 'absolute', left: 0, width: '100%', top: cy + 200, textAlign: 'center'}}>{dial.s}</Sub>}
      
    </div>
    {stats.map((s, i) => { const p = useEnter(st(i + 1)); const rp = c01(enter(f, st(i + 1) + 6, 'soft')); const R0 = 46, C0 = 2 * Math.PI * R0;
      return <div key={i} style={{...frost(s.hi ? 'gold' : i % 2 ? 'green' : 'blue'), left: S.x, top: S.y + i * (h + g), width: S.w, height: h, padding: '0 36px', display: 'flex', alignItems: 'center', gap: 28,
        opacity: c01(p), transform: `translateX(${(1 - p) * 70}px) scale(${enterScale(p)})`}}>
        <div style={{position: 'relative', width: 116, height: 116, flexShrink: 0}}>
          <svg data-deco width={116} height={116} style={{transform: 'rotate(-90deg)'}}><circle cx={58} cy={58} r={R0} fill="none" stroke={FROST.track} strokeWidth={10} />
            <circle cx={58} cy={58} r={R0} fill="none" stroke={s.hi ? '#E6C285' : 'rgba(244,238,228,0.62)'} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${C0 * s.ratio * rp} ${C0}`} /></svg>
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...N, fontSize: 28, color: FROST.sub}}>{s.rl ?? `${Math.round(s.ratio * 100 * rp)}%`}</div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <div style={{...B, fontSize: 34, color: FROST.sub}}>{s.k}</div>
          <div style={{...N, fontSize: 64, color: s.hi ? FROST.gold : FROST.ink}}><Count to={s.v} start={st(i + 1) + 4} dec={s.dec} sep={s.sep} /><span style={{...B, fontSize: 32, marginLeft: 8, color: FROST.ink}}>{s.unit}</span></div>
        </div>
        
      </div>; })}
  </>;
};

/* ============ 10 layerReveal 采光/景观/噪音/通风 条件层叠揭晓 ============ */
export const LayerReveal: React.FC<{R: Record<string, Rect>; layers: {k: string; s: string; score: number; tone?: Tone}[]; verdict: string; st: Starts}> = ({R, layers, verdict, st}) => {
  const f = useCurrentFrame(); const Lr = R.layers, Sc = R.score; const n = layers.length; const gap = 20; const h = (Lr.h - gap * (n - 1)) / n; const off = 26;
  const got = layers.reduce((a, l, i) => a + l.score * c01(enter(f, st(i) + 10, 'soft')), 0); const tot = 5 * n; const ps = useEnter(st(0) - 10);
  const vd = c01(enter(f, st(n - 1) + 24, 'chip')); const R0 = 118, C0 = 2 * Math.PI * R0;
  return <>
    {layers.map((l, i) => { const p = c01(enter(f, st(i), 'soft')); const pe = enter(f, st(i)); const hi = hiOf(f, i, n, st); const tone = l.tone ?? 'gold';
      return <div key={i} style={{...frost(tone), left: Lr.x + i * off, top: Lr.y + i * (h + gap), width: Lr.w - (n - 1) * off, height: h, padding: '0 36px', display: 'flex', alignItems: 'center', gap: 26,
        clipPath: p === 1 ? undefined : `inset(0 ${(1 - p) * 100}% 0 0 round 26px)`, transform: `translateY(${(1 - pe) * 30}px)`, zIndex: n - i}}>
        <div style={{...T, fontSize: 46, width: 110, flexShrink: 0, color: ACC[tone]}}>{l.k}</div>
        <Sub style={{whiteSpace: 'nowrap', flex: 1}}>{l.s}</Sub>
        <div data-deco style={{display: 'flex', gap: 8, flexShrink: 0}}>{Array.from({length: 5}, (_, k) => { const on = c01(enter(f, st(i) + 10 + k * 3, 'chip')) * (k < l.score ? 1 : 0);
          return <div key={k} style={{width: 22, height: 22, borderRadius: 11, background: on > 0.01 ? ACC[tone] : FROST.track, transform: `scale(${k < l.score ? 0.7 + 0.3 * on : 1})`}} />; })}</div>
        
      </div>; })}
    <div style={{...frost('gold'), left: Sc.x, top: Sc.y, width: Sc.w, height: Sc.h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22,
      opacity: c01(ps), transform: `translateX(${(1 - ps) * 60}px) scale(${enterScale(ps)})`}}>
      <div style={{...B, fontSize: 34, color: FROST.sub}}>条件综合分</div>
      <div style={{position: 'relative', width: 270, height: 270}}>
        <svg data-deco width={270} height={270} style={{transform: 'rotate(-90deg)'}}><circle cx={135} cy={135} r={R0} fill="none" stroke={FROST.track} strokeWidth={18} />
          <circle cx={135} cy={135} r={R0} fill="none" stroke="#E0BB78" strokeWidth={18} strokeLinecap="round" strokeDasharray={`${C0 * got / tot} ${C0}`} /></svg>
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...N, fontSize: 84, color: FROST.gold}}>{Math.round(got / tot * 100)}</div>
      </div>
      <div style={{opacity: vd, transform: `scale(${0.97 + 0.03 * vd})`}}><Pill tone="green" style={{fontSize: 32, padding: '10px 26px'}}>{verdict}</Pill></div>
      
    </div>
  </>;
};
