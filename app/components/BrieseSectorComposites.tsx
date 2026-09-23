'use client';

import { useMemo } from 'react';
import type { Instrument } from '@/lib/mockData';
import { computeSectorComposites } from '@/lib/brieseModels';

interface BrieseSectorCompositesProps {
  instruments: Instrument[];
  activeCategory?: string;
}

export default function BrieseSectorComposites({ instruments, activeCategory = 'all' }: BrieseSectorCompositesProps) {
  const composites = useMemo(() => {
    return computeSectorComposites(instruments);
  }, [instruments]);

  // Sector Composites are shown ONLY on the main Dashboard homepage (when activeCategory === 'all')
  if (activeCategory !== 'all') {
    return null;
  }

  const allSectors = [
    { key: 'equities', name: 'Equity Index Complex', desc: 'S&P 500 · Nasdaq · Russell · Dow' },
    { key: 'fx', name: 'Foreign Exchange Complex', desc: 'EUR · GBP · JPY · AUD · DXY' },
    { key: 'metals', name: 'Metals Complex', desc: 'Gold · Silver · Copper · Platinum' },
    { key: 'grains', name: 'Grain & Oilseed Complex', desc: 'Corn · Wheat · Soybeans' },
    { key: 'petroleum', name: 'Petroleum Complex', desc: 'Crude Oil · Heating Oil · Gasoline' },
  ];

  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl border border-[#1e2d3d] bg-[#0d1117]/80 backdrop-blur-md w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1e2d3d]/60">
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Multi-Contract Sector Composite COT Models
          </span>
          <span className="text-[11px] font-mono text-[#64748b]">
            Aggregated commercial insider accumulation across integrated market complexes (Briese Chapter 15 &amp; 19)
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
          Composite Index (0–100%)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pt-1">
        {allSectors.map((sec) => {
          const comp = composites[sec.key];
          if (!comp) return null;
          const score = comp.compositeIndex;
          const isBull = score >= 60;
          const isBear = score <= 40;
          const statusColor = isBull ? '#10b981' : isBear ? '#ef4444' : '#6366f1';
          const bgStatus = isBull ? 'rgba(16,185,129,0.1)' : isBear ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)';
          const borderStatus = isBull ? 'rgba(16,185,129,0.25)' : isBear ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.25)';

          return (
            <div
              key={sec.key}
              className="flex flex-col p-3 rounded-lg bg-[#0a0e19] border border-[#1e2d3d] hover:border-[#6366f1]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white truncate">{sec.name}</span>
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                  style={{ color: statusColor, backgroundColor: bgStatus, border: `1px solid ${borderStatus}` }}
                >
                  {comp.bias}
                </span>
              </div>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-2xl font-mono font-extrabold text-white">{score}</span>
                <span className="text-xs font-mono text-[#6366f1]">%</span>
              </div>

              <div className="w-full h-1.5 bg-[#1e2d3d] rounded-full overflow-hidden mt-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${score}%`, backgroundColor: statusColor }}
                />
              </div>

              <span className="text-[9px] font-mono text-[#64748b] truncate mt-2" title={sec.desc}>
                {sec.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
