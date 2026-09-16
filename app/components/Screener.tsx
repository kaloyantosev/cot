'use client';

import { useState } from 'react';
import { computeAllSignals, type COTSignal } from '@/lib/cotSignals';
import { formatNumberSigned } from '@/lib/utils';
import SignalBadge from './SignalBadge';

interface ScreenerProps {
  onSelect: (contractId: string) => void;
}

type FilterType =
  | 'all'
  | 'buying_climax'
  | 'selling_climax'
  | 'surge_40'
  | 'extreme_long'
  | 'extreme_short'
  | 'crossover'
  | 'largest_change';

type SortCol =
  | 'contractName'
  | 'category'
  | 'cotIndex3Y'
  | 'movementIndex6W'
  | 'commercialBias'
  | 'mmNet'
  | 'mmNetChange'
  | 'mmPercentile'
  | 'amPercentile';

export default function Screener({ onSelect }: ScreenerProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortCol, setSortCol] = useState<SortCol>('cotIndex3Y');
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

    if (filter === 'buying_climax') return item.briese?.isBuyingClimax;
    if (filter === 'selling_climax') return item.briese?.isSellingClimax;
    if (filter === 'surge_40') return item.briese?.surgeSignal !== 'NONE';
    if (filter === 'extreme_long') return item.mmPercentile >= 80;
    if (filter === 'extreme_short') return item.mmPercentile <= 20;
    if (filter === 'crossover') return item.isCrossover;
    if (filter === 'largest_change') return Math.abs(item.mmNetChange) >= 10000;
    return true;
  });

  filtered.sort((a, b) => {
    let vA: any;
    let vB: any;

    if (sortCol === 'cotIndex3Y') {
      vA = a.briese?.cotIndex3Y ?? 50;
      vB = b.briese?.cotIndex3Y ?? 50;
    } else if (sortCol === 'movementIndex6W') {
      vA = a.briese?.movementIndex6W ?? 0;
      vB = b.briese?.movementIndex6W ?? 0;
    } else if (sortCol === 'commercialBias') {
      vA = a.briese?.commercialBias ?? '';
      vB = b.briese?.commercialBias ?? '';
    } else {
      vA = a[sortCol as keyof COTSignal];
      vB = b[sortCol as keyof COTSignal];
    }

    if (typeof vA === 'string') {
      return sortDir === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
    }
    return sortDir === 'asc' ? vA - vB : vB - vA;
  });

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const getSortIcon = (col: SortCol) => {
    if (sortCol !== col) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
            Institutional COT &amp; Briese Signal Screener
          </h2>
          <p className="text-xs text-[#64748b]">
            Multi-model institutional scanning: Briese 3Y COT Index, 6-Week Movement Index, 40-Point Surges, and Fund Positioning.
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
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#64748b] hover:text-white font-mono"
            >
              X
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
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

        {/* Briese Core Models */}
        <button
          onClick={() => setFilter('buying_climax')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'buying_climax'
              ? { backgroundColor: '#10b981', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          Commercial Buying Climax (&gt;=90%)
        </button>
        <button
          onClick={() => setFilter('selling_climax')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'selling_climax'
              ? { backgroundColor: '#ef4444', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          Commercial Selling Climax (&lt;=10%)
        </button>
        <button
          onClick={() => setFilter('surge_40')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'surge_40'
              ? { backgroundColor: '#f59e0b', color: '#000', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          40-Point Surge Signal
        </button>

        {/* Speculator Dynamics */}
        <button
          onClick={() => setFilter('extreme_long')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'extreme_long'
              ? { backgroundColor: '#059669', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          Crowded Spec Long (&gt;80%)
        </button>
        <button
          onClick={() => setFilter('extreme_short')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'extreme_short'
              ? { backgroundColor: '#dc2626', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          Crowded Spec Short (&lt;20%)
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
          Zero-Line Crossover
        </button>
        <button
          onClick={() => setFilter('largest_change')}
          className="px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border"
          style={
            filter === 'largest_change'
              ? { backgroundColor: '#d97706', color: '#fff', borderColor: 'transparent' }
              : { backgroundColor: 'transparent', color: '#94a3b8', borderColor: '#1e2d3d' }
          }
        >
          Largest WoW Shift
        </button>
      </div>

      <div className="rounded-xl border border-[#1e2d3d] bg-[#0d1117]/80 backdrop-blur-md overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse min-w-[950px]">
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
                onClick={() => handleSort('cotIndex3Y')}
                className="p-3 cursor-pointer hover:text-white text-center"
              >
                Briese 3Y Index {getSortIcon('cotIndex3Y')}
              </th>
              <th
                onClick={() => handleSort('movementIndex6W')}
                className="p-3 cursor-pointer hover:text-white text-center"
              >
                6W Movement {getSortIcon('movementIndex6W')}
              </th>
              <th
                onClick={() => handleSort('commercialBias')}
                className="p-3 cursor-pointer hover:text-white text-center"
              >
                Commercial Bias {getSortIcon('commercialBias')}
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
                Spec Rank {getSortIcon('mmPercentile')}
              </th>
              <th className="p-3 text-center">Spec Bias</th>
              {/* Dealers placed at the very end/bottom of table */}
              <th className="p-3 text-center text-[#64748b]">Dealer Hedge (Contra)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2d3d]/50">
            {filtered.map((item) => {
              const briese = item.briese;
              const cotIdx = briese?.cotIndex3Y ?? 50;
              const move6W = briese?.movementIndex6W ?? 0;

              return (
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

                  {/* Briese 3Y COT Index Column */}
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="font-extrabold text-sm"
                          style={{
                            color:
                              cotIdx >= 90
                                ? '#10b981'
                                : cotIdx >= 70
                                ? '#34d399'
                                : cotIdx <= 10
                                ? '#ef4444'
                                : cotIdx <= 30
                                ? '#f87171'
                                : '#94a3b8',
                          }}
                        >
                          {cotIdx}%
                        </span>
                        {briese?.isBuyingClimax && (
                          <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
                            BUY CLIMAX
                          </span>
                        )}
                        {briese?.isSellingClimax && (
                          <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/40">
                            SELL CLIMAX
                          </span>
                        )}
                      </div>
                      <div className="w-16 h-1 rounded-full bg-[#1e2d3d] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${cotIdx}%`,
                            backgroundColor:
                              cotIdx >= 70 ? '#10b981' : cotIdx <= 30 ? '#ef4444' : '#64748b',
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* 6W Movement Index Column */}
                  <td className="p-3 text-center">
                    <div className="flex flex-col items-center">
                      <span
                        className="font-mono font-bold"
                        style={{
                          color: move6W > 0 ? '#10b981' : move6W < 0 ? '#ef4444' : '#94a3b8',
                        }}
                      >
                        {move6W > 0 ? `+${move6W}` : move6W} pts
                      </span>
                      {briese?.surgeSignal === 'BULLISH_40_SURGE' && (
                        <span className="text-[9px] font-extrabold text-[#10b981] bg-[#10b981]/15 px-1 rounded border border-[#10b981]/30">
                          +40 SURGE
                        </span>
                      )}
                      {briese?.surgeSignal === 'BEARISH_40_SURGE' && (
                        <span className="text-[9px] font-extrabold text-[#ef4444] bg-[#ef4444]/15 px-1 rounded border border-[#ef4444]/30">
                          -40 SURGE
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Commercial Bias */}
                  <td className="p-3 text-center">
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor:
                          briese?.commercialBias.includes('BULLISH')
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                        borderColor:
                          briese?.commercialBias.includes('BULLISH')
                            ? 'rgba(16, 185, 129, 0.3)'
                            : 'rgba(239, 68, 68, 0.3)',
                        color:
                          briese?.commercialBias.includes('BULLISH') ? '#10b981' : '#ef4444',
                      }}
                    >
                      {briese?.commercialBias.replace('_', ' ') ?? 'BALANCED'}
                    </span>
                  </td>

                  {/* Spec Net */}
                  <td
                    className="p-3 font-bold text-right"
                    style={{ color: item.mmNet >= 0 ? '#10b981' : '#ef4444' }}
                  >
                    {formatNumberSigned(item.mmNet)}
                  </td>

                  {/* WoW Change */}
                  <td
                    className="p-3 font-bold text-right"
                    style={{ color: item.mmNetChange >= 0 ? '#10b981' : '#ef4444' }}
                  >
                    {formatNumberSigned(item.mmNetChange)}
                  </td>

                  {/* Spec Rank */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="font-bold text-white w-7 text-right">
                        {item.mmPercentile}%
                      </span>
                      <div className="w-12 h-1 rounded-full bg-[#1e2d3d] overflow-hidden">
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

                  {/* Spec Bias */}
                  <td className="p-3 text-center">
                    <SignalBadge signal={item.signal} />
                  </td>

                  {/* Dealers (Placed at the end / bottom) */}
                  <td className="p-3 text-center">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        color: item.dealerBias.includes('SHORT') ? '#10b981' : '#ef4444',
                        backgroundColor: item.dealerBias.includes('SHORT')
                          ? 'rgba(16,185,129,0.08)'
                          : 'rgba(239,68,68,0.08)',
                      }}
                    >
                      {item.dealerBias.includes('SHORT') ? 'SHORT HEDGING' : 'LONG INVENTORY'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
