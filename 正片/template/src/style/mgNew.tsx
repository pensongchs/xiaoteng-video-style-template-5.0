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
        <path d={d} fill="none" stroke="#2A1E12" strokeWidth={ln.width} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        {ln.kind === 'connector' && <circle cx={end[0]} cy={end[1]} r={5} fill="#2A1E12" opacity={p} />}
      </g>;
    })}
  </svg>;
};

const FloorFig: React.FC<{plan: Plan; rect: Rect; p: number}> = ({plan, rect, p}) => {
  const {X, Y, scale} = layoutPlan(plan, rect);
  const walls = plan.walls;
  const flow = plan.flow.map((pt) => `${X(pt[0])},${Y(pt[1])}`).join(' ');
  return <svg style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, overflow: 'visible'}}>
    {walls.map((w, i) => <rect key={i} x={X(w.x)} y={Y(w.y)} width={Math.max(1, w.w * scale)} height={Math.max(1, w.h * scale)}
      fill={w.kind === 'exterior' ? '#E7D7C0' : '#F3E6D2'} stroke="#2A1E12" strokeWidth={1.4} opacity={p} />)}
    {plan.openings.map((o, i) => {
      const horiz = o.w >= o.h;
      if (o.type === 'window') {
        const x = X(o.x), y = Y(o.y), w = o.w * scale, h = o.h * scale;
        const mid = horiz ? y + h / 2 : x + w / 2;
        return <g key={i} opacity={p} stroke="#2A1E12" strokeWidth={1.2}>
          {horiz ? <>
            <line x1={x} x2={x + w} y1={y + 1} y2={y + 1} /><line x1={x} x2={x + w} y1={mid} y2={mid} /><line x1={x} x2={x + w} y1={y + h - 1} y2={y + h - 1} />
          </> : <>
            <line y1={y} y2={y + h} x1={x + 1} x2={x + 1} /><line y1={y} y2={y + h} x1={mid} x2={mid} /><line y1={y} y2={y + h} x1={x + w - 1} x2={x + w - 1} />
          </>}
        </g>;
      }
      if (!o.leaf.length) return null;
      const [h0, h1] = o.leaf;
      return <g key={i} opacity={p} stroke="#2A1E12" fill="none" strokeWidth={1.4}>
        <line x1={X(h0[0])} y1={Y(h0[1])} x2={X(h1[0])} y2={Y(h1[1])} />
        <path d={`M ${X(h1[0])} ${Y(h1[1])} A ${Math.hypot(X(h1[0]) - X(h0[0]), Y(h1[1]) - Y(h0[1]))} ${Math.hypot(X(h1[0]) - X(h0[0]), Y(h1[1]) - Y(h0[1]))} 0 0 1 ${X(h0[0] + (o.w >= o.h ? o.w : 0))} ${Y(h0[1] + (o.w >= o.h ? 0 : o.h))}`} strokeDasharray="4 3" />
      </g>;
    })}
    <polyline points={flow} fill="none" stroke="#C4A15A" strokeWidth={3} strokeDasharray="8 6" opacity={p} />
    {plan.flow[0] && <polygon points={`${X(plan.flow[0][0])},${Y(plan.flow[0][1]) - 10} ${X(plan.flow[0][0]) - 7},${Y(plan.flow[0][1]) + 8} ${X(plan.flow[0][0]) + 7},${Y(plan.flow[0][1]) + 8}`} fill="#C4A15A" opacity={p} />}
    {plan.flow.at(-1) && <circle cx={X(plan.flow.at(-1)![0])} cy={Y(plan.flow.at(-1)![1])} r={5} fill="#C4A15A" opacity={p} />}
    {plan.rooms.map((r) => <g key={r.name} opacity={p}>
      <text x={X(r.x + r.w / 2)} y={Y(r.y + r.h / 2) - 4} textAnchor="middle" fontFamily="Health" fontWeight={700} fontSize={30} fill="#2A1E12">{r.name}</text>
      <text x={X(r.x + r.w / 2)} y={Y(r.y + r.h / 2) + 28} textAnchor="middle" fontFamily="Health" fontWeight={700} fontSize={28} fill="#2A1E12">{(r.w * r.h / 1e6).toFixed(1)}㎡</text>
    </g>)}
    <text x={rect.x + rect.w - 36} y={rect.y + 36} textAnchor="end" fontFamily="Health" fontSize={28} fontWeight={700} fill="#2A1E12">北</text>
    <text x={rect.x + 24} y={rect.y + 32} fontFamily="Health" fontSize={28} fontWeight={700} fill="#2A1E12">{plan.dimension.mm} mm · 示例</text>
  </svg>;
};

export const NewCardView: React.FC<{layout: string; st: Starts}> = ({layout, st}) => {
  const f = useCurrentFrame();
  const scene = sceneOf(layout);
  const p0 = glassEnter(f, st(0), 'shaped');
  return <>
    <Lines sceneName={layout} p={p0} />
    {scene.planId && <FloorFig plan={planById(scene.planId)} rect={layoutRects('planSplit').plan} p={p0} />}
    {scene.cards.map((c, i) => <CardFace key={c.id} card={c} p={glassEnter(f, st(i), 'shaped')} />)}
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
