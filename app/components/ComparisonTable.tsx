'use client';

import { useState, useEffect } from 'react';
import type { Instrument } from '@/lib/mockData';
import { formatNumber, formatNumberSigned, formatPct, formatDate } from '@/lib/utils';

interface ComparisonTableProps {
  instrument: Instrument;
  summary: string;
  initialDate1?: string;
  initialDate2?: string;
}

export default function ComparisonTable({
  instrument,
  summary,
  initialDate1,
  initialDate2,
}: ComparisonTableProps) {
  const history = instrument.history;
  const dates = history.map((h) => h.date);
  const reversedDates = [...dates].reverse();

  const defaultDate2 = initialDate2 || dates[dates.length - 1];
  const defaultDate1 = initialDate1 || dates[Math.max(0, dates.length - 5)];

  const [date1, setDate1] = useState<string>(defaultDate1);
  const [date2, setDate2] = useState<string>(defaultDate2);

  // Sync date state when props change or instrument changes
  useEffect(() => {
    if (initialDate1) setDate1(initialDate1);
    else setDate1(dates[Math.max(0, dates.length - 5)] || '');
  }, [initialDate1, instrument.id]);

  useEffect(() => {
    if (initialDate2) setDate2(initialDate2);
    else setDate2(dates[dates.length - 1] || '');
  }, [initialDate2, instrument.id]);

  const d1 = history.find((h) => h.date === date1) || history[0];
  const d2 = history.find((h) => h.date === date2) || history[history.length - 1];

  interface TableRow {
    category: string;
    catColor: string;
    pos: string;
    val1: number;
    val2: number;
    isFirst: boolean;
    long1: number;
    short1: number;
    long2: number;
    short2: number;
  }

  const rows: TableRow[] = [];

  // Dealers are placed at the bottom/end of the table
  if (instrument.isFinancial) {
    rows.push({
      category: 'Asset Managers',
      catColor: '#3b82f6',
      pos: 'Long',
      val1: d1.asset_long ?? 0,
      val2: d2.asset_long ?? 0,
      isFirst: true,
      long1: d1.asset_long ?? 0,
      short1: d1.asset_short ?? 0,
      long2: d2.asset_long ?? 0,
      short2: d2.asset_short ?? 0,
    });
    rows.push({
      category: 'Asset Managers',
      catColor: '#3b82f6',
      pos: 'Short',
      val1: d1.asset_short ?? 0,
      val2: d2.asset_short ?? 0,
      isFirst: false,
      long1: d1.asset_long ?? 0,
      short1: d1.asset_short ?? 0,
      long2: d2.asset_long ?? 0,
      short2: d2.asset_short ?? 0,
    });

    rows.push({
      category: 'Leveraged Funds',
      catColor: '#8b5cf6',
      pos: 'Long',
      val1: d1.lev_long ?? 0,
      val2: d2.lev_long ?? 0,
      isFirst: true,
      long1: d1.lev_long ?? 0,
      short1: d1.lev_short ?? 0,
      long2: d2.lev_long ?? 0,
      short2: d2.lev_short ?? 0,
    });
    rows.push({
      category: 'Leveraged Funds',
      catColor: '#8b5cf6',
      pos: 'Short',
      val1: d1.lev_short ?? 0,
      val2: d2.lev_short ?? 0,
      isFirst: false,
      long1: d1.lev_long ?? 0,
      short1: d1.lev_short ?? 0,
      long2: d2.lev_long ?? 0,
      short2: d2.lev_short ?? 0,
    });

    // Dealers at the bottom
    rows.push({
      category: 'Dealers',
      catColor: '#f59e0b',
      pos: 'Long',
      val1: d1.dealer_long ?? 0,
      val2: d2.dealer_long ?? 0,
      isFirst: true,
      long1: d1.dealer_long ?? 0,
      short1: d1.dealer_short ?? 0,
      long2: d2.dealer_long ?? 0,
      short2: d2.dealer_short ?? 0,
    });
    rows.push({
      category: 'Dealers',
      catColor: '#f59e0b',
      pos: 'Short',
      val1: d1.dealer_short ?? 0,
      val2: d2.dealer_short ?? 0,
      isFirst: false,
      long1: d1.dealer_long ?? 0,
      short1: d1.dealer_short ?? 0,
      long2: d2.dealer_long ?? 0,
      short2: d2.dealer_short ?? 0,
    });
  } else {
    // Commercial Producers lead, Managed Money second
    rows.push({
      category: 'Producers',
      catColor: '#6366f1',
      pos: 'Long',
      val1: d1.prod_long ?? 0,
      val2: d2.prod_long ?? 0,
      isFirst: true,
      long1: d1.prod_long ?? 0,
      short1: d1.prod_short ?? 0,
      long2: d2.prod_long ?? 0,
      short2: d2.prod_short ?? 0,
    });
    rows.push({
      category: 'Producers',
      catColor: '#6366f1',
      pos: 'Short',
      val1: d1.prod_short ?? 0,
      val2: d2.prod_short ?? 0,
      isFirst: false,
      long1: d1.prod_long ?? 0,
      short1: d1.prod_short ?? 0,
      long2: d2.prod_long ?? 0,
      short2: d2.prod_short ?? 0,
    });

    rows.push({
      category: 'Managed Money',
      catColor: '#10b981',
      pos: 'Long',
      val1: d1.mm_long ?? 0,
      val2: d2.mm_long ?? 0,
      isFirst: true,
      long1: d1.mm_long ?? 0,
      short1: d1.mm_short ?? 0,
      long2: d2.mm_long ?? 0,
      short2: d2.mm_short ?? 0,
    });
    rows.push({
      category: 'Managed Money',
      catColor: '#10b981',
      pos: 'Short',
      val1: d1.mm_short ?? 0,
      val2: d2.mm_short ?? 0,
      isFirst: false,
      long1: d1.mm_long ?? 0,
      short1: d1.mm_short ?? 0,
      long2: d2.mm_long ?? 0,
      short2: d2.mm_short ?? 0,
    });
  }

  const calcRatio = (l: number, s: number) => {
    if (s === 0) return '∞ : 1';
    return `${(l / s).toFixed(2)} : 1`;
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border border-[#1e2d3d] bg-[#0d1117]/80 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5">
          Two-Report Comparative Audit
        </h4>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-[#64748b]">Base:</span>
            <select
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="bg-[#0a0e19] border border-[#1e2d3d] rounded-lg px-2.5 py-1 text-xs font-mono text-white outline-none focus:border-[#6366f1]"
            >
              {reversedDates.map((d) => (
                <option key={d} value={d}>
                  {formatDate(d)}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-[#64748b] font-mono">→</span>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-[#64748b]">Target:</span>
            <select
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="bg-[#0a0e19] border border-[#1e2d3d] rounded-lg px-2.5 py-1 text-xs font-mono text-white outline-none focus:border-[#6366f1]"
            >
              {reversedDates.map((d) => (
                <option key={d} value={d}>
                  {formatDate(d)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[#1e2d3d]">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#0a0e19] text-[#64748b] uppercase border-b border-[#1e2d3d]">
              <th className="p-3">Category</th>
              <th className="p-3">Position</th>
              <th className="p-3">{formatDate(date1)}</th>
              <th className="p-3">{formatDate(date2)}</th>
              <th className="p-3 text-right">Net Change</th>
              <th className="p-3 text-right">% Change</th>
              <th className="p-3 text-center">Ratio (Base)</th>
              <th className="p-3 text-center">Ratio (Target)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2d3d]/50">
            {rows.map((row, idx) => {
              const change = row.val2 - row.val1;
              const pctChange = row.val1 > 0 ? change / row.val1 : 0;
              return (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  {row.isFirst ? (
                    <td
                      rowSpan={2}
                      className="p-3 font-bold border-r border-[#1e2d3d]"
                      style={{ color: row.catColor }}
                    >
                      {row.category}
                    </td>
                  ) : null}
                  <td className="p-3 font-semibold text-[#94a3b8]">{row.pos}</td>
                  <td className="p-3 text-[#f1f5f9]">{formatNumber(row.val1)}</td>
                  <td className="p-3 text-[#f1f5f9] font-bold">{formatNumber(row.val2)}</td>
                  <td
                    className="p-3 font-bold text-right"
                    style={{ color: change >= 0 ? '#10b981' : '#ef4444' }}
                  >
                    {formatNumberSigned(change)}
                  </td>
                  <td
                    className="p-3 text-right"
                    style={{ color: pctChange >= 0 ? '#10b981' : '#ef4444' }}
                  >
                    {formatPct(pctChange)}
                  </td>
                  {row.isFirst ? (
                    <>
                      <td rowSpan={2} className="p-3 text-[#f59e0b] border-l border-[#1e2d3d] text-center">
                        {calcRatio(row.long1, row.short1)}
                      </td>
                      <td rowSpan={2} className="p-3 text-[#f59e0b] font-bold text-center">
                        {calcRatio(row.long2, row.short2)}
                      </td>
                    </>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {summary && (
        <div className="p-3.5 rounded-lg bg-[#0a0e19] border border-[#1e2d3d] flex flex-col gap-1">
          <span className="text-[11px] font-mono text-[#94a3b8] italic leading-relaxed">
            {summary}
          </span>
        </div>
      )}
    </div>
  );
}
