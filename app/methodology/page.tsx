import type { Metadata } from 'next';
import { data, fmtDate, releaseDate } from '@/lib/cot';

export const metadata: Metadata = { title: 'Methodology · COT Positioning' };

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="pt-4 text-lg font-semibold">{children}</h2>;
}

export default function Methodology() {
  return (
    <article className="max-w-3xl space-y-4 text-[15px] leading-relaxed">
      <h1 className="text-2xl font-semibold tracking-tight">Methodology</h1>

      <H>Data</H>
      <p>
        Weekly <em>futures-only</em> Commitments of Traders reports from the CFTC Public Reporting API: the Traders in
        Financial Futures report for equity indices, Treasuries and currencies, and the Disaggregated report for
        commodities. History starts in January 2016. Markets are matched by CFTC contract code, so renames (crude oil
        and copper in 2022) don&apos;t break the series. A GitHub Action refreshes the data every weekend.
      </p>
      <p>
        <strong>Timing.</strong> Positions are as of Tuesday close and published the following Friday at 15:30 ET. The
        latest report holds positions from {fmtDate(data.asOf)}, released {fmtDate(releaseDate(data.asOf))}. Any
        backtest must use the release date, not the report date, or it has a three-day look-ahead.
      </p>

      <H>Who is the speculator, who is the hedger</H>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong>Financials:</strong> speculators = Leveraged Funds (hedge funds, CTAs); hedgers = Dealers (sell-side
          intermediaries). Asset Managers are shown separately: they are real-money investors, not hedgers, and in
          equities and Treasuries they usually take the other side of leveraged funds.
        </li>
        <li>
          <strong>Commodities:</strong> speculators = Managed Money; hedgers = Commercials = Producer/Merchant + Swap
          Dealers. Leaving swap dealers out (as many dashboards do) misses most of the hedging in energy and metals.
        </li>
      </ul>

      <H>Metrics</H>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Net % of open interest</strong> = (long − short) / open interest. Raw contract counts aren&apos;t
          comparable over time because open interest grows and shrinks, so every statistic here uses this normalised
          series. Spread positions are excluded.
        </li>
        <li>
          <strong>COT Index (3Y)</strong> = 100 × (current − min) / (max − min) over the last 156 weeks. It shows
          where positioning sits within its recent range: 0 is the most bearish of the window, 100 the most bullish.
          The 26-week version shows shorter-term swings.
        </li>
        <li>
          <strong>Z-score (3Y)</strong> = (current − mean) / standard deviation over 156 weeks. Unlike the min–max
          index, a single outlier week doesn&apos;t move it much.
        </li>
        <li>
          <strong>Crowded long / short</strong>: speculative COT Index ≥ 90 or ≤ 10. Everything in between is
          labelled neutral. Positioning in the middle of its range doesn&apos;t tell you anything.
        </li>
        <li>
          <strong>Divergence ◆</strong>: speculators ≥ 80 while hedgers ≤ 20, or the reverse. This is the
          clearest COT set-up: commercials are taking the other side of a one-way speculative trade.
        </li>
      </ul>

      <H>How to use it, and the limits</H>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Extremes are a <em>conditioning variable</em>, not a trigger. Crowded trades can stay crowded while the trend
          runs; the edge comes when price stops confirming (failed new highs, a reversal week) while positioning is
          stretched.
        </li>
        <li>
          Signals are most reliable in physical commodities, where commercials hedge real exposure. In equity indices
          and Treasuries, futures positions are often one leg of a hedge or arbitrage (index replication, the
          cash–futures basis trade), so a large net short isn&apos;t necessarily a bearish view.
        </li>
        <li>
          The Dollar Index (DX) moves opposite to the other currency futures. A crowded DX long is the same trade as
          crowded shorts in EUR, JPY and the rest.
        </li>
        <li>
          Min–max ranks depend on the window. A structural shift (a new class of participant, a contract redesign) can
          leave a market &quot;extreme&quot; for months. Check the z-score and the history chart before acting.
        </li>
      </ul>
    </article>
  );
}
