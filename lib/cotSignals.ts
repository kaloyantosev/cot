import { getPercentile, getSignalFromPercentile, isCrossover, type COTSignalType } from './utils';
import { instruments } from './mockData';
import { analyzeBrieseCOT, type BrieseAnalysisResult } from './brieseModels';

export interface COTSignal {
  contractId: string;
  contractName: string;
  shortName: string;
  ticker: string;
  category: string;
  exchange: string;
  mmNet: number;
  mmNetChange: number;
  mmPercentile: number;
  amPercentile: number;
  dealerBias: 'BULLISH (DEALER SHORT)' | 'BEARISH (DEALER LONG)' | 'NET SHORT HEDGING' | 'NET LONG ACCUMULATION';
  signal: COTSignalType;
  isCrossover: boolean;
  briese: BrieseAnalysisResult;
}

export function computeAllSignals(): COTSignal[] {
  return instruments.map((inst) => {
    const history = inst.history;
    const latest = history[history.length - 1];
    const previous = history[history.length - 2] || history[0];

    const isFinancial = inst.isFinancial;

    const mmNet = latest.netLong;
    const prevMmNet = previous.netLong;

    const amNet = isFinancial
      ? (latest.asset_long ?? 0) - (latest.asset_short ?? 0)
      : 0;
    const dealerNet = isFinancial
      ? (latest.dealer_long ?? 0) - (latest.dealer_short ?? 0)
      : 0;

    const allMmNets = history.map((h) => h.netLong);
    const allAmNets = history.map((h) => (isFinancial ? (h.asset_long ?? 0) - (h.asset_short ?? 0) : 0));

    const mmPercentile = getPercentile(mmNet, allMmNets);
    const amPercentile = isFinancial ? getPercentile(amNet, allAmNets) : 50;

    const crossover = isCrossover(mmNet, prevMmNet);
    const baseSignal = getSignalFromPercentile(mmPercentile);

    let dealerBias: 'BULLISH (DEALER SHORT)' | 'BEARISH (DEALER LONG)' | 'NET SHORT HEDGING' | 'NET LONG ACCUMULATION' =
      dealerNet <= 0 ? 'BULLISH (DEALER SHORT)' : 'BEARISH (DEALER LONG)';

    return {
      contractId: inst.id,
      contractName: inst.name,
      shortName: inst.shortName,
      ticker: inst.ticker,
      category: inst.category,
      exchange: inst.exchange,
      mmNet,
      mmNetChange: mmNet - prevMmNet,
      mmPercentile: Math.round(mmPercentile),
      amPercentile: Math.round(amPercentile),
      dealerBias,
      signal: crossover ? 'CROSSOVER' : baseSignal,
      isCrossover: crossover,
      briese: analyzeBrieseCOT(inst),
    };
  });
}

export function generateCOTSummary(contractId: string): string {
  const inst = instruments.find((i) => i.id === contractId);
  if (!inst) return '';

  const history = inst.history;
  const latest = history[history.length - 1];
  const prev4 = history[history.length - 5] || history[0];
  const isFinancial = inst.isFinancial;

  const parts: string[] = [];

  if (isFinancial) {
    const amChange =
      (latest.asset_long ?? 0) -
      (latest.asset_short ?? 0) -
      ((prev4.asset_long ?? 0) - (prev4.asset_short ?? 0));
    const levChange =
      (latest.lev_long ?? 0) -
      (latest.lev_short ?? 0) -
      ((prev4.lev_long ?? 0) - (prev4.lev_short ?? 0));
    const dealerChange =
      (latest.dealer_long ?? 0) -
      (latest.dealer_short ?? 0) -
      ((prev4.dealer_long ?? 0) - (prev4.dealer_short ?? 0));

    parts.push(
      amChange >= 0
        ? `Asset Managers expanded net exposure by +${new Intl.NumberFormat().format(amChange)} contracts`
        : `Asset Managers reduced net exposure by ${new Intl.NumberFormat().format(amChange)} contracts`
    );

    parts.push(
      levChange >= 0
        ? `Leveraged Funds added +${new Intl.NumberFormat().format(levChange)} speculative longs`
        : `Leveraged Funds trimmed ${new Intl.NumberFormat().format(Math.abs(levChange))} speculative positions`
    );

    parts.push(
      dealerChange <= 0
        ? `Dealers expanded short delta-hedges by ${new Intl.NumberFormat().format(Math.abs(dealerChange))} (contra flow)`
        : `Dealers absorbed ${new Intl.NumberFormat().format(dealerChange)} contracts into inventory`
    );

    const verdict = levChange >= 0 ? 'BULLISH SPECULATIVE MOMENTUM' : 'BEARISH SPECULATIVE UNWINDING';
    return `Flow analysis: ${parts.join('; ')}. Institutional verdict: ${verdict}.`;
  } else {
    const mmChange =
      (latest.mm_long ?? 0) -
      (latest.mm_short ?? 0) -
      ((prev4.mm_long ?? 0) - (prev4.mm_short ?? 0));
    const prodChange =
      (latest.prod_long ?? 0) -
      (latest.prod_short ?? 0) -
      ((prev4.prod_long ?? 0) - (prev4.prod_short ?? 0));

    parts.push(
      mmChange >= 0
        ? `Managed Money added +${new Intl.NumberFormat().format(mmChange)} net long contracts`
        : `Managed Money exited ${new Intl.NumberFormat().format(Math.abs(mmChange))} net long contracts`
    );

    parts.push(
      prodChange <= 0
        ? `Commercial Producers expanded forward short hedging by ${new Intl.NumberFormat().format(Math.abs(prodChange))}`
        : `Commercial Producers reduced short hedging inventory by +${new Intl.NumberFormat().format(prodChange)}`
    );

    const verdict = mmChange >= 0 ? 'SPECULATIVE LONG ACCUMULATION' : 'SPECULATIVE LIQUIDATION';
    return `Flow analysis: ${parts.join('; ')}. Physical/Speculative bias: ${verdict}.`;
  }
}
