/** 文案 → 画面。纯计算：意图、容量、反重复、色调。不截图。 */
import rules from '../../match_rules.json' with {type: 'json'};
import {ESTATE_LAYOUTS} from '../style/layouts.ts';

export const LAYOUT_KEY: Record<string, string> = {
  'orig:titleFloat': 'titleFloat', 'orig:bareNumber': 'bareNumber', 'orig:splitVs': 'splitVs', 'orig:timeline': 'timeline',
  'orig:mediaRows': 'mediaRows', 'orig:quoteStack': 'quoteStack', 'orig:ringFeature': 'ringFeature', 'orig:waitVs': 'waitVs',
  'orig:triadSoft': 'triadSoft', 'orig:outroHost': 'outroHost', 'orig:lineReveal': 'lineReveal', 'orig:barGlow': 'barGlow',
  'orig:rankBars': 'rankBars', 'orig:waffle': 'waffle', 'orig:balance': 'balance', 'orig:yearRing': 'yearRing', 'orig:formulaCalc': 'formulaCalc',
  'orig:loanDial': 'loanDial', 'orig:floorLadder': 'floorLadder', 'orig:paymentSplit': 'paymentSplit', 'orig:amenityOrbit': 'amenityOrbit',
  'orig:pitfallBoard': 'pitfallBoard', 'orig:priceStep': 'priceStep', 'orig:decisionFork': 'decisionFork', 'orig:districtTags': 'districtTags',
  'orig:layerReveal': 'layerReveal',
  'new1:ticket': 'ticketStub', 'new1:tabs': 'indexTabs', 'new1:pins': 'amenityPins', 'new1:split': 'slashCompare', 'new1:arch': 'archLight',
  'new2:cup': 'paymentCup', 'new2:curve': 'loanCurve', 'new2:contract': 'contractNote', 'new2:plan': 'planSplit', 'new2:section': 'buildingSection',
  'new2:lens': 'pitfallLens', 'new2:parking': 'parkingLines', 'new2:hex': 'hexSteps', 'new2:tag': 'inspectTags', 'new2:family': 'familyPlan',
  'new2:notes': 'policyNotes', 'new2:qa': 'qaBubbles',
};
const KEY_OF = Object.fromEntries(Object.entries(LAYOUT_KEY).map(([k, v]) => [v, k]));
const DATA_CHARTS = new Set(['lineReveal', 'barGlow', 'rankBars', 'waffle', 'balance', 'yearRing', 'formulaCalc']);
const ESTATE = new Set<string>(ESTATE_LAYOUTS);
const BANNED = /投资|一定|必涨/;

export type ShotIn = {text: string; count?: number; seconds?: number; evidenced?: boolean; title?: string; struct?: string};
export type History = {recentLayouts?: string[][]; signature?: string[]; pose?: string; media?: {id: string; episode: number; hero?: boolean}[]};
export type Pick = {
  intent: string; secondary?: string; layout: string; key: string; tone: string[]; broll: string; media?: string; mediaRelaxed?: boolean; pose?: string;
  score: number; seed: number; status: 'ok' | 'split' | 'manual'; note?: string;
};

/** 类别 → 仓库里已登记的素材。台账没有可用段时才放宽冷却。 */
export const BROLL_FILES: Record<string, string[]> = {
  '航拍城市': ['media/stock/mixkit_42334_day.mp4', 'media/stock/mixkit_skyscraper_panorama.mp4'],
  '小区外景': ['media/stock/mixkit_residential_above_day.mp4', 'media/gen/clean_complex.jpg'],
  '城市航拍': ['media/stock/mixkit_42330_day.mp4', 'media/stock/mixkit_admin_district_day.mp4'],
  '写字楼': ['media/stock/mixkit_2005_day.mp4', 'media/gen/mortgage.jpg'],
  '工地/新房': ['media/gen/dust_site.jpg', 'media/gen/new_vs_used.jpg'],
  '成熟小区': ['media/gen/clean_complex.jpg', 'media/stock/mixkit_42333_day.mp4'],
  '办事大厅/银行': ['media/gen/mortgage.jpg', 'media/stock/mixkit_4803_day.mp4'],
  '日历/钥匙': ['media/gen/hidden_costs.jpg', 'media/gen/downpayment.jpg'],
  '办事/签约': ['media/gen/mortgage.jpg', 'media/gen/hidden_costs.jpg'],
  '看房走动': ['media/gen/yl_viewroom.jpg', 'media/stock/yl_v_viewroom.mp4'],
  '航拍道路': ['media/gen/main_road.jpg', 'media/stock/mixkit_42332_day.mp4'],
  '地铁口': ['media/gen/main_road.jpg', 'media/stock/mixkit_42333_day.mp4'],
  '室内采光': ['media/gen/interior_warm.jpg', 'media/gen/west_sun.jpg'],
  '阳台': ['media/gen/yl_terrace.jpg', 'media/gen/yl_yard.jpg'],
  '楼栋外立面': ['media/gen/clean_complex.jpg', 'media/stock/mixkit_residential_above_day.mp4'],
  '墙面/水渍特写': ['media/gen/water_stain.jpg', 'media/gen/wall_waterproof.jpg'],
  '屋顶': ['media/gen/yl_roof.jpg', 'media/stock/yl_v_roof.mp4'],
  '验房实拍': ['media/gen/yl_inspect.jpg', 'media/stock/yl_v_viewroom.mp4'],
  '书桌计算器': ['media/gen/hidden_costs.jpg', 'media/gen/downpayment.jpg'],
  '钥匙/房模': ['media/gen/downpayment.jpg', 'media/gen/renovation.jpg'],
  '签约桌面': ['media/gen/mortgage.jpg', 'media/gen/hidden_costs.jpg'],
  '政务大厅': ['media/stock/mixkit_4803_day.mp4', 'media/gen/mortgage.jpg'],
  '街景': ['media/gen/main_road.jpg', 'media/stock/mixkit_42332_day.mp4'],
  '人物看房': ['media/gen/yl_viewroom.jpg', 'media/gen/interior_warm.jpg'],
  '黄昏/暖光外景': ['media/gen/waterfront_dusk.jpg', 'media/stock/coverr_evening_coast.mp4'],
  '明亮客厅': ['media/gen/interior_warm.jpg', 'media/gen/outro_windows.jpg'],
};

export const pickMedia = (categories: string[], ledger: {id: string; episode: number; hero?: boolean}[], episodeNo: number, usedNow: Set<string>, hero = false) => {
  const pool = categories.flatMap((c) => BROLL_FILES[c] ?? []);
  const last = (id: string) => ledger.filter((m) => m.id === id).map((m) => m.episode).sort((a, b) => b - a)[0];
  const ok = (id: string, cool: number) => !usedNow.has(id) && (last(id) == null || episodeNo - last(id)! >= cool);
  const cool = hero ? rules.anti_repeat.hero_media_cooldown_episodes : rules.anti_repeat.media_cooldown_episodes;
  const fresh = pool.find((id) => ok(id, cool));
  if (fresh) return {id: fresh, relaxed: false};
  const relaxed = pool.find((id) => ok(id, 2));
  if (relaxed) return {id: relaxed, relaxed: true};
  return {id: undefined as string | undefined, relaxed: true};
};

export const hashSeed = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};

const family = (key: string) => key.startsWith('new') ? 'new' : key.includes('outro') ? 'outro' : 'orig';
const fits = (key: string, shot: ShotIn) => {
  const n = shot.count ?? 3;
  if ((shot.seconds ?? 4) < 2.5) return key === 'orig:titleFloat';
  if (key === 'new2:hex') return n === 4;
  if (key === 'new2:curve' || key === 'orig:timeline') return n >= 3 && n <= 5;
  if (key === 'new1:ticket') return n <= 3;
  if (key === 'new1:pins' || key === 'new2:parking') return n <= 3;
  if (key === 'new2:tag') return n >= 3 && n <= 5;
  if (key === 'new2:contract') return n >= 2 && n <= 3;
  if (key === 'new1:split') return n <= 3;
  return true;
};

const scoreIntents = (text: string, shot: ShotIn, index: number, total: number) => {
  const out: Record<string, number> = {};
  for (const [name, spec] of Object.entries(rules.intents) as [string, any][]) {
    let s = 0;
    for (const kw of spec.kw as string[]) if (text.includes(kw)) s += 1;
    if (spec.needs_number && /\d|%|百分之/.test(text)) s += 2;
    if (spec.pos === 'first' && index === 0) s += 2;
    if (spec.pos === 'last' && index === total - 1) s += 2;
    if (spec.struct && shot.struct === spec.struct) s += 2;
    out[name] = s;
  }
  return out;
};

const rankIntents = (scores: Record<string, number>) => Object.entries(scores)
  .sort((a, b) => b[1] - a[1] || rules.priority.indexOf(a[0]) - rules.priority.indexOf(b[0]));

type Used = {counts: Record<string, number>; at: Record<string, number>; newMax: number; forceOff: boolean; ignoreRecent: boolean; neu: number; estate: number; total: number; index: number};

const choose = (intent: string, shot: ShotIn, index: number, used: Used, hist: History, seed: number, evidenced: boolean): {key: string; score: number; status: Pick['status']; note?: string} => {
  const spec = (rules.intents as any)[intent];
  const pool: Record<string, number> = spec?.layouts ?? {};
  let keys = Object.keys(pool);
  if (!keys.length) keys = [...rules.fallback_layouts];
  const recent = new Map<string, number>();
  (hist.recentLayouts ?? []).forEach((eps) => eps.forEach((name) => recent.set(name, (recent.get(name) ?? 0) + 1)));
  const lastForIntent = new Set((hist.recentLayouts ?? [])[0] ?? []);
  const hard = (key: string, relax: 'none' | 'topic' | 'newmax') => {
    const name = LAYOUT_KEY[key] ?? key;
    if (!fits(key, shot)) return false;
    if (!evidenced && DATA_CHARTS.has(name)) return false;
    if (BANNED.test(shot.title ?? '') || BANNED.test(shot.text)) return false;
    const prev = used.at[name];
    if (prev != null && index - prev < 3) return false;
    const fam = family(key);
    const max = fam === 'new' ? (relax === 'newmax' ? 2 : used.newMax) : fam === 'outro' ? 1 : rules.anti_repeat.layout_max_per_episode.orig;
    if ((used.counts[name] ?? 0) >= max) return false;
    if (!used.forceOff && relax === 'none' && rules.anti_repeat.same_topic_signature_force_alternate && hist.signature && lastForIntent.has(name) && keys.length > 1) return false;
    return true;
  };
  const scoreOf = (key: string) => {
    const name = LAYOUT_KEY[key] ?? key;
    const cap = fits(key, shot) ? 1 : 0;
    const recentHits = used.ignoreRecent ? 0 : (recent.get(name) ?? 0);
    let bonus = 0;
    const late = used.index >= used.total - 4;
    if (used.total >= 8 && used.neu < 2 && late && key.startsWith('new')) bonus += 0.55;
    if (used.total >= 8 && used.estate < 2 && late && ESTATE.has(name)) bonus += 0.55;
    if (key.startsWith('new') && used.neu >= 4) bonus -= 3;
    return (pool[key] ?? 0.5) * cap - recentHits * rules.anti_repeat.recent_episode_penalty.per_hit + bonus;
  };
  let relax: 'none' | 'topic' | 'newmax' = 'none';
  let cands = keys.filter((k) => hard(k, relax) && scoreOf(k) > 0);
  if (!cands.length) { used.ignoreRecent = true; cands = keys.filter((k) => hard(k, relax) && fits(k, shot)); }
  if (!cands.length) { relax = 'topic'; used.forceOff = true; cands = keys.filter((k) => hard(k, relax)); }
  if (!cands.length) { relax = 'newmax'; cands = keys.filter((k) => hard(k, relax)); }
  if (!cands.length) return {key: 'orig:titleFloat', score: 0, status: 'manual', note: '需人工'};
  cands.sort((a, b) => scoreOf(b) - scoreOf(a));
  const best = scoreOf(cands[0]);
  const band = cands.filter((k) => best - scoreOf(k) <= 0.10);
  const key = band[seed % band.length];
  return {key, score: scoreOf(key), status: relax === 'none' ? 'ok' : 'split'};
};

export const matchEpisode = (shots: ShotIn[], meta: {episode?: string; title?: string; history?: History} = {}): Pick[] => {
  const seed = hashSeed(`${meta.episode ?? '0'}${meta.title ?? ''}`);
  const hist = meta.history ?? {};
  const episodeNo = Number(meta.episode ?? 0) || 0;
  const usedMedia = new Set<string>();
  const total = shots.length;
  const used: Used = {counts: {}, at: {}, newMax: 1, forceOff: false, ignoreRecent: false, neu: 0, estate: 0, total, index: 0};
  const intents = shots.map((shot, i) => {
    const scores = scoreIntents(shot.text, shot, i, total);
    const ranked = rankIntents(scores).filter(([, s]) => s > 0);
    return {primary: ranked[0]?.[0] ?? '', secondary: ranked[1] && ranked[1][1] >= ranked[0][1] * 0.6 ? ranked[1][0] : undefined, scores};
  });
  const signature = intents.slice(0, 3).map((x) => x.primary).filter(Boolean);
  if (hist.signature && signature.join('|') === hist.signature.join('|')) used.forceOff = false;
  return shots.map((shot, index) => {
    const banned = BANNED.test(shot.title ?? '') || BANNED.test(shot.text);
    const intent = intents[index].primary || 'hook';
    const spec = (rules.intents as any)[intent] ?? (rules.intents as any).hook;
    const evidenced = shot.evidenced !== false && !banned;
    used.index = index;
    const picked = choose(intents[index].primary || '', shot, index, used, hist, seed + index, evidenced);
    const name = LAYOUT_KEY[picked.key] ?? 'titleFloat';
    used.counts[name] = (used.counts[name] ?? 0) + 1;
    used.at[name] = index;
    if (picked.key.startsWith('new')) used.neu += 1;
    if (ESTATE.has(name)) used.estate += 1;
    const tone = (spec.tone as string[]).slice(0, rules.anti_repeat.tones_per_frame_max);
    const pose = spec.outro_pose as string | undefined;
    const broll = (spec.broll as string[])[seed % (spec.broll as string[]).length];
    const hero = index === 0 || index === total - 1;
    const media = pickMedia(spec.broll as string[], hist.media ?? [], episodeNo, usedMedia, hero);
    if (media.id) usedMedia.add(media.id);
    return {
      intent: intents[index].primary || 'fallback', secondary: intents[index].secondary, layout: name, key: picked.key,
      tone, broll, media: media.id, mediaRelaxed: media.relaxed, pose,
      score: picked.score, seed, status: banned ? 'manual' : picked.status,
      note: banned ? '标题含禁用词' : !shot.evidenced && DATA_CHARTS.has(name) ? '示例' : picked.note,
    };
  });
};

export const quotaFaults = (picks: Pick[]) => {
  const faults: string[] = [];
  const names = picks.map((p) => p.layout);
  const kinds = new Set(names);
  if (picks.length >= 8 && picks.length <= 12) {
    if (kinds.size < rules.anti_repeat.min_layout_kinds_8to12_shots) faults.push(`版式种类 ${kinds.size}`);
    const neu = names.filter((n) => KEY_OF[n]?.startsWith('new')).length;
    const [lo, hi] = rules.anti_repeat.new_cards_per_episode;
    if (neu < lo || neu > hi) faults.push(`新卡 ${neu} 不在 ${lo}–${hi}`);
    const estate = names.filter((n) => ESTATE.has(n)).length;
    if (estate < rules.anti_repeat.orig_estate9_min_per_episode) faults.push(`房产 MG ${estate}`);
  }
  names.forEach((n, i) => { if (i && n === names[i - 1]) faults.push(`相邻同版式 ${n}`); });
  picks.forEach((p) => { if (p.tone.length > 2) faults.push('色调超过 2'); });
  const medias = picks.map((p) => p.media).filter(Boolean) as string[];
  if (new Set(medias).size !== medias.length) faults.push('同期素材复用');
  return faults;
};

export {rules};
