'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import type { Instrument, WeeklyData } from '@/lib/mockData';
import { formatNumberSigned, formatDate } from '@/lib/utils';

interface PositioningTimelineProps {
  instrument: Instrument;
  customHistory?: WeeklyData[];
}

export default function PositioningTimeline({ instrument, customHistory }: PositioningTimelineProps) {
  const [internalWeeks, setInternalWeeks] = useState<number>(52);
  const [showPrice, setShowPrice] = useState<boolean>(false);

  const historySlice = customHistory || instrument.history.slice(-internalWeeks);

  const chartData = historySlice.map((h) => {
    if (instrument.isFinancial) {
      return {
        date: h.date,
        shortDate: formatDate(h.date),
        dealerNet: (h.dealer_long ?? 0) - (h.dealer_short ?? 0),
        assetNet: (h.asset_long ?? 0) - (h.asset_short ?? 0),
        levNet: (h.lev_long ?? 0) - (h.lev_short ?? 0),
        price: h.price,
      };
    } else {
      return {
        date: h.date,
        shortDate: formatDate(h.date),
        prodNet: (h.prod_long ?? 0) - (h.prod_short ?? 0),
        mmNet: (h.mm_long ?? 0) - (h.mm_short ?? 0),
        otherNet: (h.other_long ?? 0) - (h.other_short ?? 0),
        price: h.price,
      };
    }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div
        className="p-3 rounded-xl shadow-2xl font-mono text-xs border"
        style={{
          background: 'rgba(13, 17, 23, 0.95)',
          borderColor: '#1e2d3d',
          backdropFilter: 'blur(10px)',
        }}
      >
        <span className="text-[#94a3b8] font-bold block mb-2">{label}</span>
        <div className="flex flex-col gap-1">
          {payload.map((entry: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold" style={{ color: entry.value >= 0 ? '#10b981' : '#ef4444' }}>
                {entry.dataKey === 'price'
                  ? `$${entry.value.toLocaleString()}`
                  : formatNumberSigned(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border border-[#1e2d3d] bg-[#0d1117]/80 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
            Positioning Trajectory ({historySlice.length} Reports: {formatDate(historySlice[0]?.date)} — {formatDate(historySlice[historySlice.length - 1]?.date)})
          </span>
        </div>

        {!customHistory && (
          <div className="flex items-center gap-1 bg-[#0a0e19] p-1 rounded-lg border border-[#1e2d3d]">
            {[13, 26, 52, 156, 500].map((w) => (
              <button
                key={w}
                onClick={() => setInternalWeeks(w)}
                className="px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors"
                style={
                  internalWeeks === w
                    ? { backgroundColor: '#6366f1', color: '#ffffff' }
                    : { color: '#64748b' }
                }
              >
                {w === 500 ? 'ALL (2018+)' : w === 156 ? '3Y' : `${w}W`}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowPrice((v) => !v)}
          className="flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono font-semibold border transition-all"
          style={
            showPrice
              ? {
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  borderColor: '#6366f1',
                  color: '#818cf8',
                }
              : {
                  backgroundColor: 'transparent',
                  borderColor: '#1e2d3d',
                  color: '#64748b',
                }
          }
        >
          <span>{showPrice ? 'Hide Price' : 'Overlay Price'}</span>
        </button>
      </div>

      <div className="w-full" style={{ height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
            <XAxis
              dataKey="shortDate"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              stroke="#1e2d3d"
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
              stroke="#1e2d3d"
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tickLine={false}
            />
            {showPrice && (
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={['auto', 'auto']}
                tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                stroke="#1e2d3d"
                tickFormatter={(v) => `${v}`}
                tickLine={false}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'monospace', paddingTop: 10 }}
              iconType="circle"
            />
            <ReferenceLine
              yAxisId="left"
              y={0}
              stroke="#475569"
              strokeDasharray="4 2"
              label={{ value: 'Zero Line', fill: '#475569', fontSize: 9, position: 'insideTopLeft' }}
            />

            {instrument.isFinancial ? (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="assetNet"
                  name="Asset Managers Net"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="levNet"
                  name="Leveraged Funds Net"
                  stroke="#8b5cf6"
                  strokeWidth={2.2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="dealerNet"
                  name="Dealers Net"
                  stroke="#f59e0b"
                  strokeWidth={1.8}
                  dot={false}
                />
              </>
            ) : (
              <>
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="mmNet"
                  name="Managed Money Net"
                  stroke="#10b981"
                  strokeWidth={2.2}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="prodNet"
                  name="Commercial Producers Net"
                  stroke="#6366f1"
                  strokeWidth={1.8}
                  dot={false}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="otherNet"
                  name="Other Reportables Net"
                  stroke="#94a3b8"
                  strokeWidth={1.2}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </>
            )}

            {showPrice && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="price"
                name="Price"
                stroke="#f1f5f9"
                strokeWidth={1.4}
                strokeDasharray="3 3"
                dot={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
