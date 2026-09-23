'use client';

import { motion } from 'framer-motion';
import { instruments } from '@/lib/mockData';
import { getPercentile, getSignalFromPercentile } from '@/lib/utils';
import { analyzeBrieseCOT } from '@/lib/brieseModels';
import SignalBadge from './SignalBadge';

interface CrossMarketHeatmapProps {
  onSelectContract?: (id: string) => void;
  activeCategory?: string;
}

interface HeatmapCellData {
  category: string;
  catLabel: string;
  commercialPercentile: number;
  specPercentile: number;
  brieseComposite: number;
  dealerPercentile: number;
}

const CATEGORIES = [
  { key: 'equities', label: 'Equity Indices' },
  { key: 'fx', label: 'FX / Currencies' },
  { key: 'rates', label: 'Rates & Bonds' },
  { key: 'energy', label: 'Energy Commodities' },
  { key: 'metals', label: 'Metals & Ags' },
];

function getCellColor(pct: number): { bg: string; text: string; border: string } {
  if (pct >= 85) return { bg: 'rgba(16, 185, 129, 0.35)', text: '#10b981', border: 'rgba(16, 185, 129, 0.5)' };
  if (pct >= 65) return { bg: 'rgba(34, 197, 94, 0.22)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.35)' };
  if (pct >= 50) return { bg: 'rgba(134, 239, 172, 0.12)', text: '#86efac', border: 'rgba(134, 239, 172, 0.2)' };
  if (pct <= 15) return { bg: 'rgba(239, 68, 68, 0.35)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.5)' };
  if (pct <= 35) return { bg: 'rgba(249, 115, 22, 0.22)', text: '#f97316', border: 'rgba(249, 115, 22, 0.35)' };
  return { bg: 'rgba(251, 146, 60, 0.12)', text: '#fdba74', border: 'rgba(251, 146, 60, 0.2)' };
}

export default function CrossMarketHeatmap({ onSelectContract, activeCategory = 'all' }: CrossMarketHeatmapProps) {
  const filteredCategories = activeCategory === 'all'
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.key === activeCategory);

  const heatmapData: HeatmapCellData[] = filteredCategories.map((cat) => {
    const subset = instruments.filter((i) => i.category === cat.key);

    let commPcts: number[] = [];
    let specPcts: number[] = [];
    let brieseScores: number[] = [];
    let dealerPcts: number[] = [];

    subset.forEach((inst) => {
      const briese = analyzeBrieseCOT(inst);
      brieseScores.push(briese.cotIndex3Y);

      const allNets = inst.history.map((h) => h.netLong);
      const specPct = getPercentile(inst.netPosition, allNets);
      specPcts.push(specPct);

      if (inst.isFinancial) {
        const allAmNets = inst.history.map((h) => (h.asset_long ?? 0) - (h.asset_short ?? 0));
        const latestAm = (inst.history[inst.history.length - 1].asset_long ?? 0) - (inst.history[inst.history.length - 1].asset_short ?? 0);
        commPcts.push(getPercentile(latestAm, allAmNets));

        const allDealerNets = inst.history.map((h) => (h.dealer_long ?? 0) - (h.dealer_short ?? 0));
        const latestDealer = (inst.history[inst.history.length - 1].dealer_long ?? 0) - (inst.history[inst.history.length - 1].dealer_short ?? 0);
        dealerPcts.push(getPercentile(latestDealer, allDealerNets));
      } else {
        const allProdNets = inst.history.map((h) => (h.prod_long ?? 0) - (h.prod_short ?? 0));
        const latestProd = (inst.history[inst.history.length - 1].prod_long ?? 0) - (inst.history[inst.history.length - 1].prod_short ?? 0);
        commPcts.push(getPercentile(latestProd, allProdNets));
        dealerPcts.push(50);
      }
    });

    const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 50);

    return {
      category: cat.key,
      catLabel: cat.label,
      commercialPercentile: avg(commPcts),
      specPercentile: avg(specPcts),
      brieseComposite: avg(brieseScores),
      dealerPercentile: avg(dealerPcts),
    };
  });

  const crowdedBase = activeCategory === 'all'
    ? instruments
    : instruments.filter((i) => i.category === activeCategory);

  const crowdedList = crowdedBase
    .map((inst) => {
      const allNets = inst.history.map((h) => h.netLong);
      const pct = Math.round(getPercentile(inst.netPosition, allNets));
      const distance = Math.abs(pct - 50);
      return { inst, pct, distance, isLongExtreme: pct >= 50 };
    })
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 6);

  // Helper to calculate proportional width percentage based on percentage value:
  // Maps 0-100% to a visual width between 40% (for low percentages) and 100% (for 100%)
  const getProportionalWidth = (pct: number): string => {
    const clamped = Math.max(0, Math.min(100, pct));
    const widthPct = Math.round(40 + (clamped / 100) * 60);
    return `${widthPct}%`;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="p-5 rounded-xl border border-[#1e2d3d] bg-[#0d1117]/80 backdrop-blur-md overflow-x-auto">
        <div className="flex flex-col gap-1 mb-4">
          <h3 className="font-mono font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            Cross-Market Capital Positioning Heatmap
          </h3>
          <p className="text-xs text-[#64748b] font-mono">
            Commercial insiders (smart money) vs. speculative trend followers and Briese multi-contract composite index.
          </p>
        </div>

        <table className="w-full text-left font-mono border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-[#1e2d3d] text-xs uppercase text-[#64748b]">
              <th className="p-3 w-1/5">Asset Class</th>
              <th className="p-3 w-1/5 text-center">Commercial Insiders (Producers/Asset Mgrs)</th>
              <th className="p-3 w-1/5 text-center">Large Speculators (Managed Money/Lev Funds)</th>
              <th className="p-3 w-1/5 text-center">Briese 3Y Composite Index</th>
              <th className="p-3 w-1/5 text-center text-[#475569]">Dealers (Contra Inventory)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2d3d]/50">
            {heatmapData.map((row) => {
              const commStyle = getCellColor(row.commercialPercentile);
              const specStyle = getCellColor(row.specPercentile);
              const brieseStyle = getCellColor(row.brieseComposite);
              const dealerStyle = getCellColor(row.dealerPercentile);

              return (
                <tr key={row.category} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-3 font-bold text-white text-sm">{row.catLabel}</td>

                  {/* Commercial Insiders */}
                  <td className="p-2 text-center">
                    <div className="flex justify-center w-full">
                      <div
                        className="py-2.5 px-3 rounded-lg border flex flex-col items-center justify-center transition-all duration-300"
                        style={{
                          width: getProportionalWidth(row.commercialPercentile),
                          background: commStyle.bg,
                          borderColor: commStyle.border,
                          color: commStyle.text,
                        }}
                      >
                        <span className="font-bold text-sm">{row.commercialPercentile}%</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-90 font-bold whitespace-nowrap">
                          {row.commercialPercentile >= 50 ? 'ACCUMULATION' : 'SHORT HEDGING'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Large Speculators */}
                  <td className="p-2 text-center">
                    <div className="flex justify-center w-full">
                      <div
                        className="py-2.5 px-3 rounded-lg border flex flex-col items-center justify-center transition-all duration-300"
                        style={{
                          width: getProportionalWidth(row.specPercentile),
                          background: specStyle.bg,
                          borderColor: specStyle.border,
                          color: specStyle.text,
                        }}
                      >
                        <span className="font-bold text-sm">{row.specPercentile}%</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-90 font-bold whitespace-nowrap">
                          {row.specPercentile >= 50 ? 'NET LONG' : 'NET SHORT'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Briese 3Y Composite Index */}
                  <td className="p-2 text-center">
                    <div className="flex justify-center w-full">
                      <div
                        className="py-2.5 px-3 rounded-lg border flex flex-col items-center justify-center transition-all duration-300"
                        style={{
                          width: getProportionalWidth(row.brieseComposite),
                          background: brieseStyle.bg,
                          borderColor: brieseStyle.border,
                          color: brieseStyle.text,
                        }}
                      >
                        <span className="font-bold text-sm">{row.brieseComposite}%</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-90 font-bold whitespace-nowrap">
                          {row.brieseComposite >= 80
                            ? 'BUYING CLIMAX'
                            : row.brieseComposite <= 20
                            ? 'SELLING CLIMAX'
                            : row.brieseComposite >= 50
                            ? 'BULLISH BIAS'
                            : 'BEARISH BIAS'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Dealers (Contra Inventory - at bottom/end) */}
                  <td className="p-2 text-center">
                    <div className="flex justify-center w-full">
                      <div
                        className="py-2.5 px-3 rounded-lg border flex flex-col items-center justify-center transition-all duration-300"
                        style={{
                          width: getProportionalWidth(row.dealerPercentile),
                          background: dealerStyle.bg,
                          borderColor: dealerStyle.border,
                          color: dealerStyle.text,
                        }}
                      >
                        <span className="font-bold text-sm">{row.dealerPercentile}%</span>
                        <span className="text-[9px] uppercase tracking-wider opacity-90 font-bold whitespace-nowrap">
                          {row.dealerPercentile >= 50 ? 'INVENTORY LONG' : 'SHORT HEDGING'}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Top Crowded Trades */}
      {crowdedList.length > 0 && (
        <div className="p-5 rounded-xl border border-[#1e2d3d] bg-[#0d1117]/80 backdrop-blur-md flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-mono font-bold text-sm text-white uppercase tracking-wider">
              Top Crowded Institutional Trades (Statistical Distance)
            </h3>
            <span className="text-[11px] font-mono text-[#64748b]">Click any card to inspect contract</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {crowdedList.map((item, idx) => {
              const signal = getSignalFromPercentile(item.pct);
              const isLong = item.isLongExtreme;
              return (
                <motion.div
                  key={item.inst.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => onSelectContract && onSelectContract(item.inst.id)}
                  className={`p-3.5 rounded-lg border flex flex-col gap-2 transition-all ${
                    onSelectContract ? 'cursor-pointer hover:border-[#6366f1]' : ''
                  }`}
                  style={{
                    background: isLong ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                    borderColor: isLong ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#64748b]">#{idx + 1}</span>
                      <span className="text-xs font-mono font-bold text-white truncate max-w-[140px]" title={item.inst.name}>
                        {item.inst.name}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#818cf8] bg-[#6366f1]/10 px-1.5 py-0.5 rounded border border-[#6366f1]/20">
                      {item.inst.ticker}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#1e2d3d]/50">
                    <SignalBadge signal={signal} />
                    <span
                      className="font-mono text-xs font-extrabold"
                      style={{ color: isLong ? '#10b981' : '#ef4444' }}
                    >
                      {item.pct}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
