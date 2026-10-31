// 第二组数据/MG 样式：排名条 / 方块格 / 天平 / 年份进度环 / 月供算式
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT, MOTION} from './tokens';
import type {Rect} from './grid';
const E = Easing.bezier(0.33, 0, 0.2, 1);
const P = (f: number, a: number, d: number = MOTION.enter) => interpolate(f, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: E});
const abs = (r: Rect): React.CSSProperties => ({position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h});
const GOLD_BAR = 'linear-gradient(90deg, rgba(156,117,54,0.35), rgba(217,178,111,0.8) 60%, rgba(243,215,158,0.95))';
const WARM_BAR = 'linear-gradient(90deg, rgba(244,238,228,0.06), rgba(244,238,228,0.3))';
const num = (size: number, gold?: boolean): React.CSSProperties => ({fontFamily: FONT.num, fontWeight: 700, fontSize: size, color: gold ? COLOR.goldHi : COLOR.warm});
const lab = (size = 34, dim?: boolean): React.CSSProperties => ({fontFamily: FONT.body, fontWeight: 700, fontSize: size, color: dim ? COLOR.sub : COLOR.warm});

/** 1 横向排名条 */
export const RankBars: React.FC<{r: Rect; start: number; rows: {k: string; v: number}[]; unit: string; vMax: number}> = ({r, start, rows, unit, vMax}) => {
  const f = useCurrentFrame(); const labW = 260, valW = 220, gap = 36; const barMax = r.w - labW - valW - gap * 2;
  const rowH = 64, step = (r.h - rowH) / (rows.length - 1);
  return <div className="txs" style={abs(r)}>{rows.map((o, i) => {
    const s = start + i * MOTION.stagger; const g = P(f, s + 6, 34); const top = i * step; const hi = i === 0;
    return <div key={i} style={{position: 'absolute', left: 0, top, width: r.w, height: rowH, display: 'flex', alignItems: 'center', opacity: P(f, s)}}>
      <div style={{width: labW, ...lab(36, !hi), textAlign: 'right', marginRight: gap}}>{o.k}</div>
      <div style={{width: barMax * (o.v / vMax) * g, height: 40, borderRadius: 20, background: hi ? GOLD_BAR : WARM_BAR,
        borderRight: `3px solid ${hi ? COLOR.goldHi : 'rgba(244,238,228,0.7)'}`, boxShadow: hi ? '0 0 30px rgba(217,178,111,0.35)' : 'none'}} />
      <div style={{marginLeft: gap, whiteSpace: 'nowrap'}}><span style={num(hi ? 64 : 52, hi)}>{(o.v * g).toFixed(1)}</span><span style={{...lab(28, true), marginLeft: 8}}>{unit}</span></div>
    </div>;
  })}</div>;
};

/** 2 方块格 10×10 */
export const Waffle: React.FC<{r: Rect; start: number; on: number; value: string; unit: string; caption: string}> = ({r, start, on, value, unit, caption}) => {
  const f = useCurrentFrame(); const size = r.h; const cell = size / 10; const sq = cell - 10;
  const lit = interpolate(f, [start + 10, start + 55], [0, on], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: E});
  const tp = P(f, start + 50);
  return <div className="txs" style={abs(r)}>
    {Array.from({length: 100}).map((_, i) => { const c = i % 10, row = Math.floor(i / 10); const a = P(f, start + (c + row) * 1.2, 12); const isOn = i < lit;
      return <div key={i} style={{position: 'absolute', left: c * cell, top: row * cell, width: sq, height: sq, borderRadius: 8, opacity: a,
        background: isOn ? 'linear-gradient(160deg,#F3D79E,#D9B26F 60%,#9C7536)' : 'rgba(244,238,228,0.14)',
        boxShadow: isOn ? '0 0 14px rgba(217,178,111,0.4)' : 'none', border: isOn ? 'none' : '1px solid rgba(244,238,228,0.18)'}} />; })}
    <div style={{position: 'absolute', left: size + 96, top: size * 0.22, width: r.w - size - 96, opacity: tp, transform: `translateY(${(1 - tp) * 24}px)`}}>
      <div style={{whiteSpace: 'nowrap'}}><span style={num(150, true)}>{Math.round(lit)}</span><span style={{...lab(44), marginLeft: 12}}>{unit}</span></div>
      <div style={{...lab(38), marginTop: 24, lineHeight: 1.4, whiteSpace: 'pre-line'}}>{caption}</div>
      <div style={{...lab(28, true), marginTop: 20}}>{value}</div>
    </div>
  </div>;
};

/** 3 天平 */
export const Balance: React.FC<{r: Rect; start: number; L: {k: string; v: string; s: string}; R: {k: string; v: string; s: string}; tilt: number}> = ({r, start, L, R, tilt}) => {
  const f = useCurrentFrame(); const cx = r.w / 2, beamY = 250, arm = 520; // 横梁下移，倾斜后不进标题区
  const t = P(f, start + 24, 40) * tilt; const rad = (t * Math.PI) / 180; const ap = P(f, start);
  const end = (side: -1 | 1) => ({x: cx + side * arm * Math.cos(rad), y: beamY + side * arm * Math.sin(rad)});
  const pan = (side: -1 | 1, d: typeof L, heavy: boolean) => { const e = end(side); const p = P(f, start + 8 + (side > 0 ? 6 : 0));
    return <div style={{position: 'absolute', left: e.x - 200, top: e.y, width: 400, textAlign: 'center', opacity: p}}>
      <div style={{width: 2, height: 60, background: 'rgba(244,238,228,0.4)', margin: '0 auto'}} />
      <div style={{width: 300, height: 14, margin: '0 auto', borderRadius: 7, background: heavy ? GOLD_BAR : 'rgba(244,238,228,0.35)'}} />
      <div style={{...lab(36, !heavy), marginTop: 28}}>{d.k}</div>
      <div style={{whiteSpace: 'nowrap', marginTop: 8}}><span style={num(84, heavy)}>{d.v}</span></div>
      <div style={{...lab(28, true), marginTop: 6}}>{d.s}</div>
    </div>; };
  return <div className="txs" style={abs(r)}>
    <div style={{position: 'absolute', left: cx - 3, top: beamY, width: 6, height: r.h - beamY - 60, background: 'rgba(244,238,228,0.35)', opacity: ap}} />
    <div style={{position: 'absolute', left: cx - 120, top: r.h - 64, width: 240, height: 10, borderRadius: 5, background: 'rgba(244,238,228,0.35)', opacity: ap}} />
    <div style={{position: 'absolute', left: cx - arm, top: beamY - 4, width: arm * 2, height: 8, borderRadius: 4, background: 'rgba(244,238,228,0.75)',
      transform: `rotate(${t}deg)`, opacity: ap}} />
    <div style={{position: 'absolute', left: cx - 16, top: beamY - 16, width: 32, height: 32, borderRadius: 16, background: COLOR.warm, opacity: ap}} />
    {pan(-1, L, tilt < 0)}{pan(1, R, tilt > 0)}
  </div>;
};

/** 4 年份进度环（分段刻度 + 年份标点） */
export const YearRing: React.FC<{r: Rect; start: number; years: number; key1: number; title: string; sub: string; side: {k: string; v: string}[]}> = ({r, start, years, key1, title, sub, side}) => {
  const f = useCurrentFrame(); const D = r.h, R0 = D / 2 - 30, cx = D / 2, cy = D / 2;
  const p = interpolate(f, [start + 10, start + 50], [0, key1 / years], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: E});
  const cur = p * years; const hit = P(f, start + 50, 14);
  const pt = (y: number, rr: number) => { const a = (y / years) * 2 * Math.PI - Math.PI / 2; return {x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a)}; };
  return <div className="txs" style={abs(r)}>
    <svg width={D} height={D} style={{position: 'absolute', overflow: 'visible', opacity: P(f, start)}}>
      {Array.from({length: years}).map((_, y) => { const a = pt(y + 0.08, R0), b = pt(y + 0.92, R0); const done = y + 1 <= cur + 0.001;
        const partial = !done && y < cur; const m = partial ? pt(cur, R0) : b;
        return <g key={y}><path d={`M${a.x},${a.y} A${R0},${R0} 0 0 1 ${b.x},${b.y}`} stroke="rgba(244,238,228,0.16)" strokeWidth={34} fill="none" />
          {(done || partial) && <path d={`M${a.x},${a.y} A${R0},${R0} 0 0 1 ${m.x},${m.y}`} stroke={COLOR.gold} strokeWidth={34} fill="none" />}</g>; })}
      {[0, 10, 20].map((y) => { const q = pt(y, R0 + 52); return <text key={y} x={q.x} y={q.y + 10} textAnchor="middle" style={{fontFamily: FONT.num, fontSize: 28, fill: COLOR.sub}}>{y === 0 ? '30/0' : y}</text>; })}
      {hit > 0 && (() => { const q = pt(key1, R0); return <><circle cx={q.x} cy={q.y} r={22 + 14 * hit} fill="none" stroke={COLOR.goldHi} strokeWidth={3} opacity={0.7} />
        <circle cx={q.x} cy={q.y} r={14} fill={COLOR.goldHi} /></>; })()}
    </svg>
    <div style={{position: 'absolute', left: 0, top: cy - 100, width: D, textAlign: 'center'}}>
      <div style={lab(30, true)}>第</div>
      <div style={{whiteSpace: 'nowrap'}}><span style={num(120, true)}>{Math.max(1, Math.ceil(cur))}</span><span style={{...lab(40), marginLeft: 8}}>年</span></div>
    </div>
    <div style={{position: 'absolute', left: D + 120, top: 60, width: r.w - D - 120, opacity: hit, transform: `translateX(${(1 - hit) * 30}px)`}}>
      <div style={{...lab(44), lineHeight: 1.35, whiteSpace: 'pre-line'}}>{title}</div>
      <div style={{...lab(30, true), marginTop: 16, lineHeight: 1.4}}>{sub}</div>
      {side.map((s, i) => <div key={i} style={{marginTop: i ? 24 : 56, opacity: P(f, start + 58 + i * 6)}}>
        <div style={lab(28, true)}>{s.k}</div><div style={num(56)}>{s.v}</div></div>)}
    </div>
  </div>;
};

/** 5 月供算式 */
export const FormulaCalc: React.FC<{r: Rect; start: number; terms: {v: string; k: string}[]; ops: string[]; result: number; unit: string; note: string}> = ({r, start, terms, ops, result, unit, note}) => {
  const f = useCurrentFrame(); const rp = P(f, start + terms.length * 10 + 14, 30);
  const shown = Math.round(result * rp).toLocaleString('en-US');
  return <div className="txs" style={abs(r)}>
    <div style={{position: 'absolute', left: 0, top: 40, width: r.w, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between'}}>
      {terms.map((t, i) => { const p = P(f, start + i * 10); return <React.Fragment key={i}>
        <div style={{textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * -40}px)`}}>
          <div style={{...num(76), whiteSpace: 'nowrap'}}>{t.v}</div><div style={{...lab(30, true), marginTop: 12}}>{t.k}</div></div>
        {i < ops.length && <div style={{...num(64), color: COLOR.sub, opacity: P(f, start + i * 10 + 6), marginTop: 4}}>{ops[i]}</div>}
      </React.Fragment>; })}
    </div>
    <div style={{position: 'absolute', left: 0, top: 250, width: r.w * P(f, start + terms.length * 10, 20), height: 2, background: 'rgba(244,238,228,0.3)'}} />
    <div style={{position: 'absolute', left: 0, top: 300, width: r.w, display: 'flex', alignItems: 'baseline', justifyContent: 'center', opacity: P(f, start + terms.length * 10 + 10),
      transform: `translateY(${(1 - P(f, start + terms.length * 10 + 10)) * 30}px)`}}>
      <span style={{...lab(40), marginRight: 32}}>每月还款 ≈</span><span style={num(150, true)}>{shown}</span><span style={{...lab(44), marginLeft: 12}}>{unit}</span></div>
    <div style={{position: 'absolute', left: 0, top: 520, width: r.w, textAlign: 'center', ...lab(28, true), opacity: rp}}>{note}</div>
  </div>;
};
