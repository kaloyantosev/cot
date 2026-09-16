'use client';

import { useMemo } from 'react';
import type { Instrument, WeeklyData } from '@/lib/mockData';
import { analyzeBrieseCOT } from '@/lib/brieseModels';
import { formatNumberSigned } from '@/lib/utils';

interface BrieseAnalysisPanelProps {
  instrument: Instrument;
  filteredHistory?: WeeklyData[];
}

export default function BrieseAnalysisPanel({ instrument, filteredHistory }: BrieseAnalysisPanelProps) {
  const analysis = useMemo(() => {
    return analyzeBrieseCOT(instrument, filteredHistory);
  }, [instrument, filteredHistory]);

  const {
    cotIndex3Y,
    cotIndex26W,
    isBuyingClimax,
    isSellingClimax,
    movementIndex6W,
    movementIndex4W,
    surgeSignal,
    surgeDetails,
    commercialNet,
    commercialNetMin3Y,
    commercialNetMax3Y,
    speculatorNet,
    speculatorCotIndex3Y,
    fundExhaustionDivergence,
    commercialBias,
    conflictRating,
    sectorContext,
    actionableInsight,
  } = analysis;

  const getBiasColor = (b: string) => {
    switch (b) {
      case 'STRONG_BULLISH':
        return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
      case 'BULLISH':
        return { text: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.25)' };
      case 'STRONG_BEARISH':
        return { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' };
      case 'BEARISH':
      default:
        return { text: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.25)' };
    }
  };

  const biasStyle = getBiasColor(commercialBias);

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border border-[#1e2d3d] bg-[#0d1117]/85 backdrop-blur-md">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1e2d3d]/60">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Stephen Briese COT Models & CME Commercial Analytics
            </span>
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
              style={{
                backgroundColor: biasStyle.bg,
                color: biasStyle.text,
                border: `1px solid ${biasStyle.border}`,
              }}
            >
              {commercialBias.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#64748b]">
            Methodology: The Commitments of Traders Bible (Wiley Trading) & CME Commodity Trading Manual
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#818cf8] bg-[#6366f1]/10 px-2 py-1 rounded border border-[#6366f1]/20">
            3Y Range: [{formatNumberSigned(commercialNetMin3Y)} to {formatNumberSigned(commercialNetMax3Y)}]
          </span>
        </div>
      </div>

      {/* 4 CORE BRIESE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* CARD 1: 3Y COT INDEX */}
        <div className="flex flex-col p-3 rounded-lg bg-[#0a0e19] border border-[#1e2d3d]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#64748b] uppercase">Briese COT Index (3Y)</span>
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{
                color: isBuyingClimax ? '#10b981' : isSellingClimax ? '#ef4444' : '#94a3b8',
                backgroundColor: isBuyingClimax
                  ? 'rgba(16,185,129,0.15)'
                  : isSellingClimax
                  ? 'rgba(239,68,68,0.15)'
                  : 'rgba(255,255,255,0.04)',
              }}
            >
              {isBuyingClimax ? 'BUYING CLIMAX' : isSellingClimax ? 'SELLING CLIMAX' : `${cotIndex3Y}%`}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-mono font-extrabold text-white">{cotIndex3Y}</span>
            <span className="text-xs font-mono text-[#6366f1]">%</span>
          </div>
          {/* Progress track */}
          <div className="w-full h-1.5 bg-[#1e2d3d] rounded-full overflow-hidden mt-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${cotIndex3Y}%`,
                backgroundColor: cotIndex3Y >= 80 ? '#10b981' : cotIndex3Y <= 20 ? '#ef4444' : '#6366f1',
              }}
            />
          </div>
          <span className="text-[9px] font-mono text-[#64748b] mt-1.5">
            Commercial Net: {formatNumberSigned(commercialNet)}
          </span>
        </div>

        {/* CARD 2: 26W CYCLICAL INDEX */}
        <div className="flex flex-col p-3 rounded-lg bg-[#0a0e19] border border-[#1e2d3d]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#64748b] uppercase">Cyclical Index (26W)</span>
            <span className="text-[9px] font-mono text-[#94a3b8] font-bold">Short-Term</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-mono font-extrabold text-white">{cotIndex26W}</span>
            <span className="text-xs font-mono text-[#6366f1]">%</span>
          </div>
          <div className="w-full h-1.5 bg-[#1e2d3d] rounded-full overflow-hidden mt-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${cotIndex26W}%`,
                backgroundColor: cotIndex26W >= 80 ? '#10b981' : cotIndex26W <= 20 ? '#ef4444' : '#818cf8',
              }}
            />
          </div>
          <span className="text-[9px] font-mono text-[#64748b] mt-1.5">
            6-Month swing inflection point
          </span>
        </div>

        {/* CARD 3: 6W MOVEMENT INDEX */}
        <div className="flex flex-col p-3 rounded-lg bg-[#0a0e19] border border-[#1e2d3d]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#64748b] uppercase">Movement Index (6W)</span>
            <span
              className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{
                color: Math.abs(movementIndex6W) >= 40 ? '#f59e0b' : '#94a3b8',
                backgroundColor: Math.abs(movementIndex6W) >= 40 ? 'rgba(245,158,11,0.15)' : 'transparent',
              }}
            >
              {Math.abs(movementIndex6W) >= 40 ? '40-PT SURGE' : 'Normal RoC'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span
              className="text-2xl font-mono font-extrabold"
              style={{ color: movementIndex6W >= 0 ? '#10b981' : '#ef4444' }}
            >
              {movementIndex6W >= 0 ? `+${movementIndex6W}` : movementIndex6W}
            </span>
            <span className="text-xs font-mono text-[#64748b]">pts</span>
          </div>
          <span className="text-[9px] font-mono text-[#64748b] mt-2">
            4W Rate: {movementIndex4W >= 0 ? `+${movementIndex4W}` : movementIndex4W} pts
          </span>
        </div>

        {/* CARD 4: SPECULATOR / FUND DYNAMICS */}
        <div className="flex flex-col p-3 rounded-lg bg-[#0a0e19] border border-[#1e2d3d]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#64748b] uppercase">Large Speculator Index</span>
            <span className="text-[9px] font-mono text-[#94a3b8] font-bold">Funds / CTAs</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-2xl font-mono font-extrabold text-white">{speculatorCotIndex3Y}</span>
            <span className="text-xs font-mono text-[#6366f1]">%</span>
          </div>
          <div className="w-full h-1.5 bg-[#1e2d3d] rounded-full overflow-hidden mt-2">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${speculatorCotIndex3Y}%`,
                backgroundColor: speculatorCotIndex3Y >= 80 ? '#ef4444' : '#10b981',
              }}
            />
          </div>
          <span className="text-[9px] font-mono text-[#64748b] mt-1.5">
            Fund Net: {formatNumberSigned(speculatorNet)}
          </span>
        </div>
      </div>

      {/* 40-POINT SURGE OR CLIMAX BANNER */}
      {(surgeSignal !== 'NONE' || isBuyingClimax || isSellingClimax || fundExhaustionDivergence) && (
        <div
          className="p-3.5 rounded-lg border flex flex-col gap-1"
          style={{
            backgroundColor:
              isBuyingClimax || surgeSignal === 'BULLISH_40_SURGE'
                ? 'rgba(16,185,129,0.08)'
                : 'rgba(239,68,68,0.08)',
            borderColor:
              isBuyingClimax || surgeSignal === 'BULLISH_40_SURGE'
                ? 'rgba(16,185,129,0.3)'
                : 'rgba(239,68,68,0.3)',
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-mono font-bold"
              style={{
                color: isBuyingClimax || surgeSignal === 'BULLISH_40_SURGE' ? '#10b981' : '#ef4444',
              }}
            >
              {isBuyingClimax
                ? 'COMMERCIAL BUYING CLIMAX (COT INDEX >= 90%)'
                : isSellingClimax
                ? 'COMMERCIAL SELLING CLIMAX (COT INDEX <= 10%)'
                : surgeSignal === 'BULLISH_40_SURGE'
                ? '+40 POINT COMMERCIAL BUYING SURGE'
                : '-40 POINT COMMERCIAL SELLING SURGE'}
            </span>
            <span className="text-[10px] font-mono text-[#94a3b8]">Rule: Briese Chapter 6 & 7</span>
          </div>
          <p className="text-xs font-mono text-[#cbd5e1] leading-relaxed mt-1">
            {surgeDetails}
          </p>
          {fundExhaustionDivergence && (
            <div className="mt-1 pt-1 border-t border-white/10 text-xs font-mono text-[#f59e0b]">
              Notice: Large Speculator Momentum Non-Confirmation detected. Funds buying velocity is decelerating near price highs.
            </div>
          )}
        </div>
      )}

      {/* DETAILED SECTOR & COMMODITY INTELLIGENCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-lg bg-[#0a0e19] border border-[#1e2d3d] flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#64748b] uppercase font-bold">
            Sector & Structural Mechanics
          </span>
          <p className="text-xs font-mono text-[#94a3b8] leading-relaxed">
            {sectorContext}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0e19] border border-[#1e2d3d] flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#64748b] uppercase font-bold">
            Actionable Model Assessment
          </span>
          <p className="text-xs font-mono text-[#e2e8f0] font-semibold leading-relaxed">
            {actionableInsight}
          </p>
          <div className="mt-auto pt-2 border-t border-[#1e2d3d]/50 flex items-center justify-between text-[10px] font-mono text-[#64748b]">
            <span>Market Polarity:</span>
            <span className="text-[#818cf8] font-bold">{conflictRating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
