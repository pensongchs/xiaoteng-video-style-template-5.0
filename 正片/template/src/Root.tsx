import React from 'react';
import {Composition} from 'remotion';
import {Demo, DEMO_FRAMES} from './demo/Demo';
import {ContactSheet} from './ContactSheet';
import {DataChartSample, DCS_FRAMES} from './demo/DataChartSample';
import {DataChartSample2, DCS2_FRAMES} from './demo/DataChartSample2';
import {OutroSample, OUTRO_FRAMES} from './demo/OutroSample';
import {MgGallery, GALLERY_FRAMES} from './gallery/MgGallery';
import {MgGalleryRe10, RE10_FRAMES} from './gallery/MgGalleryRe10';
export const Root: React.FC = () => (<>
  <Composition id="Style50-Demo" component={Demo} durationInFrames={DEMO_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="ContactSheet" component={ContactSheet as any} durationInFrames={1} fps={30} width={1328}
    height={392} defaultProps={{files: [] as string[]}}
    calculateMetadata={({props}: any) => ({height: Math.ceil(Math.max(1, props.files.length) / 2) * 376 + 16})} />
  <Composition id="DataChartSample" component={DataChartSample} durationInFrames={DCS_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="DataChartSample2" component={DataChartSample2} durationInFrames={DCS2_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="OutroSample" component={OutroSample} durationInFrames={OUTRO_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="MgGallery" component={MgGallery} durationInFrames={GALLERY_FRAMES} fps={30} width={1920} height={1080} />
  <Composition id="MgGalleryRe10" component={MgGalleryRe10} durationInFrames={RE10_FRAMES} fps={30} width={1920} height={1080} />
</>);
