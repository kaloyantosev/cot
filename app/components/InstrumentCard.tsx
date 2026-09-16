'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { Instrument } from '@/lib/mockData';
import { getPercentile, getSignalFromPercentile } from '@/lib/utils';
import SignalBadge from './SignalBadge';

interface InstrumentCardProps {
  instrument: Instrument;
  onClick: () => void;
  index?: number;
}

function formatContractChange(val: number): { formatted: string; isPositive: boolean } {
  const isPositive = val >= 0;
  const abs = Math.abs(val);
  const formatted = (isPositive ? '+' : '-') + abs.toLocaleString('en-US');
  return { formatted, isPositive };
}

export default function InstrumentCard({ instrument, onClick, index = 0 }: InstrumentCardProps) {
  const { name, ticker, exchange, history, netPosition } = instrument;

  // Build sparkline data from last 26 weeks of net MM/Lev Fund position
  const sparkData = history.slice(-26).map((h, i) => ({ i, value: h.netLong }));

  // Last value determines line color
  const lastValue = sparkData.length > 0 ? sparkData[sparkData.length - 1].value : 0;
  const lineColor = lastValue >= 0 ? '#10b981' : '#ef4444';

  // Percentile gauge over all history
  const allNets = history.map((h) => h.netLong);
  const percentile = Math.round(getPercentile(netPosition, allNets));
  const signal = getSignalFromPercentile(percentile);

  // WoW change
  const weeklyChange =
    history.length >= 2
      ? history[history.length - 1].netLong - history[history.length - 2].netLong
      : 0;
  const { formatted: changeFormatted, isPositive: changePositive } = formatContractChange(weeklyChange);

  // Gauge marker position (clamped)
  const markerPct = Math.max(2, Math.min(98, percentile));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      onClick={onClick}
      className="relative flex flex-col gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 group select-none"
      style={{
        background: 'rgba(13, 17, 23, 0.85)',
        border: '1px solid #1e2d3d',
        backdropFilter: 'blur(8px)',
      }}
      whileHover={{
        borderColor: '#6366f1',
        boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 4px 24px rgba(99,102,241,0.15)',
      }}
      whileTap={{ scale: 0.985 }}
    >
      {/* ROW 1: Name + Exchange badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-bold text-white text-sm leading-tight truncate"
            title={name}
          >
            {name}
          </span>
          <span
            className="shrink-0 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(99,102,241,0.12)',
              color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            {ticker}
          </span>
        </div>
        <span
          className="shrink-0 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded"
          style={{
            background: 'rgba(30,45,61,0.6)',
            color: '#64748b',
            border: '1px solid #1e2d3d',
          }}
        >
          {exchange}
        </span>
      </div>

      {/* ROW 2: Mini sparkline */}
      <div style={{ width: '100%', height: 48 }}>
        <ResponsiveContainer width="100%" height={48}>
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ROW 3: Positioning gauge */}
      <div className="flex flex-col gap-1">
        {/* Bar */}
        <div
          className="relative w-full h-2 rounded-full overflow-visible"
          style={{
            background: 'linear-gradient(90deg, #ef4444 0%, #64748b 50%, #10b981 100%)',
          }}
        >
          {/* Marker pill */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-lg transition-all duration-500"
            style={{
              left: `${markerPct}%`,
              backgroundColor: '#ffffff',
              boxShadow: '0 0 6px 2px rgba(255,255,255,0.35)',
            }}
          />
        </div>
        {/* Labels */}
        <div className="flex justify-between">
          <span className="text-[10px] font-mono text-[#475569]">MAX SHORT</span>
          <span
            className="text-[10px] font-mono font-semibold"
            style={{ color: '#64748b' }}
          >
            {percentile}%
          </span>
          <span className="text-[10px] font-mono text-[#475569]">MAX LONG</span>
        </div>
      </div>

      {/* ROW 4: Signal badge + weekly change */}
      <div className="flex items-start justify-between gap-2">
        <SignalBadge signal={signal} />
        <div className="flex flex-col items-end gap-0.5">
          <span
            className="text-sm font-bold font-mono"
            style={{ color: changePositive ? '#10b981' : '#ef4444' }}
          >
            {changeFormatted}
          </span>
          <span className="text-[10px] text-[#475569] font-mono whitespace-nowrap">
            WoW change in net contracts
          </span>
        </div>
      </div>
    </motion.div>
  );
}
