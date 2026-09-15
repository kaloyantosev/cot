import realData from './realCotData.json';

export interface WeeklyData {
  date: string;
  netLong: number;
  // Financials:
  dealer_long?: number;
  dealer_short?: number;
  asset_long?: number;
  asset_short?: number;
  lev_long?: number;
  lev_short?: number;
  // Commodities:
  prod_long?: number;
  prod_short?: number;
  mm_long?: number;
  mm_short?: number;
  other_long?: number;
  other_short?: number;
  // Price:
  price: number;
}

export interface Instrument {
  id: string;
  name: string;
  shortName: string;
  ticker: string;
  exchange: 'CME' | 'CBOT' | 'NYMEX' | 'COMEX' | 'ICE' | 'EUREX';
  category: 'equities' | 'fx' | 'rates' | 'energy' | 'metals';
  isFinancial: boolean;
  netPosition: number;
  history: WeeklyData[];
}

// Export 100% REAL historical data from CFTC (2018 - Present)
export const instruments: Instrument[] = realData as Instrument[];
