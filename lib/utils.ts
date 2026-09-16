// ─── Number Formatting ──────────────────────────────────────────────────────

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function formatNumberSigned(n: number): string {
  const formatted = formatNumber(Math.abs(n));
  if (n > 0) return `+${formatted}`;
  if (n < 0) return `-${formatted}`;
  return '0';
}

export function formatPct(n: number, decimals: number = 1): string {
  return `${(n * 100).toFixed(decimals)}%`;
}

// ─── Percentile & Directional Signal (NO "NEUTRAL" RATING) ────────────────────

export function getPercentile(value: number, dataset: number[]): number {
  if (dataset.length === 0) return 50;
  const sorted = [...dataset].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < value).length;
  const equal = sorted.filter((v) => v === value).length;
  const rank = ((below + 0.5 * equal) / sorted.length) * 100;
  return Math.min(100, Math.max(0, rank));
}

export type COTSignalType = 'EXTREME_LONG' | 'NET_LONG' | 'NET_SHORT' | 'EXTREME_SHORT' | 'CROSSOVER';

/**
 * Direct institutional bias — strictly directional (no "neutral" rating)
 */
export function getSignalFromPercentile(p: number): COTSignalType {
  if (p >= 85) return 'EXTREME_LONG';
  if (p >= 50) return 'NET_LONG';
  if (p <= 15) return 'EXTREME_SHORT';
  return 'NET_SHORT';
}

export function isCrossover(current: number, previous: number): boolean {
  return (current >= 0 && previous < 0) || (current < 0 && previous >= 0);
}

// ─── Signal Display Helpers ──────────────────────────────────────────────────

export function getSignalColor(signal: string): string {
  switch (signal) {
    case 'EXTREME_LONG':
      return 'text-emerald-400';
    case 'NET_LONG':
      return 'text-green-400';
    case 'NET_SHORT':
      return 'text-orange-400';
    case 'EXTREME_SHORT':
      return 'text-red-500';
    case 'CROSSOVER':
      return 'text-purple-400';
    default:
      return 'text-slate-400';
  }
}

export function getSignalEmoji(signal: string): string {
  return '';
}

export function ordinalSuffix(n: number): string {
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  const mod10 = abs % 10;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  if (mod10 === 1) return `${n}st`;
  if (mod10 === 2) return `${n}nd`;
  if (mod10 === 3) return `${n}rd`;
  return `${n}th`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
