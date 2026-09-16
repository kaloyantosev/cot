'use client';

import { motion } from 'framer-motion';
import type { Instrument } from '@/lib/mockData';
import InstrumentCard from './InstrumentCard';

interface AssetGridProps {
  category: string;
  instruments: Instrument[];
  onSelect: (id: string) => void;
}

export default function AssetGrid({ category, instruments, onSelect }: AssetGridProps) {
  const filtered = instruments.filter((i) => i.category === category);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h3 className="text-lg font-bold text-white font-mono">No Instruments Found</h3>
        <p className="text-sm text-[#64748b]">Select another asset category from the navigation bar.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((inst, index) => (
          <InstrumentCard
            key={inst.id}
            instrument={inst}
            onClick={() => onSelect(inst.id)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
