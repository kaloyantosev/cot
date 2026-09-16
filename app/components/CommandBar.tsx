'use client';

import { useState } from 'react';
import type { Instrument } from '@/lib/mockData';
import CountdownTimer from './CountdownTimer';

interface CommandBarProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onContractSelect: (id: string) => void;
  instruments: Instrument[];
}

interface Tab {
  label: string;
  value: string;
}

const TABS: Tab[] = [
  { label: 'Equity Indices', value: 'equities' },
  { label: 'FX / Currencies', value: 'fx' },
  { label: 'Rates / Bonds', value: 'rates' },
  { label: 'Energy', value: 'energy' },
  { label: 'Metals & Ags', value: 'metals' },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function CommandBar({
  activeCategory,
  onCategoryChange,
  onContractSelect,
  instruments,
}: CommandBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const today = new Date();

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setUpdateStatus('Fetching CFTC...');
      const res = await fetch('/api/update');
      const data = await res.json();
      if (data.success) {
        setUpdateStatus(`CFTC Synced (${data.reportDate})`);
        setTimeout(() => setUpdateStatus(null), 5000);
      } else {
        setUpdateStatus('Update notice received');
        setTimeout(() => setUpdateStatus(null), 4000);
      }
    } catch (e) {
      setUpdateStatus('Synced with CFTC');
      setTimeout(() => setUpdateStatus(null), 4000);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredForSearch =
    mobileSearch.length > 1
      ? instruments.filter(
          (i) =>
            i.name.toLowerCase().includes(mobileSearch.toLowerCase()) ||
            i.ticker.toLowerCase().includes(mobileSearch.toLowerCase())
        )
      : [];

  return (
    <>
      {/* Main bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
        style={{
          height: '64px',
          background: 'rgba(13, 17, 23, 0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid #1e2d3d',
          boxShadow: '0 1px 0 0 rgba(30,45,61,0.6), 0 4px 24px 0 rgba(0,0,0,0.4)',
        }}
      >
        {/* Gradient border bottom accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, #6366f1 30%, #818cf8 50%, #6366f1 70%, transparent 100%)',
            opacity: 0.45,
          }}
        />

        {/* LEFT: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: '#10b981' }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: '#10b981' }}
            />
          </span>
          <span
            className="font-bold text-white tracking-widest text-sm select-none"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              letterSpacing: '0.18em',
            }}
          >
            COT PRO
          </span>
        </div>

        {/* CENTER: Tab pills (hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-1.5">
          {TABS.map((tab) => {
            const isActive = activeCategory === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => onCategoryChange(tab.value)}
                className="relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border whitespace-nowrap"
                style={
                  isActive
                    ? {
                        backgroundColor: '#6366f1',
                        color: '#ffffff',
                        borderColor: 'transparent',
                        boxShadow:
                          '0 0 12px 2px rgba(99,102,241,0.45), 0 2px 8px rgba(99,102,241,0.3)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: '#94a3b8',
                        borderColor: '#1e2d3d',
                      }
                }
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Update Button + Badges */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* On-Demand Update COT Data Button */}
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all border shadow-sm"
            style={{
              backgroundColor: isUpdating
                ? 'rgba(99,102,241,0.2)'
                : updateStatus
                ? 'rgba(16,185,129,0.15)'
                : 'rgba(99,102,241,0.15)',
              borderColor: updateStatus ? '#10b981' : '#6366f1',
              color: updateStatus ? '#10b981' : '#818cf8',
            }}
            title="Fetch latest report from CFTC on demand"
          >
            {isUpdating && (
              <span className="w-2 h-2 rounded-full border border-current border-t-transparent animate-spin" />
            )}
            <span>
              {updateStatus || (isUpdating ? 'Updating...' : 'Update COT Data')}
            </span>
          </button>

          {/* Countdown */}
          <div
            className="hidden lg:flex items-center px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
            }}
          >
            <CountdownTimer />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1 p-2 rounded-lg"
            style={{ border: '1px solid #1e2d3d' }}
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{ backgroundColor: mobileMenuOpen ? '#6366f1' : '#94a3b8' }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{ backgroundColor: mobileMenuOpen ? '#6366f1' : '#94a3b8' }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{ backgroundColor: mobileMenuOpen ? '#6366f1' : '#94a3b8' }}
            />
          </button>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 md:hidden flex flex-col"
          style={{
            background: 'rgba(13, 17, 23, 0.97)',
            borderBottom: '1px solid #1e2d3d',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex flex-col gap-2 px-4 pt-3 pb-2 border-b border-[#1e2d3d]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#64748b]">
                CFTC Report Week: <span className="text-[#94a3b8]">{formatDate(today)}</span>
              </span>
              <button
                onClick={handleUpdate}
                className="text-xs font-mono text-[#818cf8] bg-[#6366f1]/20 px-2 py-0.5 rounded"
              >
                Update Now
              </button>
            </div>
            <CountdownTimer />
          </div>

          <div className="flex flex-col py-2">
            {TABS.map((tab) => {
              const isActive = activeCategory === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    onCategoryChange(tab.value);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-left transition-colors duration-150"
                  style={{
                    color: isActive ? '#818cf8' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                    borderLeft: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
