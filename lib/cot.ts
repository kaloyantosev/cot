import { cache } from 'react';
import raw from '@/data/cot.json';
import { fetchReport, groupRows } from './cftc.mjs';
import type { Signal } from './format';

export * from './format';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Report = 'tff' | 'disagg';
export type Pair = [long: number, short: number];

export interface Row {
  d: string; // report date (Tuesday positions; published the following Friday)
  oi: number;
  [group: string]: Pair | number | string;
}

export interface Market {
  id: string;
  name: string;
  sector: string;
  report: Report;
  code: string;
  rows: Row[];
}

interface Dataset {
  asOf: string;
  generatedAt: string;
  source: string;
  markets: Market[];
}

const bundled = raw as unknown as Dataset;
export const SECTORS = ['Equities', 'Rates', 'FX', 'Energy', 'Metals', 'Grains', 'Softs'];

/**
 * Bundled history plus any reports the CFTC has published since the last
 * commit of data/cot.json, fetched on every request so a refresh always shows
 * the newest report (deduped per request by cache()). Falls back to the bundled data if the CFTC API is down.
 */
export const getData = cache(async (): Promise<Dataset> => {
  try {
    const init = { cache: 'no-store' as const, signal: AbortSignal.timeout(8000) };
    // Re-fetch from the bundled latest date too, in case the CFTC revised it.
    const [tff, disagg] = await Promise.all([
      fetchReport('tff', bundled.asOf, init),
      fetchReport('disagg', bundled.asOf, init),
    ]);
    const fresh = groupRows('disagg', disagg, groupRows('tff', tff));
    const markets = bundled.markets.map((m) => {
      const extra = fresh.get(m.code);
      if (!extra) return m;
      const byDate = new Map(m.rows.map((r) => [r.d, r]));
      for (const [d, r] of extra) byDate.set(d, r as Row);
      return { ...m, rows: Array.from(byDate.values()).sort((a, b) => a.d.localeCompare(b.d)) };
    });
    const asOf = markets.reduce((max, m) => (m.rows[m.rows.length - 1].d > max ? m.rows[m.rows.length - 1].d : max), '');
    return { ...bundled, asOf, generatedAt: new Date().toISOString(), markets };
  } catch (e) {
    console.error('Live CFTC fetch failed, serving bundled data', e);
    return bundled;
  }
});

export async function getMarket(id: string): Promise<Market | undefined> {
  return (await getData()).markets.find((m) => m.id === id);
}

// ─── Trader groups ───────────────────────────────────────────────────────────

export interface Group {
  key: string;
  label: string;
  role: 'spec' | 'hedger' | 'other';
  color: string;
}

export const GROUPS: Record<Report, Group[]> = {
  tff: [
    { key: 'lev', label: 'Leveraged Funds', role: 'spec', color: '#f59e0b' },
    { key: 'asset', label: 'Asset Managers', role: 'other', color: '#3b82f6' },
    { key: 'dealer', label: 'Dealers', role: 'hedger', color: '#a855f7' },
    { key: 'other', label: 'Other Reportables', role: 'other', color: '#64748b' },
    { key: 'small', label: 'Non-reportable', role: 'other', color: '#94a3b8' },
  ],
  disagg: [
    { key: 'mm', label: 'Managed Money', role: 'spec', color: '#f59e0b' },
    { key: 'comm', label: 'Commercials (Prod + Swap)', role: 'hedger', color: '#a855f7' },
    { key: 'prod', label: 'Producer / Merchant', role: 'other', color: '#3b82f6' },
    { key: 'swap', label: 'Swap Dealers', role: 'other', color: '#14b8a6' },
    { key: 'other', label: 'Other Reportables', role: 'other', color: '#64748b' },
    { key: 'small', label: 'Non-reportable', role: 'other', color: '#94a3b8' },
  ],
};

export const specGroup = (m: Market) => GROUPS[m.report].find((g) => g.role === 'spec')!;
export const hedgerGroup = (m: Market) => GROUPS[m.report].find((g) => g.role === 'hedger')!;

function pair(row: Row, key: string): Pair {
  if (key === 'comm') {
    const p = row.prod as Pair;
    const s = row.swap as Pair;
    return [p[0] + s[0], p[1] + s[1]];
  }
  return row[key] as Pair;
}

export const longShort = pair;
export const net = (row: Row, key: string) => {
  const [l, s] = pair(row, key);
  return l - s;
};
/** Net position as a percentage of open interest — comparable across years. */
export const netPctOI = (row: Row, key: string) => (row.oi > 0 ? (net(row, key) / row.oi) * 100 : 0);

// ─── Statistics ──────────────────────────────────────────────────────────────

export const LOOKBACK = 156; // 3 years of weekly reports

/** COT Index: where the latest value sits in its trailing min–max range, 0–100. */
export function cotIndex(series: number[], window = LOOKBACK): number {
  const w = series.slice(-window);
  const lo = Math.min(...w);
  const hi = Math.max(...w);
  if (hi === lo) return 50;
  return ((w[w.length - 1] - lo) / (hi - lo)) * 100;
}

/** Z-score of the latest value against the trailing window. */
export function zScore(series: number[], window = LOOKBACK): number {
  const w = series.slice(-window);
  const mean = w.reduce((a, b) => a + b, 0) / w.length;
  const sd = Math.sqrt(w.reduce((a, b) => a + (b - mean) ** 2, 0) / (w.length - 1));
  return sd > 0 ? (w[w.length - 1] - mean) / sd : 0;
}

/** Rolling COT Index for every week (needs a full window; earlier weeks are null). */
export function rollingIndex(series: number[], window = LOOKBACK): (number | null)[] {
  return series.map((_, i) => (i + 1 < window ? null : cotIndex(series.slice(i + 1 - window, i + 1), window)));
}

// ─── Signals ─────────────────────────────────────────────────────────────────

export const EXTREME = 90; // index ≥ 90 or ≤ 10 marks a positioning extreme

export function classify(index: number): Signal {
  if (index >= EXTREME) return 'Crowded long';
  if (index <= 100 - EXTREME) return 'Crowded short';
  return 'Neutral';
}

export interface Summary {
  market: Market;
  date: string;
  specLabel: string;
  specNet: number;
  specPct: number; // % of OI
  specChgPct: number; // WoW change, pp of OI
  specIndex: number; // 3Y COT index
  specIndex26: number;
  specZ: number;
  hedgerIndex: number;
  signal: Signal;
  divergence: boolean; // specs and hedgers at opposite extremes
  oi: number;
  oiChg: number; // % WoW
}

export function summarize(m: Market): Summary {
  const spec = specGroup(m);
  const hedger = hedgerGroup(m);
  const specSeries = m.rows.map((r) => netPctOI(r, spec.key));
  const hedgerSeries = m.rows.map((r) => netPctOI(r, hedger.key));
  const last = m.rows[m.rows.length - 1];
  const prev = m.rows[m.rows.length - 2];
  const specIndex = cotIndex(specSeries);
  const hedgerIndex = cotIndex(hedgerSeries);
  return {
    market: m,
    date: last.d,
    specLabel: spec.label,
    specNet: net(last, spec.key),
    specPct: specSeries[specSeries.length - 1],
    specChgPct: specSeries[specSeries.length - 1] - specSeries[specSeries.length - 2],
    specIndex,
    specIndex26: cotIndex(specSeries, 26),
    specZ: zScore(specSeries),
    hedgerIndex,
    signal: classify(specIndex),
    divergence: (specIndex >= 80 && hedgerIndex <= 20) || (specIndex <= 20 && hedgerIndex >= 80),
    oi: last.oi,
    oiChg: prev.oi > 0 ? ((last.oi - prev.oi) / prev.oi) * 100 : 0,
  };
}

/** Context a reader needs before interpreting a market's positioning. */
export const CAVEATS: Record<string, string> = {
  ZT: 'Leveraged-fund shorts in Treasuries are dominated by the cash–futures basis trade (long bonds, short futures), not directional bearish bets. Read asset-manager longs as the mirror image.',
  ZN: 'Leveraged-fund shorts in Treasuries are dominated by the cash–futures basis trade (long bonds, short futures), not directional bearish bets. Read asset-manager longs as the mirror image.',
  ZB: 'Leveraged-fund shorts in Treasuries are dominated by the cash–futures basis trade (long bonds, short futures), not directional bearish bets.',
  DX: 'The Dollar Index moves inversely to the other currency futures: a crowded long here is a crowded short in EUR, JPY, etc. Open interest is small; prefer the individual currency contracts.',
  ES: 'Dealer shorts largely offset asset-manager longs (index replication, swaps). Leveraged-fund positioning includes relative-value and dividend trades, so equity readings are noisier than in commodities.',
  NQ: 'Equity index COT data includes hedges against cash portfolios; extremes are less reliable as standalone signals than in commodities.',
  RTY: 'Russell 2000 data begins in Aug 2017 after the contract moved from ICE to CME.',
  YM: 'Small open interest; positioning can swing on a handful of large traders.',
};

