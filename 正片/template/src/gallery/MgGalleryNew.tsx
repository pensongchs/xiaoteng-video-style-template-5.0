import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Fonts} from '../style/components';
import {ShotView} from '../style/archetypes';
import {COLOR} from '../style/tokens';
import {NEW_GALLERY, OUTRO_INTERACT} from './shots-mg-new.ts';

const SHOTS = [...NEW_GALLERY, ...OUTRO_INTERACT];
export const N_SHOT = 150;
export const NEW_GALLERY_FRAMES = N_SHOT * SHOTS.length;

/** 17 款新卡 + 2 个片尾互动姿态。原 26 款画廊不在这里。 */
export const MgGalleryNew: React.FC = () => (
  <AbsoluteFill style={{background: COLOR.ink}}><Fonts />
    {SHOTS.map((s, i) => <Sequence key={s.id} from={i * N_SHOT} durationInFrames={N_SHOT} premountFor={30}>
      <ShotView s={s} dur={N_SHOT} exampleData={!String(s.layout).startsWith('outro')} />
    </Sequence>)}
  </AbsoluteFill>
);
