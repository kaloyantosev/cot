// CFTC Public Reporting API access, shared by scripts/fetch-cot.mjs (full
// rebuild of data/cot.json) and lib/cot.ts (live top-up of newer reports).
//
// Markets are matched by CFTC contract market code, not by name, so history
// survives the CFTC's periodic renames (e.g. crude oil and copper in 2022).

export const START = '2016-01-01';
const API = 'https://publicreporting.cftc.gov/resource';
const TFF = 'gpe5-46if'; // Traders in Financial Futures, futures only
const DISAGG = '72hh-3qpy'; // Disaggregated, futures only

// id, name, sector, report, CFTC code
export const MARKETS = [
  ['ES', 'E-mini S&P 500', 'Equities', 'tff', '13874A'],
  ['NQ', 'E-mini Nasdaq-100', 'Equities', 'tff', '209742'],
  ['RTY', 'E-mini Russell 2000', 'Equities', 'tff', '239742'],
  ['YM', 'E-mini Dow', 'Equities', 'tff', '124603'],
  ['ZT', '2-Year T-Note', 'Rates', 'tff', '042601'],
  ['ZN', '10-Year T-Note', 'Rates', 'tff', '043602'],
  ['ZB', 'T-Bond', 'Rates', 'tff', '020601'],
  ['6E', 'Euro', 'FX', 'tff', '099741'],
  ['6J', 'Japanese Yen', 'FX', 'tff', '097741'],
  ['6B', 'British Pound', 'FX', 'tff', '096742'],
  ['6A', 'Australian Dollar', 'FX', 'tff', '232741'],
  ['6C', 'Canadian Dollar', 'FX', 'tff', '090741'],
  ['6S', 'Swiss Franc', 'FX', 'tff', '092741'],
  ['DX', 'US Dollar Index', 'FX', 'tff', '098662'],
  ['CL', 'WTI Crude Oil', 'Energy', 'disagg', '067651'],
  ['RB', 'RBOB Gasoline', 'Energy', 'disagg', '111659'],
  ['HO', 'Heating Oil', 'Energy', 'disagg', '022651'],
  ['NG', 'Natural Gas', 'Energy', 'disagg', '023651'],
  ['GC', 'Gold', 'Metals', 'disagg', '088691'],
  ['SI', 'Silver', 'Metals', 'disagg', '084691'],
  ['HG', 'Copper', 'Metals', 'disagg', '085692'],
  ['PL', 'Platinum', 'Metals', 'disagg', '076651'],
  ['ZC', 'Corn', 'Grains', 'disagg', '002602'],
  ['ZS', 'Soybeans', 'Grains', 'disagg', '005602'],
  ['ZW', 'Chicago Wheat', 'Grains', 'disagg', '001602'],
  ['SB', 'Sugar No. 11', 'Softs', 'disagg', '080732'],
  ['KC', 'Coffee C', 'Softs', 'disagg', '083731'],
  ['CT', 'Cotton No. 2', 'Softs', 'disagg', '033661'],
];

// group key -> [long field, short field]
export const FIELDS = {
  tff: {
    dealer: ['dealer_positions_long_all', 'dealer_positions_short_all'],
    asset: ['asset_mgr_positions_long', 'asset_mgr_positions_short'],
    lev: ['lev_money_positions_long', 'lev_money_positions_short'],
    other: ['other_rept_positions_long', 'other_rept_positions_short'],
    small: ['nonrept_positions_long_all', 'nonrept_positions_short_all'],
  },
  disagg: {
    prod: ['prod_merc_positions_long', 'prod_merc_positions_short'],
    swap: ['swap_positions_long_all', 'swap__positions_short_all'],
    mm: ['m_money_positions_long_all', 'm_money_positions_short_all'],
    other: ['other_rept_positions_long', 'other_rept_positions_short'],
    small: ['nonrept_positions_long_all', 'nonrept_positions_short_all'],
  },
};

export async function fetchReport(report, since = START, init = {}) {
  const dataset = report === 'tff' ? TFF : DISAGG;
  const codes = MARKETS.filter((m) => m[3] === report).map((m) => `'${m[4]}'`);
  const cols = Object.values(FIELDS[report]).flat();
  const params = new URLSearchParams({
    $select: ['cftc_contract_market_code', 'report_date_as_yyyy_mm_dd', 'open_interest_all', ...cols].join(','),
    $where: `cftc_contract_market_code in (${codes.join(',')}) AND report_date_as_yyyy_mm_dd >= '${since}'`,
    $order: 'report_date_as_yyyy_mm_dd ASC',
    $limit: '50000',
  });
  const res = await fetch(`${API}/${dataset}.json?${params}`, {
    ...init,
    headers: { Accept: 'application/json', 'User-Agent': 'cot-dashboard-data-refresh' },
  });
  if (!res.ok) throw new Error(`CFTC ${dataset} responded ${res.status}: ${await res.text()}`);
  return res.json();
}

/** Converts API rows into { code -> Map(date -> row) }. */
export function groupRows(report, rows, into = new Map()) {
  for (const r of rows) {
    const code = r.cftc_contract_market_code.trim();
    const entry = { d: r.report_date_as_yyyy_mm_dd.slice(0, 10), oi: num(r.open_interest_all) };
    for (const [g, [l, s]] of Object.entries(FIELDS[report])) entry[g] = [num(r[l]), num(r[s])];
    if (!into.has(code)) into.set(code, new Map());
    into.get(code).set(entry.d, entry); // de-duplicates any repeated dates
  }
  return into;
}

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

