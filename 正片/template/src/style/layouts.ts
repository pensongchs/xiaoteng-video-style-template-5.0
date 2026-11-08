import {FULL, rect, splitRows, ROWS, CONTENT_H, type Rect} from './grid.ts';

export type LayoutName =
  | 'titleFloat' | 'bareNumber' | 'splitVs' | 'timeline'
  | 'mediaRows' | 'quoteStack' | 'ringFeature' | 'waitVs'
  | 'triadSoft' | 'outroAir' | 'outroHost'
  // 5.0 数据版式
  | 'lineReveal' | 'barGlow' | 'rankBars' | 'waffle' | 'balance' | 'yearRing' | 'formulaCalc'
  // 5.0 旧6套存档（兼容，不默认推荐）
  | 'keywordCascade' | 'checklistFill' | 'vsScore' | 'tipStack' | 'numberedReveal' | 'kpiGrid'
  // 5.0 房产科普 MG（已定 9 种，mgEstate.tsx）
  | 'floorLadder' | 'paymentSplit' | 'amenityOrbit' | 'pitfallBoard'
  | 'priceStep' | 'decisionFork' | 'districtTags' | 'loanDial' | 'layerReveal';

/** 5.0 新定版（玻璃v6 + 房产MG）：推荐/预览的唯一机器可读清单。 */
export const CORE_LAYOUTS = ['titleFloat','bareNumber','splitVs','timeline','mediaRows','quoteStack','ringFeature','waitVs','triadSoft','outroHost'] as const;
export const DATA_LAYOUTS = ['lineReveal','barGlow','rankBars','waffle','balance','yearRing','formulaCalc'] as const;
export const ESTATE_LAYOUTS = ['floorLadder','paymentSplit','amenityOrbit','pitfallBoard','priceStep','decisionFork','districtTags','loanDial','layerReveal'] as const;
export const ARCHIVE_LAYOUTS = ['keywordCascade','checklistFill','vsScore','tipStack','numberedReveal','kpiGrid'] as const;
export const DEFAULT_LAYOUTS: readonly LayoutName[] = [...CORE_LAYOUTS, ...DATA_LAYOUTS, ...ESTATE_LAYOUTS];
export const canonicalLayout = (name: string) => name === 'outroAir' ? 'outroHost' : name;
export const isDefaultLayout = (name: string) => DEFAULT_LAYOUTS.includes(canonicalLayout(name) as LayoutName);

/**
 * 各版式「独立 MG 组」矩形。规则：
 *  - 只用 rect/cols/splitRows，禁止手写坐标；
 *  - 独立组之间 ≥48px：左右相邻的组之间空出一整栏（≥154px），上下用 splitRows 默认 48；
 *  - 以 conn 开头的是连接件（箭头），只需 ≥24。
 */
export const layoutRects = (name: LayoutName, n = 3, opt: {character?: boolean; windows?: boolean} = {}): Record<string, Rect> => {
  switch (name) {
    case 'titleFloat': {
      const [mediaR, callR] = splitRows(ROWS.contentTop, CONTENT_H, [66, 34]);
      return {title: rect(0, 6, FULL), media: rect(7, 5, mediaR), callout: rect(7, 5, callR)};
    }
    case 'bareNumber':
      return {number: rect(0, 6, FULL), media: rect(7, 5, FULL)};
    case 'splitVs': {
      const [top, bot] = splitRows(ROWS.contentTop, CONTENT_H, [54, 46]);
      return {mediaL: rect(0, 5, top), mediaR: rect(7, 5, top), dataL: rect(0, 5, bot), dataR: rect(7, 5, bot),
        connArrow: rect(5, 2, {y: top.y + top.h / 2 - 20, h: 40})};
    }
    case 'timeline': {
      const [steps, lower] = splitRows(ROWS.contentTop, CONTENT_H, opt.windows ? [35, 65] : [70, 30]);
      return {steps: rect(0, 12, steps), [opt.windows ? 'windows' : 'note']: rect(0, 12, lower)};
    }
    case 'mediaRows':
      return {media: rect(0, 5, FULL), rows: rect(6, 6, FULL)};
    case 'quoteStack': {
      const [rows, warn] = splitRows(ROWS.contentTop, CONTENT_H, [74, 26]);
      return {quote: rect(0, 5, FULL), rows: rect(6, 6, rows), warn: rect(6, 6, warn)};
    }
    case 'ringFeature': {
      const [ring, a] = splitRows(ROWS.contentTop, CONTENT_H, [54, 46]);
      return {media: rect(0, 6, FULL), ring: rect(7, 5, ring), a: rect(7, 5, a)};
    }
    case 'waitVs': {
      const [img, num] = splitRows(ROWS.contentTop, CONTENT_H, [50, 50]);
      return {mediaL: rect(0, 5, img), mediaR: rect(7, 5, img), numL: rect(0, 5, num), numR: rect(7, 5, num),
        connArrow: rect(5, 2, {y: num.y + 70, h: 40})};
    }
    case 'triadSoft': {
      const [top, note] = splitRows(ROWS.contentTop, CONTENT_H, [66, 34]);
      return {c0: rect(0, 3, top), c1: rect(4, 4, top), c2: rect(9, 3, top), note: rect(0, 12, note)};
    }
    case 'outroAir':
    case 'outroHost': {
      // 片尾：小滕默认出镜，占左侧约 1/3 宽、底边贴画面底；文案在右 5–11 栏分层排版。character:false 时文案居中
      const band = {y: ROWS.contentTop - 40, h: CONTENT_H + 40};
      return opt.character
        ? {character: {x: 40, y: 250, w: 620, h: 830}, text: rect(5, 7, band)}
        : {text: rect(2, 8, band)};
    }
    // ===== 5.0 数据版式（尺寸「协调合理」：内容约占矩形 55–75%，不用空卡片）=====
    case 'lineReveal': return {chart: rect(0, 10, FULL)};
    case 'barGlow': return {chart: rect(1, 9, FULL)};
    case 'rankBars': return {chart: rect(0, 11, {y: ROWS.contentTop + 52, h: 520})};
    case 'waffle': return {chart: rect(0, 11, {y: ROWS.contentTop + 20, h: 580})};
    case 'balance': return {chart: rect(0, 12, FULL)};
    case 'yearRing': return {chart: rect(0, 12, {y: ROWS.contentTop + 12, h: 600})};
    case 'formulaCalc': return {chart: rect(1, 10, {y: ROWS.contentTop + 52, h: 560})};
    // ===== 5.0 MG 卡片扩展 =====
    case 'keywordCascade': return {cards: rect(0, 7, FULL), media: rect(8, 4, FULL)};
    case 'checklistFill': return {list: rect(0, 7, FULL), media: rect(8, 4, FULL)};
    case 'vsScore': return {board: rect(0, 12, FULL)};
    case 'tipStack': return {stack: rect(0, 7, FULL), media: rect(8, 4, FULL)};
    case 'numberedReveal': return {cards: rect(0, 12, FULL)};
    case 'kpiGrid': return {grid: rect(0, 8, FULL), media: rect(9, 3, FULL)};
    // ===== 5.0 房产科普 MG（已定 9 种）=====
    case 'floorLadder': return {ladder: rect(0, 12, FULL)};
    case 'paymentSplit': {
      const [total, parts] = splitRows(ROWS.contentTop, CONTENT_H, [30, 70]);
      return {total: rect(0, 12, total), parts: rect(0, 12, parts)};
    }
    case 'amenityOrbit': return {orbit: rect(0, 12, FULL)};
    case 'pitfallBoard': return {head: rect(0, 4, FULL), list: rect(5, 7, FULL)};
    case 'priceStep': return {steps: rect(0, 12, FULL)};
    case 'decisionFork': {
      const q = {y: ROWS.contentTop, h: 140}; const conn = {y: q.y + q.h + 24, h: 130}; const out = {y: conn.y + conn.h + 24, h: ROWS.contentBottom - (conn.y + conn.h + 24)};
      return {q: rect(3, 6, q), connFork: rect(0, 12, conn), L: rect(0, 5, out), R: rect(7, 5, out)};
    }
    case 'districtTags': return {cloud: rect(0, 9, FULL), legend: rect(10, 2, FULL)};
    case 'loanDial': return {dial: rect(0, 6, FULL), stats: rect(7, 5, FULL)};
    case 'layerReveal': return {layers: rect(0, 7, FULL), score: rect(8, 4, FULL)};
    default:
      return {};
  }
};

export const titleRect = (): Rect => ({x: 96, y: ROWS.titleY, w: 1536, h: ROWS.titleH});
export const usesTitle = (name: LayoutName) =>
  name !== 'titleFloat' && name !== 'outroAir' && name !== 'outroHost' && name !== 'quoteStack';
