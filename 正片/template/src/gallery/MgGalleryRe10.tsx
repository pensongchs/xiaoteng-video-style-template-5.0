// 房产 MG 已定 9 套 v6：每套 4.5 秒，仅本 gallery 用 10 帧柔和叠化；无扫光、无镜头回弹。
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {Fonts} from '../style/components';
import {ShotView} from '../style/archetypes';
import {COLOR} from '../style/tokens';
import {RE10} from './shots-mg-re10.ts';
export const R_SHOT = 135; export const RE10_FRAMES = R_SHOT * RE10.length;
const GalleryDissolve: React.FC<{first: boolean; children: React.ReactNode}> = ({first, children}) => {
  const f = useCurrentFrame(); const t = Math.max(0, Math.min(1, f / 10)); const opacity = first ? 1 : t * t * (3 - 2 * t);
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};
export const MgGalleryRe10: React.FC = () => <AbsoluteFill style={{background: COLOR.ink}}><Fonts />
  {RE10.map((s, i) => <Sequence key={s.id} from={i * R_SHOT} durationInFrames={R_SHOT + (i < RE10.length - 1 ? 10 : 0)} premountFor={30}>
    <GalleryDissolve first={!i}><ShotView s={s} dur={R_SHOT} exampleData /></GalleryDissolve>
  </Sequence>)}
</AbsoluteFill>;
