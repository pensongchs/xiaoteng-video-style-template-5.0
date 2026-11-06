// @ts-nocheck
// 本期：选楼层口诀（5.0 · 正片部分，时间码已减去片头 3807ms）。全片定性内容，不造数字。
import type {Shot} from '../style/types.ts';
const S = (f: string) => `media/stock/${f}`;
const G = (f: string) => `media/gen/${f}`;
export const SUBTITLE = {show: true, highlight: true};
export const SHOTS: Shot[] = [
  {id: 'S01', example: false, layout: 'quoteStack', at: {cue: 1}, anchors: {q1: '标准件', sub0: '同样', sub1: '换个', r0: '采光', r1: '噪声', r2: '视野', warn: '两样'}, kicker: '口诀的问题',
    bg: {src: S('mixkit_42334_day.mp4'), video: true, dark: 0.52},
    data: {quote: '把具体的房子\n当成了标准件', sub: '同样叫中间层，换个小区',
      rows: [{t: '采光', s: '楼间距、遮挡各不相同', k: '因楼而异'}, {t: '噪声', s: '临街还是靠内，差很多', k: '因楼而异'}, {t: '视野', s: '窗外是景还是楼', k: '因楼而异'}],
      warn: '可能{完全两样}'}},

  {id: 'S02', example: false, layout: 'mediaRows', at: {cue: 7}, anchors: {media: '怎么选', r0: '东户', r1: '西户', r2: '根本'}, kicker: '口诀一 · 一梯两户',
    title: '东户还是西户？{各有说法}',
    bg: {src: S('mixkit_42332_day.mp4'), video: true, dark: 0.52},
    data: {media: {src: G('ew_units.jpg'), label: '一梯两户 · 东西两户', tag: '概念图'},
      rows: [{t: '选东户', s: '上午有太阳，下午不晒', k: '说法一'}, {t: '选西户', s: '冬天下午暖和', k: '说法二'}, {t: '光凭东西两个字', s: '根本定不了', k: '结论'}]}},

  {id: 'S03', example: false, layout: 'timeline', at: {cue: 14}, anchors: {s0: '楼栋', s1: '边套', s2: '最后', note: '最后'}, kicker: '一梯两户 · 怎么选',
    title: '按{三步}看',
    bg: {src: S('mixkit_42330_day.mp4'), video: true, dark: 0.52},
    data: {steps: [
      {t: '确认楼栋朝向', s: '两户是不是都朝南', chip: '第 1 步'},
      {t: '看哪户是边套', s: '窗外是马路还是楼', chip: '第 2 步'},
      {t: '想想城市气候', s: '夏天长还是冬天长', chip: '第 3 步'}],
      note: {t: '朝向、边套、气候，{一起看}'}}},

  {id: 'S04', example: false, layout: 'titleFloat', at: {cue: 20}, kicker: '西晒 · 看城市',
    bg: {src: S('mixkit_4803_day.mp4'), video: true, dark: 0.5},
    data: {chips: [{t: '夏天长', tone: 'coral'}, {t: '冬天长', tone: 'green'}],
      line1: '西晒是电费', line2: '还是好处',
      sub: '夏天长：年年交电费；冬天长：多晒一下午',
      media: {src: G('west_sun.jpg'), label: '午后西晒', tag: '概念图'},
      callout: '看城市，{不看口诀}', icon: '▲'}},

  {id: 'S05', example: false, layout: 'mediaRows', at: {cue: 22}, anchors: {r0: '工地', r1: '主干道', r2: '风往'}, kicker: '口诀二 · 7–11 层扬灰层',
    title: '灰尘多少，看{周边}',
    bg: {src: S('mixkit_admin_district_day.mp4'), video: true, dark: 0.52},
    data: {media: {src: G('main_road.jpg'), label: '工地 · 主干道', tag: '概念图'},
      rows: [{t: '周边有没有工地', s: '施工扬尘最直接', k: '查规划'}, {t: '有没有主干道', s: '车流带起的灰', k: '看地图'}, {t: '风往哪边吹', s: '跟几楼关系不大', k: '看风向'}]}},

  {id: 'S06', example: false, layout: 'splitVs', at: {cue: 25}, anchors: {L: '三楼', R: '九楼'}, kicker: '扬灰层 · 对比',
    title: '楼层不是关键，{环境}才是',
    bg: {src: S('mixkit_residential_above_day.mp4'), video: true, dark: 0.5},
    data: {winner: 'R',
      L: {media: {src: G('dust_site.jpg'), label: '紧挨工地', tag: '紧挨工地'}, label: '紧挨工地', value: 3, unit: '楼', chip: {t: '一样吃灰', tone: 'coral'}},
      R: {media: {src: G('clean_complex.jpg'), label: '周边干净', tag: '周边干净'}, label: '周边干净', value: 9, unit: '楼', chip: {t: '也没事', tone: 'green'}}}},

  {id: 'S07', example: false, layout: 'titleFloat', at: {cue: 29}, kicker: '口诀三 · 槽钢层 腰线层',
    bg: {src: S('mixkit_2005_day.mp4'), video: true, dark: 0.52},
    data: {chips: [{t: '槽钢层'}, {t: '腰线层'}],
      line1: '漏不漏水', line2: '看施工和防水',
      sub: '不是有这一层，就一定会漏',
      media: {src: G('wall_waterproof.jpg'), label: '外墙防水施工', tag: '概念图'},
      callout: '看外墙，{不看楼层}', icon: '▲'}},

  {id: 'S08', example: false, layout: 'quoteStack', at: {cue: 32}, anchors: {q1: '这一层', sub0: '上下', r0: '窗边', r1: '水渍', r2: '刷过', warn: '新房'}, kicker: '漏水 · 看房清单',
    bg: {src: G('water_stain.jpg'), dark: 0.5},
    data: {quote: '二手房\n看这三处', sub: '本层 + 上下两层',
      rows: [{t: '窗边 · 墙角', s: '重点看位置', k: '位置'}, {t: '水渍 · 发霉', s: '有没有痕迹', k: '痕迹'}, {t: '重新刷过漆', s: '可能在遮盖', k: '警惕'}],
      warn: '新房：问清外墙防水{质保期}'}},

  {id: 'S09', example: false, layout: 'mediaRows', at: {cue: 38}, anchors: {r0: '提醒', r1: '价格', r2: '天天'}, kicker: '总结',
    title: '口诀当提醒，{别当答案}',
    bg: {src: S('mixkit_42333_day.mp4'), video: true, dark: 0.52},
    data: {media: {src: G('interior_warm.jpg'), label: '住进去才知道', tag: '概念图'},
      rows: [{t: '口诀', s: '可以当提醒', k: '提醒'}, {t: '能接受的缺点', s: '拿去换价格', k: '议价'}, {t: '天天躲不开的噪声和西晒', s: '便宜多少都不划算', k: '别买'}]}},

  {id: 'S10', layout: 'outroHost', at: {cue: 41},
    bg: {src: G('outro_windows.jpg'), dark: 0.4},
    data: {eyebrow: '你家选的是', line: '{东户}还是西户？',
      points: ['住进去以后，后悔过吗？'],
      note: '口诀当提醒，别当答案', account: '极限小滕 · 房产科普'}},
];
