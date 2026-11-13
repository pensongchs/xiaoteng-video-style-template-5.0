// 由 scripts/sample-luma.mjs 生成。渲染和检查都读这份实测值，缺文件时才退回 bg.dark 估算。
import table from '../demo/luma.json' with {type: 'json'};

export type LumaRow = {luma: number; p90: number};
const rows = table as Record<string, LumaRow>;

export const measuredLuma = (src?: string): LumaRow | undefined => (src ? rows[src] : undefined);

export const bgWithLuma = <T extends {src?: string; luma?: number; p90?: number; dark?: number}>(bg: T): T => {
  const row = measuredLuma(bg.src);
  if (!row) return bg;
  return {...bg, luma: bg.luma ?? row.luma, p90: bg.p90 ?? row.p90};
};
