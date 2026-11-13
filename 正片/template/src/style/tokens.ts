export const COLOR = {
  ink: '#121110', graphite: '#1d1b19', warm: '#F4EEE4', sub: 'rgba(244,238,228,0.78)',
  gold: '#D9B26F', goldHi: '#F3D79E', goldDeep: '#9C7536', coral: '#E0715C', green: '#8DB89A', pearlInk: '#1d1b19',
};
export const FONT = {title: 'PuHui', body: 'Health', num: "ArialB, Arial, 'Helvetica Neue', Helvetica, sans-serif"};
/** 字号 px @1920×1080。正文/说明 ≥34，标签/胶囊/序号/面积 ≥28，房间名 ≥30 */
export const TYPE = {
  kicker: 30, title: 80, heroTitle: 92, number: 150, quote: 60, rowTitle: 40, body: 34, label: 28, chip: 28, ringValue: 52, room: 30,
};
export const MIN_FONT = {any: 28, body: 34, label: 28, room: 30};
/** 排版规则（检查脚本强制） */
export const RULE = {
  mgGap: 48,        // 独立 MG 组之间最小间距
  innerGap: 24,     // 组内元素
  pad: 32,          // 卡片内边距 / 文字到卡边
  fillMax: 0.75,    // 文字宽 / 容器宽 上限
  lineHeight: 1.3,  // 多行文字最小行高倍数
  titleChars: 14,
  cardTitleChars: 8,
  bodyChars: 16,
  bodyLines: 2,
  chipChars: 6,
};
export const RADIUS = {card: 36, frame: 32, chip: 999, badge: 0.3};
/** 中景卡片的透视。整组共用一个平面，避免连线和卡边错开。 */
export const DEPTH = {perspective: 1240, rotateY: 12, rotateX: 3.5, cardYaw: 8, origin: '36% 60%'};
/** 5.0 新定版：遗留 spring 配置只作兼容，所有正片卡片使用下方有限单调入场。 */
export const SPRING = {
  enter: {damping: 26, stiffness: 150, mass: 0.78, overshootClamping: true},
  soft: {damping: 26, stiffness: 110, mass: 0.95, overshootClamping: true},
  snappy: {damping: 26, stiffness: 190, mass: 0.7, overshootClamping: true},
  cam: {damping: 26, stiffness: 90, mass: 1.1, overshootClamping: true},
};
export const MOTION = {enter: 16, stagger: 5, chip: 12, count: 32, focus: 12, freeze: 30, maxShift: 48};
export const GLASS_ENTER_FRAMES = {enter: 16, shaped: 18, soft: 20, chip: 12};
export type GlassEnterKind = keyof typeof GLASS_ENTER_FRAMES;
/** 有限时长 ease-out；范围严格 [0,1]，到位精确等于1，无过冲/回弹。异形卡用 quint，其余 cubic。 */
export const glassEnter = (frame: number, start = 0, kind: GlassEnterKind = 'enter', fps = 30) => {
  const t = Math.max(0, Math.min(1, (frame - start) / (GLASS_ENTER_FRAMES[kind] * fps / 30)));
  if (t === 1) return 1;
  const exp = kind === 'shaped' ? 5 : 3;
  return 1 - Math.pow(1 - t, exp);
};
/** 旧组件 spring 调用的稳定适配器；保留参数接口，不再调用物理弹簧。 */
export const steadySpring = ({frame, fps = 30, config = SPRING.enter}: {frame: number; fps?: number; config?: typeof SPRING.enter}) =>
  glassEnter(frame, 0, config === SPRING.soft ? 'soft' : config === SPRING.snappy ? 'chip' : 'enter', fps);

/** 5.0 暖雾磨砂（v6.1，2026-11-12）：卡片唯一材质。模糊只发生在卡内，背景 blur 仍为 0。
 *  填充是香槟/暖纸一类浅暖半透，不是灰底也不是深色底。字用同色系深墨。 */
export const FOG_GRAIN = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.22'/></svg>\")";
export const FOG = {
  champ: {name: '香槟', fill0: 'rgba(250,243,231,0.74)', fill1: 'rgba(236,224,204,0.64)', ink: '#2A1E12'},
  paper: {name: '暖纸', fill0: 'rgba(246,238,220,0.74)', fill1: 'rgba(232,220,196,0.64)', ink: '#2A1E12'},
  navy: {name: '墨蓝', fill0: 'rgba(226,234,242,0.74)', fill1: 'rgba(206,218,230,0.64)', ink: '#10203A'},
  tea: {name: '柔茶绿', fill0: 'rgba(226,236,226,0.74)', fill1: 'rgba(206,222,208,0.64)', ink: '#10281C'},
  clay: {name: '淡陶土', fill0: 'rgba(242,230,218,0.74)', fill1: 'rgba(228,210,196,0.64)', ink: '#2A1E12'},
} as const;
export type FogTone = keyof typeof FOG;
export const fogFill = (tone: FogTone = 'champ', lift = false) => {
  const p = FOG[tone];
  const bump = (rgba: string) => lift ? rgba.replace(/0\.\d+\)$/, (a) => `${Math.min(0.96, Number(a.slice(0, -1)) + 0.1)})`) : rgba;
  return `linear-gradient(165deg, ${bump(p.fill0)}, ${bump(p.fill1)})`;
};
export const GLASS_V6 = {
  blur: 'blur(26px) saturate(1.3) brightness(1.12)',
  fill: fogFill('champ'),
  fillSoft: 'linear-gradient(165deg, rgba(250,243,231,0.66), rgba(236,224,204,0.56))',
  surfaceHighlight: 'linear-gradient(180deg, rgba(255,252,246,0.82) 0%, rgba(255,252,246,0.22) 11%, rgba(255,252,246,0) 30%)',
  grain: FOG_GRAIN,
  hair: 'rgba(255,248,240,0.78)',
  rim: 'rgba(150,176,186,0.42)',
  mist: 'rgba(168,160,190,0.20)',
  top: 'rgba(255,252,246,0.95)',
  bottom: 'rgba(255,244,220,0.46)',
  shadow: '0 8px 14px -4px rgba(48,30,12,0.46), 0 20px 36px -14px rgba(70,44,18,0.36), 0 0 36px rgba(196,154,90,0.32)',
  textShadow: 'none',
  ink: FOG.champ.ink, sub: FOG.champ.ink, faint: 'rgba(42,30,18,0.62)',
  gold: '#2A1E12', goldFill: 'linear-gradient(90deg, #E6C48A, #C4A15A)', coral: '#8A4034', green: '#1E5A40', blue: '#1A3E68',
  badge: {gold: '#8A6230', coral: '#8A4034', green: '#1E5A40', blue: '#1A3E68', none: '#2A1E12'},
  line: 'rgba(42,30,18,0.16)', track: 'rgba(42,30,18,0.10)', tick: 'rgba(42,30,18,0.45)', well: 'rgba(42,30,18,0.05)',
  tint: {gold: 'rgba(159,123,61,0.10)', coral: 'rgba(162,91,80,0.10)', green: 'rgba(51,131,112,0.08)', blue: 'rgba(67,107,157,0.08)', none: 'rgba(0,0,0,0)'},
  lift: 0.10,
};

/** FROST 是新默认；GLASS 仅为旧调用的兼容视图，dark/light 不再分成两套质感。 */
export const FROST = GLASS_V6;
const classic = {fill: GLASS_V6.fill, hair: GLASS_V6.hair, top: GLASS_V6.top};
export const GLASS = {
  ...GLASS_V6, sheen: GLASS_V6.surfaceHighlight, dark: classic, light: classic,
};
