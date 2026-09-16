'use client';

interface SignalBadgeProps {
  signal: string;
}

interface BadgeConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
}

const SIGNAL_MAP: Record<string, BadgeConfig> = {
  EXTREME_LONG: {
    label: 'CROWDED LONG',
    bg: 'rgba(16, 185, 129, 0.2)',
    text: '#10b981',
    border: 'rgba(16, 185, 129, 0.45)',
  },
  NET_LONG: {
    label: 'NET LONG',
    bg: 'rgba(34, 197, 94, 0.15)',
    text: '#22c55e',
    border: 'rgba(34, 197, 94, 0.35)',
  },
  NET_SHORT: {
    label: 'NET SHORT',
    bg: 'rgba(249, 115, 22, 0.15)',
    text: '#f97316',
    border: 'rgba(249, 115, 22, 0.35)',
  },
  EXTREME_SHORT: {
    label: 'CROWDED SHORT',
    bg: 'rgba(239, 68, 68, 0.2)',
    text: '#ef4444',
    border: 'rgba(239, 68, 68, 0.45)',
  },
  CROSSOVER: {
    label: 'CROSSOVER',
    bg: 'rgba(99, 102, 241, 0.2)',
    text: '#818cf8',
    border: 'rgba(99, 102, 241, 0.45)',
  },
};

const FALLBACK: BadgeConfig = {
  label: 'ACTIVE',
  bg: 'rgba(100, 116, 139, 0.12)',
  text: '#94a3b8',
  border: 'rgba(100, 116, 139, 0.25)',
};

export default function SignalBadge({ signal }: SignalBadgeProps) {
  const config = SIGNAL_MAP[signal] ?? FALLBACK;

  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold font-mono whitespace-nowrap"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        letterSpacing: '0.04em',
      }}
    >
      {config.label}
    </span>
  );
}
