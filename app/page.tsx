import { markets, summarize, SECTORS } from '@/lib/cot';
import Overview, { type OverviewRow } from './Overview';

export default function Home() {
  const rows: OverviewRow[] = markets.map((m) => {
    const { market, ...s } = summarize(m);
    return { id: market.id, name: market.name, sector: market.sector, ...s };
  });

  const longs = rows.filter((r) => r.signal === 'Crowded long').length;
  const shorts = rows.filter((r) => r.signal === 'Crowded short').length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Speculative positioning across futures</h1>
        <p className="text-sm text-muted max-w-3xl">
          Net position of the speculative group (Leveraged Funds in financials, Managed Money in commodities) as a
          share of open interest, ranked against its own last three years. Extremes flag crowding — a risk of
          reversal if the trend stalls — not a timing signal on their own.
        </p>
        <p className="text-sm">
          <span className="text-up font-medium">{longs} crowded long</span>
          <span className="text-muted"> · </span>
          <span className="text-down font-medium">{shorts} crowded short</span>
          <span className="text-muted"> · {rows.length - longs - shorts} neutral</span>
        </p>
      </div>
      <Overview rows={rows} sectors={SECTORS} />
    </div>
  );
}
