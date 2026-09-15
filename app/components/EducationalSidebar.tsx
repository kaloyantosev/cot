'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EducationalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  title: string;
  content: string;
  highlight?: string;
}

const SECTIONS: Section[] = [
  {
    id: 'cot_overview',
    title: 'What is the COT Report?',
    content:
      'The Commitment of Traders (COT) report is published weekly by the Commodity Futures Trading Commission (CFTC), breaking down open interest and net futures positions held by distinct market participant categories. Released every Friday at 15:30 Eastern Time (reflecting Tuesday data), it covers over 100 global derivatives markets across equities, currencies, interest rates, energy, and commodities.',
    highlight: 'Data reflects institutional commitments as of Tuesday close, published Friday 15:30 ET.',
  },
  {
    id: 'participants',
    title: 'Who are Dealers vs. Asset Managers vs. Leveraged Funds?',
    content:
      'Dealers / Intermediaries are major investment banks and sell-side brokerages warehousing client risk and providing liquidity. Asset Managers represent long-term institutional capital (pension funds, endowments, mutual funds) with slow-moving macro allocation mandates. Leveraged Funds (CTAs, global macro hedge funds) are active trend-followers and momentum traders who position with high directional leverage.',
    highlight: 'Leveraged Funds = speculative momentum. Asset Managers = structural institutional capital.',
  },
  {
    id: 'extremes',
    title: 'How to use positioning extremes as contrarian signals',
    content:
      'When Leveraged Funds or Managed Money reach beyond the 90th percentile of net long positioning (or below the 10th percentile net short), a trade becomes historically crowded. At these statistical extremes, all buyers are already in, leaving the market fragile to any adverse catalyst. Systematic macro funds monitor these percentiles to fade crowded trades and prepare for asymmetric mean-reversion squeezes.',
    highlight: 'Percentiles >90% or <10% represent historically fragile, crowded positioning.',
  },
  {
    id: 'crossover',
    title: 'What is a COT Crossover signal?',
    content:
      'A crossover occurs when speculative net positioning (Managed Money or Leveraged Funds) flips through zero—from net short to net long (bullish crossover) or net long to net short (bearish crossover). Crossovers mark structural regime shifts in speculative sentiment, frequently preceding sustained medium-term macro trends.',
    highlight: 'Zero-line crossovers reflect institutional regime shifts in directional bias.',
  },
  {
    id: 'dealer_contra',
    title: 'Why Dealer positioning is a contra-indicator for equities',
    content:
      'Dealers do not take speculative directional bets; they hedge structured client trades and equity derivatives. In bull markets, as institutional and retail clients buy equities and calls, dealers are forced to take the opposite side (net short futures) to delta-hedge. When dealers become unusually long, it often means clients panic-sold into them—acting as a classic contra-indicator signaling a market bottom.',
    highlight: 'Dealers take the other side of client flow; heavy dealer shorts are normal in equity rallies.',
  },
];

export default function EducationalSidebar({ isOpen, onClose }: EducationalSidebarProps) {
  const [expanded, setExpanded] = useState<string | null>('cot_overview');

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col shadow-2xl"
            style={{
              background: '#0d1117',
              borderLeft: '1px solid #1e2d3d',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1e2d3d]">
              <div className="flex items-center gap-2">
                <span className="text-lg">📚</span>
                <h2 className="text-base font-bold text-white font-mono">How to Read COT Data</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748b] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors font-mono"
                aria-label="Close panel"
              >
                ✕
              </button>
            </div>

            {/* Accordion List */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              <p className="text-xs text-[#64748b] mb-1 font-mono">
                Institutional Macro Guide · CFTC Reporting Mechanics
              </p>

              {SECTIONS.map((sec) => {
                const isExp = expanded === sec.id;
                return (
                  <div
                    key={sec.id}
                    className="rounded-xl overflow-hidden transition-all duration-200 border"
                    style={{
                      background: isExp ? 'rgba(15, 23, 42, 0.7)' : 'rgba(13, 17, 23, 0.5)',
                      borderColor: isExp ? '#6366f1' : '#1e2d3d',
                    }}
                  >
                    <button
                      onClick={() => toggle(sec.id)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 select-none"
                    >
                      <span className="text-sm font-semibold text-white leading-snug">
                        {sec.title}
                      </span>
                      <span
                        className="text-xs text-[#6366f1] shrink-0 font-mono transition-transform duration-200"
                        style={{ transform: isExp ? 'rotate(90deg)' : 'rotate(0deg)' }}
                      >
                        ▶
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExp && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <div className="px-4 pb-4 pt-1 flex flex-col gap-3 border-t border-[#1e2d3d]/50">
                            <p className="text-xs text-[#94a3b8] leading-relaxed">
                              {sec.content}
                            </p>
                            {sec.highlight && (
                              <div
                                className="p-2.5 rounded-lg text-xs font-mono"
                                style={{
                                  background: 'rgba(99, 102, 241, 0.1)',
                                  border: '1px solid rgba(99, 102, 241, 0.25)',
                                  color: '#818cf8',
                                }}
                              >
                                💡 {sec.highlight}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="p-4 border-t border-[#1e2d3d] bg-[#0a0e19]">
              <span className="text-[11px] font-mono text-[#475569] block text-center">
                CFTC Disaggregated & Legacy Reports · COT Pro Terminal
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
