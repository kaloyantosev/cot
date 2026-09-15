'use client';

import { useRouter } from 'next/navigation';
import CommandBar from '../components/CommandBar';
import Screener from '../components/Screener';
import { instruments } from '@/lib/mockData';

export default function ScreenerPage() {
  const router = useRouter();

  const handleSelect = (id: string) => {
    router.push(`/?contract=${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050810] text-[#f1f5f9]">
      <CommandBar
        activeCategory="equities"
        onCategoryChange={() => router.push('/')}
        onContractSelect={handleSelect}
        instruments={instruments}
      />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 pb-16 max-w-7xl mx-auto w-full">
        <Screener onSelect={handleSelect} />
      </main>
    </div>
  );
}
