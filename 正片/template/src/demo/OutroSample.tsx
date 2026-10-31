import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Fonts} from '../style/components';
import {ShotView} from '../style/archetypes';
import {SHOTS} from './shots.ts';
export const OUTRO_FRAMES = 180;
/** 片尾小样：只渲片尾镜头（无音频、无字幕） */
export const OutroSample: React.FC = () => {
  const s = SHOTS.find((x) => String(x.layout).startsWith('outro'))!;
  return <AbsoluteFill style={{background: '#121110'}}><Fonts /><ShotView s={s} dur={OUTRO_FRAMES} /></AbsoluteFill>;
};
