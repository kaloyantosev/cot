'use client';

import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Group } from '@/lib/cot';

export type ChartPoint = { d: string; spec: number | null; hedger: number | null } & Record<string, number | string | null>;

const RANGES = [
  { label: '1Y', weeks: 52 },
  { label: '3Y', weeks: 156 },
  { label: '5Y', weeks: 260 },
  { label: 'All', weeks: Infinity },
];

const axis = { stroke: 'rgb(var(--muted))', fontSize: 11, tickLine: false, axisLine: false };
const grid = <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="3 3" vertical={false} />;
const tooltipStyle = {
  contentStyle: {
    background: 'rgb(var(--surface))',
    border: '1px solid rgb(var(--line))',
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: 'rgb(var(--muted))', marginBottom: 4 },
};

const tickDate = (d: string) => {
  const [y, m] = d.split('-');
  return `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m - 1]} ${y.slice(2)}`;
};

export default function Charts({
  points,
  groups,
  specLabel,
  hedgerLabel,
}: {
  points: ChartPoint[];
  groups: Group[];
  specLabel: string;
  hedgerLabel: string;
}) {
  const [range, setRange] = useState('3Y');
  const [on, setOn] = useState<Set<string>>(
    () => new Set(groups.filter((g) => g.role !== 'other' || g.key === 'asset').map((g) => g.key))
  );

  const data = useMemo(() => {
    const w = RANGES.find((r) => r.label === range)!.weeks;
    return Number.isFinite(w) ? points.slice(-w) : points;
  }, [points, range]);

  const toggle = (k: string) =>
    setOn((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">Net positioning, % of open interest</h2>
        <div className="flex rounded-lg border border-line p-0.5 text-sm">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRange(r.label)}
              className={`rounded-md px-3 py-1 ${range === r.label ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {groups.map((g) => (
          <button
            key={g.key}
            onClick={() => toggle(g.key)}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs transition-opacity ${
              on.has(g.key) ? 'border-line' : 'border-transparent opacity-40'
            }`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: g.color }} />
            {g.label}
          </button>
        ))}
      </div>

      <div className="h-72 rounded-lg border border-line bg-surface p-3 sm:h-80">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            {grid}
            <XAxis dataKey="d" tickFormatter={tickDate} minTickGap={48} {...axis} />
            <YAxis tickFormatter={(v) => `${v}%`} width={48} {...axis} />
            <ReferenceLine y={0} stroke="rgb(var(--muted))" strokeOpacity={0.6} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`} />
            {groups
              .filter((g) => on.has(g.key))
              .map((g) => (
                <Line
                  key={g.key}
                  dataKey={g.key}
                  name={g.label}
                  stroke={g.color}
                  strokeWidth={g.role === 'other' ? 1.25 : 2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="pt-2 font-semibold">COT Index, rolling 3-year range</h2>
      <p className="-mt-2 text-sm text-muted">
        Where each week&apos;s net % OI sat within the prior 156 weeks. Shaded bands mark the 0–10 and 90–100 extremes.
      </p>
      <div className="h-56 rounded-lg border border-line bg-surface p-3">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
            {grid}
            <ReferenceArea y1={90} y2={100} fill="rgb(var(--up))" fillOpacity={0.08} />
            <ReferenceArea y1={0} y2={10} fill="rgb(var(--down))" fillOpacity={0.08} />
            <XAxis dataKey="d" tickFormatter={tickDate} minTickGap={48} {...axis} />
            <YAxis domain={[0, 100]} ticks={[0, 10, 50, 90, 100]} interval={0} width={48} {...axis} />
            <Tooltip {...tooltipStyle} formatter={(v: number) => Math.round(v)} />
            <Line dataKey="spec" name={specLabel} stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} />
            <Line dataKey="hedger" name={hedgerLabel} stroke="#a855f7" strokeWidth={1.25} dot={false} isAnimationActive={false} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
