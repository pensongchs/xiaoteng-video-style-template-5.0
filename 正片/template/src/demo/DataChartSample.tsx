import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Backdrop, ExampleMark, Fonts, Headline, Kicker} from '../style/components';
import {Transition} from '../style/transitions';
import {LineChartReveal, BarGlow} from '../style/DataCharts';
import {cols} from '../style/grid';
export const DCS_FRAMES = 300;
const S = 150, T = {kind: 'crossfade' as const, dur: 12};
export const DataChartSample: React.FC = () => <AbsoluteFill style={{background: '#121110'}}>
  <Fonts />
  <Sequence durationInFrames={S + T.dur} premountFor={30}>
    <Transition d={S} inT={null} outT={T} z={1}>
      <Backdrop src="media/stock/mixkit_42332_day.mp4" video dark={0.6} />
      <Kicker text="房价走势" /><ExampleMark />
      <Headline text="某城新房均价 {先涨后跌}" />
      <LineChartReveal r={{...cols(0, 10), y: 248, h: 632}} start={20} drawDur={45} peak={3} unit="万/㎡" vMin={1.2} vMax={1.95}
        pts={[{x: '2019', v: 1.52}, {x: '2020', v: 1.68}, {x: '2021', v: 1.81}, {x: '2022', v: 1.86}, {x: '2023', v: 1.74}, {x: '2024', v: 1.62}, {x: '2025', v: 1.55}]} />
    </Transition>
  </Sequence>
  <Sequence from={S} durationInFrames={S} premountFor={30}>
    <Transition d={S} inT={T} outT={null} z={2}>
      <Backdrop src="media/stock/mixkit_residential_above_day.mp4" video dark={0.6} />
      <Kicker text="买房账单" /><ExampleMark />
      <Headline text="300万的房 {利息}最扎心" />
      <BarGlow r={{...cols(1, 9), y: 248, h: 632}} start={18} unit="万" vMax={230}
        bars={[{k: '首付', v: 90}, {k: '贷款本金', v: 210}, {k: '30年总利息', v: 112.8, hi: true}]} />
    </Transition>
  </Sequence>
</AbsoluteFill>;
