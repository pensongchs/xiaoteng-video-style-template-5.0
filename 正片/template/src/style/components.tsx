import React from 'react';
import {AbsoluteFill, Easing, Freeze, interpolateColors, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {Rect} from './grid.ts';
import {COLOR, FONT, FROST, GLASS, glassEnter, steadySpring as spring, MIN_FONT, MOTION, RADIUS, SPRING, TYPE} from './tokens';

/** 暖雾磨砂入口。模糊只在这层，不作用到背景视频。旧 light/edge 接口仍可用。 */
const softTint = (tint?: string) => tint?.replace(/rgba\(([^,]+),([^,]+),([^,]+),\s*([\d.]+)\)/g,
  (_, r, g, b, a) => `rgba(${r},${g},${b},${Math.min(0.10, Number(a))})`);
export const glassMat = (_mode: 'dark' | 'light' = 'dark', tint?: string, _edge?: string, soft = false): React.CSSProperties => ({
  color: FROST.ink, textShadow: FROST.textShadow,
  background: `${FROST.grain}, ${FROST.surfaceHighlight}, linear-gradient(165deg, ${softTint(tint) ?? FROST.tint.none}, rgba(0,0,0,0) 72%), ${soft ? FROST.fillSoft : FROST.fill}`,
  backgroundSize: '64px 64px, auto, auto, auto',
  backdropFilter: FROST.blur, WebkitBackdropFilter: FROST.blur,
  border: `1.6px solid ${FROST.hair}`,
  boxShadow: `inset 0 1.5px 0 ${FROST.top}, inset 0 -12px 18px ${FROST.bottom}, 0 0 0 1px ${FROST.rim}, 0 0 0 1px ${FROST.mist}, ${FROST.shadow}`,
});
/** 兼容旧 useLiquid，现为单调入场；不拉伸、不压扁。 */
export const useLiquid = (start: number, config: typeof SPRING.enter = SPRING.enter) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return {p: spring({frame: f - start, fps, config}), sx: 1, sy: 1};
};
/** 兼容 API：新定版关闭邻居让位与到位后反弹。 */
export const bump = (_t: number) => 0;
/** 兼容 API：新定版没有移动扫光条；面光已固定在 glassMat 内。 */
export const Sheen: React.FC<{at: number; dur?: number; strength?: number}> = () => null;

export const Fonts: React.FC = () => (
  <style>{`
    @font-face{font-family:'PuHui';src:url('${staticFile('fonts/AlibabaPuHuiTi-Black.woff2')}') format('woff2');font-weight:900}
    @font-face{font-family:'Health';src:url('${staticFile('fonts/AlibabaHealthFont2.0CN-85B.ttf')}') format('truetype');font-weight:700}
    @font-face{font-family:'Health';src:url('${staticFile('fonts/AlibabaHealthFont2.0CN-45R.ttf')}') format('truetype');font-weight:400}
    .txs,.txs *{text-shadow:0 0 12px rgba(120,72,32,0.45),0 1px 2px rgba(70,42,18,0.35)}
    .tx2,.tx2 *{-webkit-text-stroke:4px rgba(110,68,32,0.42);paint-order:stroke fill;text-shadow:0 0 12px rgba(120,72,32,0.55),0 0 28px rgba(120,72,32,0.35)}
    .txs .gt,.tx2 .gt{text-shadow:none;-webkit-text-stroke:0;filter:drop-shadow(0 2px 4px rgba(60,36,12,0.55))}
    @font-face{font-family:'ArialB';src:local('Arial Bold'),local('Arial-BoldMT'),url('${staticFile('fonts/Style40-Arial-Bold.ttf')}') format('truetype');font-weight:700}
  `}</style>
);

/** 线性 0→1（兼容旧调用：进度条、计数插值等） */
export const prog = (f: number, start: number, dur: number = MOTION.enter) =>
  interpolate(f, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const ease = (p: number) => 1 - Math.pow(1 - p, 3);

/** 旧 hook 名兼容；现在使用16/20/12帧有限时长单调入场。 */
export const useSpringP = (start: number, config: typeof SPRING.enter = SPRING.enter) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return spring({frame: Math.max(0, f - start), fps, config});
};

export type Tone = 'dark' | 'pearl' | 'gold' | 'coral' | 'ghost';
export type Enter = 'up' | 'left' | 'right' | 'scale' | 'fade' | 'blur' | 'none';

/** 单调入场，进度钳制0–1，到位后固定。 */
const enterStyle = (from: Enter, p: number): React.CSSProperties => {
  const o = Math.min(1, Math.max(0, p));
  const t = o; // 禁止过冲
  const sh = MOTION.maxShift;
  switch (from) {
    case 'up': return {opacity: o, transform: `translateY(${(1 - t) * sh}px) scale(${0.96 + 0.04 * Math.min(t, 1.15)})`};
    case 'left': return {opacity: o, transform: `translateX(${(1 - t) * -sh}px) scale(${0.97 + 0.03 * Math.min(t, 1.12)})`};
    case 'right': return {opacity: o, transform: `translateX(${(1 - t) * sh}px) scale(${0.97 + 0.03 * Math.min(t, 1.12)})`};
    case 'scale': return {opacity: o, transform: `scale(${0.97 + 0.03 * t})`};
    case 'blur': return {opacity: o, filter: `blur(${Math.max(0, (1 - Math.min(t, 1)) * 8)}px)`, transform: `translateY(${(1 - t) * 16}px) scale(${0.97 + 0.03 * Math.min(t, 1.1)})`};
    case 'fade': return {opacity: o, transform: `scale(${0.985 + 0.015 * Math.min(t, 1.08)})`};
    default: return {opacity: 1};
  }
};

const toneBg: Record<Tone, React.CSSProperties> = {
  dark: glassMat(), pearl: glassMat('light'),
  gold: glassMat('dark', FROST.tint.gold), coral: glassMat('dark', FROST.tint.coral),
  ghost: glassMat('dark', undefined, undefined, true),
};

/** 玻璃卡（少用；全屏不要堆满） */
export const GlassCard: React.FC<{r: Rect; start: number; tone?: Tone; from?: Enter; dim?: number; radius?: number; pad?: number | string; children: React.ReactNode; style?: React.CSSProperties}> =
({r, start, tone = 'dark', from = 'up', dim = 1, radius = RADIUS.card, pad = 36, children, style}) => {
  const p = useSpringP(start, SPRING.enter);
  return <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: radius, padding: pad, boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
    opacity: dim, ...toneBg[tone], ...enterStyle(from, p), ...style}}>{children}</div>;
};

/** 真实帧上下文：镜头末尾定格时，前景冻结，但视频（背景/媒体框）继续播放，避免「顿一下」 */
export const LiveFrameCtx = React.createContext<number | null>(null);
/** 素材比镜头短时的慢放倍率（0.75–1），由 Demo 按镜头时长与素材时长计算 */
export const ClipRateCtx = React.createContext<Record<string, number>>({});
export const LiveVideo: React.FC<{src: string; style: React.CSSProperties; trimStart?: number}> = ({src, style, trimStart = 0}) => {
  const live = React.useContext(LiveFrameCtx); const rate = React.useContext(ClipRateCtx)[src] ?? 1;
  const v = <OffthreadVideo src={staticFile(src)} style={style} muted playbackRate={rate} startFrom={Math.round(trimStart * 30)} />;
  return live == null ? v : <Freeze frame={live}>{v}</Freeze>;
};

/** 媒体框：描边在内侧 */
export const MediaFrame: React.FC<{r: Rect; start: number; src: string; video?: boolean; label?: string; tag?: string; trimStart?: number; from?: Enter; fit?: 'cover' | 'contain'; soft?: boolean}> =
({r, start, src, video, label, tag, trimStart = 0, from = 'scale', fit = 'cover', soft}) => {
  const p = useSpringP(start, SPRING.enter); const B = soft ? 0 : 8;
  return <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: RADIUS.frame, overflow: 'hidden',
    border: soft ? 'none' : '1px solid rgba(255,255,255,0.22)', boxShadow: soft ? '0 20px 50px rgba(0,0,0,0.4)' : 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 18px 40px rgba(0,0,0,0.4)',
    ...enterStyle(from, p)}}>
    <div style={{position: 'absolute', inset: B, borderRadius: RADIUS.frame - 4, overflow: 'hidden'}}>
      {video
        ? <LiveVideo src={src} style={{width: '100%', height: '100%', objectFit: fit}} trimStart={trimStart} />
        : <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: fit}} />}
    </div>
    {tag && <div data-fit="tag" style={{position: 'absolute', top: 20, right: 20, padding: '8px 30px', borderRadius: 999, fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.chip,
      ...glassMat('dark', FROST.tint.gold), color: FROST.gold}}>{tag}</div>}
    {label && <div style={{position: 'absolute', left: 24, bottom: 22, display: 'flex', alignItems: 'center', gap: 12}}>
      <div style={{width: 4, height: 28, background: COLOR.goldHi, borderRadius: 2}} />
      <span style={{fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.label, color: COLOR.warm, textShadow: '0 2px 8px rgba(0,0,0,0.6)'}}>{label}</span>
    </div>}
  </div>;
};

export type ChipTone = 'gold' | 'glass' | 'coral' | 'green';
export const Chip: React.FC<{children: React.ReactNode; start: number; tone?: ChipTone; size?: number; hi?: number}> = ({children, start, tone = 'glass', size = TYPE.chip, hi}) => {
  const p = useSpringP(start, SPRING.snappy);
  const o = Math.min(1, Math.max(0, p));
  const st: Record<ChipTone, React.CSSProperties> = {
    gold: {...glassMat('dark', FROST.tint.gold), color: FROST.ink},
    glass: {...glassMat('dark'), color: FROST.ink, textShadow: 'none'},
    coral: {...glassMat('dark', 'rgba(224,113,92,0.42)', 'rgba(240,150,130,0.6)'), color: FROST.ink, textShadow: 'none'},
    green: {...glassMat('dark', 'rgba(141,184,154,0.40)', 'rgba(170,210,182,0.6)'), color: FROST.ink, textShadow: 'none'},
  };
  return <div data-fit="chip" style={{display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', flexShrink: 0, whiteSpace: 'nowrap', padding: `${Math.round(size * 0.42)}px ${Math.round(size * 1.3)}px`, borderRadius: 999,
    fontFamily: FONT.body, fontWeight: 700, fontSize: size, opacity: o, transform: `translateY(${(1 - p) * 10}px) scale(${0.97 + 0.03 * Math.min(p, 1)})`,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 18px rgba(0,0,0,0.3)', ...st[tone],
    ...(hi != null ? {position: 'relative', overflow: 'hidden', color: interpolateColors(hi, [0, 1], [FROST.ink, FROST.ink]), textShadow: 'none'} : {})}}>
    {hi != null && hi > 0.001 && <div style={{position: 'absolute', inset: 0, borderRadius: 999, opacity: hi, background: FROST.tint.gold}} />}
    {hi != null ? <span style={{position: 'relative'}}>{children}</span> : children}</div>;
};

export const Badge: React.FC<{children: React.ReactNode; size?: number; active?: boolean}> = ({children, size = 72, active = true}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.3, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: FONT.num, fontSize: size * 0.38, color: active ? '#2a2012' : COLOR.warm,
    background: active ? 'radial-gradient(circle at 30% 25%, #FBE6BC, #D9B26F 55%, #9C7536)' : 'rgba(255,255,255,0.12)',
    boxShadow: active ? '0 0 22px rgba(217,178,111,0.55)' : 'none'}}>{children}</div>
);

export const Kicker: React.FC<{text: string; plate?: boolean}> = ({text, plate}) => {
  const p = useSpringP(0, SPRING.soft); const o = Math.min(1, Math.max(0, p));
  return <div className="tx2" style={{position: 'absolute', left: 96, top: 56, height: 36, display: 'flex', alignItems: 'center', gap: 14, opacity: o, transform: `translateX(${(1 - p) * -16}px)`}}>
    {plate && <div style={{position: 'absolute', left: -12, right: 80, top: -4, bottom: -4, borderRadius: 10, zIndex: -1,
      background: 'linear-gradient(90deg, rgba(255,248,236,0.46), rgba(255,248,236,0.12) 72%, rgba(255,248,236,0))', backdropFilter: 'blur(8px)'}} />}
    <div style={{width: 28 * o, height: 2, background: COLOR.goldHi}} />
    <span style={{fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.kicker, color: '#FFF8EC', letterSpacing: 2}}>{text}</span>
  </div>;
};

export const GoldText: React.FC<{text: string}> = ({text}) => <>{text.split(/(\{[^}]+\})/).map((s, i) =>
  s.startsWith('{') ? <span key={i} className="gt" style={{background: 'linear-gradient(180deg,#FBE6BC,#D9B26F 60%,#B48843)', WebkitBackgroundClip: 'text', color: 'transparent'}}>{s.slice(1, -1)}</span> : <span key={i}>{s}</span>)}</>;

export const Headline: React.FC<{text: string; start?: number; plate?: boolean}> = ({text, start = 2, plate}) => {
  const p = useSpringP(start, SPRING.enter); const o = Math.min(1, Math.max(0, p));
  return <div className="tx2" style={{position: 'absolute', left: 96, top: 100, width: 1536, height: 100, display: 'flex', alignItems: 'center', opacity: o, transform: `translateY(${(1 - p) * 22}px) scale(${0.97 + 0.03 * Math.min(p, 1)})`}}>
    <div style={{position: 'absolute', left: -16, right: '8%', top: 8, bottom: 8, borderRadius: 16, zIndex: -1, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 12% 50%, rgba(120,72,32,0.16), rgba(120,72,32,0) 68%)'}} />
    {plate && <div style={{position: 'absolute', left: -8, right: '6%', top: 6, bottom: 6, borderRadius: 14, zIndex: -1,
      background: 'linear-gradient(90deg, rgba(255,248,236,0.50), rgba(255,248,236,0.16) 70%, rgba(255,248,236,0))', backdropFilter: 'blur(10px)'}} />}
    <div style={{fontFamily: FONT.title, fontSize: TYPE.title, color: '#FFF8EC', lineHeight: 1.15, whiteSpace: 'pre-line'}}><GoldText text={text} /></div>
  </div>;
};

export const Count: React.FC<{to: number; start: number; dec?: number; sep?: boolean}> = ({to, start, dec = 0, sep}) => {
  const f = useCurrentFrame(); const p = prog(f, start, MOTION.count); const v = to * ease(p);
  const raw = dec > 0 ? v.toFixed(dec) : Math.round(v).toString();
  const shown = sep ? raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : raw;
  return <>{shown}</>;
};

export const Bar: React.FC<{ratio: number; start: number; hi?: boolean}> = ({ratio, start, hi}) => {
  const f = useCurrentFrame(); const p = prog(f, start, 22);
  return <div style={{height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginTop: 12}}>
    <div style={{height: '100%', width: `${ratio * 100 * ease(p)}%`, borderRadius: 3, background: hi ? 'linear-gradient(90deg,#F3D79E,#C99A52)' : 'rgba(255,255,255,0.45)'}} />
  </div>;
};

export const ExampleMark: React.FC = () => (
  <div style={{position: 'absolute', left: 1400, top: 56, width: 232, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    fontFamily: FONT.body, fontSize: MIN_FONT.any, color: 'rgba(244,238,228,0.45)'}}>* 数据为示例</div>
);

/** 背景：整体提亮（亮度 ×1.1、压暗降约 0.15），文字可读性靠左上/底部的渐变压暗而非整屏压黑 */
/** 背景保持清晰。blur 只为兼容旧数据，不再作用到画面；5.0 仍比 4.5 提亮一档。 */
/** 镜头内运镜方向：由 ShotView 注入，背景视差慢于前景 */
export const CamCtx = React.createContext<{dirX: number; dirY: number; zoom: number; move?: number}>({dirX: 1, dirY: 0, zoom: 1});

export const Backdrop: React.FC<{src: string; video?: boolean; blur?: number; dark?: number; trimStart?: number}> = ({src, video, blur: _blur = 0, dark = 0.45, trimStart = 0}) => {
  // 5.0：比 4.5 提亮一档（4.5 为 brightness 1.1 / max(0.22, dark−0.16) / 上下渐变）
  const k = Math.max(0.13, dark - 0.26);
  // 镜头内缓慢运镜（视频+静图）：轻推近 + 沿 CamCtx 方向漂移，制造空间感
  const cur = useCurrentFrame(); const live = React.useContext(LiveFrameCtx) ?? cur;
  const cam = React.useContext(CamCtx);
  const t = live / 30; // 秒
  const mv = cam.move ?? 1; // 可选：本期加强运镜（默认 1 = 定版行为）
  const scale = 1.04 + t * 0.008 * cam.zoom * mv; // ~0.8%/s 推近
  const tx = cam.dirX * t * 6 * mv + (mv > 1 ? Math.sin(t * 0.55) * 10 : 0);  // 约 6px/s
  const ty = cam.dirY * t * 4 * mv + (mv > 1 ? Math.cos(t * 0.42) * 6 : 0);
  const filter = 'brightness(1.2) saturate(1.06)';
  const mediaStyle: React.CSSProperties = {width: '100%', height: '100%', objectFit: 'cover', filter, transform: `scale(${scale}) translate(${tx}px, ${ty}px)`, transformOrigin: '50% 45%'};
  return <AbsoluteFill>
    {video
      ? <LiveVideo src={src} style={mediaStyle} trimStart={trimStart} />
      : <Img src={staticFile(src)} style={mediaStyle} />}
    <AbsoluteFill style={{background: `rgba(12,11,10,${k})`}} />
    {/* 5.0：渐变只留文字一侧（左上标题区）和底部字幕区，中部通透 */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 42% at 18% 10%, rgba(12,11,10,0.42) 0%, rgba(12,11,10,0) 100%)'}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(12,11,10,0) 74%, rgba(12,11,10,0.36) 100%)'}} />
  </AbsoluteFill>;
};

/* ========== 新增 MG 元素（不全是卡片） ========== */

/** 下划线描画 */
export const UnderlineDraw: React.FC<{x: number; y: number; w: number; start: number; color?: string}> = ({x, y, w, start, color = COLOR.goldHi}) => {
  const f = useCurrentFrame(); const p = prog(f, start, 18);
  return <div style={{position: 'absolute', left: x, top: y, width: w * ease(p), height: 3, borderRadius: 2, background: `linear-gradient(90deg,${color},rgba(217,178,111,0))`}} />;
};

/** 无卡底的大数字 */
export const BareNumber: React.FC<{r: Rect; start: number; value: number; unit: string; dec?: number; sep?: boolean; label?: string; gold?: boolean; from?: Enter; size?: number; children?: React.ReactNode; flow?: boolean}> =
({r, start, value, unit, dec, sep, label, gold = true, from = 'up', size, children, flow}) => {
  const fs = size ?? Math.min(TYPE.number, Math.round(r.h * 0.42));
  const p = useSpringP(start, SPRING.enter);
  const pos: React.CSSProperties = flow ? {position: 'relative'} : {position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h};
  return <div style={{...pos, display: 'flex', flexDirection: 'column', justifyContent: 'center', ...enterStyle(from, p)}}>
    {label && <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body, color: COLOR.sub, marginBottom: 16}}>{label}</div>}
    <div style={{fontFamily: FONT.num, fontSize: fs, lineHeight: 1.05, whiteSpace: 'nowrap',
      ...(gold ? {background: 'linear-gradient(180deg,#FBE6BC,#D9B26F 55%,#9C7536)', WebkitBackgroundClip: 'text', color: 'transparent'} : {color: COLOR.warm})}}>
      <Count to={value} start={start + 4} dec={dec} sep={sep} />
      <span style={{fontFamily: FONT.title, fontSize: Math.max(TYPE.body, Math.round(fs * 0.36)), marginLeft: 14, color: gold ? COLOR.goldHi : COLOR.warm}}>{unit}</span>
    </div>
    {children && <div style={{marginTop: 32, display: 'flex', gap: 20}}>{children}</div>}
  </div>;
};

/** 浮动标签（轻量，无大卡） */
export const FloatLabel: React.FC<{r: Rect; start: number; text: string; tone?: ChipTone | 'plain'; from?: Enter}> = ({r, start, text, tone = 'glass', from = 'fade'}) => {
  const f = useCurrentFrame(); const p = prog(f, start, MOTION.chip);
  const bob = 0; // v6：标签到位即停
  if (tone === 'plain') return <div style={{position: 'absolute', left: r.x, top: r.y + bob, width: r.w, height: r.h, display: 'flex', alignItems: 'center',
    fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body, color: COLOR.warm, ...enterStyle(from, p)}}>{text}</div>;
  return <div style={{position: 'absolute', left: r.x, top: r.y + bob * 0.4, ...enterStyle(from, p)}}><Chip start={start} tone={tone as ChipTone}>{text}</Chip></div>;
};

/** 时间轴节点 */
export const Timeline: React.FC<{r: Rect; start: number; steps: {t: string; s: string; chip?: string}[]; active: number; starts?: number[]}> = ({r, start, steps, active, starts}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig(); const n = steps.length; const gap = 48;
  const cw = (r.w - gap * (n - 1)) / n;
  return <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h}}>
    {/* 连接线 */}
    <div style={{position: 'absolute', left: cw / 2, right: cw / 2, top: 36, height: 2, background: 'rgba(255,255,255,0.15)'}}>
      <div style={{height: '100%', width: `${Math.min(1, Math.max(0, (active + prog(f, start + 20, 40)) / (n - 1))) * 100}%`, background: 'linear-gradient(90deg,#D9B26F,#F3D79E)', transition: 'width 0.3s'}} />
    </div>
    {steps.map((st, i) => {
      const st0 = starts?.[i] ?? start + i * MOTION.stagger;
      const sp = glassEnter(f, st0);
      const o = Math.min(1, Math.max(0, sp)); const on = i === active; const done = i < active;
      const hs = (x?: number) => (x == null ? 0 : spring({frame: Math.max(0, f - x), fps, config: SPRING.snappy}));
      const hi = starts ? Math.max(0, Math.min(1, hs(starts[i]) - hs(starts[i + 1]))) : (on ? 1 : 0);
      const dn = starts ? Math.min(1, hs(starts[i + 1])) : (done ? 1 : 0);
      const x = i * (cw + gap);
      return <div key={i} style={{position: 'absolute', left: x, top: 0, width: cw, height: r.h, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: o * (1 - 0.28 * dn),
        transform: `translateY(${(1 - sp) * 28}px) scale(${0.97 + 0.03 * sp})`, transformOrigin: '50% 100%'}}>
        <div style={{width: 28, height: 28, borderRadius: 14, marginTop: 22, background: hi + dn > 0.5 ? 'radial-gradient(circle at 30% 25%,#FBE6BC,#D9B26F)' : 'rgba(255,255,255,0.2)',
          boxShadow: `0 0 22px rgba(217,178,111,${0.7 * hi})`, border: `2px solid rgba(255,255,255,${hi})`}} />
        <div style={{position: 'relative', marginTop: 24, padding: '20px 26px 24px', borderRadius: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', boxSizing: 'border-box',
          ...glassMat('dark')}}>
        <div data-deco style={{position: 'absolute', inset: 0, borderRadius: 24, pointerEvents: 'none', opacity: hi, background: 'linear-gradient(165deg, rgba(159,123,61,0.10), rgba(0,0,0,0) 140%)', boxShadow: 'none'}} />
        <div style={{fontFamily: FONT.title, position: 'relative', fontSize: 40, lineHeight: 1.3, color: interpolateColors(hi, [0, 1], [COLOR.warm, COLOR.goldHi]), textAlign: 'center'}}>{st.t}</div>
        {st.s && <div data-role="body" style={{position: 'relative', marginTop: 14, fontFamily: FONT.body, fontSize: TYPE.body, color: COLOR.sub, textAlign: 'center', lineHeight: 1.4}}>{st.s}</div>}
        {st.chip && <div style={{position: 'relative', marginTop: 22}}><Chip start={(starts?.[i] ?? start + i * 6) + 10} tone="glass" hi={hi}>{st.chip}</Chip></div>}
        <div style={{position: 'absolute', inset: 0, borderRadius: 24, overflow: 'hidden', pointerEvents: 'none'}}><Sheen at={st0 + 6} />{on && starts && <Sheen at={st0 + 8} strength={0.26} />}</div>
        </div>
      </div>;
    })}
  </div>;
};

/** 图标+文字细行 */
export const IconRow: React.FC<{r: Rect; start: number; idx: string; title: string; sub: string; tip?: string; active?: boolean; from?: Enter; glass?: boolean;
  activeAt?: number; offAt?: number; dim?: number; nudge?: number; subStart?: number}> =
({r, start, idx, title, sub, tip, active, from = 'right', glass = true, activeAt, offAt, dim = 0, nudge = 0, subStart}) => {
  const f = useCurrentFrame(); const L = useLiquid(start, SPRING.enter); const p = L.p; const g = glass ? 7 : 0;
  // 焦点只改变色光/文字亮度，不再放大或移动卡片
  const aAt = activeAt ?? start;
  const hi = activeAt == null ? (active ? 1 : 0) : Math.max(0, Math.min(1, useSpringPOnce(f, aAt) - (offAt != null ? useSpringPOnce(f, offAt) : 0)));
  
  const es = enterStyle(from, p);
  return <div style={{position: 'absolute', left: r.x, top: r.y + g, width: r.w, height: r.h - g * 2, display: 'flex', alignItems: 'center', gap: 32, padding: glass ? '0 28px' : '0 24px', boxSizing: 'border-box',
    ...(glass ? {...glassMat('dark'), borderRadius: 22, overflow: 'hidden'} : {borderBottom: '1px solid rgba(255,255,255,0.12)'}),
    opacity: ((es.opacity as number) ?? 1) * (1 - 0.30 * dim),
    transform: es.transform, transformOrigin: '50% 50%'}}>
    {glass && <div data-deco style={{position: 'absolute', inset: 0, borderRadius: 22, pointerEvents: 'none', opacity: hi,
      background: 'linear-gradient(165deg, rgba(159,123,61,0.10), rgba(0,0,0,0) 140%)', boxShadow: 'none'}} />}
    <div style={{position: 'relative', fontFamily: FONT.num, fontSize: 40, color: interpolateColors(hi, [0, 1], ['rgba(244,238,228,0.62)', COLOR.goldHi]), width: 64, flexShrink: 0}}>{idx}</div>
    <div style={{position: 'relative', flex: 1, minWidth: 0}}>
      <div style={{fontFamily: FONT.title, fontSize: TYPE.rowTitle, lineHeight: 1.3, color: interpolateColors(hi, [0, 1], [COLOR.warm, COLOR.goldHi])}}>{title}</div>
      <div data-role="body" style={{fontFamily: FONT.body, fontSize: TYPE.body, lineHeight: 1.35, color: COLOR.sub, marginTop: 6, opacity: subStart == null ? 1 : ease(prog(f, subStart, 8))}}>{sub}</div>
    </div>
    {tip && <div style={{position: 'relative', flexShrink: 0}}><Chip start={start + 8} tone="glass" hi={hi}>{tip}</Chip></div>}
    {hi > 0.01 && <div style={{position: 'absolute', left: 0, top: r.h - g * 2 - 2, width: `${100 * ease(prog(f, aAt + 4, 16))}%`, height: 2, background: COLOR.goldHi, opacity: hi}} />}
    {glass && <Sheen at={start + 6} />}
    {glass && activeAt != null && aAt > start + 8 && <Sheen at={aAt + 2} strength={0.28} />}
  </div>;
};
const useSpringPOnce = (f: number, start: number) => spring({frame: Math.max(0, f - start), fps: 30, config: SPRING.snappy});

/** 引用号 + 引文 */
export const QuoteBlock: React.FC<{r: Rect; start: number; text: string; sub?: string; lineAt?: number[]; subAt?: number[]; focus?: number}> = ({r, start, text, sub, lineAt, subAt, focus = 0}) => {
  const f = useCurrentFrame(); const p = useSpringP(start, SPRING.enter);
  const lines = text.split('\n'); const subs = sub ? sub.split(/(?<=，)/) : [];
  const ln = (i: number) => lineAt?.[i] ?? start + i * 10; const sb = (i: number) => subAt?.[i] ?? start + 26 + i * 8;
  const piece = (st: number, k: React.Key, node: React.ReactNode, inline = false) => {
    const L = spring({frame: Math.max(0, f - st), fps: 30, config: SPRING.enter});
    return <span key={k} style={{display: inline ? 'inline-block' : 'block', opacity: Math.min(1, Math.max(0, L * 1.4)),
      transform: `translateY(${(1 - L) * 22}px) scale(${0.97 + 0.03 * Math.min(L, 1.1)})`, transformOrigin: '0 60%'}}>{node}</span>;
  };
  return <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, opacity: Math.min(1, p * 1.5) * (1 - 0.4 * focus),
    transform: 'none', transformOrigin: '0 40%'}}>
    <div data-deco style={{fontFamily: FONT.title, fontSize: 120, lineHeight: 0.8, color: 'rgba(217,178,111,0.35)'}}>“</div>
    <div style={{fontFamily: FONT.title, fontSize: TYPE.quote, color: COLOR.warm, lineHeight: 1.35, marginTop: 0}}>{lines.map((l, i) => piece(ln(i), i, <GoldText text={l} />))}</div>
    {sub && <div data-role="body" style={{fontFamily: FONT.body, fontSize: TYPE.body, lineHeight: 1.4, color: COLOR.sub, marginTop: 40}}>{subs.map((t, i) => piece(sb(i), i, t, true))}</div>}
  </div>;
};

/** 软发光提示条（比玻璃卡更轻） */
export const SoftCallout: React.FC<{r: Rect; start: number; text: string; tone?: 'gold' | 'coral'; icon?: string; h?: number}> = ({r, start, text, tone = 'gold', icon, h = 112}) => {
  const p = useSpringP(start, SPRING.snappy); const H = Math.min(h, r.h);
  // 宽度随文字收缩（左边贴栏线），内边距 56；文字宽 ≤ 容器 75%
  return <div data-fit="callout" style={{position: 'absolute', left: r.x, top: r.y + (r.h - H) / 2, maxWidth: r.w, height: H, display: 'inline-flex', alignItems: 'center', gap: 24, padding: '0 56px', boxSizing: 'border-box', whiteSpace: 'nowrap',
    borderRadius: 18, ...glassMat('dark', tone === 'coral' ? 'rgba(224,113,92,0.30)' : 'rgba(159,123,61,0.10)', tone === 'coral' ? 'rgba(240,150,130,0.55)' : 'rgba(243,215,158,0.5)'), ...enterStyle('scale', p)}}>
    <div style={{width: 52, height: 52, borderRadius: 26, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.num, fontSize: 28,
      color: tone === 'coral' ? '#fff' : '#2a2012', background: tone === 'coral' ? COLOR.coral : 'radial-gradient(circle at 30% 25%,#FBE6BC,#D9B26F)'}}>{icon ?? (tone === 'coral' ? '!' : '✓')}</div>
    <span data-fit-text style={{fontFamily: FONT.title, fontSize: 38, color: tone === 'coral' ? '#FFE3DB' : COLOR.warm}}><GoldText text={text} /></span>
  </div>;
};

/** 进度环 */
export const ProgressRing: React.FC<{cx: number; cy: number; size: number; start: number; ratio: number; label: string; value: string}> =
({cx, cy, size, start, ratio, label, value}) => {
  const f = useCurrentFrame(); const p = prog(f, start, 28); const r = (size - 10) / 2; const c = 2 * Math.PI * r; const dash = c * ratio * ease(p);
  return <div style={{position: 'absolute', left: cx - size / 2, top: cy - size / 2, width: size, height: size, opacity: ease(prog(f, start, 14))}}>
    <svg width={size} height={size} style={{transform: 'rotate(-90deg)'}}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#D9B26F" strokeWidth={8} strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
    </svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'rotate(0)'}}>
      <div style={{fontFamily: FONT.num, fontSize: TYPE.ringValue, color: COLOR.goldHi, lineHeight: 1.2}}>{value}</div>
      <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.label, color: COLOR.sub, marginTop: 8}}>{label}</div>
    </div>
  </div>;
};

/** 箭头连接 */
export const ArrowConnector: React.FC<{x: number; y: number; w: number; start: number}> = ({x, y, w, start}) => {
  const f = useCurrentFrame(); const p = prog(f, start, 16);
  return <div style={{position: 'absolute', left: x, top: y, width: w * ease(p), height: 2, background: 'linear-gradient(90deg,rgba(217,178,111,0.2),#D9B26F)', opacity: ease(p)}}>
    <div style={{position: 'absolute', right: -2, top: -6, width: 0, height: 0, borderLeft: '12px solid #D9B26F', borderTop: '7px solid transparent', borderBottom: '7px solid transparent'}} />
  </div>;
};

/** 高亮竖条 / 焦点条 */
export const HighlightBar: React.FC<{x: number; y: number; h: number; start: number}> = ({x, y, h, start}) => {
  const f = useCurrentFrame(); const p = prog(f, start, 14);
  return <div style={{position: 'absolute', left: x, top: y, width: 4, height: h * ease(p), borderRadius: 2, background: 'linear-gradient(180deg,#F3D79E,#9C7536)', boxShadow: '0 0 16px rgba(217,178,111,0.5)'}} />;
};

/** 分裂大标题（一行主标题 + 一行副） */
export const SplitType: React.FC<{r: Rect; start: number; line1: string; line2: string; line2Start?: number; sub?: string}> = ({r, start, line1, line2, line2Start = start + 7, sub}) => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const p1 = spring({frame: Math.max(0, f - start), fps, config: SPRING.enter});
  const p2 = spring({frame: Math.max(0, f - line2Start), fps, config: SPRING.enter});
  const o1 = Math.min(1, Math.max(0, p1)), o2 = Math.min(1, Math.max(0, p2));
  return <div style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
    <div style={{fontFamily: FONT.title, fontSize: TYPE.heroTitle, color: COLOR.warm, lineHeight: 1.3, opacity: o1, transform: `translateY(${(1 - p1) * 28}px) scale(${0.96 + 0.04 * Math.min(p1, 1.12)})`}}>{line1}</div>
    <div style={{fontFamily: FONT.title, fontSize: TYPE.heroTitle, lineHeight: 1.3, marginTop: 0, opacity: o2, transform: `translateY(${(1 - p2) * 28}px) scale(${0.96 + 0.04 * Math.min(p2, 1.12)})`,
      background: 'linear-gradient(180deg,#FBE6BC,#D9B26F 60%,#B48843)', WebkitBackgroundClip: 'text', color: 'transparent'}}>{line2}</div>
    <div style={{position: 'relative', marginTop: 28, height: 3}}>
      <UnderlineDraw x={0} y={0} w={Math.min(420, r.w * 0.55)} start={line2Start + 13} />
    </div>
    {sub && <div data-role="body" style={{fontFamily: FONT.body, fontSize: TYPE.body, lineHeight: 1.4, color: COLOR.sub, marginTop: 48, opacity: ease(prog(f, line2Start + 19, 14))}}>{sub}</div>}
  </div>;
};

/** 紧凑统计胶囊（小元素） */
export const StatPill: React.FC<{r: Rect; start: number; k: string; value: number; unit: string; dec?: number; sep?: boolean; s?: string; hi?: boolean}> =
({r, start, k, value, unit, dec, sep, s, hi}) => {
  const p = useSpringP(start, SPRING.enter);
  return <div data-fit="pill" style={{position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 22, padding: '40px 44px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center',
    ...glassMat('dark', hi ? 'rgba(140,104,48,0.45)' : undefined, hi ? 'rgba(243,215,158,0.5)' : undefined), ...enterStyle('up', p)}}>
    <div style={{fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.label, color: COLOR.goldHi, letterSpacing: 2}}>{k}</div>
    <div style={{fontFamily: FONT.num, fontSize: 68, color: COLOR.warm, marginTop: 18, lineHeight: 1.1, whiteSpace: 'nowrap'}}>
      <Count to={value} start={start + 6} dec={dec} sep={sep} /><span style={{fontFamily: FONT.body, fontWeight: 700, fontSize: TYPE.body, marginLeft: 10}}>{unit}</span>
    </div>
    {s && <div data-role="body" style={{fontFamily: FONT.body, fontSize: TYPE.body, lineHeight: 1.35, color: COLOR.sub, marginTop: 20}}>{s}</div>}
  </div>;
};
