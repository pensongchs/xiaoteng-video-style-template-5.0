// 本期：一楼和顶楼能不能买（5.0 · 正片，时间码已减去片头 8880ms）。全片定性内容，不造数字。
// v2：视频背景（生成+Mixkit 实拍）、fx 加强运镜、beats 口播节拍标签；拆长镜 S02/S12
import type {Shot} from '../style/types.ts';
const G = (f: string) => `media/gen/${f}`;
const V = (f: string) => `media/stock/${f}.mp4`;
const FX = 2.6;
const R1 = 1776; // 右侧留白列（节拍标签）
export const SUBTITLE = {show: true, highlight: true};
export const SHOTS: Shot[] = ([
  {id: 'S01', layout: 'mediaRows', at: {cue: 1}, anchors: {media: '院子', r0: '中间', r1: '抢手', r2: '真相', b0: '发现', b1: '贵', b2: '能不能买'}, kicker: '奇怪的现象',
    title: '被嫌弃的楼层，{反而抢手}',
    bg: {src: G('yl_lowdensity.jpg'), dark: 0.58},
    beats: [{k: 'b0', t: '反常', x: R1, y: 300, tone: 'gold', icon: '!'}, {k: 'b1', t: '一楼更贵', x: R1, y: 470, tone: 'green', icon: '↑'}, {k: 'b2', t: '能买吗', x: R1, y: 640, icon: '?'}],
    data: {media: {src: G('yl_yard.jpg'), label: '一楼带院子', tag: '概念图'},
      rows: [{t: '一楼带院子', s: '卖得比中间楼层还贵', k: '现象一'}, {t: '有些顶楼', s: '整个小区最抢手的户型', k: '现象二'}, {t: '到底能不能买', s: '很多人忽略的真相', k: '今天说清'}]}},

  {id: 'S02', layout: 'quoteStack', at: {cue: 6}, anchors: {q1: '居住', sub0: '采光', r0: '树木', r1: '主干道', r2: '入口', warn: '入口', b0: '采光', b1: '最难'}, kicker: '先说一楼',
    bg: {src: G('yl_dark.jpg'), dark: 0.5},
    beats: [{k: 'b0', t: '不只是采光', x: R1, y: 300, icon: '☀'}, {k: 'b1', t: '最难改', x: R1, y: 470, tone: 'coral', icon: '!'}],
    data: {quote: '一楼最难改的\n是居住环境', sub: '不一定是采光',
      rows: [{t: '楼前树木茂密', s: '窗前被挡住', k: '遮挡'}, {t: '窗外是主干道', s: '人来车往', k: '吵闹'}, {t: '靠近单元入口', s: '进出都经过', k: '隐私'}],
      warn: '环境问题，{最难改变}'}},

  {id: 'S02b', layout: 'titleFloat', at: {cue: 12}, anchors: {b0: '说话', b1: '经过', b2: '开窗', b3: '压抑'}, kicker: '一楼 · 你会发现',
    bg: {src: G('west_sun.jpg'), dark: 0.6},
    beats: [{k: 'b0', t: '有人说话', x: R1, y: 300, icon: '♪'}, {k: 'b1', t: '有人经过', x: R1, y: 430, icon: '◐'}, {k: 'b2', t: '担心隐私', x: R1, y: 560, tone: 'coral', icon: '!'}, {k: 'b3', t: '觉得压抑', x: R1, y: 690, tone: 'coral', icon: '▼'}],
    data: {chips: [{t: '人来人往', tone: 'coral'}],
      line1: '开窗担心隐私', line2: '关窗又压抑',
      sub: '居住环境，往往最难改变',
      media: {src: G('interior_warm.jpg'), label: '一楼室内', tag: '概念图'},
      callout: '开窗关窗{都两难}', icon: '▲'}},

  {id: 'S03', layout: 'titleFloat', at: {cue: 17}, anchors: {b0: '楼间距', b1: '遮挡', b2: '想象'}, kicker: '一楼 · 老小区',
    bg: {src: G('yl_roof.jpg'), dark: 0.62},
    beats: [{k: 'b2', t: '采光更差', x: R1, y: 300, tone: 'coral', icon: '▼'}],
    data: {chips: [{t: '楼间距小', tone: 'coral'}, {t: '绿化遮挡', tone: 'coral'}],
      line1: '老小区一楼', line2: '采光可能更差',
      sub: '楼间距小、绿化遮挡严重',
      media: {src: G('wall_waterproof.jpg'), label: '老小区一楼室内', tag: '概念图'},
      callout: '比你想象中{还要差}', icon: '▲'}},

  {id: 'S04', layout: 'mediaRows', at: {cue: 19}, anchors: {media: '低密度', r0: '楼间距', r1: '地势', r2: '产权', b0: '不代表', b1: '通风', b2: '合法'}, kicker: '一楼 · 也有好的',
    title: '这样的一楼，{反而舒服}',
    bg: {src: G('clean_complex.jpg'), dark: 0.58},
    beats: [{k: 'b0', t: '不是都不能买', x: 409, y: 300, tone: 'green', icon: '✓'}, {k: 'b1', t: '采光通风好', x: R1, y: 420, tone: 'green', icon: '☀'}, {k: 'b2', t: '合法庭院', x: R1, y: 600, tone: 'gold', icon: '✓'}],
    data: {media: {src: G('ew_units.jpg'), label: '低密度小区 · 庭院', tag: '概念图'},
      rows: [{t: '低密度 · 楼间距宽', s: '光线不被挡', k: '条件一'}, {t: '地势比较高', s: '采光通风都不错', k: '条件二'}, {t: '庭院产权清晰', s: '合法使用', k: '条件三'}]}},

  {id: 'S05', layout: 'titleFloat', at: {cue: 26}, anchors: {b0: '老人', b1: '小孩', b2: '舒服'}, kicker: '一楼 · 适合谁',
    bg: {src: G('yl_terrace.jpg'), dark: 0.6},
    beats: [{k: 'b2', t: '更舒服', x: R1, y: 300, tone: 'green', icon: '♥'}],
    data: {chips: [{t: '家有老人', tone: 'green'}, {t: '家有小孩', tone: 'green'}],
      line1: '有老人小孩', line2: '一楼更舒服',
      sub: '前提：条件好、庭院合法',
      media: {src: G('yl_viewroom.jpg'), label: '一楼庭院', tag: '概念图'},
      callout: '比较{舒服}的选择', icon: '▲'}},

  {id: 'S06', layout: 'quoteStack', at: {cue: 27}, anchors: {q1: '重点', sub0: '无法', r0: '便宜', r1: '缺点', r2: '接受', warn: '接受', b0: '便宜', b1: '接受'}, kicker: '买一楼 · 看什么',
    bg: {src: G('water_stain.jpg'), dark: 0.55},
    beats: [{k: 'b0', t: '别只看价', x: R1, y: 300, tone: 'coral', icon: '✕'}, {k: 'b1', t: '能接受吗', x: R1, y: 470, tone: 'gold', icon: '?'}],
    data: {quote: '买一楼\n别只看便宜', sub: '看无法改变的缺点',
      rows: [{t: '有多便宜', s: '不是重点', k: '误区'}, {t: '无法改变的缺点', s: '环境、采光、隐私', k: '重点'}, {t: '你能不能接受', s: '想清楚再买', k: '关键'}],
      warn: '缺点能接受，{才值得买}'}},

  {id: 'S07', layout: 'mediaRows', at: {cue: 31}, anchors: {media: '漏水', r0: '建筑', r1: '屋面', r2: '物业', b0: '顶楼', b1: '漏水', b2: '实际上'}, kicker: '再说顶楼',
    title: '顶楼怕漏水？{先看这三样}',
    bg: {src: G('yl_inspect.jpg'), dark: 0.58},
    beats: [{k: 'b1', t: '第一反应：漏水', x: 409, y: 300, tone: 'coral', icon: '!'}, {k: 'b2', t: '其实要看', x: R1, y: 300, tone: 'gold', icon: '→'}],
    data: {media: {src: G('waterfront_dusk.jpg'), label: '屋面防水', tag: '概念图'},
      rows: [{t: '建筑质量', s: '房子本身过不过关', k: '第一'}, {t: '屋面防水隔热', s: '顶楼最关键', k: '第二'}, {t: '物业维护能力', s: '后期修不修得好', k: '第三'}]}},

  {id: 'S08', layout: 'timeline', at: {cue: 37}, anchors: {s0: '防水', s1: '保温', s2: '维修', note: '维修', b0: '房龄', b1: '更热'}, kicker: '顶楼 · 房龄大要小心',
    title: '老顶楼的{三个隐患}',
    bg: {src: G('main_road.jpg'), dark: 0.55},
    beats: [{k: 'b0', t: '房龄大', x: R1, y: 300, tone: 'gold', icon: '!'}, {k: 'b1', t: '夏天更热', x: R1, y: 470, tone: 'coral', icon: '☀'}],
    data: {steps: [
      {t: '屋面防水老化', s: '漏水隐患', chip: '隐患 1'},
      {t: '保温隔热不足', s: '夏天可能更热', chip: '隐患 2'},
      {t: '后期维修', s: '可能比较麻烦', chip: '隐患 3'}],
      note: {t: '老顶楼，{重点看屋面}'}}},

  {id: 'S09', layout: 'mediaRows', at: {cue: 42}, anchors: {media: '新小区', r0: '脚步', r1: '视野', r2: '噪音', b0: '新小区', b1: '施工', b2: '措施', b3: '独特'}, kicker: '顶楼 · 品质好的新小区',
    title: '好顶楼，{优势很明显}',
    bg: {src: G('outro_windows.jpg'), dark: 0.58},
    beats: [{k: 'b0', t: '品质新小区', x: 409, y: 300, tone: 'green', icon: '✓'}, {k: 'b1', t: '施工过关', x: R1, y: 300, tone: 'green', icon: '✓'}, {k: 'b2', t: '防水完善', x: R1, y: 470, tone: 'green', icon: '✓'}, {k: 'b3', t: '独特优势', x: R1, y: 640, tone: 'gold', icon: '★'}],
    data: {media: {src: G('new_vs_used.jpg'), label: '顶楼 · 开阔视野', tag: '概念图'},
      rows: [{t: '没有楼上脚步声', s: '头顶没有邻居', k: '安静'}, {t: '视野更开阔', s: '采光更好', k: '敞亮'}, {t: '楼上噪音', s: '受影响概率更低', k: '清净'}]}},

  {id: 'S10', layout: 'titleFloat', at: {cue: 50}, anchors: {b0: '安静', b1: '隐私', b2: '每个楼层'}, kicker: '顶楼 · 适合谁',
    bg: {src: V('mixkit_guangzhou_lights'), video: true, dark: 0.6},
    beats: [{k: 'b2', t: '稀缺优势', x: R1, y: 300, tone: 'gold', icon: '★'}],
    data: {chips: [{t: '喜欢安静', tone: 'green'}, {t: '重视隐私', tone: 'green'}],
      line1: '喜欢安静的人', line2: '顶楼值得看',
      sub: '这些优势，不是每个楼层都有',
      media: {src: G('downpayment.jpg'), label: '顶楼露台', tag: '概念图'},
      callout: '优势{不是每层都有}', icon: '▲'}},

  {id: 'S11', layout: 'mediaRows', at: {cue: 53}, anchors: {media: '记住', r0: '销售', r1: '实际', r2: '资料', b0: '记住', b1: '防水'}, kicker: '顶楼 · 一定要记住',
    title: '防水好不好，{别只听销售}',
    bg: {src: G('hidden_costs.jpg'), dark: 0.6},
    beats: [{k: 'b0', t: '一定记住', x: R1, y: 300, tone: 'gold', icon: '!'}, {k: 'b1', t: '防水好不好？', x: 409, y: 300, icon: '?'}],
    data: {media: {src: G('mortgage.jpg'), label: '实地查验', tag: '概念图'},
      rows: [{t: '销售说的', s: '只能当参考', k: '提醒'}, {t: '查验实际情况', s: '看屋顶、墙角', k: '实地'}, {t: '查相关资料', s: '心里才有底', k: '资料'}]}},

  {id: 'S12', layout: 'timeline', at: {cue: 57}, anchors: {s0: '自住', s1: '实地', s2: '质量', note: '质量', b0: '建议', b1: '通风', b2: '噪音'}, kicker: '最后的建议 · 自住',
    title: '主要自住，{一楼顶楼都可以}',
    bg: {src: G('renovation.jpg'), dark: 0.58},
    beats: [{k: 'b0', t: '一个建议', x: R1, y: 300, tone: 'gold', icon: '✓'}, {k: 'b1', t: '通风', x: R1, y: 470, icon: '≋'}, {k: 'b2', t: '噪音', x: R1, y: 600, icon: '♪'}],
    data: {steps: [
      {t: '主要自住', s: '一楼顶楼都可以考虑', chip: '前提'},
      {t: '一定要实地看', s: '采光 · 通风 · 噪音', chip: '必做'},
      {t: '房屋实际质量', s: '亲自确认', chip: '必看'}],
      note: {t: '自住，{一定要实地看}'}}},

  {id: 'S12b', layout: 'quoteStack', at: {cue: 62}, anchors: {q1: '转手', sub0: '谨慎', r0: '谨慎', r1: '人群', r2: '出售', warn: '让步', b0: '转手', b1: '有限'}, kicker: '最后的建议 · 转手',
    bg: {src: V('mixkit_city_night_aerial_river'), video: true, dark: 0.55},
    beats: [{k: 'b0', t: '在意转手', x: R1, y: 300, tone: 'coral', icon: '!'}],
    data: {quote: '在意转手\n要更谨慎', sub: '接受人群通常更有限',
      rows: [{t: '更加谨慎', s: '想清楚再下手', k: '态度'}, {t: '接受人群', s: '通常更有限', k: '原因'}, {t: '未来出售', s: '可能要做出让步', k: '结果'}],
      warn: '出售时，{可能要在价格上让步}'}},

  {id: 'S13', layout: 'quoteStack', at: {cue: 66}, anchors: {q1: '楼层', sub0: '匹配', r0: '便宜', r1: '优点', r2: '缺点', warn: '范围', b0: '一句话', b1: '前提'}, kicker: '记住一句话',
    bg: {src: V('mixkit_skyscraper_panorama'), video: true, dark: 0.55},
    beats: [{k: 'b0', t: '记住', x: R1, y: 300, tone: 'gold', icon: '★'}, {k: 'b1', t: '值得买前提', x: R1, y: 470, tone: 'green', icon: '✓'}],
    data: {quote: '没有不能买的\n楼层', sub: '只有价格和缺点不匹配的房子',
      rows: [{t: '便宜了多少', s: '不是前提', k: '误区'}, {t: '优点', s: '足够突出', k: '前提'}, {t: '缺点', s: '在接受范围之内', k: '前提'}],
      warn: '价格和缺点，{要匹配}'}},

  {id: 'S14', layout: 'outroHost', at: {cue: 73}, fx: 1.6,
    bg: {src: G('dust_site.jpg'), dark: 0.45},
    data: {eyebrow: '同一个小区，价格差不多', line: '{一楼}、顶楼还是中间层？',
      points: ['你会选哪一个？'],
      account: '极限小滕 · 房产科普'}},
] as any[]).map((s) => ({fx: FX, ...s})) as Shot[];
