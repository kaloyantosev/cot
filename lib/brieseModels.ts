// ==============================================================================
// STEPHEN E. BRIESE & CME COMMODITY ANALYZING MODELS
// Authoritative implementations based on:
// 1. 'The Commitments of Traders Bible' by Stephen E. Briese (Wiley Trading)
// 2. 'CME Commodity Trading Manual' (Chicago Mercantile Exchange)
// ==============================================================================

import type { WeeklyData, Instrument } from './mockData';

export interface BrieseAnalysisResult {
  contractId: string;
  contractName: string;
  category: string;
  isFinancial: boolean;

  // Commercial Positioning
  commercialNet: number;
  commercialNetMin3Y: number;
  commercialNetMax3Y: number;

  // Briese COT Index (0 - 100)
  cotIndex3Y: number; // 156-Week Standard Baseline
  cotIndex26W: number; // 26-Week Cyclical Lookback
  isBuyingClimax: boolean; // >= 90% (Aggressive smart-money accumulation)
  isSellingClimax: boolean; // <= 10% (Heavy commercial hedging / distribution)

  // COT Movement Index (Rate of Change over 6 Weeks)
  movementIndex6W: number; // Point change over 6 weeks
  movementIndex4W: number; // Point change over 4 weeks
  surgeSignal: 'BULLISH_40_SURGE' | 'BEARISH_40_SURGE' | 'NONE';
  surgeDetails: string;

  // Large Speculator (Fund) Dynamics
  speculatorNet: number;
  speculatorCotIndex3Y: number;
  speculatorMovementIndex6W: number;
  fundExhaustionDivergence: boolean; // Fund buying momentum stalls near price highs

  // Conflict / Sentiment Score
  commercialBias: 'STRONG_BULLISH' | 'BULLISH' | 'BEARISH' | 'STRONG_BEARISH';
  conflictRating: string;

  // Sector-Specific Interpretation (Metals, Energy, Grains, Livestock, Financials)
  sectorContext: string;
  actionableInsight: string;
}

/**
 * Calculates the Briese COT Index:
 * COT Index = 100 * (CurrentNet - MinNet) / (MaxNet - MinNet)
 */
export function calculateCOTIndex(currentNet: number, historicalNets: number[]): number {
  if (historicalNets.length === 0) return 50;
  const minNet = Math.min(...historicalNets);
  const maxNet = Math.max(...historicalNets);
  if (maxNet === minNet) return 50;
  const raw = ((currentNet - minNet) / (maxNet - minNet)) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

/**
 * Extracts Commercial Net position for a given report:
 * - Commodities: Commercial Producers (prod_long - prod_short)
 * - Financials: Asset Managers / Institutional Hedgers (asset_long - asset_short)
 */
export function getCommercialNet(h: WeeklyData, isFinancial: boolean): number {
  if (isFinancial) {
    return (h.asset_long ?? 0) - (h.asset_short ?? 0);
  }
  return (h.prod_long ?? 0) - (h.prod_short ?? 0);
}

/**
 * Extracts Large Speculator (Fund) Net position for a given report:
 * - Commodities: Managed Money (mm_long - mm_short)
 * - Financials: Leveraged Funds / CTAs (lev_long - lev_short)
 */
export function getSpeculatorNet(h: WeeklyData, isFinancial: boolean): number {
  if (isFinancial) {
    return (h.lev_long ?? 0) - (h.lev_short ?? 0);
  }
  return (h.mm_long ?? 0) - (h.mm_short ?? 0);
}

/**
 * Runs the comprehensive Briese COT analyzing model for an instrument
 */
export function analyzeBrieseCOT(instrument: Instrument, customHistory?: WeeklyData[]): BrieseAnalysisResult {
  const history = customHistory && customHistory.length > 0 ? customHistory : instrument.history;
  const totalReports = history.length;
  const latest = history[totalReports - 1];

  const isFin = instrument.isFinancial;
  const commNet = getCommercialNet(latest, isFin);
  const specNet = getSpeculatorNet(latest, isFin);

  // 1. Commercial COT Index over 3 Years (up to 156 weeks) and 26 Weeks
  const slice3Y = history.slice(-Math.min(156, totalReports));
  const slice26W = history.slice(-Math.min(26, totalReports));

  const allCommNets3Y = slice3Y.map((h) => getCommercialNet(h, isFin));
  const allCommNets26W = slice26W.map((h) => getCommercialNet(h, isFin));

  const min3Y = Math.min(...allCommNets3Y);
  const max3Y = Math.max(...allCommNets3Y);

  const cotIndex3Y = calculateCOTIndex(commNet, allCommNets3Y);
  const cotIndex26W = calculateCOTIndex(commNet, allCommNets26W);

  const isBuyingClimax = cotIndex3Y >= 90;
  const isSellingClimax = cotIndex3Y <= 10;

  // 2. COT Movement Index (Rate of Change)
  // Calculate historical series of COT Index to compute delta
  const computeHistoricalIndices = (lookback: number) => {
    return history.map((_, idx) => {
      const start = Math.max(0, idx - lookback + 1);
      const sub = history.slice(start, idx + 1);
      const subNets = sub.map((h) => getCommercialNet(h, isFin));
      const current = getCommercialNet(history[idx], isFin);
      return calculateCOTIndex(current, subNets);
    });
  };

  const historicalIndexSeries = computeHistoricalIndices(156);
  const currentIndex = historicalIndexSeries[historicalIndexSeries.length - 1];

  const index6WAgo =
    historicalIndexSeries.length >= 7
      ? historicalIndexSeries[historicalIndexSeries.length - 7]
      : historicalIndexSeries[0];
  const index4WAgo =
    historicalIndexSeries.length >= 5
      ? historicalIndexSeries[historicalIndexSeries.length - 5]
      : historicalIndexSeries[0];

  const movementIndex6W = currentIndex - index6WAgo;
  const movementIndex4W = currentIndex - index4WAgo;

  // 3. 40-Point Surge Rules (Stephen Briese Chapter 7)
  let surgeSignal: 'BULLISH_40_SURGE' | 'BEARISH_40_SURGE' | 'NONE' = 'NONE';
  let surgeDetails = 'No rapid 40-point positioning surge detected over the past 6 weeks.';

  if (movementIndex6W >= 40 || movementIndex4W >= 40) {
    surgeSignal = 'BULLISH_40_SURGE';
    surgeDetails = `+40 Commercial Buying Surge: Commercials expanded their COT Index by +${movementIndex6W} points within 6 weeks. Per Briese Chapter 7, aggressive insider accumulation marks the end of pullbacks and signals uptrend resumption.`;
  } else if (movementIndex6W <= -40 || movementIndex4W <= -40) {
    surgeSignal = 'BEARISH_40_SURGE';
    surgeDetails = `-40 Commercial Selling Surge: Commercials dumped exposure by ${movementIndex6W} points within 6 weeks. Per Briese Chapter 7, aggressive producer hedging marks the end of bear market rallies and signals resumption of downtrend.`;
  }

  // 4. Large Speculator Dynamics & Divergence
  const allSpecNets3Y = slice3Y.map((h) => getSpeculatorNet(h, isFin));
  const specCotIndex3Y = calculateCOTIndex(specNet, allSpecNets3Y);

  const computeHistoricalSpecIndices = (lookback: number) => {
    return history.map((_, idx) => {
      const start = Math.max(0, idx - lookback + 1);
      const sub = history.slice(start, idx + 1);
      const subNets = sub.map((h) => getSpeculatorNet(h, isFin));
      const current = getSpeculatorNet(history[idx], isFin);
      return calculateCOTIndex(current, subNets);
    });
  };

  const specIndexSeries = computeHistoricalSpecIndices(156);
  const specCurrent = specIndexSeries[specIndexSeries.length - 1];
  const spec6WAgo =
    specIndexSeries.length >= 7
      ? specIndexSeries[specIndexSeries.length - 7]
      : specIndexSeries[0];
  const speculatorMovementIndex6W = specCurrent - spec6WAgo;

  // Fund Exhaustion Divergence (Briese Silver Top-Picking Rule, Chapter 7):
  // Price is near highs, but Fund rate-of-change has stalled/turned negative while commercial hedging remains defensive
  let fundExhaustionDivergence = false;
  if (totalReports >= 8) {
    const recentPrices = history.slice(-8).map((h) => h.price ?? 0);
    const maxRecentPrice = Math.max(...recentPrices);
    const latestPrice = latest.price ?? 0;
    const isPriceNearHighs = maxRecentPrice > 0 && latestPrice >= maxRecentPrice * 0.96;
    if (isPriceNearHighs && speculatorMovementIndex6W <= -15 && specCotIndex3Y >= 75) {
      fundExhaustionDivergence = true;
    }
  }

  // 5. Commercial Bias Determination
  let commercialBias: 'STRONG_BULLISH' | 'BULLISH' | 'BEARISH' | 'STRONG_BEARISH' = 'BULLISH';
  if (isBuyingClimax || surgeSignal === 'BULLISH_40_SURGE') {
    commercialBias = 'STRONG_BULLISH';
  } else if (cotIndex3Y >= 60) {
    commercialBias = 'BULLISH';
  } else if (isSellingClimax || surgeSignal === 'BEARISH_40_SURGE') {
    commercialBias = 'STRONG_BEARISH';
  } else {
    commercialBias = 'BEARISH';
  }

  // 6. Conflict Matrix
  let conflictRating = 'Equilibrium';
  if (cotIndex3Y >= 80 && specCotIndex3Y <= 25) {
    conflictRating = 'Maximum Commercial Bullish Divergence (Commercials Accumulating / Funds Heavily Short)';
  } else if (cotIndex3Y <= 20 && specCotIndex3Y >= 80) {
    conflictRating = 'Crowded Speculative Bubble (Commercials Maximum Hedged / Funds Overextended Long)';
  } else if (cotIndex3Y >= 60 && specCotIndex3Y >= 60) {
    conflictRating = 'Momentum Alignment (Both Commercials and Speculators Expanding Exposure)';
  } else {
    conflictRating = 'Standard Counter-Trend Distribution';
  }

  // 7. Sector-Specific Context & CME Agricultural/Energy Models
  const { sectorContext, actionableInsight } = getSectorSpecificInsights(
    instrument,
    cotIndex3Y,
    cotIndex26W,
    movementIndex6W,
    commNet,
    specNet,
    isBuyingClimax,
    isSellingClimax
  );

  return {
    contractId: instrument.id,
    contractName: instrument.name,
    category: instrument.category,
    isFinancial: isFin,
    commercialNet: commNet,
    commercialNetMin3Y: min3Y,
    commercialNetMax3Y: max3Y,
    cotIndex3Y,
    cotIndex26W,
    isBuyingClimax,
    isSellingClimax,
    movementIndex6W,
    movementIndex4W,
    surgeSignal,
    surgeDetails,
    speculatorNet: specNet,
    speculatorCotIndex3Y: specCotIndex3Y,
    speculatorMovementIndex6W,
    fundExhaustionDivergence,
    commercialBias,
    conflictRating,
    sectorContext,
    actionableInsight,
  };
}

/**
 * Applies sector-specific rules from Briese Chapters 12-19 and the CME Commodity Trading Manual
 */
function getSectorSpecificInsights(
  instrument: Instrument,
  cotIndex3Y: number,
  cotIndex26W: number,
  movement6W: number,
  commNet: number,
  specNet: number,
  isBuyClimax: boolean,
  isSellClimax: boolean
): { sectorContext: string; actionableInsight: string } {
  const cat = instrument.category;
  const id = instrument.id;

  // METALS (Gold, Silver, Copper, Platinum) - Briese Chapter 14
  if (cat === 'metals') {
    if (id === 'GC') {
      return {
        sectorContext:
          'Briese Chapter 14 (Marking Time in Gold): Commercial bullion dealers maintain a structural net short position hedging mine production and forward bar delivery. Net short expansion is normal on rallies; a Commercial Buying Climax occurs when short contracts contract to 3-year minimums.',
        actionableInsight: isBuyClimax
          ? 'Commercial short positions have dropped to 3-year lows (Buying Climax). Bullion dealers are refusing to sell short at current spot prices, indicating strong physical floor support.'
          : isSellClimax
          ? 'Commercial shorts have reached 3-year record highs (Selling Climax). Commercials are aggressively forward-hedging into fund momentum.'
          : `Gold Commercial Index stands at ${cotIndex3Y}%. Commercial hedging is in normal cyclical rotation.`,
      };
    }
    if (id === 'SI') {
      return {
        sectorContext:
          'Briese Chapter 14 & 7: Silver is notorious for violent large speculator crowds. Briese specifically demonstrated fund momentum non-confirmation on silver rallies ahead of multi-month cycle tops.',
        actionableInsight:
          specNet > 40000 && movement6W < -15
            ? 'Fund buying velocity is decelerating while prices test highs. High risk of speculative long liquidation.'
            : `Silver Commercial Index at ${cotIndex3Y}%. Producer hedging reflects industrial demand expectations.`,
      };
    }
    if (id === 'HG') {
      return {
        sectorContext:
          'Briese Chapter 14 (The Copper Caper): Copper is heavily influenced by commercial scrap recyclers, wire-drawers, and global swap dealers.',
        actionableInsight: `Copper Commercial Index is ${cotIndex3Y}%.`,
      };
    }
  }

  // ENERGY (Crude Oil, Gasoline, Heating Oil, Nat Gas) - Briese Chapter 15
  if (cat === 'energy') {
    return {
      sectorContext:
        'Briese Chapter 15 (Oil Slick) & CME Manual: Petroleum markets are dominated by commercial open interest (integrated oil companies, refiners, and independent drillers). Refiners hedge crack spreads by buying crude and selling refined products.',
      actionableInsight: isBuyClimax
        ? 'Commercial Buying Climax in Energy: Commercial drillers have significantly reduced forward short hedges while refiners accumulate crude contracts. Physical tightness signals imminent upward pricing pressure.'
        : isSellClimax
        ? 'Commercial Selling Climax in Energy: Exploration and production drillers are forward-selling massive supply into current price strength.'
        : `Commercial Index at ${cotIndex3Y}%. 6-week rate of change is ${movement6W} points.`,
    };
  }

  // GRAINS & AGRICULTURE (Corn, Wheat, Soybeans) - Briese Chapter 17 & CME Manual
  if (['ZC', 'ZW', 'ZS', 'KC', 'SB', 'CT'].includes(id)) {
    return {
      sectorContext:
        'CME Commodity Trading Manual (Agricultural Marketing) & Briese Chapter 17 (Bean Counting): Grain elevators, processors, and exporters warehouse physical cash crops and hedge price risk by shorting futures (carrying-charge hedging). Commercial net shorts typically peak during fall harvest pressure.',
      actionableInsight: isBuyClimax
        ? 'Grain Commercial Buying Climax: Elevators and commercial processors are locking in cash inventory without heavy forward short sales. Signals tight supply or strong export demand.'
        : isSellClimax
        ? 'Seasonal Commercial Hedging Climax: Commercials are absorbing seasonal farmer cash sales and transferring risk via heavy futures short hedges.'
        : `Agricultural Commercial Index is ${cotIndex3Y}%. Seasonal hedging is within normal multi-year distribution.`,
    };
  }

  // FINANCIALS / EQUITIES / FX / RATES - Briese Chapters 12, 13, 16
  return {
    sectorContext:
      'Briese Chapters 12, 13, 16: In financial index, rate, and currency futures, commercials represent institutional asset managers, pension funds, and foreign exchange bank dealers.',
    actionableInsight: isBuyClimax
      ? 'Institutional Buying Climax: Asset managers are accumulating long exposure at multi-year peaks relative to trend-following funds.'
      : isSellClimax
      ? 'Institutional Selling Climax: Smart money is rotating out of long risk assets while leveraged hedge funds remain aggressively long.'
      : `Institutional Commercial Index stands at ${cotIndex3Y}%. Trend-following funds net position is ${specNet >= 0 ? '+' : ''}${specNet}.`,
  };
}

/**
 * Computes Stephen Briese's Multi-Contract Sector Composites:
 * - Petroleum Composite (CL + HO + RB)
 * - Grain & Soy Composite (ZC + ZW + ZS)
 * - Metals Composite (GC + SI + HG + PL)
 */
export function computeSectorComposites(instruments: Instrument[]): Record<string, { compositeIndex: number; bias: string; contracts: string }> {
  const getAvgIndex = (ids: string[]) => {
    const matched = instruments.filter((i) => ids.includes(i.id));
    if (matched.length === 0) return 50;
    const scores = matched.map((m) => {
      const res = analyzeBrieseCOT(m);
      return res.cotIndex3Y;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const petroleumAvg = getAvgIndex(['CL', 'HO', 'RB']);
  const grainAvg = getAvgIndex(['ZC', 'ZW', 'ZS']);
  const metalsAvg = getAvgIndex(['GC', 'SI', 'HG', 'PL']);
  const equitiesAvg = getAvgIndex(['ES', 'NQ', 'RTY', 'YM']);
  const fxAvg = getAvgIndex(['6E', '6B', '6J', '6A', 'DX']);

  const getBias = (score: number) => {
    if (score >= 80) return 'BUYING CLIMAX';
    if (score >= 60) return 'BULLISH ACCUMULATION';
    if (score <= 20) return 'SELLING CLIMAX';
    if (score <= 40) return 'BEARISH DISTRIBUTION';
    return score >= 50 ? 'COMMERCIAL LONG TILT' : 'COMMERCIAL SHORT TILT';
  };

  return {
    petroleum: {
      compositeIndex: petroleumAvg,
      bias: getBias(petroleumAvg),
      contracts: 'Crude Oil (CL) · Heating Oil (HO) · Gasoline (RB)',
    },
    grains: {
      compositeIndex: grainAvg,
      bias: getBias(grainAvg),
      contracts: 'Corn (ZC) · Wheat (ZW) · Soybeans (ZS)',
    },
    metals: {
      compositeIndex: metalsAvg,
      bias: getBias(metalsAvg),
      contracts: 'Gold (GC) · Silver (SI) · Copper (HG) · Platinum (PL)',
    },
    equities: {
      compositeIndex: equitiesAvg,
      bias: getBias(equitiesAvg),
      contracts: 'S&P 500 (ES) · Nasdaq (NQ) · Russell (RTY) · Dow (YM)',
    },
    fx: {
      compositeIndex: fxAvg,
      bias: getBias(fxAvg),
      contracts: 'EUR (6E) · GBP (6B) · JPY (6J) · AUD (6A) · DXY (DX)',
    },
  };
}
