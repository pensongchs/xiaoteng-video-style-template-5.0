// 字幕解析与排版（纯 Node，Windows / macOS / Linux 通用）
// 支持：SRT（句级）+ Remotion Caption JSON（[{text,startMs,endMs,timestampMs,confidence}]，逐词/逐字级）
export const PUNCT = /[，。、；：！？,!?;:…—“”"'‘’（）()《》【】\[\]·~～]/;
const PUNCT_G = new RegExp(PUNCT.source, 'g');

/** SRT → [{startMs,endMs,text}] */
export const parseSrt = (src) => {
  const ms = (t) => { const m = t.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/); if (!m) return NaN; return ((+m[1] * 60 + +m[2]) * 60 + +m[3]) * 1000 + +m[4].padEnd(3, '0').slice(0, 3); };
  return src.replace(/^\uFEFF/, '').replace(/\r/g, '').split(/\n\s*\n/).map((b) => b.trim().split('\n')).filter((l) => l.length >= 2)
    .map((l) => { const i = l.findIndex((x) => x.includes('-->')); if (i < 0) return null; const [a, b] = l[i].split('-->');
      return {startMs: ms(a), endMs: ms(b), text: l.slice(i + 1).join(' ').replace(/<[^>]+>/g, '').trim()}; })
    .filter((c) => c && Number.isFinite(c.startMs) && Number.isFinite(c.endMs) && c.text);
};

/** Caption JSON → [{text,startMs,endMs}]（按时间排序，丢弃空词） */
export const parseCaptions = (src) => {
  const j = JSON.parse(src.replace(/^\uFEFF/, '')); const arr = Array.isArray(j) ? j : j.captions || j.words || [];
  return arr.map((w) => ({text: String(w.text ?? '').trim(), startMs: +w.startMs, endMs: +(w.endMs ?? w.startMs)}))
    .filter((w) => w.text && Number.isFinite(w.startMs)).sort((a, b) => a.startMs - b.startMs);
};

/** 只有逐词 JSON 时：按标点 / 停顿 >350ms / 长度 >18 字分句 */
export const cuesFromWords = (words, maxW = 18) => {
  const out = []; let cur = null;
  for (const w of words) {
    const gap = cur ? w.startMs - cur.endMs : 0;
    if (cur && (gap > 350 || width(clean(cur.text + w.text)) > maxW)) { out.push(cur); cur = null; }
    cur = cur ? {...cur, endMs: w.endMs, text: cur.text + w.text} : {...w};
    if (PUNCT.test(w.text.slice(-1))) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out.map((c) => ({...c, text: c.text.trim()}));
};

/** 显示用文本：句中标点换成空格（保留小数点、百分号），去掉首尾标点 */
export const clean = (t) => t.replace(/(\d)[.．](\d)/g, '$1\u0000$2').replace(PUNCT_G, ' ').replace(/[.．]/g, ' ')
  .replace(/\u0000/g, '.').replace(/\s+/g, ' ').trim();
/** 视觉宽度（中文 1，半角 0.55） */
export const width = (t) => [...t].reduce((a, c) => a + (/[\x00-\xff]/.test(c) ? 0.55 : 1), 0);

/** 把字幕词按比例映射到句子的每个字，得到逐字时间（毫秒） */
export const charTimes = (cue, words) => {
  const chars = [...cue.text.replace(/\s/g, '')];
  const ws = words.filter((w) => w.startMs >= cue.startMs - 80 && w.startMs < cue.endMs);
  const N = chars.length; if (!N) return {chars, s: [], e: [], word: []};
  if (!ws.length) { // 没有逐词时间：按句内均分
    const step = (cue.endMs - cue.startMs) / N;
    return {chars, s: chars.map((_, i) => Math.round(cue.startMs + i * step)), e: chars.map((_, i) => Math.round(cue.startMs + (i + 1) * step)), word: chars.map(() => -1)};
  }
  const lens = ws.map((w) => Math.max(1, [...w.text.replace(PUNCT_G, '').replace(/\s/g, '')].length)); const M = lens.reduce((a, b) => a + b, 0);
  const s = [], e = [], word = []; let acc = 0;
  ws.forEach((w, k) => { const a = Math.round((acc * N) / M), b = Math.round(((acc + lens[k]) * N) / M); acc += lens[k];
    for (let i = a; i < b; i++) { const p0 = (i - a) / (b - a), p1 = (i - a + 1) / (b - a);
      s[i] = Math.round(w.startMs + p0 * (w.endMs - w.startMs)); e[i] = Math.round(w.startMs + p1 * (w.endMs - w.startMs)); word[i] = k; } });
  for (let i = 0; i < N; i++) if (s[i] == null) { s[i] = s[i - 1] ?? cue.startMs; e[i] = e[i - 1] ?? cue.endMs; word[i] = word[i - 1] ?? 0; }
  return {chars, s, e, word};
};

/**
 * 句 → 显示条：每条 1 行（≤maxW 字），过长时优先按时间拆成多条单行；
 * 没有逐词时间时才用 2 行。返回 [{startMs,endMs,lines:[[{t,s,e}]]}]
 */
export const layoutCue = (cue, words, maxW = 18) => {
  const txt = clean(cue.text); const ct = charTimes({...cue, text: txt}, words);
  // 把 clean 后的文本拆成 token（同一个词的字合在一起；空格单独）
  const toks = []; let ci = 0;
  for (const ch of [...txt]) {
    if (ch === ' ') { toks.push({t: ' ', s: null, e: null, w: -2}); continue; }
    const k = ct.word[ci]; const last = toks[toks.length - 1];
    if (last && last.w === k && k >= 0 && !/\s/.test(last.t)) { last.t += ch; last.e = ct.e[ci]; }
    else toks.push({t: ch, s: ct.s[ci], e: ct.e[ci], w: k});
    ci++;
  }
  // 数字串（含小数点、%）合成一个 token，避免逐位跳色
  for (let i = toks.length - 1; i > 0; i--) {
    const a = toks[i - 1], b = toks[i]; const num = /[0-9.%]/;
    if (a.t !== ' ' && b.t !== ' ' && num.test(a.t.slice(-1)) && num.test(b.t[0])) {
      // 把 a 里末尾的数字部分与 b 开头的数字部分合并
      const ma = a.t.match(/[0-9.%]+$/)[0], mb = b.t.match(/^[0-9.%]+/)[0];
      const merged = {t: ma + mb, s: a.s, e: b.e, w: a.w};
      const pre = a.t.slice(0, -ma.length), post = b.t.slice(mb.length);
      const rep = [];
      if (pre) rep.push({t: pre, s: a.s, e: a.s, w: a.w});
      rep.push(merged);
      if (post) rep.push({t: post, s: b.e, e: b.e, w: b.w});
      toks.splice(i - 1, 2, ...rep); i = Math.min(i + 1, toks.length);
    }
  }
  const W = (ts) => width(ts.map((x) => x.t).join('').trim());
  const trim = (ts) => { while (ts.length && ts[0].t === ' ') ts.shift(); while (ts.length && ts[ts.length - 1].t === ' ') ts.pop(); return ts; };
  // 切成每段 ≤maxW：在全部合法断点上做最优分段（DP），代价 = 断点自然度 + 段长均衡
  // 断点自然度：原标点(空格) > 语音停顿 > 普通词边界；避免「的/把/在…」结尾、「的/了/吗…」开头；避免 <5 字孤段
  const BAD_END = /[的把在跟和与被给对向从让]$/, BAD_START = /^[的了吗呢吧着过们地得啊]/;
  const bcost = (i) => { const p = toks[i - 1], q = toks[i]; if (p.t === ' ' || q.t === ' ') return 0;
    let c = 6; const pe = p.e, qs = q.s; if (pe != null && qs != null) { const g = qs - pe; if (g >= 250) c = 1; else if (g >= 120) c = 3; }
    if (!wb.has(tokPos[i - 1])) c += 40; if (BAD_END.test(p.t)) c += 8; if (BAD_START.test(q.t)) c += 8; const rt = toks.slice(i).map((x) => x.t).join(''); if (/^(还是|就|主要|看的是|便宜|但|而|所以|可是|不如|反倒|也|跟)/.test(rt)) c = Math.max(0, c - 6); if (/[0-9.%]$/.test(p.t) && /^[0-9.%]/.test(q.t)) c += 100; return c; };
  // 中文分词（Intl.Segmenter）得到自然词边界：断在词中间重罚
  const wb = new Set(); { let pos = 0; const segTxt = toks.map((x) => x.t).join('');
    for (const sg of new Intl.Segmenter('zh', {granularity: 'word'}).segment(segTxt)) { pos += sg.segment.length; wb.add(pos); } }
  const tokPos = []; { let p = 0; for (const x of toks) { p += x.t.length; tokPos.push(p); } }
  const L = toks.length; const total = W(toks); const chunks = [];
  if (total <= maxW) chunks.push(trim(toks.slice()));
  else {
    const best = new Array(L + 1).fill(Infinity), prev = new Array(L + 1).fill(-1), cnt = new Array(L + 1).fill(0); best[0] = 0;
    const nMin = Math.ceil(total / maxW), target = total / nMin;
    for (let j = 1; j <= L; j++) for (let i = 0; i < j; i++) { if (best[i] === Infinity) continue;
      const w = W(toks.slice(i, j)); if (w > maxW) continue; if (w === 0) continue;
      const brk = j < L ? bcost(j) : 0; const orphan = w < 5 ? 30 : 0; const bal = 0.06 * (w - target) ** 2;
      const v = best[i] + brk + orphan + bal + 10; if (v < best[j]) { best[j] = v; prev[j] = i; cnt[j] = cnt[i] + 1; } }
    if (best[L] === Infinity) chunks.push(trim(toks.slice()));
    else { const cuts = []; for (let j = L; j > 0; j = prev[j]) cuts.unshift([prev[j], j]); for (const [i, j] of cuts) chunks.push(trim(toks.slice(i, j))); }
  }
  const timed = toks.some((x) => x.w >= 0);
  const bounds = (c) => { const tt = c.filter((x) => x.s != null); return [tt[0]?.s ?? cue.startMs, tt[tt.length - 1]?.e ?? cue.endMs]; };
  if (!timed && chunks.length === 2) return [{startMs: cue.startMs, endMs: cue.endMs, lines: chunks.map(strip)}];
  return chunks.filter((c) => c.length).map((c, k, all) => { const [a] = bounds(c); const b = k < all.length - 1 ? bounds(all[k + 1])[0] : cue.endMs;
    return {startMs: k === 0 ? cue.startMs : a, endMs: b, lines: [strip(c)]}; });
};
const strip = (ts) => ts.map(({t, s, e}) => ({t, s, e}));
