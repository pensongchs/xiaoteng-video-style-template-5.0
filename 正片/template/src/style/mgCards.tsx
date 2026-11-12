// 5.0 旧6套 MG 存档（非默认推荐）：关键词瀑布 / 清单进度 / VS 计分板 / 提示堆叠 / 序号翻牌 / 迷你KPI。
// 材质与已定 v6 共用 glassMat；无颗粒、无白底、无到位弹、无扫光。
import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Sheen, Count, glassMat} from './components';
import {COLOR, FONT, SPRING, TYPE, FROST, steadySpring as spring} from './tokens';
import type {Rect} from './grid.ts';

const LG = (_a = 0.16, tint?: string): React.CSSProperties => ({
  ...glassMat('dark', tint), borderRadius: 26,
  boxSizing: 'border-box', overflow: 'hidden', position: 'absolute',
});
const TINT: Record<string, string> = {gold: FROST.tint.gold, coral: FROST.tint.coral, green: FROST.tint.green, glass: FROST.tint.none};
const ACC: Record<string, string> = {gold: FROST.ink, coral: FROST.coral, green: FROST.green, glass: FROST.ink};
const useSp = (st: number, cfg = SPRING.enter) => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return spring({frame: Math.max(0, f - st), fps, config: cfg}); };
/** 旧签名兼容：新定版到位后不整体呼吸/漂浮。 */
const breathe = (_f: number, _i: number, _amp = 3) => 'translateY(0px)';
const T: React.CSSProperties = {fontFamily: FONT.title, fontWeight: 900};
const B: React.CSSProperties = {fontFamily: FONT.body, fontWeight: 700};
const txs = 'txs';
export type Starts = (i: number) => number;

/** 1 关键词瀑布：关键词卡逐个从上落下叠成阶梯，最后一张高亮 */
export const KeywordCascade: React.FC<{r: Rect; words: {t: string; s?: string; tone?: string}[]; st: Starts}> = ({r, words, st}) => {
  const f = useCurrentFrame(); const n = words.length; const h = Math.min(132, (r.h - (n - 1) * 20) / n);
  return <>{words.map((w, i) => { const p = useSp(st(i)); const o = Math.min(1, p); const x = r.x + i * Math.min(110, (r.w - 760) / Math.max(1, n - 1));
    const y = r.y + i * (h + 20); const last = i === n - 1;
    return <div key={i} className={txs} style={{...LG(0.15, TINT[w.tone ?? (last ? 'gold' : 'glass')]), left: x, top: y, width: 760, height: h, padding: '0 40px', display: 'flex', alignItems: 'center', gap: 28,
      opacity: o, transform: `translateY(${(1 - p) * -70}px) rotate(${(1 - p) * -4}deg) ${breathe(f, i)}`}}>
      <div style={{...T, fontSize: 30, color: ACC[w.tone ?? 'gold'], width: 56}}>{String(i + 1).padStart(2, '0')}</div>
      <div style={{...T, fontSize: 56, color: FROST.ink}}>{w.t}</div>
      {w.s && <div style={{...B, fontSize: 34, color: FROST.sub, marginLeft: 'auto'}}>{w.s}</div>}
      <Sheen at={st(i) + 6} />
    </div>; })}</>;
};

/** 2 清单 + 进度条：每说一项打勾，顶部进度条一格一格填满 */
export const ChecklistFill: React.FC<{r: Rect; items: {t: string; tone?: string}[]; st: Starts; label?: string}> = ({r, items, st, label}) => {
  const f = useCurrentFrame(); const n = items.length; const done = items.filter((_, i) => f >= st(i) + 10).length;
  const barP = interpolate(f, items.map((_, i) => st(i) + 10).concat([st(n - 1) + 30]), items.map((_, i) => i / n).concat([1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rowH = Math.min(96, (r.h - 130 - (n - 1) * 16) / n); const shown = useSp(st(0) - 10);
  return <>
    <div className={txs} style={{...LG(0.14), left: r.x, top: r.y, width: r.w, height: 100, padding: '0 36px', display: 'flex', alignItems: 'center', gap: 28, opacity: Math.min(1, shown)}}>
      <div style={{...B, fontSize: 32, whiteSpace: 'nowrap'}}>{label ?? '清单进度'}</div>
      <div style={{flex: 1, display: 'flex', gap: 8}}>{items.map((it, i) => { const fill = Math.max(0, Math.min(1, barP * n - i));
        return <div key={i} style={{flex: 1, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.18)', overflow: 'hidden'}}>
          <div style={{width: `${fill * 100}%`, height: '100%', background: `linear-gradient(90deg, ${COLOR.gold}, ${ACC[it.tone ?? 'gold']})`, boxShadow: `0 0 14px ${COLOR.gold}`}} /></div>; })}</div>
      <div style={{...T, fontFamily: FONT.num, fontWeight: 700, fontSize: 44, color: COLOR.goldHi}}>{done}<span style={{fontSize: 28, color: COLOR.sub}}> / {n}</span></div>
    </div>
    {items.map((it, i) => { const p = useSp(st(i)); const ck = useSp(st(i) + 8, SPRING.snappy); const on = f >= st(i) + 8; const cur = i === done - 1;
      return <div key={i} className={txs} style={{...LG(cur ? 0.2 : 0.12, cur ? TINT[it.tone ?? 'gold'] : undefined), left: r.x, top: r.y + 130 + i * (rowH + 16), width: r.w, height: rowH, padding: '0 36px', display: 'flex', alignItems: 'center', gap: 28,
        opacity: Math.min(1, p) * (on && !cur ? 0.78 : 1), transform: `translateX(${(1 - p) * 60}px) ${breathe(f, i, 2)}`}}>
        <div style={{width: 50, height: 50, borderRadius: 14, border: '2px solid rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? ACC[it.tone ?? 'gold'] : 'transparent'}}>
          <span style={{...T, fontSize: 34, color: COLOR.graphite, transform: `scale(${ck})`}}>✓</span></div>
        <div style={{...B, fontSize: 40}}>{it.t}</div>
        <Sheen at={st(i) + 8} />
      </div>; })}
  </>;
};

/** 3 VS 计分板：左右两队，逐项比分，胜方那一格亮起；底部总比分滚动 */
export const VsScore: React.FC<{r: Rect; L: string; R: string; rows: {k: string; w: 'L' | 'R' | '='}[]; st: Starts}> = ({r, L, R, rows, st}) => {
  const f = useCurrentFrame(); const head = useSp(st(0) - 14); const n = rows.length; const rh = Math.min(84, (r.h - 160 - (n - 1) * 14) / n);
  const sc = (side: 'L' | 'R') => rows.filter((x, i) => f >= st(i) + 8 && (x.w === side || x.w === '=')).length;
  const colW = (r.w - 300) / 2;
  return <>
    {(['L', 'R'] as const).map((sd, j) => <div key={sd} className={txs} style={{...LG(0.16, TINT[j ? 'green' : 'coral']), left: j ? r.x + colW + 300 : r.x, top: r.y, width: colW, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px',
      opacity: Math.min(1, head), transform: `translateX(${(1 - head) * (j ? 80 : -80)}px)`}}>
      <div style={{...T, fontSize: 52}}>{sd === 'L' ? L : R}</div>
      <div style={{fontFamily: FONT.num, fontWeight: 700, fontSize: 72, color: COLOR.goldHi, transform: 'none'}}>{sc(sd)}</div>
    </div>)}
    <div style={{position: 'absolute', left: r.x + colW, top: r.y, width: 300, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', ...T, fontSize: 64, color: '#fff', opacity: Math.min(1, head), transform: `scale(${0.6 + 0.4 * head}) rotate(0deg)`}} className={txs}>VS</div>
    {rows.map((x, i) => { const p = useSp(st(i)); const lit = useSp(st(i) + 8, SPRING.snappy); const y = r.y + 160 + i * (rh + 14);
      const cell = (side: 'L' | 'R') => { const win = x.w === side || x.w === '='; return <div style={{...LG(win ? 0.1 + 0.14 * Math.min(1, lit) : 0.08, win ? TINT[side === 'L' ? 'coral' : 'green'] : undefined), position: 'absolute', left: side === 'L' ? r.x : r.x + colW + 300, top: 0, width: colW, height: rh, display: 'flex', alignItems: 'center', justifyContent: 'center', ...T, fontSize: 40, color: win ? '#fff' : 'rgba(255,255,255,0.45)'}}>{win ? (x.w === '=' ? '平' : '胜') : '—'}{win && <Sheen at={st(i) + 8} />}</div>; };
      return <div key={i} className={txs} style={{position: 'absolute', left: 0, top: y, opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 40}px)`}}>
        {cell('L')}{cell('R')}
        <div style={{...LG(0.22), left: r.x + colW + 24, top: 0, width: 252, height: rh, display: 'flex', alignItems: 'center', justifyContent: 'center', ...B, fontSize: 36}}>{x.k}</div>
      </div>; })}
  </>;
};

/** 4 提示堆叠：图标胶囊卡像通知一样从右侧弹入，新卡进来旧卡上推、缩小、变淡 */
export const TipStack: React.FC<{r: Rect; tips: {icon: string; t: string; s?: string; tone?: string}[]; st: Starts}> = ({r, tips, st}) => {
  const f = useCurrentFrame(); const n = tips.length; const h = 168; const act = tips.reduce((k, _, i) => (f >= st(i) ? i : k), 0);
  return <>{tips.map((tp, i) => { const p = useSp(st(i)); const depth = Math.max(0, act - i); const ds = (i: number) => i < act ? Math.min(1, spring({frame: Math.max(0, f - st(i + 1)), fps: 30, config: SPRING.soft})) : 0; const dd = Array.from({length: Math.max(0, act - i)}, (_, j) => ds(i + j)).reduce((a, b) => a + b, 0); const sc = 1 - dd * 0.04; const op = Math.max(0, 1 - dd * 0.3);
    const y = r.y + r.h - h - dd * (h + 20);
    return <div key={i} className={txs} style={{...LG(0.17, TINT[tp.tone ?? 'glass']), left: r.x, top: y, width: r.w, height: h, padding: '0 40px', display: 'flex', alignItems: 'center', gap: 32,
      opacity: Math.min(1, p) * op, transform: `translateX(${(1 - p) * 220}px) scale(${sc}) ${breathe(f, i, 2)}`, transformOrigin: '50% 100%', zIndex: i}}>
      <div style={{width: 88, height: 88, borderRadius: 24, background: `linear-gradient(160deg, ${ACC[tp.tone ?? 'gold']}, ${COLOR.goldDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, transform: `rotate(${(1 - p) * -30}deg)`}}>{tp.icon}</div>
      <div><div style={{...T, fontSize: 48}}>{tp.t}</div>{tp.s && <div style={{...B, fontSize: 34, color: COLOR.sub, marginTop: 6}}>{tp.s}</div>}</div>
      <Sheen at={st(i) + 6} />
    </div>; })}</>;
};

/** 5 序号翻牌：大号序号卡 3D 翻转揭晓内容，横排；当前卡抬升 */
export const NumberedReveal: React.FC<{r: Rect; cards: {t: string; s?: string}[]; st: Starts}> = ({r, cards, st}) => {
  const f = useCurrentFrame(); const n = cards.length; const gap = 36; const w = (r.w - gap * (n - 1)) / n; const act = cards.reduce((k, _, i) => (f >= st(i) ? i : k), -1);
  return <>{cards.map((c, i) => { const p = useSp(st(i) - 14, SPRING.soft); const flip = useSp(st(i), SPRING.enter); const ang = 180 - 180 * Math.min(1.08, flip); const front = ang < 90; const up = 0;
    return <div key={i} style={{position: 'absolute', left: r.x + i * (w + gap), top: r.y + 40 - up * 24, width: w, height: r.h - 80, perspective: 1400, opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 60}px) ${breathe(f, i, 2.5)}`}}>
      <div className={txs} style={{...LG(front ? 0.18 : 0.12, front && up ? TINT.gold : undefined), inset: 0, transform: `rotateY(${front ? ang : ang - 180}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24, textAlign: 'center'}}>
        {front ? <>
          <div style={{fontFamily: FONT.num, fontWeight: 700, fontSize: 96, color: COLOR.goldHi, lineHeight: 1}}>{i + 1}</div>
          <div style={{...T, fontSize: 48, lineHeight: 1.3}}>{c.t}</div>
          {c.s && <div style={{...B, fontSize: 34, color: COLOR.sub, lineHeight: 1.4}}>{c.s}</div>}
        </> : <div style={{fontFamily: FONT.num, fontWeight: 700, fontSize: 160, color: 'rgba(255,255,255,0.5)'}}>?</div>}
        {front && <Sheen at={st(i) + 8} />}
      </div>
    </div>; })}</>;
};

/** 6 迷你 KPI 网格：2×2 / 2×3 小卡，数字滚动 + 迷你进度条；无真实数字时用 value 文本 */
export const KpiGrid: React.FC<{r: Rect; kpis: {k: string; v?: number; dec?: number; unit?: string; text?: string; ratio?: number; tone?: string}[]; st: Starts}> = ({r, kpis, st}) => {
  const f = useCurrentFrame(); const n = kpis.length; const c = n > 4 ? 3 : 2; const rws = Math.ceil(n / c); const g = 36;
  const w = (r.w - g * (c - 1)) / c; const h = (r.h - g * (rws - 1)) / rws;
  return <>{kpis.map((x, i) => { const p = useSp(st(i)); const bar = useSp(st(i) + 10, SPRING.soft);
    return <div key={i} className={txs} style={{...LG(0.15, TINT[x.tone ?? 'glass']), left: r.x + (i % c) * (w + g), top: r.y + Math.floor(i / c) * (h + g), width: w, height: h, padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      opacity: Math.min(1, p), transform: `scale(${0.85 + 0.15 * p}) ${breathe(f, i, 2)}`}}>
      <div style={{...B, fontSize: 34, color: COLOR.sub}}>{x.k}</div>
      <div style={{fontFamily: x.text ? FONT.title : FONT.num, fontWeight: x.text ? 900 : 700, fontSize: x.text ? 64 : 84, color: ACC[x.tone ?? 'gold'], lineHeight: 1}}>
        {x.text ?? <><Count to={x.v ?? 0} start={st(i)} dec={x.dec} /><span style={{fontSize: 36, marginLeft: 8, color: '#fff'}}>{x.unit}</span></>}</div>
      <div style={{height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.18)'}}><div style={{width: `${(x.ratio ?? 0.6) * Math.min(1, bar) * 100}%`, height: '100%', borderRadius: 6, background: ACC[x.tone ?? 'gold']}} /></div>
      <Sheen at={st(i) + 6} />
    </div>; })}</>;
};
