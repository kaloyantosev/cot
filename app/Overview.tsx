'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { fmtSigned, type Signal } from '@/lib/format';
import IndexBar from './IndexBar';

export interface OverviewRow {
  id: string;
  name: string;
  sector: string;
  specLabel: string;
  specNet: number;
  specPct: number;
  specChgPct: number;
  specIndex: number;
  specIndex26: number;
  specZ: number;
  hedgerIndex: number;
  signal: Signal;
  divergence: boolean;
}

type SortKey = 'sector' | 'specPct' | 'specChgPct' | 'specIndex' | 'specIndex26' | 'specZ';

const COLS: { key: SortKey; label: string; title: string }[] = [
  { key: 'specPct', label: 'Net % OI', title: 'Speculative net position as % of open interest' },
  { key: 'specChgPct', label: 'Δ 1W', title: 'Week-over-week change in net % of OI (percentage points)' },
  { key: 'specIndex', label: 'COT Index 3Y', title: 'Position of current net % OI within its 3-year min–max range (0–100)' },
  { key: 'specIndex26', label: '26W', title: 'Same index over the last 26 weeks' },
  { key: 'specZ', label: 'Z 3Y', title: 'Standard deviations from the 3-year mean' },
];

export function SignalTag({ signal }: { signal: Signal }) {
  const cls =
    signal === 'Crowded long'
      ? 'bg-up/10 text-up'
      : signal === 'Crowded short'
      ? 'bg-down/10 text-down'
      : 'text-muted';
  return <span className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{signal}</span>;
}

export default function Overview({ rows, sectors }: { rows: OverviewRow[]; sectors: string[] }) {
  const [sector, setSector] = useState('All');
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'sector', desc: false });

  const shown = useMemo(() => {
    const r = rows.filter((x) => sector === 'All' || x.sector === sector);
    if (sort.key === 'sector') return r; // source order is sector order
    const k = sort.key;
    return [...r].sort((a, b) => (sort.desc ? b[k] - a[k] : a[k] - b[k]));
  }, [rows, sector, sort]);

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: true }));

  let lastSector = '';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {['All', ...sectors].map((s) => (
          <button
            key={s}
            onClick={() => setSector(s)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              sector === s ? 'border-fg bg-fg text-bg' : 'border-line text-muted hover:text-fg'
            }`}
          >
            {s}
          </button>
        ))}
        {sort.key !== 'sector' && (
          <button onClick={() => setSort({ key: 'sector', desc: false })} className="ml-auto text-sm text-accent">
            Reset sort
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-4 py-2.5 font-medium">Market</th>
              {COLS.map((c) => (
                <th key={c.key} className="px-3 py-2.5 font-medium text-right" title={c.title}>
                  <button onClick={() => toggle(c.key)} className="hover:text-fg">
                    {c.label}
                    {sort.key === c.key ? (sort.desc ? ' ↓' : ' ↑') : ''}
                  </button>
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium">Signal</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const header = sort.key === 'sector' && sector === 'All' && r.sector !== lastSector;
              lastSector = r.sector;
              return [
                header && (
                  <tr key={`h-${r.sector}`} className="bg-bg/60">
                    <td colSpan={7} className="px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-muted">
                      {r.sector}
                    </td>
                  </tr>
                ),
                <tr key={r.id} className="border-t border-line/60 hover:bg-bg/60">
                  <td className="px-4 py-2">
                    <Link href={`/m/${r.id}`} className="group flex items-baseline gap-2">
                      <span className="font-mono text-xs text-muted w-8">{r.id}</span>
                      <span className="group-hover:text-accent">{r.name}</span>
                      {r.divergence && (
                        <span title="Speculators and hedgers sit at opposite extremes" className="text-xs text-accent">
                          ◆
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className={`px-3 py-2 text-right num ${r.specPct >= 0 ? 'text-up' : 'text-down'}`}>
                    {fmtSigned(r.specPct, 1)}%
                  </td>
                  <td className="px-3 py-2 text-right num text-muted">{fmtSigned(r.specChgPct, 1)}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end">
                      <IndexBar value={r.specIndex} />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right num text-muted">{Math.round(r.specIndex26)}</td>
                  <td className="px-3 py-2 text-right num">{fmtSigned(r.specZ, 1)}</td>
                  <td className="px-4 py-2">
                    <SignalTag signal={r.signal} />
                  </td>
                </tr>,
              ];
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        Crowded = 3-year COT Index ≥ 90 or ≤ 10. ◆ = speculators and hedgers at opposite extremes (≥ 80 vs ≤ 20).
        Click a market for all trader groups and history.
      </p>
    </div>
  );
}
