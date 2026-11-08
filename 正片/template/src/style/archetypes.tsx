import React from 'react';
import {AbsoluteFill, Freeze, Img, staticFile, useCurrentFrame, useVideoConfig, getInputProps} from 'remotion';
import {bump, 
  ArrowConnector, Backdrop, BareNumber, CamCtx, Chip, ExampleMark, FloatLabel, GoldText, Headline, HighlightBar,
  IconRow, Kicker, MediaFrame, ProgressRing, QuoteBlock, SoftCallout, SplitType, StatPill, Timeline, UnderlineDraw, prog, glassMat,
  LiveFrameCtx,
} from './components';
import {layoutRects, titleRect, usesTitle} from './layouts.ts';
import {GRID, splitRows, type Rect} from './grid.ts';
import {COLOR, FONT, MOTION, SPRING, TYPE, FROST, glassEnter, steadySpring as spring} from './tokens';
import type {Shot, TimelineWindow} from './types';
import {entranceAt} from '../sync/timeline.ts';
import {DomCheck} from './domcheck';
import {LineChartReveal, BarGlow} from './DataCharts';
import {RankBars, Waffle, Balance, YearRing, FormulaCalc} from './DataCharts2';
import {KeywordCascade, ChecklistFill, VsScore, TipStack, NumberedReveal, KpiGrid} from './mgCards';
import {FloorLadder, PaymentSplit, AmenityOrbit, PitfallBoard, PriceStep, DecisionFork, DistrictTags, LoanDial, LayerReveal} from './mgEstate';

/** 对应短句起点提前两帧起动，口播开始时已能看到入场。未设锚点时使用版式默认值。 */
export const AnchorCtx = React.createContext<Record<string, number>>({});
const useAt = () => {
  const anchors = React.useContext(AnchorCtx);
  return (key: string, fallback: number) => entranceAt(anchors[key], fallback);
};


/** 有锚点 s0/s1…（或 r0/r1…）时，焦点随口播逐项移动 */
const anchoredIdx = (f: number, n: number, p: string, a: Record<string, number>) => {
  if (a[`${p}0`] == null) return null; let k = 0;
  for (let i = 0; i < n; i++) if (a[`${p}${i}`] != null && f >= entranceAt(a[`${p}${i}`], Infinity)) k = i;
  return k;
};
const focusIdx = (f: number, n: number, from: number, to: number) =>
  Math.min(n - 1, Math.max(0, Math.floor(((f - from) / Math.max(1, to - from)) * n)));

const TitleFloat: React.FC<{s: Shot}> = ({s}) => {
  const R = layoutRects('titleFloat'); const d = s.data;
  const at = useAt();
  const titleBody = {...R.title, y: R.title.y + 80, h: R.title.h - 80};
  const l1 = at('l1', 4);
  return <>
    <div style={{position: 'absolute', left: R.title.x, top: R.title.y, display: 'flex', gap: 20}}>
      {d.chips?.map((c: any, i: number) => <Chip key={i} start={at(`chip${i}`, l1 + 4 + i * 5)} tone={c.tone}>{c.t}</Chip>)}
    </div>
    <SplitType r={titleBody} start={l1} line1={d.line1} line2={d.line2} line2Start={at('l2', l1 + 7)} sub={d.sub} />
    <MediaFrame r={R.media} start={at('media', 34)} {...d.media} from="right" soft />
    <SoftCallout r={R.callout} start={at('callout', l1 + 28)} text={d.callout} icon={d.icon ?? '▲'} />
  </>;
};

const BareNumView: React.FC<{s: Shot}> = ({s}) => {
  const R = layoutRects('bareNumber'); const d = s.data; const at = useAt(); const c0 = at('count', 10); const f = useCurrentFrame(); const N = R.number;
  return <>
    <div style={{position: 'absolute', left: N.x, top: N.y, width: N.w, height: N.h, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 48}}>
      <Chip start={6} tone="gold">{d.chip}</Chip>
      <BareNumber r={{x: 0, y: 0, w: N.w, h: 260}} start={c0} value={d.value} unit={d.unit} dec={d.dec} label={d.label} size={150} flow />
      <div style={{position: 'relative'}}>
        <UnderlineDraw x={0} y={0} w={360} start={c0 + 18} />
        <div style={{paddingTop: 28, fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body, lineHeight: 1.4, color: COLOR.sub, opacity: prog(f, at('formula', c0 + 22), 14)}} data-role="body">
          <GoldText text={d.formula} />
        </div>
      </div>
      <div style={{display: 'flex', gap: 24}}>{d.chips?.map((c: any, i: number) => <Chip key={i} start={c0 + 30 + i * 6} tone={c.tone}>{c.t}</Chip>)}</div>
    </div>
    <MediaFrame r={R.media} start={at('media', c0 + 26)} {...d.media} from="right" soft />
  </>;
};

const SplitVs: React.FC<{s: Shot}> = ({s}) => {
  const R = layoutRects('splitVs'); const d = s.data; const A = R.connArrow; const at = useAt(); const l0 = at('L', 28), r0 = at('R', Math.max(36, l0 + 8));
  return <>
    <MediaFrame r={R.mediaL} start={at('mediaL', l0 + 8)} {...d.L.media} from="left" soft />
    <ArrowConnector x={A.x + 48} y={A.y + 18} w={A.w - 96} start={Math.max(l0 + 18, r0 - 16)} />
    <MediaFrame r={R.mediaR} start={at('mediaR', Math.max(l0 + 30, r0))} {...d.R.media} from="right" soft />
    <BareNumber r={R.dataL} start={l0} value={d.L.value} unit={d.L.unit} dec={d.L.dec} label={d.L.label} gold={d.winner === 'L'} size={110}>
      {d.L.chip && <Chip start={l0 + 16} tone={d.L.chip.tone}>{d.L.chip.t}</Chip>}
    </BareNumber>
    <BareNumber r={R.dataR} start={r0} value={d.R.value} unit={d.R.unit} dec={d.R.dec} label={d.R.label} gold={d.winner === 'R'} size={110}>
      {d.R.chip && <Chip start={r0 + 12} tone={d.R.chip.tone}>{d.R.chip.t}</Chip>}
    </BareNumber>
  </>;
};

const TimelineWindows: React.FC<{r: Rect; cards: TimelineWindow[]; starts: number[]}> = ({r, cards, starts}) => {
  const f = useCurrentFrame();
  const width = (r.w - GRID.gutter * (cards.length - 1)) / cards.length;
  const current = starts.reduce((latest, start, i) => f >= start ? i : latest, -1);
  return <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h}}>
    {cards.map(({label, src}, i) => {
      const p = glassEnter(f, starts[i]);
      const lit = current === i;
      return <div key={src} data-window={i} style={{
        position: 'absolute', left: i * (width + GRID.gutter), top: 0, width, height: '100%',
        display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
        borderRadius: 18, overflow: 'hidden', border: `1px solid ${lit ? '#e5c48d' : 'rgba(240,244,255,.25)'}`,
        background: '#191e27', boxShadow: '0 10px 30px rgba(7,13,24,.45)',
        opacity: p, transform: `translateY(${16 * (1 - p)}px)`,
      }}>
        <Img src={staticFile(src)} style={{width: '100%', height: 0, flex: '1 1 auto', objectFit: 'cover'}} />
        <div style={{
          display: 'grid', placeItems: 'center', minHeight: 67,
          background: 'linear-gradient(180deg,#303642,#202631)', fontFamily: FONT.title,
          fontSize: TYPE.rowTitle, letterSpacing: 2, lineHeight: 1.25, color: lit ? '#ffe1a6' : COLOR.warm,
        }}>{label}</div>
      </div>;
    })}
  </div>;
};

const TimelineView: React.FC<{s: Shot; dur: number}> = ({s, dur}) => {
  const f = useCurrentFrame(); const d = s.data;
  const windows = d.windows?.length ? d.windows as TimelineWindow[] : undefined;
  const R = layoutRects('timeline', d.steps.length, {windows: !!windows});
  const at = useAt(); const act = anchoredIdx(f, d.steps.length, 's', React.useContext(AnchorCtx)) ?? focusIdx(f, d.steps.length, 24, dur - 60);
  const next = d.note?.next && f >= at('noteNext', dur);
  return <>
    <Timeline r={R.steps} start={8} steps={d.steps} active={act} starts={d.steps.map((_: any, i: number) => at(`s${i}`, 8 + i * 40))} />
    {windows ? <TimelineWindows r={R.windows} cards={windows} starts={windows.map((_, i) => at(`w${i}`, dur))} />
      : d.note && <SoftCallout key={next ? 'next' : 'first'} r={R.note} start={next ? at('noteNext', dur) : at('note', dur - 56)}
        text={next ? d.note.next : d.note.t} tone={d.note.tone} icon={d.note.icon} />}
  </>;
};

const rowRects = (r: Rect, n: number) => splitRows(r.y, r.h, Array(n).fill(1), 24).map((y) => ({x: r.x, w: r.w, ...y}));

/** 逐项节拍（5.0 默认）：每行在其锚点词说出时入场；当前项高亮、前项变暗；卡片到位停稳；焦点仅改变颜色/亮度 */
const useRowBeats = (n: number, fb: (i: number) => number) => {
  const f = useCurrentFrame(); const at = useAt(); const a = React.useContext(AnchorCtx);
  const starts = Array.from({length: n}, (_, i) => at(`r${i}`, fb(i)));
  const act = anchoredIdx(f, n, 'r', a) ?? starts.reduce((k, st, i) => (f >= st ? i : k), 0);
  const sp = (st: number) => Math.min(1, spring({frame: Math.max(0, f - st), fps: 30, config: SPRING.soft}));
  const dim = (i: number) => (i < act ? sp(starts[i + 1] + 4) : 0);
  const nudge = (_i: number) => 0;
  const cam: React.CSSProperties = {}; // v6：关闭前景整体漂移与焦点推近
  return {starts, act, dim, nudge, cam};
};

const MediaRows: React.FC<{s: Shot; dur: number}> = ({s}) => {
  const d = s.data; const n = d.rows.length; const R = layoutRects('mediaRows', n); const rows = rowRects(R.rows, n);
  const B = useRowBeats(n, (i) => 14 + i * 40); const at = useAt();
  return <>
    <MediaFrame r={R.media} start={at('media', 20)} {...d.media} from="left" soft />
    <AbsoluteFill style={B.cam}>
    {d.rows.map((row: any, i: number) =>
      <IconRow key={i} r={rows[i]} start={B.starts[i]} activeAt={B.starts[i]} offAt={B.starts[i + 1]} dim={B.dim(i)} nudge={B.nudge(i)} idx={`0${i + 1}`} title={row.t} sub={row.s} subStart={at(`rsub${i}`, B.starts[i] - 8)} tip={row.k} active={i === B.act} />)}
    </AbsoluteFill>
  </>;
};

const QuoteStack: React.FC<{s: Shot; dur: number}> = ({s, dur}) => {
  const f = useCurrentFrame(); const d = s.data; const n = d.rows.length; const R = layoutRects('quoteStack', n); const rows = rowRects(R.rows, n);
  const at = useAt(); const B = useRowBeats(n, (i) => 16 + i * 40);
  const nl = String(d.quote).split('\n').length; const ns = d.sub ? String(d.sub).split(/(?<=，)/).length : 0;
  const lineAt = Array.from({length: nl}, (_, i) => at(`q${i}`, 4 + i * 10));
  const subAt = Array.from({length: ns}, (_, i) => at(`sub${i}`, 30 + i * 8));
  // 焦点交接：第一行卡片进来后，引文退后变暗
  const focus = Math.min(1, spring({frame: Math.max(0, f - B.starts[0]), fps: 30, config: SPRING.soft}));
  const warnAt = at('warn', dur - 56);
  const settle = Math.min(1, spring({frame: Math.max(0, f - warnAt), fps: 30, config: SPRING.soft}));
  return <>
    <QuoteBlock r={R.quote} start={lineAt[0]} text={d.quote} sub={d.sub} lineAt={lineAt} subAt={subAt} focus={focus * (1 - 0.5 * settle)} />
    <AbsoluteFill style={B.cam}>
    {d.rows.map((row: any, i: number) =>
      <IconRow key={i} r={rows[i]} start={B.starts[i]} activeAt={B.starts[i]} offAt={B.starts[i + 1]} dim={B.dim(i) * (1 - 0.6 * settle)} nudge={B.nudge(i)} idx={`0${i + 1}`} title={row.t} sub={row.s} subStart={at(`rsub${i}`, B.starts[i] - 8)} tip={row.k} active={i === B.act} />)}
    </AbsoluteFill>
    <SoftCallout r={R.warn} start={warnAt} text={d.warn} tone="coral" />
  </>;
};

const RingFeature: React.FC<{s: Shot}> = ({s}) => {
  const R = layoutRects('ringFeature'); const d = s.data; const ring = R.ring; const at = useAt();
  const size = Math.min(ring.w, ring.h);
  return <>
    <MediaFrame r={R.media} start={at('media', 20)} {...d.media} from="left" soft />
    <ProgressRing cx={ring.x + size / 2} cy={ring.y + ring.h / 2} size={size} start={at('ring', 18)} ratio={d.ring.ratio} label={d.ring.label} value={d.ring.value} />
    {d.ring.note && <div data-role="body" style={{position: 'absolute', left: ring.x + size + 48, top: ring.y, width: ring.w - size - 48, height: ring.h, display: 'flex', alignItems: 'center',
      fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body, lineHeight: 1.4, color: COLOR.sub, whiteSpace: 'pre-line'}}><GoldText text={d.ring.note} /></div>}
    <StatPill r={R.a} start={at('a', Math.max(28, at('ring', 18) + 10))} {...d.a} hi />
  </>;
};

const WaitVs: React.FC<{s: Shot}> = ({s}) => {
  const R = layoutRects('waitVs'); const d = s.data; const A = R.connArrow; const at = useAt(); const l0 = at('L', 26), r0 = at('R', Math.max(36, l0 + 8));
  return <>
    <MediaFrame r={R.mediaL} start={at('mediaL', l0 + 8)} {...d.L.media} from="left" soft />
    <MediaFrame r={R.mediaR} start={at('mediaR', Math.max(l0 + 30, r0 + 10))} {...d.R.media} from="right" soft />
    <HighlightBar x={R.numL.x} y={R.numL.y + 8} h={R.numL.h - 16} start={l0 - 2} />
    <BareNumber r={{...R.numL, x: R.numL.x + 40, w: R.numL.w - 40}} start={l0} value={d.L.value} unit={d.L.unit} label={d.L.label} gold={false} size={110}>
      {d.L.chip && <Chip start={l0 + 18} tone={d.L.chip.tone}>{d.L.chip.t}</Chip>}
    </BareNumber>
    <ArrowConnector x={A.x + 48} y={A.y + 16} w={A.w - 96} start={r0 - 2} />
    <BareNumber r={R.numR} start={r0} value={d.R.value} unit={d.R.unit} label={d.R.label} gold size={110}>
      {d.R.chip && <Chip start={r0 + 12} tone={d.R.chip.tone}>{d.R.chip.t}</Chip>}
    </BareNumber>
  </>;
};

const TriadSoft: React.FC<{s: Shot; dur: number}> = ({s, dur}) => {
  const d = s.data; const R = layoutRects('triadSoft'); const at = useAt();
  return <>
    {d.cols.map((c: any, i: number) => <StatPill key={i} r={R[`c${i}`]} start={at(`c${i}`, 8 + i * 8)} {...c} hi={i === 1} />)}
    <SoftCallout r={R.note} start={at('note', dur - 56)} text={d.note.t} />
  </>;
};

/** 片尾 outroHost（默认）/ outroAir：小滕卡通 + 片尾文案分层排版。
 *  屏幕文字只来自当期片尾文案；模板不自动加任何「点赞/关注/收藏/转发」类引导语，也没有按钮式 CTA。 */
const OUTRO_BAN = /点赞|关注|收藏|转发|三连|评论区|订阅/;
const clean = (t?: string) => (t && !OUTRO_BAN.test(t) ? t : undefined);
const OutroHost: React.FC<{s: Shot}> = ({s}) => {
  const f = useCurrentFrame(); const d = s.data; const ch: string | false = d.character === false ? false : (d.character ?? 'media/character/xiaoteng_outro.png');
  const R = layoutRects('outroAir', 0, {character: !!ch}); const t = R.text; const center = !ch;
  const {fps} = useVideoConfig();
  const pin = spring({frame: Math.max(0, f - 2), fps, config: SPRING.enter});
  const pinO = Math.min(1, Math.max(0, pin));
  const settle = Math.max(0, f - 28);
  const bob = Math.sin(settle / 22) * 6 * Math.min(1, settle / 20);
  const wave = Math.sin(settle / 9) * 1.6 * Math.min(1, settle / 15);
  const points: string[] = (d.points ?? []).map(clean).filter(Boolean).slice(0, 3);
  const note = clean(d.note);
  const at = useAt();
  const lineAt = at('line', 14);
  const pStart = lineAt + 20;
  const lineSp = spring({frame: Math.max(0, f - lineAt), fps, config: SPRING.enter});
  const lineO = Math.min(1, Math.max(0, lineSp));
  const eyeSp = spring({frame: Math.max(0, f - 10), fps, config: SPRING.soft});
  return <>
    {ch && <div style={{position: 'absolute', left: R.character.x, top: R.character.y, width: R.character.w, height: R.character.h, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: '8%', right: '8%', bottom: 18, height: 90, borderRadius: '50%', opacity: 0.85 * pinO,
        background: 'radial-gradient(ellipse at center, rgba(243,215,158,0.30), rgba(0,0,0,0.45) 45%, rgba(0,0,0,0) 72%)', filter: 'blur(10px)'}} />
      <div style={{position: 'absolute', inset: 0, opacity: pinO, transformOrigin: '50% 100%',
        transform: `translate(${(1 - pin) * -120}px, ${(1 - pin) * 60 + bob}px) rotate(${wave}deg) scale(${0.94 + 0.06 * Math.min(pin, 1.08)})`,
        WebkitMaskImage: 'linear-gradient(180deg,#000 82%,transparent 100%)', maskImage: 'linear-gradient(180deg,#000 82%,transparent 100%)'}}>
        <Img src={staticFile(ch)} style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', filter: 'drop-shadow(0 18px 40px rgba(0,0,0,0.45))'}} />
      </div>
    </div>}
    <div style={{position: 'absolute', left: t.x, top: t.y, width: t.w, height: t.h, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: center ? 'center' : 'flex-start', textAlign: center ? 'center' : 'left'}}>
      {d.eyebrow && <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.label, color: COLOR.goldHi, letterSpacing: 8, opacity: Math.min(1, Math.max(0, eyeSp)), transform: `translateY(${(1 - eyeSp) * 12}px)`}}>{d.eyebrow}</div>}
      <div style={{fontFamily: FONT.title, fontSize: 76, color: COLOR.warm, marginTop: 28, lineHeight: 1.3, whiteSpace: 'pre-line',
        textShadow: '0 4px 24px rgba(0,0,0,0.35)', opacity: lineO, transform: `translateY(${(1 - lineSp) * 28}px) scale(${0.96 + 0.04 * Math.min(lineSp, 1.1)})`}}><GoldText text={d.line} /></div>
      <div style={{position: 'relative', width: 240, height: 3, marginTop: 36}}><UnderlineDraw x={0} y={0} w={240} start={lineAt + 14} /></div>
      {points.length > 0 && <div style={{marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18, width: center ? undefined : '100%'}}>
        {points.map((p, i) => { const q = spring({frame: Math.max(0, f - at(`p${i}`, pStart + i * 7)), fps, config: SPRING.enter}); const qo = Math.min(1, Math.max(0, q)); return <div key={i} data-role="body" style={{display: 'flex', alignItems: 'center', gap: 20,
          padding: '16px 28px', borderRadius: 20, ...glassMat('dark'),
          opacity: qo, transform: `translateX(${(1 - q) * 48}px) scale(${0.96 + 0.04 * Math.min(q, 1.08)})`}}>
          <span style={{fontFamily: FONT.title, fontSize: 34, color: COLOR.goldHi, minWidth: 44}}>{String(i + 1).padStart(2, '0')}</span>
          <span style={{fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body + 2, color: COLOR.warm, lineHeight: 1.35}}><GoldText text={p} /></span>
        </div>; })}
      </div>}
      {note && <div data-role="body" style={{marginTop: 32, fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body, lineHeight: 1.4, color: COLOR.sub,
        opacity: Math.min(1, Math.max(0, spring({frame: Math.max(0, f - at('note', pStart + points.length * 7 + 6)), fps, config: SPRING.soft})))}}><GoldText text={note} /></div>}
      {d.account && <div style={{marginTop: 22, fontFamily: FONT.body, fontWeight: 500, fontSize: TYPE.label - 2, color: 'rgba(243,215,158,0.72)', letterSpacing: 4,
        opacity: Math.min(1, Math.max(0, spring({frame: Math.max(0, f - at('account', pStart + points.length * 7 + 14)), fps, config: SPRING.soft})))}}>{d.account}</div>}
    </div>
  </>;
};

/* ===== 5.0 数据版式 View：data 字段见 references/版式目录.md；锚点键 draw（开始画/长） ===== */
const dv = (name: any, C: any, fb = 16) => (({s}: {s: Shot}) => { const at = useAt(); return <C r={layoutRects(name).chart} start={at('draw', fb)} {...s.data} />; }) as React.FC<{s: Shot; dur: number}>;
const DATA_VIEWS = {
  lineReveal: dv('lineReveal', LineChartReveal, 20), barGlow: dv('barGlow', BarGlow, 18), rankBars: dv('rankBars', RankBars),
  waffle: dv('waffle', Waffle, 14), balance: dv('balance', Balance, 14), yearRing: dv('yearRing', YearRing, 12), formulaCalc: dv('formulaCalc', FormulaCalc, 14),
};
/* ===== 5.0 MG 卡片扩展 View：每项锚点 r0/r1…（说到该词入场），无锚点按 fb+i*gap 兜底；有 media 时右侧配图/视频 ===== */
const mv = (name: any, C: any, key: string, listKey: string, gap = 26) => (({s, dur}: {s: Shot; dur: number}) => {
  const at = useAt(); const R = layoutRects(name); const d = s.data; const n = (d[listKey] ?? []).length;
  const g = Math.min(gap, Math.max(12, (dur - 60) / Math.max(1, n)));
  const st = (i: number) => at(`r${i}`, 14 + i * g);
  return <>
    <C r={R[key]} st={st} {...d} />
    {R.media && d.media && <MediaFrame r={R.media} start={at('media', 20)} {...d.media} from="right" soft />}
  </>;
}) as React.FC<{s: Shot; dur: number}>;
const MG_VIEWS = {
  keywordCascade: mv('keywordCascade', KeywordCascade, 'cards', 'words'),
  checklistFill: mv('checklistFill', ChecklistFill, 'list', 'items'),
  vsScore: mv('vsScore', VsScore, 'board', 'rows', 30),
  tipStack: mv('tipStack', TipStack, 'stack', 'tips', 34),
  numberedReveal: mv('numberedReveal', NumberedReveal, 'cards', 'cards', 30),
  kpiGrid: mv('kpiGrid', KpiGrid, 'grid', 'kpis', 14),
};
/* ===== 5.0 房产科普 MG（已定 9 种，mgEstate.tsx）：锚点 r0/r1…；n = 节拍数；R 传整组矩形 ===== */
const ev = (name: any, C: any, beats: (d: any) => number, gap = 24, one?: string) => (({s, dur}: {s: Shot; dur: number}) => {
  const at = useAt(); const R = layoutRects(name); const d = s.data; const n = Math.max(1, beats(d));
  const g = Math.min(gap, Math.max(10, (dur - 70) / n)); const st = (i: number) => at(`r${i}`, 16 + i * g);
  return <C {...(one ? {r: R[one]} : {R})} st={st} {...d} />;
}) as React.FC<{s: Shot; dur: number}>;
const ESTATE_VIEWS = {
  floorLadder: ev('floorLadder', FloorLadder, (d) => d.floors.length, 18, 'ladder'),
  paymentSplit: ev('paymentSplit', PaymentSplit, (d) => d.parts.length, 18),
  amenityOrbit: ev('amenityOrbit', AmenityOrbit, (d) => d.tags.length, 10, 'orbit'),
  pitfallBoard: ev('pitfallBoard', PitfallBoard, (d) => d.items.length, 16),
  priceStep: ev('priceStep', PriceStep, (d) => d.steps.length, 20, 'steps'),
  decisionFork: ev('decisionFork', DecisionFork, () => 3, 20),
  districtTags: ev('districtTags', DistrictTags, (d) => d.tags.length, 7),
  loanDial: ev('loanDial', LoanDial, (d) => d.stats.length + 1, 14),
  layerReveal: ev('layerReveal', LayerReveal, (d) => d.layers.length, 18),
};
const VIEWS: Record<string, React.FC<{s: Shot; dur: number}>> = {
  ...ESTATE_VIEWS,
  ...MG_VIEWS,
  ...DATA_VIEWS,
  titleFloat: ({s}) => <TitleFloat s={s} />,
  bareNumber: ({s}) => <BareNumView s={s} />,
  splitVs: ({s}) => <SplitVs s={s} />,
  timeline: ({s, dur}) => <TimelineView s={s} dur={dur} />,
  mediaRows: ({s, dur}) => <MediaRows s={s} dur={dur} />,
  quoteStack: ({s, dur}) => <QuoteStack s={s} dur={dur} />,
  ringFeature: ({s}) => <RingFeature s={s} />,
  waitVs: ({s}) => <WaitVs s={s} />,
  triadSoft: ({s, dur}) => <TriadSoft s={s} dur={dur} />,
  outroAir: ({s}) => <OutroHost s={s} />,
  outroHost: ({s}) => <OutroHost s={s} />,
};

/** 栏目行：city 可选，填了才显示为前缀 */
export const kickerText = (s: Shot) => (s.kicker ? (s.city ? `${s.city} · ${s.kicker}` : s.kicker) : undefined);

/** 按版式选运镜方向：与内容逻辑一致（对比→横移、流程→轻横移、标题→推近、片尾→稳住） */
const camFor = (layout: string): {dirX: number; dirY: number; zoom: number} => {
  if (layout === 'splitVs' || layout === 'waitVs') return {dirX: 1, dirY: 0, zoom: 1};
  if (layout === 'timeline') return {dirX: 0.55, dirY: 0, zoom: 1};
  if (layout === 'mediaRows') return {dirX: -0.7, dirY: 0.15, zoom: 1};
  if (layout === 'quoteStack') return {dirX: 0.25, dirY: -0.35, zoom: 1.05};
  if (layout === 'titleFloat' || layout === 'bareNumber' || layout === 'ringFeature') return {dirX: 0, dirY: -0.25, zoom: 1.2};
  if (String(layout).startsWith('outro')) return {dirX: 0, dirY: 0, zoom: 0.55};
  return {dirX: 0.4, dirY: -0.15, zoom: 1};
};

export const ShotView: React.FC<{s: Shot; dur: number; exampleData?: boolean; anchors?: Record<string, number>}> = ({s, dur, exampleData, anchors = {}}) => {
  const f = useCurrentFrame();
  const View = VIEWS[s.layout];
  const kt = kickerText(s);
  const fx = (s as any).fx as number | undefined; // 可选：本期加强运镜 + 口播节拍动效
  const cam = {...camFor(s.layout), move: fx ?? 1};
  // v6：所有 MG 前景到位即停，背景自然运镜保留（含旧版式与 fx 路径）。
  const fgTX = 0, fgTY = 0, fgScale = 1;
  const body = <AbsoluteFill>
    <CamCtx.Provider value={cam}>
      <Backdrop src={s.bg.src} video={s.bg.video} blur={s.bg.blur} dark={s.bg.dark} trimStart={s.bg.trim} />
    </CamCtx.Provider>
    <AbsoluteFill style={{transform: `translate(${fgTX}px, ${fgTY}px) scale(${fgScale})`, transformOrigin: '50% 45%'}}>
      {kt && <Kicker text={kt} />}
      {exampleData && <ExampleMark />}
      {usesTitle(s.layout) && s.title && <Headline text={s.title} start={entranceAt(anchors.title, 2)} />}
      {View ? <View s={s} dur={dur} /> : null}
      {fx ? <Beats s={s} /> : null}
    </AbsoluteFill>
  </AbsoluteFill>;
  // 音画同步：不再提前 1 秒定格（会和口播错位），只在退场转场期间冻结前景
  const freezeAt = dur - 1;
  const check = !!(getInputProps() as any)?.check && f >= freezeAt;
  const zones: Record<string, Rect> = {...layoutRects(s.layout, s.data?.steps?.length ?? s.data?.rows?.length ?? 3, {character: !!s.data?.character, windows: !!s.data?.windows?.length}),
    _kicker: {x: 96, y: 56, w: 1240, h: 36}, _example: {x: 1400, y: 56, w: 232, h: 36}};
  if (usesTitle(s.layout)) zones._title = titleRect();
  return <>
    <AnchorCtx.Provider value={anchors}><LiveFrameCtx.Provider value={f}>{f >= freezeAt ? <Freeze frame={freezeAt}>{body}</Freeze> : body}</LiveFrameCtx.Provider></AnchorCtx.Provider>
    {check && <DomCheck id={s.id} zones={zones} />}
  </>;
};

/* ===== 可选（shot.fx）：口播节拍动效。beats = 说到某词时弹出的小标签/图标；无扫光/整体浮动 ===== */
type Beat = {k: string; t: string; x: number; y: number; tone?: 'gold' | 'green' | 'coral' | 'glass'; icon?: string};
const TONE: Record<string, [string, string]> = {gold: ['rgba(243,215,158,.34)', '#F3D79E'], green: ['rgba(141,184,154,.36)', '#BFE8CB'], coral: ['rgba(224,113,92,.36)', '#FFC2B4'], glass: ['rgba(255,255,255,.16)', '#FFFFFF']};
const Beats: React.FC<{s: Shot}> = ({s}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const a = React.useContext(AnchorCtx);
  const beats = ((s as any).beats ?? []) as Beat[];
  return <>{beats.map((b, i) => {
    const st = entranceAt(a[b.k], Infinity); if (f < st) return null;
    const p = spring({frame: f - st, fps, config: SPRING.snappy});
    const ring = Math.min(1, (f - st) / 22);
    const [bg, fg] = TONE[b.tone ?? 'glass'];
    const bob = 0;
    return <div key={i} style={{position: 'absolute', left: b.x, top: b.y + bob, transform: `translate(-50%,-50%) scale(${0.3 + 0.7 * p})`, opacity: Math.min(1, p * 1.8)}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 140, height: 140, marginLeft: -70, marginTop: -70, borderRadius: '50%', border: `3px solid ${fg}`, opacity: (1 - ring) * 0.8, transform: `scale(${0.4 + ring * 1.6})`}} />
      <div style={{display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap', padding: '12px 28px', borderRadius: 999, ...glassMat('dark', bg),
        fontFamily: FONT.body, fontWeight: 700, fontSize: 32, color: '#fff', textShadow: '0 2px 6px rgba(0,0,0,.4)'}}>
        {b.icon && <span style={{display: 'inline-flex', width: 40, height: 40, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: fg, color: '#1d1b19', fontSize: 26}}>{b.icon}</span>}
        {b.t}
      </div>
    </div>;
  })}</>;
};
