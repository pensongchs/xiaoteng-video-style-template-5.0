// 暖雾磨砂新增 17 款。停稳坐标来自 scenes.ts；入场用 18 帧 quint，到位后不再移动。
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {glassMat} from './components';
import {FONT, FOG, FROST, fogFill, glassEnter, type FogTone} from './tokens';
import {layoutRects} from './layouts.ts';
import {sceneOf, type CardGeom} from './scenes.ts';
import {layoutPlan, planById, type Plan} from './floorplans.ts';
import type {Rect} from './grid.ts';

export type Starts = (i: number) => number;
const fogStyle = (tone: FogTone): React.CSSProperties => ({
  ...glassMat(),
  color: FOG[tone].ink,
  background: `${FROST.grain}, ${FROST.surfaceHighlight}, ${fogFill(tone)}`,
});

const CardFace: React.FC<{card: CardGeom; p: number}> = ({card, p}) => {
  const xs = card.poly.map((pt) => pt[0]), ys = card.poly.map((pt) => pt[1]);
  const left = Math.min(...xs), top = Math.min(...ys);
  const width = Math.max(...xs) - left, height = Math.max(...ys) - top;
  const clip = `polygon(${card.poly.map((pt) => `${((pt[0] - left) / width) * 100}% ${((pt[1] - top) / height) * 100}%`).join(',')})`;
  return <div style={{position: 'absolute', left, top, width, height, clipPath: clip, ...fogStyle(card.tone), opacity: Math.min(1, p), transform: `translateY(${(1 - p) * 28}px)`}}>
    {card.id === 'people' && card.marks?.map((m, i) => {
      const colors = ['#8AA4BE', '#C4A15A', '#A3C4B0', '#C4A090'];
      return <div key={'fig' + i} style={{position: 'absolute', left: m.x - left, top: m.y - top, width: m.w, height: m.h}}>
        <div style={{position: 'absolute', left: '50%', top: 8, width: Math.min(54, m.w * 0.5), height: Math.min(54, m.w * 0.5), marginLeft: -Math.min(27, m.w * 0.25), borderRadius: '50%', background: colors[i % 4]}} />
        <div style={{position: 'absolute', left: '18%', right: '18%', top: 68, bottom: 8, borderRadius: 28, background: colors[i % 4]}} />
      </div>;
    })}
    {card.texts.map((t, i) => <div key={i} data-role={t.role === 'body' ? 'body' : t.role === 'room' ? 'room' : 'label'} data-fit="card" style={{
      position: 'absolute', left: t.box.x - left, top: t.box.y - top, width: t.box.w, height: t.box.h,
      fontFamily: t.role === 'num' ? FONT.num : t.role === 'title' ? FONT.title : FONT.body,
      fontWeight: 700, fontSize: t.size, lineHeight: 1.3, color: FOG[card.tone].ink,
    }}>{t.text}</div>)}
  </div>;
};

const Lines: React.FC<{sceneName: string; p: number}> = ({sceneName, p}) => {
  const scene = sceneOf(sceneName);
  return <svg style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible', pointerEvents: 'none'}}>
    {scene.lines.map((ln) => {
      const d = ln.pts.map((pt, i) => `${i ? 'L' : 'M'}${pt[0]},${pt[1]}`).join(' ');
      const end = ln.pts[ln.pts.length - 1];
      return <g key={ln.id}>
        <path d={ln.d ?? d} fill="none" stroke={ln.color ?? '#C4A15A'} strokeWidth={ln.width} strokeLinecap="round" strokeLinejoin="round" pathLength={ln.d ? undefined : 1} strokeDasharray={ln.d ? undefined : '1 1'} strokeDashoffset={ln.d ? undefined : 1 - p} />
        {ln.dot && <circle cx={end[0]} cy={end[1]} r={5} fill={ln.color ?? '#C4A15A'} opacity={p} />}
      </g>;
    })}
  </svg>;
};

const FloorFig: React.FC<{plan: Plan; rect: Rect; p: number}> = ({plan, rect, p}) => {
  const {X, Y, scale} = layoutPlan(plan, rect);
  const flow = plan.flow.map((pt) => `${X(pt[0])},${Y(pt[1])}`).join(' ');
  const ext = plan.walls.filter((w) => w.kind === 'exterior');
  const minX = Math.min(...ext.map((w) => w.x)), maxX = Math.max(...ext.map((w) => w.x + w.w));
  const top = Math.min(...ext.map((w) => w.y));
  const dimY = Y(top) - 22;
  return <svg style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible'}}>
    <defs>
      <pattern id="wallHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" stroke="#CDB892" strokeWidth="1" />
      </pattern>
    </defs>
    {plan.walls.map((w, i) => {
      const x = X(w.x), y = Y(w.y), ww = Math.max(2, w.w * scale), hh = Math.max(2, w.h * scale);
      return <g key={i} opacity={p}>
        <rect x={x} y={y} width={ww} height={hh} fill="url(#wallHatch)" />
        <rect x={x} y={y} width={ww} height={hh} fill="none" stroke="#2A1E12" strokeWidth={w.kind === 'exterior' ? 2.2 : 1.5} />
      </g>;
    })}
    {plan.openings.map((o, i) => {
      const horiz = o.w >= o.h;
      const x = X(o.x), y = Y(o.y), w = Math.max(2, o.w * scale), h = Math.max(2, o.h * scale);
      if (o.type === 'window') {
        return <g key={i} opacity={p}>
          <rect x={x} y={y} width={w} height={h} fill="#F7F1E4" />
          {horiz ? [0.2, 0.5, 0.8].map((t) => <line key={t} x1={x - 3} x2={x + w + 3} y1={y + h * t} y2={y + h * t} stroke="#2A1E12" strokeWidth={t === 0.5 ? 1.6 : 1.1} />)
            : [0.2, 0.5, 0.8].map((t) => <line key={t} y1={y - 3} y2={y + h + 3} x1={x + w * t} x2={x + w * t} stroke="#2A1E12" strokeWidth={t === 0.5 ? 1.6 : 1.1} />)}
        </g>;
      }
      if (o.type === 'slider') {
        return <g key={i} opacity={p} stroke="#2A1E12" strokeWidth={1.3}>
          <line x1={x} x2={x + w} y1={y + h * 0.35} y2={y + h * 0.35} />
          <line x1={x} x2={x + w} y1={y + h * 0.65} y2={y + h * 0.65} />
        </g>;
      }
      if (!o.leaf.length) return null;
      const [hinge, tip] = o.leaf;
      const len = Math.hypot(tip[0] - hinge[0], tip[1] - hinge[1]);
      const closed: [number, number] = horiz ? [hinge[0] + (o.w >= o.h ? o.w : 0), hinge[1]] : [hinge[0], hinge[1] + o.h];
      const r = Math.max(8, len * scale);
      return <g key={i} opacity={p} stroke="#2A1E12" fill="none" strokeWidth={1.6}>
        <line x1={X(hinge[0])} y1={Y(hinge[1])} x2={X(tip[0])} y2={Y(tip[1])} />
        <path d={`M ${X(tip[0])} ${Y(tip[1])} A ${r} ${r} 0 0 1 ${X(closed[0])} ${Y(closed[1])}`} strokeDasharray="5 3" />
      </g>;
    })}
    <polyline points={flow} fill="none" stroke="#C4A15A" strokeWidth={2.5} strokeDasharray="7 5" opacity={p} />
    {plan.flow[0] && <polygon points={`${X(plan.flow[0][0])},${Y(plan.flow[0][1]) - 11} ${X(plan.flow[0][0]) - 7},${Y(plan.flow[0][1]) + 7} ${X(plan.flow[0][0]) + 7},${Y(plan.flow[0][1]) + 7}`} fill="#C4A15A" opacity={p} />}
    {plan.flow.at(-1) && <circle cx={X(plan.flow.at(-1)![0])} cy={Y(plan.flow.at(-1)![1])} r={5} fill="#C4A15A" opacity={p} />}
    {plan.rooms.map((r) => <g key={r.name} opacity={p}>
      <text x={X(r.x + r.w / 2)} y={Y(r.y + r.h / 2) - 2} textAnchor="middle" fontFamily="Health" fontWeight={700} fontSize={30} fill="#2A1E12">{r.name}</text>
      <text x={X(r.x + r.w / 2)} y={Y(r.y + r.h / 2) + 28} textAnchor="middle" fontFamily="Health" fontWeight={700} fontSize={28} fill="#5A4634">{(r.w * r.h / 1e6).toFixed(1)}㎡</text>
    </g>)}
    <g opacity={p} stroke="#2A1E12" fill="#2A1E12">
      <line x1={X(minX)} x2={X(maxX)} y1={dimY} y2={dimY} strokeWidth={1.4} />
      <line x1={X(minX)} x2={X(minX)} y1={dimY - 6} y2={dimY + 6} strokeWidth={1.4} />
      <line x1={X(maxX)} x2={X(maxX)} y1={dimY - 6} y2={dimY + 6} strokeWidth={1.4} />
      <text x={(X(minX) + X(maxX)) / 2} y={dimY - 8} textAnchor="middle" fontFamily="Health" fontSize={28} fontWeight={700}>{plan.dimension.mm}</text>
    </g>
    <g opacity={p} transform={`translate(${rect.x + rect.w - 56}, ${rect.y + 28})`}>
      <polygon points="0,-16 6,4 -6,4" fill="#2A1E12" />
      <text y={22} textAnchor="middle" fontFamily="Health" fontSize={28} fontWeight={700} fill="#2A1E12">北</text>
    </g>
  </svg>;
};

const CupFig: React.FC<{p: number}> = ({p}) => {
  const cup = sceneOf('paymentCup').cards.find((c) => c.id === 'cup')!;
  const [a, b, c, d] = cup.poly;
  const bands = [0.32, 0.43, 0.25];
  const fills = ['rgba(214,224,206,0.72)', 'rgba(236,214,176,0.62)', 'rgba(228,196,156,0.78)'];
  const yAt = (t: number) => a[1] + (d[1] - a[1]) * t;
  const xL = (t: number) => a[0] + (d[0] - a[0]) * t;
  const xR = (t: number) => b[0] + (c[0] - b[0]) * t;
  let acc = 0;
  const slices = bands.map((share, i) => {
    const t0 = acc; acc += share; const t1 = acc;
    return `${xL(t0)},${yAt(t0)} ${xR(t0)},${yAt(t0)} ${xR(t1)},${yAt(t1)} ${xL(t1)},${yAt(t1)}`;
  });
  const refT = 0.67;
  const label = cup.texts[0];
  return <svg style={{position: 'absolute', inset: 0, width: 1920, height: 1080, overflow: 'visible', opacity: p}}>
    <defs>
      <linearGradient id="cupFog" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(250,243,231,0.78)" />
        <stop offset="100%" stopColor="rgba(236,224,204,0.7)" />
      </linearGradient>
      <filter id="cupShade"><feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#5A3C1E" floodOpacity="0.28" /></filter>
    </defs>
    <polygon points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`} fill="url(#cupFog)" filter="url(#cupShade)" />
    <polygon points={slices[2]} fill={fills[2]} />
    <polygon points={slices[1]} fill={fills[1]} />
    <polygon points={slices[0]} fill={fills[0]} />
    <polygon points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`} fill="none" stroke="rgba(255,248,236,0.9)" strokeWidth={1.6} />
    <line x1={xL(refT) + 10} x2={xR(refT) - 86} y1={yAt(refT)} y2={yAt(refT)} stroke="#C4A15A" strokeWidth={2.4} strokeDasharray="7 4" />
    <text x={label.box.x} y={label.box.y + 26} fontFamily="Health" fontWeight={700} fontSize={28} fill="#2A1E12">{label.text}</text>
  </svg>;
};

const SectionFig: React.FC<{p: number}> = ({p}) => {
  const R = layoutRects('buildingSection');
  const tower = {x: R.section.x + 36, y: R.section.y + 16, w: 720, h: R.section.h - 32};
  const floors = 12;
  const slab = 8;
  const gap = (tower.h - slab * (floors + 1)) / floors;
  const coreW = 92;
  return <svg style={{position: 'absolute', inset: 0, width: 1920, height: 1080, overflow: 'visible', opacity: p}}>
    <rect x={tower.x} y={tower.y} width={tower.w} height={tower.h} fill="rgba(244,236,220,0.28)" stroke="#2A1E12" strokeWidth={2} />
    {Array.from({length: floors + 1}, (_, i) => {
      const y = tower.y + i * (gap + slab);
      return <rect key={i} x={tower.x} y={y} width={tower.w} height={slab} fill="#E4D2B4" stroke="#2A1E12" strokeWidth={1} />;
    })}
    <rect x={tower.x + 10} y={tower.y + slab} width={coreW} height={tower.h - slab * 2} fill="rgba(255,248,236,0.35)" stroke="#2A1E12" strokeWidth={1.2} />
    {Array.from({length: floors}, (_, i) => {
      const y = tower.y + slab + i * (gap + slab) + 4;
      const x0 = tower.x + 18;
      return <polyline key={i} points={`${x0},${y + gap - 10} ${x0 + 28},${y + 6} ${x0 + 56},${y + gap - 10}`} fill="none" stroke="#2A1E12" strokeWidth={1.2} />;
    })}
    {Array.from({length: floors}, (_, i) => {
      const y = tower.y + slab + i * (gap + slab);
      const x = tower.x + 16 + coreW;
      const uw = tower.w - coreW - 28;
      const wash = i < 3 ? 'rgba(232,210,170,0.45)' : i < 8 ? 'rgba(244,232,204,0.28)' : 'rgba(214,224,206,0.4)';
      return <g key={'u' + i}>
        <rect x={x} y={y + 2} width={uw} height={gap - 4} fill={wash} stroke="#2A1E12" strokeWidth={1} />
        <rect x={x + uw - 54} y={y + 4} width={46} height={Math.max(8, gap - 8)} fill="none" stroke="#2A1E12" strokeWidth={1} />
        <line x1={x + uw - 54} x2={x + uw - 8} y1={y + 4 + (gap - 8) / 2} y2={y + 4 + (gap - 8) / 2} stroke="#2A1E12" strokeWidth={0.8} />
      </g>;
    })}
  </svg>;
};

export const NewCardView: React.FC<{layout: string; st: Starts}> = ({layout, st}) => {
  const f = useCurrentFrame();
  const scene = sceneOf(layout);
  const p0 = glassEnter(f, st(0), 'shaped');
  return <>
    {layout === 'buildingSection' && <SectionFig p={p0} />}
    {layout === 'paymentCup' && <CupFig p={p0} />}
    <Lines sceneName={layout} p={p0} />
    {scene.planId && <FloorFig plan={planById(scene.planId)} rect={layoutRects('planSplit').plan} p={p0} />}
    {scene.cards.filter((c) => c.id !== 'cup').map((c) => {
      const i = scene.cards.indexOf(c);
      return <CardFace key={c.id} card={c} p={glassEnter(f, st(i), 'shaped')} />;
    })}
    {layout === 'archLight' && <Sun p={p0} />}
  </>;
};

const Sun: React.FC<{p: number}> = ({p}) => {
  const a = layoutRects('archLight').arch;
  const cx = a.x + a.w / 2, rad = (a.w - 48) / 2, cy = a.y + 36 + rad;
  const ang = Math.PI * (0.15 + 0.7 * p);
  const x = cx + Math.cos(Math.PI - ang) * (rad * 0.72);
  const y = cy - Math.sin(ang) * (rad * 0.42);
  return <div style={{position: 'absolute', left: x - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: '#E6C48A', opacity: p}} />;
};
