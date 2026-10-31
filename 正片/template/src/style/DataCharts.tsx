// 数据画面：折线逐年描画 + 半透明光条柱（5.0 小样）。尺寸匀称：内容约占容器 60–70%，字号守规范下限、不夸张
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLOR, FONT, MOTION, TYPE} from './tokens';
import type {Rect} from './grid';

const E = Easing.bezier(0.33, 0, 0.2, 1);
const P = (f: number, a: number, d: number) => interpolate(f, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: E});

export const LineChartReveal: React.FC<{r: Rect; start: number; pts: {x: string; v: number}[]; peak: number; unit: string; drawDur?: number; vMin: number; vMax: number}> =
({r, start, pts, peak, unit, drawDur = 45, vMin, vMax}) => {
  const f = useCurrentFrame();
  const padL = 40, padR = 40, padT = 150, padB = 70; // 上方留给拐点数字，下方年份
  const W = r.w - padL - padR, H = r.h - padT - padB;
  const xy = pts.map((p, i) => ({x: padL + (W * i) / (pts.length - 1), y: padT + H * (1 - (p.v - vMin) / (vMax - vMin))}));
  const seg = drawDur / (pts.length - 1);
  const prog = P(f, start, drawDur) * (pts.length - 1); // 0..n-1
  const k = Math.floor(prog), t = prog - k;
  const shown = xy.slice(0, k + 1);
  if (k < xy.length - 1) shown.push({x: xy[k].x + (xy[k + 1].x - xy[k].x) * t, y: xy[k].y + (xy[k + 1].y - xy[k].y) * t});
  const d = shown.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
  const area = shown.length > 1 ? `${d} L${shown[shown.length - 1].x},${padT + H} L${shown[0].x},${padT + H} Z` : '';
  const peakAt = start + seg * peak; const pp = P(f, peakAt, 14); const head = shown[shown.length - 1];
  const base = P(f, start - 10, MOTION.enter);
  return <div className="txs" style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h}}>
    <svg width={r.w} height={r.h} style={{position: 'absolute', overflow: 'visible'}}>
      <defs><linearGradient id="lcA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COLOR.gold} stopOpacity="0.28" /><stop offset="1" stopColor={COLOR.gold} stopOpacity="0" /></linearGradient></defs>
      <line x1={padL} x2={padL + W * base} y1={padT + H} y2={padT + H} stroke="rgba(244,238,228,0.28)" strokeWidth={2} />
      {area && <path d={area} fill="url(#lcA)" />}
      <path d={d} fill="none" stroke={COLOR.gold} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 10px rgba(217,178,111,0.45))'}} />
      {xy.map((p, i) => i <= prog + 0.001 && i !== peak && <circle key={i} cx={p.x} cy={p.y} r={8} fill={COLOR.warm} opacity={0.85} />)}
      {head && prog < pts.length - 1 && <circle cx={head.x} cy={head.y} r={10} fill={COLOR.goldHi} />}
      {pp > 0 && <><circle cx={xy[peak].x} cy={xy[peak].y} r={14 + 22 * pp} fill="none" stroke={COLOR.goldHi} strokeWidth={3} opacity={0.6 * (1 - pp) + 0.25} />
        <circle cx={xy[peak].x} cy={xy[peak].y} r={9 + 6 * pp} fill={COLOR.goldHi} /></>}
    </svg>
    {pts.map((p, i) => <div key={i} style={{position: 'absolute', left: xy[i].x - 60, width: 120, top: padT + H + 20, textAlign: 'center', fontFamily: FONT.num,
      fontSize: 30, color: i === peak ? COLOR.warm : COLOR.sub, opacity: P(f, start + seg * i - 6, 12)}}>{p.x}</div>)}
    <div style={{position: 'absolute', left: xy[peak].x - 200, width: 400, top: xy[peak].y - 150, textAlign: 'center', opacity: pp, transform: `translateY(${(1 - pp) * 20}px) scale(${0.9 + 0.1 * pp})`}}>
      <span style={{fontFamily: FONT.num, fontWeight: 700, fontSize: 96, color: COLOR.goldHi}}>{pts[peak].v.toFixed(2)}</span>
      <span style={{fontFamily: FONT.body, fontWeight: 700, fontSize: 34, color: COLOR.warm, marginLeft: 10}}>{unit}</span>
    </div>
  </div>;
};

export const BarGlow: React.FC<{r: Rect; start: number; bars: {k: string; v: number; hi?: boolean}[]; unit: string; vMax: number; barW?: number}> =
({r, start, bars, unit, vMax, barW = 160}) => {
  const f = useCurrentFrame(); const top = 110, bot = 70; const H = r.h - top - bot;
  const slot = r.w / bars.length;
  return <div className="txs" style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h}}>
    <div style={{position: 'absolute', left: 0, top: top + H, width: r.w * P(f, start - 10, MOTION.enter), height: 2, background: 'rgba(244,238,228,0.28)'}} />
    {bars.map((b, i) => {
      const s = start + i * MOTION.stagger; const g = P(f, s, 36); const h = H * (b.v / vMax) * g; const cx = slot * i + slot / 2;
      const fill = b.hi ? `linear-gradient(180deg, rgba(243,215,158,0.95), rgba(217,178,111,0.55) 60%, rgba(156,117,54,0.25))`
                        : `linear-gradient(180deg, rgba(244,238,228,0.42), rgba(244,238,228,0.14) 70%, rgba(244,238,228,0.05))`;
      return <React.Fragment key={i}>
        <div style={{position: 'absolute', left: cx - barW / 2, width: barW, top: top + H - h, height: h, borderRadius: '14px 14px 0 0', background: fill,
          borderTop: `3px solid ${b.hi ? COLOR.goldHi : 'rgba(244,238,228,0.7)'}`, boxShadow: b.hi ? '0 0 40px rgba(217,178,111,0.35)' : 'none'}} />
        <div style={{position: 'absolute', left: cx - 160, width: 320, top: top + H - h - 96, textAlign: 'center', opacity: P(f, s + 12, 18), whiteSpace: 'nowrap'}}>
          <span style={{fontFamily: FONT.num, fontWeight: 700, fontSize: 76, color: b.hi ? COLOR.goldHi : COLOR.warm}}>{(Number.isInteger(b.v) ? Math.round(b.v * g) : (b.v * g).toFixed(1))}</span>
          <span style={{fontFamily: FONT.body, fontWeight: 700, fontSize: 30, color: COLOR.sub, marginLeft: 8}}>{unit}</span>
        </div>
        <div style={{position: 'absolute', left: cx - 160, width: 320, top: top + H + 18, textAlign: 'center', fontFamily: FONT.body, fontWeight: 700,
          fontSize: 34, color: b.hi ? COLOR.warm : COLOR.sub, opacity: P(f, s, MOTION.enter)}}>{b.k}</div>
      </React.Fragment>;
    })}
  </div>;
};
