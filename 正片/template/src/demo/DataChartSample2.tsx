import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {Backdrop, ExampleMark, Fonts, Headline, Kicker} from '../style/components';
import {Transition, TRANSITIONS} from '../style/transitions';
import {RankBars, Waffle, Balance, YearRing, FormulaCalc} from '../style/DataCharts2';
import {cols} from '../style/grid';
const S = 140; export const DCS2_FRAMES = S * 5;
const shots: {bg: string; kicker: string; title: string; el: React.ReactNode}[] = [
  {bg: 'mixkit_42333_day', kicker: '成本拆解', title: '买房钱都去哪了 {贷款利息}排第一', el:
    <RankBars r={{...cols(0, 11), y: 300, h: 520}} start={16} unit="%" vMax={45}
      rows={[{k: '贷款利息', v: 38.5}, {k: '首付', v: 30.0}, {k: '税费', v: 12.4}, {k: '装修', v: 11.6}, {k: '中介/杂费', v: 7.5}]} />},
  {bg: 'mixkit_42334_day', kicker: '购房人群', title: '每100个买房人里', el:
    <Waffle r={{...cols(0, 11), y: 268, h: 580}} start={14} on={37} unit="个" caption={'选择了30年\n最长贷款期限'} value="其余 63 个选 20 年及以下" />},
  {bg: 'mixkit_42330_day', kicker: '方案对比', title: '全款还是贷款 {差在哪}', el:
    <Balance r={{...cols(0, 12), y: 248, h: 632}} start={14} tilt={-7}
      L={{k: '贷款买 · 总支出', v: '412.8万', s: '首付90万 + 360期月供'}} R={{k: '全款买 · 总支出', v: '300万', s: '一次付清'}} />},
  {bg: 'mixkit_admin_district_day', kicker: '还款进度', title: '30年房贷 一半利息要还多久', el:
    <YearRing r={{...cols(0, 12), y: 260, h: 600}} start={12} years={30} key1={10} title={'第 10 年\n才还完一半利息'} sub="等额本息前期主要在还利息"
      side={[{k: '总利息', v: '112.8 万'}, {k: '前10年已付利息', v: '≈ 57.8 万'}]} />},
  {bg: 'mixkit_2005_day', kicker: '月供怎么算', title: '贷款210万 每月要还多少', el:
    <FormulaCalc r={{...cols(1, 10), y: 300, h: 560}} start={14} result={8967} unit="元"
      terms={[{v: '210万', k: '贷款额'}, {v: '3.1%', k: '年利率'}, {v: '360期', k: '30年 · 等额本息'}]} ops={['×', '×']}
      note="M = P·r·(1+r)ⁿ / ((1+r)ⁿ − 1)，r = 3.1%÷12，n = 360" />},
];
export const DataChartSample2: React.FC = () => <AbsoluteFill style={{background: '#121110'}}><Fonts />
  {shots.map((s, i) => { const inT = i ? TRANSITIONS[(i - 1) % 4] : null; const outT = i < 4 ? TRANSITIONS[i % 4] : null;
    return <Sequence key={i} from={i * S} durationInFrames={S + (outT?.dur ?? 0)} premountFor={30}>
      <Transition d={S} inT={inT} outT={outT} z={i + 1}>
        <Backdrop src={`media/stock/${s.bg}.mp4`} video dark={0.6} />
        <Kicker text={s.kicker} /><ExampleMark /><Headline text={s.title} />{s.el}
      </Transition></Sequence>; })}
</AbsoluteFill>;
