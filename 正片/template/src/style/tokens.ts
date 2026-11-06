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
/** 5.0 新定版：遗留 spring 配置只作兼容，所有正片卡片使用下方有限单调入场。 */
export const SPRING = {
  enter: {damping: 26, stiffness: 150, mass: 0.78, overshootClamping: true},
  soft: {damping: 26, stiffness: 110, mass: 0.95, overshootClamping: true},
  snappy: {damping: 26, stiffness: 190, mass: 0.7, overshootClamping: true},
  cam: {damping: 26, stiffness: 90, mass: 1.1, overshootClamping: true},
};
export const MOTION = {enter: 16, stagger: 5, chip: 12, count: 32, focus: 12, freeze: 30, maxShift: 48};
export const GLASS_ENTER_FRAMES = {enter: 16, soft: 20, chip: 12};
export type GlassEnterKind = keyof typeof GLASS_ENTER_FRAMES;
/** 有限时长 ease-out cubic；范围严格 [0,1]，到位精确等于1，无过冲/回弹。 */
export const glassEnter = (frame: number, start = 0, kind: GlassEnterKind = 'enter', fps = 30) => {
  const t = Math.max(0, Math.min(1, (frame - start) / (GLASS_ENTER_FRAMES[kind] * fps / 30)));
  return t === 1 ? 1 : 1 - Math.pow(1 - t, 3);
};
/** 旧组件 spring 调用的稳定适配器；保留参数接口，不再调用物理弹簧。 */
export const steadySpring = ({frame, fps = 30, config = SPRING.enter}: {frame: number; fps?: number; config?: typeof SPRING.enter}) =>
  glassEnter(frame, 0, config === SPRING.soft ? 'soft' : config === SPRING.snappy ? 'chip' : 'enter', fps);

/** 5.0 新定版（玻璃v6 + 房产MG，2026-11-06 Asia/Shanghai）：唯一共享玻璃材质。
 *  对齐 classic_glass_ref：定版原冷灰色、偏薄的半透明玻璃，只降低基础透射，不做厚斜面/双边/重影。
 *  原 GLASS.dark alpha .56/.64 → .68/.74；背景仍可透见，文字更稳。无噪点、无扫描光条。 */
export const GLASS_V6 = {
  // 经典玻璃原组件本来不启用 backdrop blur；不再用 v5 的28px雾化抹掉背景细节。
  blur: 'none',
  fill: 'linear-gradient(165deg, rgba(62,64,72,0.68), rgba(38,40,48,0.74))',
  fillSoft: 'linear-gradient(165deg, rgba(62,64,72,0.62), rgba(38,40,48,0.68))',
  // 固定、宽而柔的镜面亮度渐变，不移动、不画扫光条，不刷白底。
  surfaceHighlight: 'linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.035) 38%, rgba(255,255,255,0) 60%)',
  hair: 'rgba(255,255,255,0.22)', top: 'rgba(255,255,255,0.26)', bottom: 'rgba(0,0,0,0.12)',
  shadow: '0 8px 20px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.12)',
  textShadow: '0 1px 2px rgba(0,0,0,0.30)',
  ink: '#F4EEE4', sub: '#CEC6B9', faint: 'rgba(244,238,228,0.48)',
  gold: '#E6C285', goldFill: 'linear-gradient(90deg, #F3D79E, #D9B26F)', coral: '#F08D78', green: '#A3D0BE', blue: '#AFC8E2',
  badge: {gold: '#B98B47', coral: '#D2624D', green: '#528E7B', blue: '#5D84AA', none: '#6A6C76'},
  line: 'rgba(255,255,255,0.12)', track: 'rgba(255,255,255,0.14)', tick: 'rgba(244,238,228,0.48)', well: 'rgba(255,255,255,0.045)',
  // 沿用语义配色，仅将染色强度约 .30 降到 .08–.10，不让玻璃变成彩色实心块。
  tint: {gold: 'rgba(159,123,61,0.10)', coral: 'rgba(162,91,80,0.10)', green: 'rgba(51,131,112,0.08)', blue: 'rgba(67,107,157,0.08)', none: 'rgba(0,0,0,0)'},
};

/** FROST 是新默认；GLASS 仅为旧调用的兼容视图，dark/light 不再分成两套质感。 */
export const FROST = GLASS_V6;
const classic = {fill: GLASS_V6.fill, hair: GLASS_V6.hair, top: GLASS_V6.top};
export const GLASS = {
  ...GLASS_V6, sheen: GLASS_V6.surfaceHighlight, dark: classic, light: classic,
};
