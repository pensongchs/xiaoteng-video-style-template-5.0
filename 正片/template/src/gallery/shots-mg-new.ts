// 新增 17 款的样镜。不进入默认 26 镜画廊，和原版式一起放进选卡池。
import type {Shot} from '../style/types.ts';
import {NEW_LAYOUTS} from '../style/layouts.ts';

const bg = {src: 'media/gen/clean_complex.jpg', dark: 0.42};
const titles: Record<string, [string, string]> = {
  ticketStub: ['购房杂费', '杂费要{提前留}'],
  indexTabs: ['看房顺序', '看房按{这三步}'],
  amenityPins: ['看区位', '一刻钟{生活圈}'],
  slashCompare: ['新房还是二手', '差别看{入住时间}'],
  archLight: ['朝向采光', '冬至能晒{几小时}'],
  paymentCup: ['月供水位', '月供别超{三分一}'],
  loanCurve: ['贷款流程', '从签约到放款要过{几关}'],
  contractNote: ['合同批注', '签约先看{这三处}'],
  planSplit: ['户型拆解', '一百平{能用多少}'],
  buildingSection: ['楼栋剖面', '楼层先看{这三处}'],
  pitfallLens: ['避坑放大', '验房先看{这三处}'],
  parkingLines: ['车位划线', '车位先问{归属}'],
  hexSteps: ['公积金贷款', '公积金贷款{四步走}'],
  inspectTags: ['验房吊牌', '收房先看{这四处}'],
  familyPlan: ['户型怎么选', '一家几口住几室{合适}'],
  policyNotes: ['政策便签', '资格以{当地为准}'],
  qaBubbles: ['问答', '顶楼{能不能买}'],
};

export const NEW_GALLERY: Shot[] = NEW_LAYOUTS.map((layout, i) => {
  const [kicker, title] = titles[layout];
  return {id: `N${String(i + 1).padStart(2, '0')}`, layout, kicker, title, bg, data: {}};
});

export const OUTRO_INTERACT: Shot[] = [
  {id: 'NH', layout: 'outroHost', kicker: '本期小结', bg: {src: 'media/gen/waterfront_dusk.jpg', dark: 0.42, luma: 0.5},
    data: {interact: 'hold', eyebrow: '今天记住三句话', line: '月供先{算清楚}', points: ['税费杂费先留出', '月供别超三分一', '早高峰去一趟'], note: '第二条最容易忽略', account: '极限小滕 · 房产科普'}},
  {id: 'NT', layout: 'outroHost', kicker: '下期预告', bg: {src: 'media/gen/interior_warm.jpg', dark: 0.4, luma: 0.55},
    data: {interact: 'talk', eyebrow: '下期聊', line: '公积金怎么用\n月供压力更小', note: '住得舒服，才是好房子', account: '极限小滕 · 房产科普'}},
];
