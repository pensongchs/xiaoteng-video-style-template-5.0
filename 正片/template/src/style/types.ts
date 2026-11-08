import type {LayoutName} from './layouts.ts';
export type Media = {src: string; video?: boolean; label?: string; tag?: string; trim?: number};
export type ChipT = {t: string; tone?: 'gold' | 'glass' | 'coral' | 'green'};
export type Num = {label: string; value: number; dec?: number; sep?: boolean; unit: string; chip?: ChipT; ratio?: number};
export type TimelineWindow = {label: string; src: string};
export type Shot = {
  id: string; layout: LayoutName;
  /** 本镜从哪句口播开始：cue=字幕序号(1 起) / text=句中文字 / ms=毫秒。第一镜固定从 0 开始 */
  at?: {cue?: number; text?: string; ms?: number};
  /** 动效锚点：键 → 对应短句的开头、关键词起音或字幕序号。元素随口播开始入场 */
  anchors?: Record<string, string | number>;
  /** 旧版固定秒数，仅在没有 at 时兜底（不推荐） */
  sec?: number; kicker?: string; title?: string;
  /** 可选城市名。只在填写时显示为栏目行前缀（如「杭州 · 第一笔账」）；模板默认不写城市 */
  city?: string;
  /** 本镜主动画名。相邻镜不得相同，一期至少 6 种（check-layout 会查） */
  motion?: string;
  bg: Media & {blur?: number; dark?: number};
  /** 本镜字幕保留文字和投影，去掉胶囊底。 */
  bareSubtitles?: boolean;
  data: any;
};
/** 片尾数据：文字只来自当期片尾文案；禁止「点赞/关注/收藏/转发」类引导语（模板会自动过滤）。
 *  character 默认用小滕挥手形象，传 false 关闭；account 为可选小字署名 */
export type OutroData = {
  eyebrow?: string; line: string; points?: string[]; note?: string; account?: string; character?: string | false;
};
