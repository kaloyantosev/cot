'use client';

import { useState } from 'react';
import { computeAllSignals, type COTSignal } from '@/lib/cotSignals';
import { formatNumberSigned } from '@/lib/utils';
import SignalBadge from './SignalBadge';

interface ScreenerProps {
  onSelect: (contractId: string) => void;
}

type FilterType = 'all' | 'extreme_long' | 'net_long' | 'net_short' | 'extreme_short' | 'crossover' | 'largest_change';

export default function Screener({ onSelect }: ScreenerProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortCol, setSortCol] = useState<keyof COTSignal>('mmPercentile');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState<string>('');

  const allSignals = computeAllSignals();

  let filtered = allSignals.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        item.contractName.toLowerCase().includes(q) ||
        item.ticker.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filter === 'extreme_long') return item.mmPercentile >= 80;
    if (filter === 'net_long') return item.mmNet >= 0;
    if (filter === 'net_short') return item.mmNet < 0;
    if (filter === 'extreme_short') return item.mmPercentile <= 20;
    if (filter === 'crossover') return item.isCrossover;
    if (filter === 'largest_change') return Math.abs(item.mmNetChange) >= 10000;
    return true;
  });

  filtered.sort((a, b) => {
    let vA: any = a[sortCol];
    let vB: any = b[sortCol];

    if (typeof vA === 'string') {
      return sortDir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
    }
    return sortDir === 'asc' ? vA - vB : vB - vA;
  });

  const handleSort = (col: keyof COTSignal) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const getSortIcon = (col: keyof COTSignal) => {
    if (sortCol !== col) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            <span>⚡</span> Institutional COT Signal Screener
          </h2>
          <p className="text-xs text-[#64748b]">
            Direct directional positioning across 30+ liquid futures markets. Strictly statistical and directional—no arbitrary ratings.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Filter by ticker or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#0a0e19] border border-[#1e2d3d] rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder:text-[#475569] outline-none focus:border-[#6366f1] w-56"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#64748b] hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'all'
              ? { backgroundColor: '#6366f1', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          All Markets ({allSignals.length})
        </button>
        <button
          onClick={() => setFilter('extreme_long')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'extreme_long'
              ? { backgroundColor: '#10b981', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          🟢 Crowded Long (&gt;80%)
        </button>
        <button
          onClick={() => setFilter('net_long')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'net_long'
              ? { backgroundColor: '#22c55e', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          ▲ Net Long
        </button>
        <button
          onClick={() => setFilter('net_short')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'net_short'
              ? { backgroundColor: '#f97316', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          ▼ Net Short
        </button>
        <button
          onClick={() => setFilter('extreme_short')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'extreme_short'
              ? { backgroundColor: '#ef4444', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          🔴 Crowded Short (&lt;20%)
        </button>
        <button
          onClick={() => setFilter('crossover')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'crossover'
              ? { backgroundColor: '#8b5cf6', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          ⚡ Crossover
        </button>
        <button
          onClick={() => setFilter('largest_change')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'largest_change'
              ? { backgroundColor: '#f59e0b', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          🌊 Largest WoW Shift
        </button>
      </div>

      <div className="rounded-xl border border-[#1e2d3d] bg-[#0d1117]/80 backdrop-blur-md overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-[#0a0e19] text-[#64748b] uppercase border-b border-[#1e2d3d] select-none">
              <th
                onClick={() => handleSort('contractName')}
                className="p-3 cursor-pointer hover:text-white"
              >
                Contract {getSortIcon('contractName')}
              </th>
              <th
                onClick={() => handleSort('category')}
                className="p-3 cursor-pointer hover:text-white"
              >
                Category {getSortIcon('category')}
              </th>
              <th
                onClick={() => handleSort('mmNet')}
                className="p-3 cursor-pointer hover:text-white text-right"
              >
                Spec Net {getSortIcon('mmNet')}
              </th>
              <th
                onClick={() => handleSort('mmNetChange')}
                className="p-3 cursor-pointer hover:text-white text-right"
              >
                WoW Change {getSortIcon('mmNetChange')}
              </th>
              <th
                onClick={() => handleSort('mmPercentile')}
                className="p-3 cursor-pointer hover:text-white text-center"
              >
                Percentile Rank {getSortIcon('mmPercentile')}
              </th>
              <th className="p-3 text-center">Bias</th>
              <th
                onClick={() => handleSort('amPercentile')}
                className="p-3 cursor-pointer hover:text-white text-center"
              >
                Asset Mgr % {getSortIcon('amPercentile')}
              </th>
              <th className="p-3 text-center">Dealer Hedge</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2d3d]/50">
            {filtered.map((item) => (
              <tr
                key={item.contractId}
                onClick={() => onSelect(item.contractId)}
                className="hover:bg-white/[0.03] cursor-pointer transition-colors"
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.contractName}</span>
                    <span className="text-[10px] text-[#818cf8] bg-[#6366f1]/10 px-1.5 py-0.5 rounded border border-[#6366f1]/20">
                      {item.ticker}
                    </span>
                    <span className="text-[10px] text-[#64748b] bg-[#1e2d3d]/40 px-1 py-0.5 rounded">
                      {item.exchange}
                    </span>
                  </div>
                </td>

                <td className="p-3 text-[#94a3b8] capitalize">{item.category}</td>

                <td
                  className="p-3 font-bold text-right"
                  style={{ color: item.mmNet >= 0 ? '#10b981' : '#ef4444' }}
                >
                  {formatNumberSigned(item.mmNet)}
                </td>

                <td
                  className="p-3 font-bold text-right"
                  style={{ color: item.mmNetChange >= 0 ? '#10b981' : '#ef4444' }}
                >
                  {item.mmNetChange >= 0 ? '▲' : '▼'} {formatNumberSigned(item.mmNetChange)}
                </td>

                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-bold text-white w-8 text-right">
                      {item.mmPercentile}%
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-[#1e2d3d] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.mmPercentile}%`,
                          backgroundColor:
                            item.mmPercentile >= 50 ? '#10b981' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                </td>

                <td className="p-3 text-center">
                  <SignalBadge signal={item.signal} />
                </td>

                <td className="p-3 text-center text-[#94a3b8] font-bold">
                  {item.amPercentile > 0 ? `${item.amPercentile}%` : '—'}
                </td>

                <td className="p-3 text-center">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded"
                    style={{
                      color: item.dealerBias.includes('SHORT') ? '#10b981' : '#ef4444',
                      backgroundColor: item.dealerBias.includes('SHORT')
                        ? 'rgba(16,185,129,0.1)'
                        : 'rgba(239,68,68,0.1)',
                    }}
                  >
                    {item.dealerBias.includes('SHORT') ? 'SHORT HEDGING' : 'LONG INVENTORY'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
