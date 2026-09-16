'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

import CommandBar from './components/CommandBar';
import AssetGrid from './components/AssetGrid';
import PositioningTimeline from './components/PositioningTimeline';
import PercentileGauge from './components/PercentileGauge';
import ComparisonTable from './components/ComparisonTable';
import Screener from './components/Screener';
import CrossMarketHeatmap from './components/CrossMarketHeatmap';
import BrieseAnalysisPanel from './components/BrieseAnalysisPanel';
import BrieseSectorComposites from './components/BrieseSectorComposites';

import { instruments, type Instrument } from '@/lib/mockData';
import { generateCOTSummary } from '@/lib/cotSignals';
import { getPercentile, formatDate } from '@/lib/utils';

type NavTab = 'dashboard' | 'screener' | 'heatmap';
type PeriodPreset = '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>('equities');
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

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
    setActiveTab('dashboard');
  };

  const handleContractSelect = (id: string) => {
    const inst = instruments.find((i) => i.id === id);
    if (inst) {
      setActiveCategory(inst.category);
      setSelectedContract(id);
      setActiveTab('dashboard');
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const handlePeriodChange = (p: PeriodPreset) => {
    setSelectedPeriod(p);
    setCustomStartDate('');
    setCustomEndDate('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050810] text-[#f1f5f9]">
      {/* 1. Command Bar (Fixed Top) */}
      <CommandBar
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onContractSelect={handleContractSelect}
        instruments={instruments}
      />

      {/* 2. Secondary Sub-Nav Bar */}
      <div
        className="fixed top-16 left-0 right-0 z-40 flex items-center justify-between px-6 border-b border-[#1e2d3d]"
        style={{
          height: '46px',
          background: 'rgba(10, 14, 25, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all"
            style={
              activeTab === 'dashboard'
                ? { backgroundColor: '#6366f1', color: '#fff' }
                : { color: '#94a3b8' }
            }
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('screener')}
            className="px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all"
            style={
              activeTab === 'screener'
                ? { backgroundColor: '#6366f1', color: '#fff' }
                : { color: '#94a3b8' }
            }
          >
            Signal Screener
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className="px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all"
            style={
              activeTab === 'heatmap'
                ? { backgroundColor: '#6366f1', color: '#fff' }
                : { color: '#94a3b8' }
            }
          >
            Cross-Market Heatmap
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/25">
            OFFICIAL CFTC DATA · 2018 – PRESENT
          </span>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-32 pb-16 max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8">
            {/* HERO SECTION (only when no contract is selected) */}
            {!selectedContract && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex flex-col items-center text-center pt-6 pb-8 border-b border-[#1e2d3d]/60"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#6366f1]/10 border border-[#6366f1]/30 text-[#818cf8] mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                  INSTITUTIONAL COT POSITIONING TERMINAL
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold font-mono tracking-tight leading-tight max-w-4xl bg-gradient-to-r from-white via-[#cbd5e1] to-[#818cf8] bg-clip-text text-transparent">
                  COMMITMENT OF TRADERS
                </h1>
                <p className="text-sm sm:text-base text-[#94a3b8] font-mono italic mt-2 max-w-2xl">
                  Real CFTC filings tracking commercial hedging, dealer inventory, and speculative positioning.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 w-full max-w-2xl">
                  <div className="p-3 rounded-lg bg-[#0d1117] border border-[#1e2d3d] flex flex-col items-center">
                    <span className="font-mono text-xl font-bold text-[#6366f1]">28</span>
                    <span className="text-[10px] font-mono text-[#64748b] uppercase">Liquid Contracts</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0d1117] border border-[#1e2d3d] flex flex-col items-center">
                    <span className="font-mono text-xl font-bold text-[#10b981]">5</span>
                    <span className="text-[10px] font-mono text-[#64748b] uppercase">Asset Classes</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0d1117] border border-[#1e2d3d] flex flex-col items-center">
                    <span className="font-mono text-xl font-bold text-[#f59e0b]">8+ Years</span>
                    <span className="text-[10px] font-mono text-[#64748b] uppercase">Historical Archive</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0d1117] border border-[#1e2d3d] flex flex-col items-center">
                    <span className="font-mono text-xl font-bold text-[#8b5cf6]">445+ Wks</span>
                    <span className="text-[10px] font-mono text-[#64748b] uppercase">Weekly Reports</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ASSET GRID (when no contract is selected) */}
            {!selectedContract && (
              <div className="flex flex-col gap-6">
                <BrieseSectorComposites instruments={instruments} />

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-mono font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                      Tracked {activeCategory.toUpperCase()} Futures
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
                  filteredHistory={filteredHistory}
                />

                {/* 4. SECTION: INSTITUTIONAL PERCENTILE GAUGES */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      Statistical Percentile Distribution ({filteredHistory.length} Reports)
                    </h3>
                    <span className="text-[11px] font-mono text-[#64748b]">
                      Ranked over {formatDate(filteredHistory[0]?.date)} — {formatDate(filteredHistory[filteredHistory.length - 1]?.date)}
                    </span>
                  </div>

                  {currentInstrument.isFinancial ? (
                    (() => {
                      const allDealer = filteredHistory.map(
                        (h) => (h.dealer_long ?? 0) - (h.dealer_short ?? 0)
                      );
                      const allAsset = filteredHistory.map(
                        (h) => (h.asset_long ?? 0) - (h.asset_short ?? 0)
                      );
                      const allLev = filteredHistory.map(
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
                      const allProd = filteredHistory.map(
                        (h) => (h.prod_long ?? 0) - (h.prod_short ?? 0)
                      );
                      const allMm = filteredHistory.map(
                        (h) => (h.mm_long ?? 0) - (h.mm_short ?? 0)
                      );
                      const allOther = filteredHistory.map(
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

                {/* 4. SECTION: COMPARATIVE AUDIT TABLE */}
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
        )}

        {activeTab === 'screener' && (
          <Screener
            onSelect={(id) => {
              handleContractSelect(id);
            }}
          />
        )}

        {activeTab === 'heatmap' && <CrossMarketHeatmap />}
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
