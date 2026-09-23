'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

import CommandBar from './components/CommandBar';
import AssetGrid from './components/AssetGrid';
import PositioningTimeline from './components/PositioningTimeline';
import PercentileGauge from './components/PercentileGauge';
import ComparisonTable from './components/ComparisonTable';
import CrossMarketHeatmap from './components/CrossMarketHeatmap';
import BrieseAnalysisPanel from './components/BrieseAnalysisPanel';
import BrieseSectorComposites from './components/BrieseSectorComposites';

import { instruments, type Instrument } from '@/lib/mockData';
import { generateCOTSummary } from '@/lib/cotSignals';
import { getPercentile, formatDate } from '@/lib/utils';

type PeriodPreset = '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<string | null>(null);

  // Period Selector State
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>('1Y');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const currentInstrument: Instrument | undefined = useMemo(() => {
    return selectedContract ? instruments.find((i) => i.id === selectedContract) : undefined;
  }, [selectedContract]);

  // Compute sliced history based on selected period
  const filteredHistory = useMemo(() => {
    if (!currentInstrument) return [];
    const full = currentInstrument.history;
    if (full.length === 0) return [];

    if (customStartDate || customEndDate) {
      const start = customStartDate || full[0]?.date || '';
      const end = customEndDate || full[full.length - 1]?.date || '';
      const sliced = full.filter((h) => h.date >= start && h.date <= end);
      if (sliced.length > 0) return sliced;
    }

    switch (selectedPeriod) {
      case '1M':
        return full.slice(-4);
      case '3M':
        return full.slice(-13);
      case '6M':
        return full.slice(-26);
      case '1Y':
        return full.slice(-52);
      case '3Y':
        return full.slice(-156);
      case '5Y':
        return full.slice(-260);
      case 'ALL':
      default:
        return full;
    }
  }, [currentInstrument, selectedPeriod, customStartDate, customEndDate]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSelectedContract(null);
  };

  const handleContractSelect = (id: string) => {
    const inst = instruments.find((i) => i.id === id);
    if (inst) {
      setActiveCategory(inst.category);
      setSelectedContract(id);
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const handleGoHome = () => {
    setActiveCategory('all');
    setSelectedContract(null);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const handlePeriodChange = (p: PeriodPreset) => {
    setSelectedPeriod(p);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050810] text-[#f1f5f9]">
      {/* 1. Command Bar (Fixed Top with Dashboard & Categories) */}
      <CommandBar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onContractSelect={handleContractSelect}
        onGoHome={handleGoHome}
        instruments={instruments}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-16 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-8">
          {/* CLEAN TERMINAL HEADER (when no contract is selected) */}
          {!selectedContract && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e2d3d]/60">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <h1 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-wide">
                    CFTC COMMITMENTS OF TRADERS TERMINAL
                  </h1>
                </div>
                <p className="text-xs text-[#94a3b8] font-mono">
                  Direct commercial hedging intelligence, fund momentum, and Briese analyzing models.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-[#64748b]">
                <span className="px-2.5 py-1 rounded bg-[#0d1117] border border-[#1e2d3d]">
                  28 Liquid Futures
                </span>
                <span className="px-2.5 py-1 rounded bg-[#0d1117] border border-[#1e2d3d] text-[#10b981]">
                  Official CFTC 2018 – 2026
                </span>
              </div>
            </div>
          )}

          {/* DASHBOARD HOMEPAGE: SECTOR COMPOSITES, CONTRACTS, AND CROSS-MARKET HEATMAP */}
          {!selectedContract && (
            <div className="flex flex-col gap-8">
              {/* Sector Composites (adjusted to selected category) */}
              <BrieseSectorComposites
                instruments={instruments}
                activeCategory={activeCategory}
              />

              {/* Futures Contracts Grid */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    {activeCategory === 'all'
                      ? 'Tracked Futures Contracts (28 Markets)'
                      : `Tracked ${activeCategory.toUpperCase()} Futures`}
                  </h3>
                  <span className="text-xs font-mono text-[#64748b]">
                    Click any contract to load complete unified analysis
                  </span>
                </div>
                <AssetGrid
                  category={activeCategory}
                  instruments={instruments}
                  onSelect={(id) => handleContractSelect(id)}
                />
              </div>

              {/* Cross-Market Heatmap & Crowded Trades directly on homepage */}
              <div className="pt-4 border-t border-[#1e2d3d]/60">
                <CrossMarketHeatmap
                  activeCategory={activeCategory}
                  onSelectContract={(id) => handleContractSelect(id)}
                />
              </div>
            </div>
          )}

          {/* UNIFIED FULL-PAGE INSTRUMENT VIEW (NO SUB-PAGES / SUB-TABS) */}
          {selectedContract && currentInstrument && filteredHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {/* 1. TOP HEADER & PERIOD SELECTOR */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl border border-[#1e2d3d] bg-[#0d1117]/95 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedContract(null)}
                    className="px-3.5 py-2 rounded-lg border border-[#1e2d3d] bg-[#0a0e19] text-xs font-mono font-semibold text-[#94a3b8] hover:text-white hover:border-[#6366f1] transition-all flex items-center gap-2 shrink-0"
                  >
                    <span>←</span>
                    <span>All Contracts</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-extrabold font-mono text-white">
                      {currentInstrument.name}
                    </h2>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#6366f1]/15 text-[#818cf8] border border-[#6366f1]/30">
                      {currentInstrument.ticker}
                    </span>
                    <span className="font-mono text-xs text-[#64748b] bg-[#1e2d3d]/50 px-2.5 py-1 rounded">
                      {currentInstrument.exchange}
                    </span>
                  </div>
                </div>

                {/* Period Selector Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-[#64748b] uppercase font-bold mr-1">
                    Period:
                  </span>
                  {(['1M', '3M', '6M', '1Y', '3Y', '5Y', 'ALL'] as PeriodPreset[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePeriodChange(p)}
                      className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all border"
                      style={
                        selectedPeriod === p && !customStartDate
                          ? {
                              backgroundColor: '#6366f1',
                              borderColor: '#6366f1',
                              color: '#ffffff',
                              boxShadow: '0 0 8px rgba(99,102,241,0.4)',
                            }
                          : {
                              backgroundColor: 'transparent',
                              borderColor: '#1e2d3d',
                              color: '#94a3b8',
                            }
                      }
                    >
                      {p}
                    </button>
                  ))}

                  {/* Date Pickers for Custom Range (Newest dates first) */}
                  <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-[#1e2d3d]">
                    <select
                      value={customStartDate || filteredHistory[0]?.date || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomStartDate(val);
                        if (!customEndDate) {
                          setCustomEndDate(filteredHistory[filteredHistory.length - 1]?.date || '');
                        }
                      }}
                      className="bg-[#0a0e19] border border-[#1e2d3d] rounded px-2 py-1 text-xs font-mono text-white outline-none focus:border-[#6366f1]"
                      title="Start Date"
                    >
                      {[...currentInstrument.history].reverse().map((h) => (
                        <option key={h.date} value={h.date}>
                          {formatDate(h.date)}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-[#64748b] font-mono">→</span>
                    <select
                      value={
                        customEndDate ||
                        filteredHistory[filteredHistory.length - 1]?.date ||
                        ''
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomEndDate(val);
                        if (!customStartDate) {
                          setCustomStartDate(filteredHistory[0]?.date || '');
                        }
                      }}
                      className="bg-[#0a0e19] border border-[#1e2d3d] rounded px-2 py-1 text-xs font-mono text-white outline-none focus:border-[#6366f1]"
                      title="End Date"
                    >
                      {[...currentInstrument.history].reverse().map((h) => (
                        <option key={h.date} value={h.date}>
                          {formatDate(h.date)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. SECTION: POSITIONING TIMELINE CHART */}
              <PositioningTimeline
                instrument={currentInstrument}
                customHistory={filteredHistory}
              />

              {/* 3. SECTION: STEPHEN BRIESE COT MODEL & CME COMMERCIAL ANALYTICS */}
              <BrieseAnalysisPanel
                instrument={currentInstrument}
                filteredHistory={currentInstrument.history}
              />

              {/* 4. SECTION: INSTITUTIONAL PERCENTILE GAUGES */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    Statistical Percentile Distribution (Full History Baseline: {currentInstrument.history.length} Reports)
                  </h3>
                  <span className="text-[11px] font-mono text-[#64748b]">
                    Standard 3-Year &amp; Multi-Year CFTC Range
                  </span>
                </div>

                {currentInstrument.isFinancial ? (
                  (() => {
                    const allDealer = currentInstrument.history.map(
                      (h) => (h.dealer_long ?? 0) - (h.dealer_short ?? 0)
                    );
                    const allAsset = currentInstrument.history.map(
                      (h) => (h.asset_long ?? 0) - (h.asset_short ?? 0)
                    );
                    const allLev = currentInstrument.history.map(
                      (h) => (h.lev_long ?? 0) - (h.lev_short ?? 0)
                    );

                    const latest = filteredHistory[filteredHistory.length - 1];
                    const dNet = (latest.dealer_long ?? 0) - (latest.dealer_short ?? 0);
                    const aNet = (latest.asset_long ?? 0) - (latest.asset_short ?? 0);
                    const lNet = (latest.lev_long ?? 0) - (latest.lev_short ?? 0);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <PercentileGauge
                          label="Asset Managers"
                          percentile={getPercentile(aNet, allAsset)}
                          currentNet={aNet}
                          highNet={Math.max(...allAsset)}
                          lowNet={Math.min(...allAsset)}
                        />
                        <PercentileGauge
                          label="Leveraged Funds (CTAs)"
                          percentile={getPercentile(lNet, allLev)}
                          currentNet={lNet}
                          highNet={Math.max(...allLev)}
                          lowNet={Math.min(...allLev)}
                        />
                        <PercentileGauge
                          label="Dealers / Intermediaries"
                          percentile={getPercentile(dNet, allDealer)}
                          currentNet={dNet}
                          highNet={Math.max(...allDealer)}
                          lowNet={Math.min(...allDealer)}
                        />
                      </div>
                    );
                  })()
                ) : (
                  (() => {
                    const allProd = currentInstrument.history.map(
                      (h) => (h.prod_long ?? 0) - (h.prod_short ?? 0)
                    );
                    const allMm = currentInstrument.history.map(
                      (h) => (h.mm_long ?? 0) - (h.mm_short ?? 0)
                    );
                    const allOther = currentInstrument.history.map(
                      (h) => (h.other_long ?? 0) - (h.other_short ?? 0)
                    );

                    const latest = filteredHistory[filteredHistory.length - 1];
                    const pNet = (latest.prod_long ?? 0) - (latest.prod_short ?? 0);
                    const mNet = (latest.mm_long ?? 0) - (latest.mm_short ?? 0);
                    const oNet = (latest.other_long ?? 0) - (latest.other_short ?? 0);

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <PercentileGauge
                          label="Commercial Producers"
                          percentile={getPercentile(pNet, allProd)}
                          currentNet={pNet}
                          highNet={Math.max(...allProd)}
                          lowNet={Math.min(...allProd)}
                        />
                        <PercentileGauge
                          label="Managed Money (Funds)"
                          percentile={getPercentile(mNet, allMm)}
                          currentNet={mNet}
                          highNet={Math.max(...allMm)}
                          lowNet={Math.min(...allMm)}
                        />
                        <PercentileGauge
                          label="Other Reportables"
                          percentile={getPercentile(oNet, allOther)}
                          currentNet={oNet}
                          highNet={Math.max(...allOther)}
                          lowNet={Math.min(...allOther)}
                        />
                      </div>
                    );
                  })()
                )}
              </div>

              {/* 5. SECTION: COMPARATIVE AUDIT TABLE */}
              <div>
                <div className="mb-3">
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    Period Start vs. Period End Audit Table
                  </h3>
                </div>

                <ComparisonTable
                  key={`${currentInstrument.id}-${filteredHistory[0]?.date}-${filteredHistory[filteredHistory.length - 1]?.date}`}
                  instrument={currentInstrument}
                  summary={generateCOTSummary(currentInstrument.id)}
                  initialDate1={filteredHistory[0]?.date}
                  initialDate2={filteredHistory[filteredHistory.length - 1]?.date}
                />
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2d3d] bg-[#070b14] py-4 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#64748b]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" />
            <span className="text-white font-bold tracking-wider">COT PRO</span>
            <span>— Institutional Positioning Terminal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#10b981]">Official CFTC Historical Filings (2018 – 2026)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
