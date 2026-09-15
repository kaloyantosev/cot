'use client';

import { motion } from 'framer-motion';
import { formatNumber, formatNumberSigned } from '@/lib/utils';
import SignalBadge from './SignalBadge';
import { getSignalFromPercentile } from '@/lib/utils';

interface ParticipantRowProps {
  name: string;
  color: string;
  role: string;
  long: number;
  short: number;
  prevLong: number;
  prevShort: number;
  percentile: number;
  isContra?: boolean;
}

export default function ParticipantRow({
  name,
  color,
  role,
  long,
  short,
  prevLong,
  prevShort,
  percentile,
  isContra = false,
}: ParticipantRowProps) {
  const currentNet = long - short;
  const prevNet = prevLong - prevShort;
  const change = currentNet - prevNet;

  const ratio = short > 0 ? (long / short).toFixed(2) : '∞';
  const signal = getSignalFromPercentile(percentile);
  const markerPct = Math.max(2, Math.min(98, percentile));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3 p-4 rounded-xl border bg-[#0d1117]/90 backdrop-blur-sm"
      style={{
        borderColor: '#1e2d3d',
        borderLeftWidth: '4px',
        borderLeftColor: color,
      }}
    >
      {/* ROW 1: Name, Role, Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
          <h4 className="font-mono font-bold text-sm text-white">{name}</h4>
          {isContra && (
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              CONTRA HEDGE
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-white">{percentile}th %ile</span>
          <SignalBadge signal={signal} />
        </div>
      </div>

      {/* Role description */}
      <p className="text-xs text-[#64748b] leading-relaxed">{role}</p>

      {/* 4 Stat Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-[#0a0e19] border border-[#1e2d3d] rounded-lg p-2.5 flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase text-[#64748b]">Total Longs</span>
          <span className="font-mono font-bold text-xs sm:text-sm text-[#f1f5f9]">
            {formatNumber(long)}
          </span>
        </div>
        <div className="bg-[#0a0e19] border border-[#1e2d3d] rounded-lg p-2.5 flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase text-[#64748b]">Total Shorts</span>
          <span className="font-mono font-bold text-xs sm:text-sm text-[#f1f5f9]">
            {formatNumber(short)}
          </span>
        </div>
        <div className="bg-[#0a0e19] border border-[#1e2d3d] rounded-lg p-2.5 flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase text-[#64748b]">Net Position</span>
          <span
            className="font-mono font-bold text-xs sm:text-sm"
            style={{ color: currentNet >= 0 ? '#10b981' : '#ef4444' }}
          >
            {formatNumberSigned(currentNet)}
          </span>
        </div>
        <div className="bg-[#0a0e19] border border-[#1e2d3d] rounded-lg p-2.5 flex flex-col items-center">
          <span className="text-[10px] font-mono uppercase text-[#64748b]">L / S Ratio</span>
          <span className="font-mono font-bold text-xs sm:text-sm text-[#f59e0b]">
            {ratio} : 1
          </span>
        </div>
      </div>

      {/* Weekly change & Percentile bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#1e2d3d]/60">
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span style={{ color: change >= 0 ? '#10b981' : '#ef4444' }} className="font-bold">
            {change >= 0 ? '▲ +' : '▼ '} {formatNumber(Math.abs(change))}
          </span>
          <span className="text-[#64748b]">net contracts vs prior report</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-48">
          <span className="text-[9px] font-mono text-[#475569]">0%</span>
          <div
            className="relative flex-1 h-1.5 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #ef4444 0%, #f97316 40%, #22c55e 60%, #10b981 100%)',
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border border-white bg-white shadow"
              style={{ left: `${markerPct}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-[#475569]">100%</span>
        </div>
      </div>
    </motion.div>
  );
}
