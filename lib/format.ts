// Client-safe helpers: no dataset import, so client components stay small.

export type Signal = 'Crowded long' | 'Crowded short' | 'Neutral';

// ─── Formatting ──────────────────────────────────────────────────────────────

export const fmtInt = (n: number) => new Intl.NumberFormat('en-US').format(Math.round(n));
export const fmtSigned = (n: number, digits = 0) =>
  `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
export const fmtDate = (d: string) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/** The Friday a Tuesday report is published. */
export function releaseDate(d: string): string {
  const t = new Date(`${d}T00:00:00Z`);
  t.setUTCDate(t.getUTCDate() + 3);
  return t.toISOString().slice(0, 10);
}
