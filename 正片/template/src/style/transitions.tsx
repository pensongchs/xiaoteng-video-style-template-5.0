// 5.0 运镜转场：镜头之间用「推/拉/漂/起」连续空间感，弹簧落地；旧 kind 名仍可用（映射到新实现）
import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {SPRING} from './tokens';

export type TKind =
  | 'crossfade' | 'pushBlur' | 'lightSweep' | 'maskWipe'   // 旧名（兼容）
  | 'softPush' | 'softZoom' | 'driftDissolve' | 'liftReveal'; // 新运镜

export type TSpec = {kind: TKind; dur: number; dir?: 1 | -1};

/** 默认轮换：右推 → 推近 → 左漂 → 上浮，方向交替，观感连续不乱跳 */
export const TRANSITIONS: TSpec[] = [
  {kind: 'softPush', dur: 18, dir: 1},
  {kind: 'softZoom', dur: 16},
  {kind: 'driftDissolve', dur: 16, dir: -1},
  {kind: 'liftReveal', dur: 18},
];

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const easeCam = Easing.bezier(0.4, 0.0, 0.2, 1);

const resolve = (k: TKind): 'softPush' | 'softZoom' | 'driftDissolve' | 'liftReveal' => {
  if (k === 'pushBlur') return 'softPush';
  if (k === 'crossfade') return 'softZoom';
  if (k === 'maskWipe') return 'driftDissolve';
  if (k === 'lightSweep') return 'liftReveal';
  return k as any;
};

/** 包住一镜：入场按 inT（第 0..dur 帧），退场按 outT（d..d+dur 帧，此时画面已定格） */
export const Transition: React.FC<{d: number; inT: TSpec | null; outT: TSpec | null; z: number; children: React.ReactNode}> = ({d, inT, outT, z, children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  let style: React.CSSProperties = {zIndex: z, willChange: 'transform, opacity, filter'};
  let overlay: React.ReactNode = null;

  if (inT && f < inT.dur + 6) {
    const kind = resolve(inT.kind);
    const dir = inT.dir ?? 1;
    const sp = spring({frame: f, fps, config: SPRING.cam});
    const lin = interpolate(f, [0, inT.dur], [0, 1], {...clamp, easing: easeCam});
    const o = Math.min(1, Math.max(0, sp));
    if (kind === 'softPush') {
      // 相机从侧向推入：带轻微模糊与缩放，弹簧落地
      style = {...style, opacity: o,
        transform: `translateX(${(1 - sp) * 110 * dir}px) scale(${0.96 + 0.04 * Math.min(sp, 1.06)})`,
        filter: `blur(${Math.max(0, (1 - Math.min(sp, 1)) * 8)}px)`};
    } else if (kind === 'softZoom') {
      // 推近落地：从 1.10 收到 1.0，带柔光扫
      style = {...style, opacity: o, transform: `scale(${1.10 - 0.10 * Math.min(sp, 1.05)})`};
      overlay = <AbsoluteFill style={{zIndex: z + 0.5, pointerEvents: 'none', opacity: 0.18 * Math.sin(Math.PI * lin),
        background: `linear-gradient(105deg, transparent ${lin * 120 - 40}%, rgba(255,240,215,0.85) ${lin * 120 - 18}%, transparent ${lin * 120}%)`}} />;
    } else if (kind === 'driftDissolve') {
      // 同向漂入叠化：空间连续
      style = {...style, opacity: o,
        transform: `translateX(${(1 - sp) * 48 * dir}px) translateY(${(1 - sp) * 10}px) scale(${0.985 + 0.015 * Math.min(sp, 1.04)})`};
    } else if (kind === 'liftReveal') {
      // 上浮揭示：从下方带模糊弹入
      style = {...style, opacity: o,
        transform: `translateY(${(1 - sp) * 56}px) scale(${0.97 + 0.03 * Math.min(sp, 1.06)})`,
        filter: `blur(${Math.max(0, (1 - Math.min(sp, 1)) * 6)}px)`};
    }
  }

  if (outT && f >= d) {
    const kind = resolve(outT.kind);
    const dir = outT.dir ?? 1;
    const p = interpolate(f, [d, d + outT.dur], [0, 1], {...clamp, easing: easeCam});
    if (kind === 'softPush') {
      // 旧镜沿推入反方向滑出并轻微放大/虚化 → 接下一镜的推入
      style = {...style, opacity: 1 - p * 0.55,
        transform: `translateX(${-p * 70 * dir}px) scale(${1 + p * 0.04})`,
        filter: `blur(${p * 7}px)`};
    } else if (kind === 'softZoom') {
      style = {...style, opacity: 1 - p * 0.65, transform: `scale(${1 + p * 0.08})`};
    } else if (kind === 'driftDissolve') {
      style = {...style, opacity: 1 - p * 0.7,
        transform: `translateX(${-p * 36 * dir}px) scale(${1 + p * 0.02})`};
    } else if (kind === 'liftReveal') {
      style = {...style, opacity: 1 - p * 0.6,
        transform: `translateY(${-p * 28}px) scale(${1 + p * 0.03})`,
        filter: `blur(${p * 5}px)`};
    }
  }

  return <><AbsoluteFill style={style}>{children}</AbsoluteFill>{overlay}</>;
};
