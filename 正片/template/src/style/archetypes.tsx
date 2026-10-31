import React from 'react';
import {AbsoluteFill, Freeze, Img, staticFile, useCurrentFrame, useVideoConfig, spring, getInputProps} from 'remotion';
import {bump, 
  ArrowConnector, Backdrop, BareNumber, CamCtx, Chip, ExampleMark, FloatLabel, GoldText, Headline, HighlightBar,
  IconRow, Kicker, MediaFrame, ProgressRing, QuoteBlock, SoftCallout, SplitType, StatPill, Timeline, UnderlineDraw, prog, glassMat,
  LiveFrameCtx,
} from './components';
import {layoutRects, titleRect, usesTitle} from './layouts.ts';
import {splitRows, type Rect} from './grid.ts';
import {COLOR, FONT, MOTION, SPRING, TYPE} from './tokens';
import type {Shot} from './types';
import {DomCheck} from './domcheck';
import {LineChartReveal, BarGlow} from './DataCharts';
import {RankBars, Waffle, Balance, YearRing, FormulaCalc} from './DataCharts2';

/** 口播锚点：shots.ts 里 anchors:{count:'30.6万'} → 该词说出时的帧（相对本镜）。元素提前 6 帧开始入场，正好在说到时到位 */
export const AnchorCtx = React.createContext<Record<string, number>>({});
/** 5.0 默认：图卡跟随口播——在左侧文字之后、说到图对应关键词（anchors.media）时才入场 */
const mediaAt = (at: (k: string, fb: number) => number, after: number) => Math.max(at('media', after), after);
const useAt = () => { const a = React.useContext(AnchorCtx); return (k: string, fb: number) => (a[k] != null ? Math.max(0, a[k] - 6) : fb); };


/** 有锚点 s0/s1…（或 r0/r1…）时，焦点随口播逐项移动 */
const anchoredIdx = (f: number, n: number, p: string, a: Record<string, number>) => {
  if (a[`${p}0`] == null) return null; let k = 0;
  for (let i = 0; i < n; i++) if (a[`${p}${i}`] != null && f >= a[`${p}${i}`] - 4) k = i;
  return k;
};
const focusIdx = (f: number, n: number, from: number, to: number) =>
  Math.min(n - 1, Math.max(0, Math.floor(((f - from) / Math.max(1, to - from)) * n)));

const TitleFloat: React.FC<{s: Shot}> = ({s}) => {
  const R = layoutRects('titleFloat'); const d = s.data;
  const titleBody = {...R.title, y: R.title.y + 80, h: R.title.h - 80};
  return <>
    <div style={{position: 'absolute', left: R.title.x, top: R.title.y, display: 'flex', gap: 20}}>
      {d.chips?.map((c: any, i: number) => <Chip key={i} start={8 + i * 5} tone={c.tone}>{c.t}</Chip>)}
    </div>
    <SplitType r={titleBody} start={4} line1={d.line1} line2={d.line2} sub={d.sub} />
    <MediaFrame r={R.media} start={mediaAt(useAt(), 34)} {...d.media} from="right" soft />
    <SoftCallout r={R.callout} start={32} text={d.callout} icon={d.icon ?? '▲'} />
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
        <div style={{paddingTop: 28, fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body, lineHeight: 1.4, color: COLOR.sub, opacity: prog(f, c0 + 22, 14)}} data-role="body">
          <GoldText text={d.formula} />
        </div>
      </div>
      <div style={{display: 'flex', gap: 24}}>{d.chips?.map((c: any, i: number) => <Chip key={i} start={c0 + 30 + i * 6} tone={c.tone}>{c.t}</Chip>)}</div>
    </div>
    <MediaFrame r={R.media} start={mediaAt(at, c0 + 26)} {...d.media} from="right" soft />
  </>;
};

const SplitVs: React.FC<{s: Shot}> = ({s}) => {
  const R = layoutRects('splitVs'); const d = s.data; const A = R.connArrow; const at = useAt(); const l0 = at('L', 28), r0 = Math.max(at('R', 36), l0 + 8);
  return <>
    <MediaFrame r={R.mediaL} start={l0 + 8} {...d.L.media} from="left" soft />
    <ArrowConnector x={A.x + 48} y={A.y + 18} w={A.w - 96} start={Math.max(l0 + 18, r0 - 16)} />
    <MediaFrame r={R.mediaR} start={Math.max(l0 + 30, r0)} {...d.R.media} from="right" soft />
    <BareNumber r={R.dataL} start={l0} value={d.L.value} unit={d.L.unit} dec={d.L.dec} label={d.L.label} gold={d.winner === 'L'} size={110}>
      {d.L.chip && <Chip start={l0 + 16} tone={d.L.chip.tone}>{d.L.chip.t}</Chip>}
    </BareNumber>
    <BareNumber r={R.dataR} start={r0} value={d.R.value} unit={d.R.unit} dec={d.R.dec} label={d.R.label} gold={d.winner === 'R'} size={110}>
      {d.R.chip && <Chip start={r0 + 12} tone={d.R.chip.tone}>{d.R.chip.t}</Chip>}
    </BareNumber>
  </>;
};

const TimelineView: React.FC<{s: Shot; dur: number}> = ({s, dur}) => {
  const f = useCurrentFrame(); const d = s.data; const R = layoutRects('timeline', d.steps.length);
  const at = useAt(); const act = anchoredIdx(f, d.steps.length, 's', React.useContext(AnchorCtx)) ?? focusIdx(f, d.steps.length, 24, dur - 60);
  return <>
    <Timeline r={R.steps} start={8} steps={d.steps} active={act} starts={d.steps.map((_: any, i: number) => at(`s${i}`, 8 + i * 40))} />
    <SoftCallout r={R.note} start={at('note', dur - 56)} text={d.note.t} tone={d.note.tone} icon={d.note.icon} />
  </>;
};

const rowRects = (r: Rect, n: number) => splitRows(r.y, r.h, Array(n).fill(1), 24).map((y) => ({x: r.x, w: r.w, ...y}));

/** 逐项节拍（5.0 默认）：每行在其锚点词说出时入场；当前项高亮、前项变暗；新卡落地时邻居让位；镜头随焦点微移 */
const useRowBeats = (n: number, fb: (i: number) => number) => {
  const f = useCurrentFrame(); const at = useAt(); const a = React.useContext(AnchorCtx);
  const starts = Array.from({length: n}, (_, i) => at(`r${i}`, fb(i)));
  const act = anchoredIdx(f, n, 'r', a) ?? starts.reduce((k, st, i) => (f >= st ? i : k), 0);
  const sp = (st: number) => Math.min(1, spring({frame: Math.max(0, f - st), fps: 30, config: SPRING.soft}));
  const dim = (i: number) => (i < act ? sp(starts[i + 1] + 4) : 0);
  const nudge = (i: number) => starts.reduce((acc, st, j) => (j === i ? acc : acc + (i < j ? -1 : 1) * (9 / Math.abs(i - j)) * bump(f - st - 6)), 0);
  // 镜头微移：每到新一拍向焦点行轻推 ~6px + 0.6% 推近
  const camK = starts.reduce((acc, st) => acc + sp(st), 0);
  const cam = {transform: `translateY(${-3 * camK + (act - (n - 1) / 2) * -4 * sp(starts[act])}px) scale(${1 + 0.003 * camK})`, transformOrigin: '60% 50%'};
  return {starts, act, dim, nudge, cam};
};

const MediaRows: React.FC<{s: Shot; dur: number}> = ({s}) => {
  const d = s.data; const n = d.rows.length; const R = layoutRects('mediaRows', n); const rows = rowRects(R.rows, n);
  const B = useRowBeats(n, (i) => 14 + i * 40); const at = useAt();
  return <>
    <MediaFrame r={R.media} start={mediaAt(at, 20)} {...d.media} from="left" soft />
    <AbsoluteFill style={B.cam}>
    {d.rows.map((row: any, i: number) =>
      <IconRow key={i} r={rows[i]} start={B.starts[i]} activeAt={B.starts[i]} offAt={B.starts[i + 1]} dim={B.dim(i)} nudge={B.nudge(i)} idx={`0${i + 1}`} title={row.t} sub={row.s} tip={row.k} active={i === B.act} />)}
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
      <IconRow key={i} r={rows[i]} start={B.starts[i]} activeAt={B.starts[i]} offAt={B.starts[i + 1]} dim={B.dim(i) * (1 - 0.6 * settle)} nudge={B.nudge(i)} idx={`0${i + 1}`} title={row.t} sub={row.s} tip={row.k} active={i === B.act} />)}
    </AbsoluteFill>
    <SoftCallout r={R.warn} start={warnAt} text={d.warn} tone="coral" />
  </>;
};

const RingFeature: React.FC<{s: Shot}> = ({s}) => {
  const R = layoutRects('ringFeature'); const d = s.data; const ring = R.ring; const at = useAt();
  const size = Math.min(ring.w, ring.h);
  return <>
    <MediaFrame r={R.media} start={mediaAt(at, 20)} {...d.media} from="left" soft />
    <ProgressRing cx={ring.x + size / 2} cy={ring.y + ring.h / 2} size={size} start={at('ring', 18)} ratio={d.ring.ratio} label={d.ring.label} value={d.ring.value} />
    {d.ring.note && <div data-role="body" style={{position: 'absolute', left: ring.x + size + 48, top: ring.y, width: ring.w - size - 48, height: ring.h, display: 'flex', alignItems: 'center',
      fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body, lineHeight: 1.4, color: COLOR.sub, whiteSpace: 'pre-line'}}><GoldText text={d.ring.note} /></div>}
    <StatPill r={R.a} start={Math.max(at('a', 28), at('ring', 18) + 10)} {...d.a} hi />
  </>;
};

const WaitVs: React.FC<{s: Shot}> = ({s}) => {
  const R = layoutRects('waitVs'); const d = s.data; const A = R.connArrow; const at = useAt(); const l0 = at('L', 26), r0 = Math.max(at('R', 36), l0 + 8);
  return <>
    <MediaFrame r={R.mediaL} start={l0 + 8} {...d.L.media} from="left" soft />
    <MediaFrame r={R.mediaR} start={Math.max(l0 + 30, r0 + 10)} {...d.R.media} from="right" soft />
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
  const pStart = 34;
  const lineSp = spring({frame: Math.max(0, f - 14), fps, config: SPRING.enter});
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
      <div style={{position: 'relative', width: 240, height: 3, marginTop: 36}}><UnderlineDraw x={0} y={0} w={240} start={28} /></div>
      {points.length > 0 && <div style={{marginTop: 36, display: 'flex', flexDirection: 'column', gap: 18, width: center ? undefined : '100%'}}>
        {points.map((p, i) => { const q = spring({frame: Math.max(0, f - (pStart + i * 7)), fps, config: SPRING.enter}); const qo = Math.min(1, Math.max(0, q)); return <div key={i} data-role="body" style={{display: 'flex', alignItems: 'center', gap: 20,
          padding: '16px 28px', borderRadius: 20, ...glassMat('dark'),
          opacity: qo, transform: `translateX(${(1 - q) * 48}px) scale(${0.96 + 0.04 * Math.min(q, 1.08)})`}}>
          <span style={{fontFamily: FONT.title, fontSize: 34, color: COLOR.goldHi, minWidth: 44}}>{String(i + 1).padStart(2, '0')}</span>
          <span style={{fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body + 2, color: COLOR.warm, lineHeight: 1.35}}><GoldText text={p} /></span>
        </div>; })}
      </div>}
      {note && <div data-role="body" style={{marginTop: 32, fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body, lineHeight: 1.4, color: COLOR.sub,
        opacity: Math.min(1, Math.max(0, spring({frame: Math.max(0, f - (pStart + points.length * 7 + 6)), fps, config: SPRING.soft})))}}><GoldText text={note} /></div>}
      {d.account && <div style={{marginTop: 22, fontFamily: FONT.body, fontWeight: 500, fontSize: TYPE.label - 2, color: 'rgba(243,215,158,0.72)', letterSpacing: 4,
        opacity: Math.min(1, Math.max(0, spring({frame: Math.max(0, f - (pStart + points.length * 7 + 14)), fps, config: SPRING.soft})))}}>{d.account}</div>}
    </div>
  </>;
};

/* ===== 5.0 数据版式 View：data 字段见 references/版式目录.md；锚点键 draw（开始画/长） ===== */
const dv = (name: any, C: any, fb = 16) => (({s}: {s: Shot}) => { const at = useAt(); return <C r={layoutRects(name).chart} start={at('draw', fb)} {...s.data} />; }) as React.FC<{s: Shot; dur: number}>;
const DATA_VIEWS = {
  lineReveal: dv('lineReveal', LineChartReveal, 20), barGlow: dv('barGlow', BarGlow, 18), rankBars: dv('rankBars', RankBars),
  waffle: dv('waffle', Waffle, 14), balance: dv('balance', Balance, 14), yearRing: dv('yearRing', YearRing, 12), formulaCalc: dv('formulaCalc', FormulaCalc, 14),
};
const VIEWS: Record<string, React.FC<{s: Shot; dur: number}>> = {
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
  const cam = camFor(s.layout);
  // 前景相对背景更快一点的同向漂移（视差），只在镜头前段建立空间感
  const fgT = Math.min(1, f / Math.max(1, dur * 0.85));
  const fgTX = cam.dirX * fgT * 10;
  const fgTY = cam.dirY * fgT * 6;
  const fgScale = 1 + fgT * 0.012 * cam.zoom;
  const body = <AbsoluteFill>
    <CamCtx.Provider value={cam}>
      <Backdrop src={s.bg.src} video={s.bg.video} blur={s.bg.blur} dark={s.bg.dark} trimStart={s.bg.trim} />
    </CamCtx.Provider>
    <AbsoluteFill style={{transform: `translate(${fgTX}px, ${fgTY}px) scale(${fgScale})`, transformOrigin: '50% 45%'}}>
      {kt && <Kicker text={kt} />}
      {exampleData && <ExampleMark />}
      {usesTitle(s.layout) && s.title && <Headline text={s.title} />}
      {View ? <View s={s} dur={dur} /> : null}
    </AbsoluteFill>
  </AbsoluteFill>;
  // 音画同步：不再提前 1 秒定格（会和口播错位），只在退场转场期间冻结前景
  const freezeAt = dur - 1;
  const check = !!(getInputProps() as any)?.check && f >= freezeAt;
  const zones: Record<string, Rect> = {...layoutRects(s.layout, s.data?.steps?.length ?? s.data?.rows?.length ?? 3, {character: !!s.data?.character}),
    _kicker: {x: 96, y: 56, w: 1240, h: 36}, _example: {x: 1400, y: 56, w: 232, h: 36}};
  if (usesTitle(s.layout)) zones._title = titleRect();
  return <>
    <AnchorCtx.Provider value={anchors}><LiveFrameCtx.Provider value={f}>{f >= freezeAt ? <Freeze frame={freezeAt}>{body}</Freeze> : body}</LiveFrameCtx.Provider></AnchorCtx.Provider>
    {check && <DomCheck id={s.id} zones={zones} />}
  </>;
};
