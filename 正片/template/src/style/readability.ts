/** 亮度、对比度和亮底文字处理。输入是颜色或采样值，不看截图。 */
import {FOG, fogFill, type FogTone} from './tokens.ts';

export type RGB = [number, number, number];
const lin = (c: number) => { const x = c / 255; return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
export const relL = (rgb: RGB) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
export const contrastRatio = (a: RGB, b: RGB) => {
  const L1 = relL(a), L2 = relL(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
};
export const parseRgb = (hex: string): RGB => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const parseRgba = (s: string): {rgb: RGB; a: number} => {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return {rgb: [250, 243, 231], a: 0.74};
  const p = m[1].split(',').map((x) => Number(x.trim()));
  return {rgb: [p[0], p[1], p[2]], a: p[3] ?? 1};
};
const mix = (fg: RGB, a: number, bg: RGB): RGB => fg.map((v, i) => v * a + bg[i] * (1 - a)) as RGB;
const scale = (rgb: RGB, k: number): RGB => rgb.map((v) => Math.max(0, Math.min(255, v * k))) as RGB;

/** 卡面 = 背景先 brightness 1.12，再叠填充（上沿 α.74、下沿 α.64 取更暗的下沿做保守对比）。 */
export const cardFace = (bg: RGB, tone: FogTone = 'champ', lift = false): RGB => {
  const fill = fogFill(tone, lift);
  const parts = [...fill.matchAll(/rgba?\([^)]+\)/g)].map((m) => parseRgba(m[0]));
  const layer = parts[1] ?? parts[0];
  return mix(layer.rgb, layer.a, scale(bg, 1.12));
};

export type TextMode = 'legacy' | 'tx2' | 'bar';
/** L>0.45 或 P90>0.75 → 暖描边；L>0.65 → 再加右端渐隐的薄磨砂条；更暗则沿用原字影。 */
export const textTreatment = (L: number, p90 = L): TextMode => {
  if (L > 0.65) return 'bar';
  if (L > 0.45 || p90 > 0.75) return 'tx2';
  return 'legacy';
};
export const needsLift = (L: number) => L < 0.3;

/** 白天素材没有实测亮度时，用 bg.dark 估一个保守 L，只供渲染开关；检查仍用实测或函数值。 */
export const estimateLuma = (dark = 0.45) => (dark >= 0.52 ? 0.32 : 0.55);

export const inkOf = (tone: FogTone = 'champ') => parseRgb(FOG[tone].ink);

/** 深墨字对卡面的对比。不够时按升档：lift → α 提到由调用方再算 → 换更浅调。 */
export const inkContrast = (bg: RGB, tone: FogTone = 'champ') => {
  const plain = contrastRatio(inkOf(tone), cardFace(bg, tone, false));
  const lifted = contrastRatio(inkOf(tone), cardFace(bg, tone, true));
  return {plain, lifted, ok: plain >= 4.5 || (relL(bg) < 0.3 && lifted >= 4.5)};
};
