import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  CAVEATS,
  GROUPS,
  cotIndex,
  fmtDate,
  fmtInt,
  fmtSigned,
  getMarket,
  hedgerGroup,
  longShort,
  markets,
  net,
  netPctOI,
  rollingIndex,
  specGroup,
  summarize,
  zScore,
} from '@/lib/cot';
import IndexBar from '../../IndexBar';
import { SignalTag } from '../../Overview';
import Charts, { type ChartPoint } from './Charts';

export function generateStaticParams() {
  return markets.map((m) => ({ id: m.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const m = getMarket(params.id);
  return { title: m ? `${m.name} (${m.id}) · COT Positioning` : 'COT Positioning' };
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="mt-1 text-xl font-semibold num">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export default function MarketPage({ params }: { params: { id: string } }) {
  const m = getMarket(params.id);
  if (!m) notFound();

  const s = summarize(m);
  const spec = specGroup(m);
  const hedger = hedgerGroup(m);
  const groups = GROUPS[m.report];
  const last = m.rows[m.rows.length - 1];
  const prev = m.rows[m.rows.length - 2];

  const specRolling = rollingIndex(m.rows.map((r) => netPctOI(r, spec.key)));
  const hedgerRolling = rollingIndex(m.rows.map((r) => netPctOI(r, hedger.key)));
  const points: ChartPoint[] = m.rows.map((r, i) => {
    const p: ChartPoint = { d: r.d, spec: specRolling[i], hedger: hedgerRolling[i] };
    for (const g of groups) p[g.key] = Math.round(netPctOI(r, g.key) * 10) / 10;
    return p;
  });

  const table = groups.map((g) => {
    const series = m.rows.map((r) => netPctOI(r, g.key));
    const [l, sh] = longShort(last, g.key);
    return {
      g,
      long: l,
      short: sh,
      net: l - sh,
      chg: net(last, g.key) - net(prev, g.key),
      pct: series[series.length - 1],
      idx: cotIndex(series),
      z: zScore(series),
    };
  });

  const caveat = CAVEATS[m.id];

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Link href="/" className="text-sm text-muted hover:text-fg">
          ← All markets
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{m.name}</h1>
          <span className="font-mono text-sm text-muted">{m.id}</span>
          <SignalTag signal={s.signal} />
        </div>
        <p className="text-sm text-muted">
          {m.sector} · CFTC code {m.code} · {m.report === 'tff' ? 'Traders in Financial Futures' : 'Disaggregated'}{' '}
          report · positions as of {fmtDate(last.d)} · {m.rows.length} weeks since {fmtDate(m.rows[0].d)}
        </p>
        {caveat && (
          <p className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
            <span className="font-medium">Read with care: </span>
            {caveat}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label={`${spec.label} net`}
          value={`${fmtSigned(s.specPct, 1)}% OI`}
          sub={`${fmtSigned(s.specNet)} contracts`}
        />
        <Stat label="COT Index 3Y" value={Math.round(s.specIndex)} sub={`26W: ${Math.round(s.specIndex26)}`} />
        <Stat label="Z-score 3Y" value={fmtSigned(s.specZ, 2)} sub={`Δ 1W ${fmtSigned(s.specChgPct, 1)} pp of OI`} />
        <Stat label="Open interest" value={fmtInt(s.oi)} sub={`${fmtSigned(s.oiChg, 1)}% w/w`} />
      </div>

      {s.divergence && (
        <p className="text-sm">
          <span className="text-accent">◆</span> {spec.label} (index {Math.round(s.specIndex)}) and {hedger.label}{' '}
          (index {Math.round(s.hedgerIndex)}) sit at opposite ends of their 3-year ranges: hedgers are taking the other
          side of a stretched speculative position.
        </p>
      )}

      <Charts points={points} groups={groups} specLabel={spec.label} hedgerLabel={hedger.label} />

      <section className="space-y-3">
        <h2 className="font-semibold">All trader groups · {fmtDate(last.d)}</h2>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-4 py-2.5 font-medium">Group</th>
                <th className="px-3 py-2.5 font-medium text-right">Long</th>
                <th className="px-3 py-2.5 font-medium text-right">Short</th>
                <th className="px-3 py-2.5 font-medium text-right">Net</th>
                <th className="px-3 py-2.5 font-medium text-right">Δ 1W</th>
                <th className="px-3 py-2.5 font-medium text-right">Net % OI</th>
                <th className="px-3 py-2.5 font-medium text-right">COT Index 3Y</th>
                <th className="px-4 py-2.5 font-medium text-right">Z 3Y</th>
              </tr>
            </thead>
            <tbody>
              {table.map((t) => (
                <tr key={t.g.key} className="border-t border-line/60">
                  <td className="px-4 py-2">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: t.g.color }} />
                    {t.g.label}
                    {t.g.role === 'spec' && <span className="ml-1.5 text-xs text-muted">speculators</span>}
                    {t.g.role === 'hedger' && <span className="ml-1.5 text-xs text-muted">hedgers</span>}
                  </td>
                  <td className="px-3 py-2 text-right num">{fmtInt(t.long)}</td>
                  <td className="px-3 py-2 text-right num">{fmtInt(t.short)}</td>
                  <td className={`px-3 py-2 text-right num ${t.net >= 0 ? 'text-up' : 'text-down'}`}>{fmtSigned(t.net)}</td>
                  <td className="px-3 py-2 text-right num text-muted">{fmtSigned(t.chg)}</td>
                  <td className="px-3 py-2 text-right num">{fmtSigned(t.pct, 1)}%</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end">
                      <IndexBar value={t.idx} width="w-20" />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right num">{fmtSigned(t.z, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          Net excludes spread positions, so nets across all groups sum to zero.
          {m.report === 'disagg' &&
            ' Commercials = Producer/Merchant + Swap Dealers (the legacy “commercial” definition), shown alongside its two parts.'}
        </p>
      </section>
    </div>
  );
}
