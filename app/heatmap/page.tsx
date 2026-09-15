'use client';

import { useRouter } from 'next/navigation';
import CommandBar from '../components/CommandBar';
import CrossMarketHeatmap from '../components/CrossMarketHeatmap';
import { instruments } from '@/lib/mockData';

export default function HeatmapPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-[#050810] text-[#f1f5f9]">
      <CommandBar
        activeCategory="equities"
        onCategoryChange={() => router.push('/')}
        onContractSelect={(id) => router.push(`/?contract=${id}`)}
        instruments={instruments}
      />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-16 max-w-7xl mx-auto w-full">
        <CrossMarketHeatmap />
      </main>
    </div>
  );
}
