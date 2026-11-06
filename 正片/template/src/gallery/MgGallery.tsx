import React from 'react';
import {AbsoluteFill, Sequence, getInputProps} from 'remotion';
import {Fonts} from '../style/components';
import {ShotView} from '../style/archetypes';
import {Transition, TRANSITIONS} from '../style/transitions';
import {COLOR} from '../style/tokens';
import {GALLERY, ARCHIVE_GALLERY} from './shots-mg-gallery.ts';
export const G_SHOT = 150; export const GALLERY_FRAMES = G_SHOT * GALLERY.length;
/** archiveAudit 只供存档材质回归；默认始终26套，不作推荐入口。 */
export const MgGallery: React.FC = () => {
  const shots = (getInputProps() as {archiveAudit?: boolean}).archiveAudit ? ARCHIVE_GALLERY : GALLERY;
  return <AbsoluteFill style={{background: COLOR.ink}}><Fonts />
  {shots.map((s, i) => { const inT = i ? TRANSITIONS[(i - 1) % TRANSITIONS.length] : null; const outT = i < shots.length - 1 ? TRANSITIONS[i % TRANSITIONS.length] : null;
    return <Sequence key={s.id} from={i * G_SHOT} durationInFrames={G_SHOT + (outT?.dur ?? 0)} premountFor={30}>
      <Transition d={G_SHOT} inT={inT} outT={outT} z={i}><ShotView s={s} dur={G_SHOT} exampleData={!String(s.layout).startsWith('outro')} /></Transition>
    </Sequence>; })}
</AbsoluteFill>;
};
