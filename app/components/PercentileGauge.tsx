'use client';

import { formatNumberSigned } from '@/lib/utils';

interface PercentileGaugeProps {
  percentile: number;
  label: string;
  currentNet: number;
  highNet: number;
  lowNet: number;
  size?: number;
}

export default function PercentileGauge({
  percentile,
  label,
  currentNet,
  highNet,
  lowNet,
  size = 200,
}: PercentileGaugeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(percentile)));
  const angle = -180 + (clamped / 100) * 180;

  const radius = 75;
  const cx = 100;
  const cy = 95;

  let biasText = clamped >= 50 ? 'NET LONG' : 'NET SHORT';
  if (clamped >= 80) biasText = 'CROWDED LONG';
  if (clamped <= 20) biasText = 'CROWDED SHORT';

  return (
    <div className="flex flex-col items-center p-4 rounded-xl border border-[#1e2d3d] bg-[#0d1117]/80 backdrop-blur-md w-full">
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-xs font-mono uppercase font-bold text-[#94a3b8] tracking-wider truncate">
          {label}
        </span>
        <span
          className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
          style={{
            backgroundColor: clamped >= 50 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: clamped >= 50 ? '#10b981' : '#ef4444',
            border: `1px solid ${clamped >= 50 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}
        >
          {biasText}
        </span>
      </div>

      {/* SVG Semicircle Speedometer */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.6 }}>
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`gaugeTrack_${label.replace(/\s+/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="35%" stopColor="#f97316" />
              <stop offset="65%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          <path
            d="M 25 95 A 75 75 0 0 1 175 95"
            fill="none"
            stroke={`url(#gaugeTrack_${label.replace(/\s+/g, '')})`}
            strokeWidth="12"
            strokeLinecap="round"
          />

          <text
            x={cx}
            y={cy - 10}
            textAnchor="middle"
            className="font-mono font-extrabold"
            fill="#f1f5f9"
            fontSize="24"
          >
            {clamped}
            <tspan fontSize="12" fill="#6366f1" dx="2">
              %
            </tspan>
          </text>
          <text
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            className="font-mono"
            fill="#64748b"
            fontSize="9"
          >
            PERCENTILE RANK
          </text>

          {/* Needle */}
          <g transform={`rotate(${angle} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy}
              x2={cx + radius - 4}
              y2={cy}
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
            />
            <circle cx={cx} cy={cy} r="4.5" fill="#ffffff" />
            <circle cx={cx} cy={cy} r="2" fill="#6366f1" />
          </g>
        </svg>
      </div>

      {/* 3 Stat Pills */}
      <div className="grid grid-cols-3 gap-2 w-full mt-2">
        <div className="flex flex-col items-center bg-[#0a0e19] border border-[#1e2d3d] rounded-lg py-1.5 px-1">
          <span className="text-[9px] font-mono text-[#64748b] uppercase">Current Net</span>
          <span
            className="text-xs font-mono font-bold truncate max-w-full"
            style={{ color: currentNet >= 0 ? '#10b981' : '#ef4444' }}
          >
            {formatNumberSigned(currentNet)}
          </span>
        </div>
        <div className="flex flex-col items-center bg-[#0a0e19] border border-[#1e2d3d] rounded-lg py-1.5 px-1">
          <span className="text-[9px] font-mono text-[#64748b] uppercase">Period High</span>
          <span className="text-xs font-mono font-bold text-[#94a3b8] truncate max-w-full">
            {formatNumberSigned(highNet)}
          </span>
        </div>
        <div className="flex flex-col items-center bg-[#0a0e19] border border-[#1e2d3d] rounded-lg py-1.5 px-1">
          <span className="text-[9px] font-mono text-[#64748b] uppercase">Period Low</span>
          <span className="text-xs font-mono font-bold text-[#94a3b8] truncate max-w-full">
            {formatNumberSigned(lowNet)}
          </span>
        </div>
      </div>
    </div>
  );
}
