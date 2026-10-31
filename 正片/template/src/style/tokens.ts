export const COLOR = {
  ink: '#121110', graphite: '#1d1b19', warm: '#F4EEE4', sub: 'rgba(244,238,228,0.78)',
  gold: '#D9B26F', goldHi: '#F3D79E', goldDeep: '#9C7536', coral: '#E0715C', green: '#8DB89A', pearlInk: '#1d1b19',
};
export const FONT = {title: 'PuHui', body: 'Health', num: "ArialB, Arial, 'Helvetica Neue', Helvetica, sans-serif"};
/** 字号 px @1920×1080。手机可读底线：正文 ≥34，标签/胶囊 ≥26（检查脚本强制） */
export const TYPE = {
  kicker: 30, title: 80, heroTitle: 92, number: 150, quote: 60, rowTitle: 40, body: 34, label: 28, chip: 28, ringValue: 52,
};
export const MIN_FONT = {any: 26, body: 34};
/** 排版规则（检查脚本强制） */
export const RULE = {
  mgGap: 48,        // 独立 MG 组之间最小间距
  fillMax: 0.75,    // 文字宽 / 容器宽 上限
  lineHeight: 1.3,  // 多行文字最小行高倍数
};
export const RADIUS = {card: 26, frame: 24, chip: 999, badge: 0.3};
/** Q 弹弹簧（Remotion spring）：overshoot → settle，克制不卡通 */
export const SPRING = {
  enter: {damping: 13, stiffness: 150, mass: 0.78},   // 入场：轻过冲回弹
  soft:  {damping: 18, stiffness: 110, mass: 0.95},   // 柔和落地
  snappy:{damping: 11, stiffness: 190, mass: 0.7},    // 芯片/焦点：更脆一点
  cam:   {damping: 20, stiffness: 90,  mass: 1.1},    // 运镜：重、稳
};
export const MOTION = { // 帧 @30fps（5.0 运镜版：入场略长、位移略大以配合弹簧）
  enter: 24, stagger: 5, chip: 16, count: 32, focus: 12, freeze: 30, maxShift: 48,
};

/** 5.0 苹果磨砂玻璃材质（iOS/visionOS 风）：强模糊+饱和、半实底色、1px 内发丝边+顶部高光、柔阴影。
 *  dark = 深色背景上（默认，文字白）；light = 亮背景/珍珠卡（文字深）；tint 用于 gold/coral/green 着色玻璃。 */
export const GLASS = {
  // 不用 backdrop-filter：它在 opacity<1 / filter 的祖先（入场、转场、dim）下会换 backdrop root，
  // 导致卡片动画中“透明”、静止后“磨砂”来回闪。改为确定性的半透明着色 + 镜面高光，逐帧一致。
  blur: 'none',
  sheen: 'linear-gradient(160deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 38%, rgba(255,255,255,0) 60%)',
  dark:  {fill: 'linear-gradient(165deg, rgba(62,64,72,0.56), rgba(38,40,48,0.64))', hair: 'rgba(255,255,255,0.20)', top: 'rgba(255,255,255,0.22)'},
  light: {fill: 'linear-gradient(165deg, rgba(252,250,246,0.78), rgba(236,232,224,0.72))', hair: 'rgba(255,255,255,0.75)', top: 'rgba(255,255,255,0.95)'},
  shadow: '0 14px 36px rgba(0,0,0,0.32), 0 2px 6px rgba(0,0,0,0.18)',
  textShadow: '0 1px 2px rgba(0,0,0,0.35), 0 0 18px rgba(0,0,0,0.25)',
};
