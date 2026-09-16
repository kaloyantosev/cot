'use client';

import { motion } from 'framer-motion';
import { instruments } from '@/lib/mockData';
import { getPercentile, getSignalFromPercentile } from '@/lib/utils';
import { analyzeBrieseCOT } from '@/lib/brieseModels';
import SignalBadge from './SignalBadge';

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

export default function CrossMarketHeatmap() {
  const heatmapData: HeatmapCellData[] = CATEGORIES.map((cat) => {
    const subset = instruments.filter((i) => i.category === cat.key);

    let commPcts: number[] = [];
    let specPcts: number[] = [];
    let brieseScores: number[] = [];
    let dealerPcts: number[] = [];

    subset.forEach((inst) => {
      // Briese Analysis
      const briese = analyzeBrieseCOT(inst);
      brieseScores.push(briese.cotIndex3Y);

      // Speculator Percentile
      const allNets = inst.history.map((h) => h.netLong);
      const specPct = getPercentile(inst.netPosition, allNets);
      specPcts.push(specPct);

      if (inst.isFinancial) {
        // Asset Managers are Commercial/Institutional Smart Money in Financials
        const allAmNets = inst.history.map((h) => (h.asset_long ?? 0) - (h.asset_short ?? 0));
        const latestAm = (inst.history[inst.history.length - 1].asset_long ?? 0) - (inst.history[inst.history.length - 1].asset_short ?? 0);
        commPcts.push(getPercentile(latestAm, allAmNets));

        // Dealers are intermediaries / contra-hedgers
        const allDealerNets = inst.history.map((h) => (h.dealer_long ?? 0) - (h.dealer_short ?? 0));
        const latestDealer = (inst.history[inst.history.length - 1].dealer_long ?? 0) - (inst.history[inst.history.length - 1].dealer_short ?? 0);
        dealerPcts.push(getPercentile(latestDealer, allDealerNets));
      } else {
        // Physical Producers are the primary Commercial Hedgers in Commodities
        const allProdNets = inst.history.map((h) => (h.prod_long ?? 0) - (h.prod_short ?? 0));
        const latestProd = (inst.history[inst.history.length - 1].prod_long ?? 0) - (inst.history[inst.history.length - 1].prod_short ?? 0);
        commPcts.push(getPercentile(latestProd, allProdNets));

        // No dealers in physical commodities; neutral benchmark
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

  const crowdedList = instruments
    .map((inst) => {
      const allNets = inst.history.map((h) => h.netLong);
      const pct = Math.round(getPercentile(inst.netPosition, allNets));
      const distance = Math.abs(pct - 50);
      return {
        inst,
        pct,
        distance,
        isLongExtreme: pct >= 50,
      };
    })
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          Cross-Market Institutional Heatmap &amp; Briese Composite
        </h2>
        <p className="text-xs text-[#64748b]">
          Cross-sector capital positioning: Commercial Insiders (Producers/Asset Managers), Speculative Funds, and Stephen Briese Composite Indexes.
        </p>
      </div>

      <div className="p-5 rounded-xl border border-[#1e2d3d] bg-[#0d1117]/80 backdrop-blur-md overflow-x-auto">
        <table className="w-full text-left font-mono border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-[#1e2d3d] text-xs uppercase text-[#64748b]">
              <th className="p-3 w-1/4">Asset Class</th>
              {/* Primary Insiders first */}
              <th className="p-3 text-center">Commercial Insiders (Producers/Asset Mgrs)</th>
              {/* Speculative crowd second */}
              <th className="p-3 text-center">Large Speculators (Managed Money/Lev Funds)</th>
              {/* Briese Model Composite third */}
              <th className="p-3 text-center">Briese 3Y Composite Index</th>
              {/* Dealers placed at the bottom/end */}
              <th className="p-3 text-center text-[#475569]">Dealers (Contra Inventory)</th>
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
                    <div
                      className="py-2.5 px-3 rounded-lg border flex flex-col items-center justify-center transition-transform hover:scale-105"
                      style={{ background: commStyle.bg, borderColor: commStyle.border, color: commStyle.text }}
                    >
                      <span className="font-bold text-sm">{row.commercialPercentile}%</span>
                      <span className="text-[9px] uppercase tracking-wider opacity-90 font-bold">
                        {row.commercialPercentile >= 50 ? 'ACCUMULATION' : 'SHORT HEDGING'}
                      </span>
                    </div>
                  </td>

                  {/* Large Speculators */}
                  <td className="p-2 text-center">
                    <div
                      className="py-2.5 px-3 rounded-lg border flex flex-col items-center justify-center transition-transform hover:scale-105"
                      style={{ background: specStyle.bg, borderColor: specStyle.border, color: specStyle.text }}
                    >
                      <span className="font-bold text-sm">{row.specPercentile}%</span>
                      <span className="text-[9px] uppercase tracking-wider opacity-90 font-bold">
                        {row.specPercentile >= 50 ? 'NET LONG' : 'NET SHORT'}
                      </span>
                    </div>
                  </td>

                  {/* Briese 3Y Composite Index */}
                  <td className="p-2 text-center">
                    <div
                      className="py-2.5 px-3 rounded-lg border flex flex-col items-center justify-center transition-transform hover:scale-105"
                      style={{ background: brieseStyle.bg, borderColor: brieseStyle.border, color: brieseStyle.text }}
                    >
                      <span className="font-bold text-sm">{row.brieseComposite}%</span>
                      <span className="text-[9px] uppercase tracking-wider opacity-90 font-bold">
                        {row.brieseComposite >= 80
                          ? 'BUYING CLIMAX'
                          : row.brieseComposite <= 20
                          ? 'SELLING CLIMAX'
                          : row.brieseComposite >= 50
                          ? 'BULLISH BIAS'
                          : 'BEARISH BIAS'}
                      </span>
                    </div>
                  </td>

                  {/* Dealers (Contra Inventory - at the bottom/end) */}
                  <td className="p-2 text-center">
                    <div
                      className="py-2.5 px-3 rounded-lg border flex flex-col items-center justify-center"
                      style={{ background: dealerStyle.bg, borderColor: dealerStyle.border, color: dealerStyle.text }}
                    >
                      <span className="font-bold text-sm">{row.dealerPercentile}%</span>
                      <span className="text-[9px] uppercase tracking-wider opacity-90 font-bold">
                        {row.dealerPercentile >= 50 ? 'INVENTORY LONG' : 'SHORT HEDGING'}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-5 rounded-xl border border-[#1e2d3d] bg-[#0d1117]/80 backdrop-blur-md flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-mono font-bold text-sm text-white uppercase tracking-wider">
              Top 6 Crowded Institutional Trades (By Statistical Distance)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#64748b]">CFTC Historical Percentile</span>
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
                className="p-3.5 rounded-lg border flex flex-col gap-2 transition-colors"
                style={{
                  background: isLong ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
                  borderColor: isLong ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#64748b]">#{idx + 1}</span>
                    <span className="text-xs font-mono font-bold text-white">{item.inst.name}</span>
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
    </div>
  );
}
