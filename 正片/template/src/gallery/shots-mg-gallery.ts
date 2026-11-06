// 5.0 MG 版式活目录：每个默认版式一镜，示例数据（画面带「示例」角标）。新增版式必须在这里登记一镜。
import type {Shot} from '../style/types.ts';
import {RE10} from './shots-mg-re10.ts';
import {ARCHIVE_LAYOUTS, isDefaultLayout} from '../style/layouts.ts';
import {SHOTS as FLOOR} from './floor-ref-shots.ts';
const V = (f: string) => ({src: `media/stock/${f}.mp4`, video: true, dark: 0.55});
const G = (f: string) => `media/gen/${f}`;
const pick = (l: string) => FLOOR.find((s) => s.layout === l)!;
const HISTORICAL_SAMPLES: Shot[] = ([
  // —— 定版原有 6 种（取自选楼层口诀）——
  pick('quoteStack'), pick('mediaRows'), pick('timeline'), pick('titleFloat'), pick('splitVs'),
  // —— 原有但少用 ——
  {layout: 'bareNumber', kicker: '裸数字', title: '税费常被{漏算}', bg: V('mixkit_42333_day'),
    data: {chip: '示例', value: 3, unit: '%', label: '契税参考', formula: '按{面积与套数}确定', chips: [{t: '首套', tone: 'green'}, {t: '二套', tone: 'coral'}], media: {src: G('hidden_costs.jpg'), label: '交易税费', tag: '概念图'}}},
  {layout: 'ringFeature', kicker: '进度环', title: '首付只占{一部分}', bg: V('mixkit_42330_day'),
    data: {media: {src: G('downpayment.jpg'), label: '首付', tag: '概念图'}, ring: {ratio: 0.3, label: '首付占比', value: '30%', note: '剩下的\n{慢慢还}'}, a: {k: '贷款', value: 70, unit: '%', s: '按揭部分'}}},
  {layout: 'waitVs', kicker: '等待对比', title: '现房还是期房', bg: V('mixkit_admin_district_day'),
    data: {L: {media: {src: G('new_vs_used.jpg'), label: '期房'}, label: '期房 · 等交付', value: 24, unit: '个月', chip: {t: '要等', tone: 'coral'}},
      R: {media: {src: G('interior_warm.jpg'), label: '现房'}, label: '现房 · 入住', value: 1, unit: '个月', chip: {t: '马上住', tone: 'green'}}}},
  {layout: 'triadSoft', kicker: '三列胶囊', title: '三笔{前期}支出', bg: V('mixkit_42334_day'),
    data: {cols: [{k: '首付', value: 30, unit: '%', s: '大头'}, {k: '税费', value: 3, unit: '%', s: '易漏'}, {k: '装修', value: 10, unit: '%', s: '可控'}], note: {t: '先把{三笔}列清楚'}}},
  // —— 数据图表 ——
  {layout: 'lineReveal', kicker: '折线揭示', title: '某城均价 {先涨后跌}', bg: V('mixkit_skyscraper_panorama'),
    data: {drawDur: 45, peak: 3, unit: '万/㎡', vMin: 1.2, vMax: 1.95, pts: [{x: '2019', v: 1.52}, {x: '2020', v: 1.68}, {x: '2021', v: 1.81}, {x: '2022', v: 1.86}, {x: '2023', v: 1.74}, {x: '2024', v: 1.62}, {x: '2025', v: 1.55}]}},
  {layout: 'barGlow', kicker: '光柱', title: '300万的房 {利息}最扎心', bg: V('mixkit_residential_above_day'),
    data: {unit: '万', vMax: 230, bars: [{k: '首付', v: 90}, {k: '贷款本金', v: 210}, {k: '30年总利息', v: 112.8, hi: true}]}},
  {layout: 'rankBars', kicker: '排行条', title: '钱都去哪了', bg: V('mixkit_42333_day'),
    data: {unit: '%', vMax: 45, rows: [{k: '贷款利息', v: 38.5}, {k: '首付', v: 30.0}, {k: '税费', v: 12.4}, {k: '装修', v: 11.6}, {k: '杂费', v: 7.5}]}},
  {layout: 'waffle', kicker: '百格图', title: '每100个买房人里', bg: V('mixkit_42334_day'),
    data: {on: 37, unit: '个', caption: '选择了30年\n最长贷款期限', value: '其余 63 个选更短'}},
  {layout: 'balance', kicker: '天平', title: '全款还是贷款 {差在哪}', bg: V('mixkit_42330_day'),
    data: {tilt: -7, L: {k: '贷款买 · 总支出', v: '412.8万', s: '首付 + 月供'}, R: {k: '全款买 · 总支出', v: '300万', s: '一次付清'}}},
  {layout: 'yearRing', kicker: '年轮', title: '30年房贷 一半利息要还多久', bg: V('mixkit_admin_district_day'),
    data: {years: 30, key1: 10, title: '第 10 年\n才还完一半利息', sub: '等额本息前期主要在还利息', side: [{k: '总利息', v: '112.8 万'}, {k: '前10年', v: '≈ 57.8 万'}]}},
  {layout: 'formulaCalc', kicker: '公式计算', title: '每月要还多少', bg: V('mixkit_2005_day'),
    data: {result: 8967, unit: '元', terms: [{v: '210万', k: '贷款额'}, {v: '3.1%', k: '年利率'}, {v: '360期', k: '30年'}], ops: ['×', '×'], note: 'r = 年利率÷12，n = 360'}},
  // —— 旧6套：只导出到 ARCHIVE_GALLERY，绝不进入默认预览 ——
  {layout: 'keywordCascade', kicker: '关键词瀑布', title: '看房先看{这四样}', bg: V('mixkit_42332_day'),
    data: {words: [{t: '采光', s: '楼间距'}, {t: '噪声', s: '临不临街'}, {t: '视野', s: '窗外是啥'}, {t: '物业', s: '管得好不好', tone: 'gold'}], media: {src: V('yl_v_viewroom').src, video: true, label: '实地看房'}}},
  {layout: 'checklistFill', kicker: '清单进度', title: '首付之外 {7笔钱}', bg: V('mixkit_42333_day'),
    data: {label: '第 X / 7 笔', items: [{t: '契税'}, {t: '维修基金'}, {t: '中介费'}, {t: '装修', tone: 'coral'}, {t: '家电家具', tone: 'coral'}, {t: '物业预缴', tone: 'coral'}, {t: '搬家杂费', tone: 'coral'}], media: {src: G('renovation.jpg'), label: '装修', tag: '概念图'}}},
  {layout: 'vsScore', kicker: 'VS 计分板', title: '一楼 vs 顶楼', bg: V('yl_v_terrace'),
    data: {L: '一楼', R: '顶楼', rows: [{k: '采光', w: 'R'}, {k: '安静', w: 'R'}, {k: '出行', w: 'L'}, {k: '院子/露台', w: '='}, {k: '转手', w: 'L'}]}},
  {layout: 'tipStack', kicker: '提示堆叠', title: '验房{别忘了}', bg: V('mixkit_42330_day'),
    data: {tips: [{icon: '💧', t: '看窗边墙角', s: '有没有水渍'}, {icon: '🔌', t: '试每个插座', s: '带个小夜灯'}, {icon: '🚿', t: '放水看下水', s: '地漏快不快', tone: 'green'}, {icon: '📐', t: '量层高', s: '和合同对一对', tone: 'gold'}], media: {src: G('yl_inspect.jpg'), label: '验房', tag: '概念图'}}},
  {layout: 'numberedReveal', kicker: '序号翻牌', title: '选楼层 {三条口诀}', bg: V('mixkit_residential_above_day'),
    data: {cards: [{t: '东西户', s: '看朝向和边套'}, {t: '扬灰层', s: '看周边不看楼层'}, {t: '槽钢层', s: '看施工和防水'}]}},
  {layout: 'kpiGrid', kicker: '迷你 KPI', title: '这套房{一眼看}', bg: V('mixkit_42334_day'),
    data: {kpis: [{k: '房龄', v: 8, unit: '年', ratio: 0.3}, {k: '得房率', v: 82, unit: '%', ratio: 0.82, tone: 'green'}, {k: '楼间距', text: '宽', ratio: 0.8}, {k: '物业', text: '一般', ratio: 0.45, tone: 'coral'}], media: {src: G('clean_complex.jpg'), label: '小区', tag: '概念图'}}},
  pick('outroHost'),
] as any[]).map((s, i) => ({...s, id: `G${String(i + 1).padStart(2, '0')}`})) as Shot[];

/** 存档复核入口（不注册默认预览 composition）。 */
export const ARCHIVE_GALLERY = HISTORICAL_SAMPLES.filter(s => (ARCHIVE_LAYOUTS as readonly string[]).includes(s.layout));
/** 26套 = 原核心10（outroAir别名不重复）+ 数据7 + 已定房产9；无户型对比/旧6套。 */
export const GALLERY: Shot[] = [
  ...HISTORICAL_SAMPLES.filter(s => isDefaultLayout(s.layout) && s.layout !== 'outroHost'),
  ...RE10, pick('outroHost'),
].map((s, i) => ({...s, id: `G${String(i + 1).padStart(2, '0')}`}));
