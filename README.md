# COT Positioning

A simple, accurate dashboard of CFTC Commitments of Traders positioning for 28 liquid futures: equity indices, Treasuries, currencies, energy, metals, grains and softs.

**Live:** https://cot-visualiser.vercel.app

## What it shows

- **Overview:** the speculative net position for every market (Leveraged Funds in financials, Managed Money in commodities) as a % of open interest, with its 3-year COT Index, 26-week index, 3-year z-score and a crowded long / crowded short / neutral flag.
- **Market pages:** the history of every trader group's net % of open interest, the rolling 3-year COT Index for speculators and hedgers, the latest positions table, and caveats where COT data is easy to misread (the Treasury basis trade, DX vs other FX, equity index hedges).
- **Methodology:** definitions, timing (positions as of Tuesday, released Friday), and the limits of the signals.

## Data

`data/cot.json` is built by `scripts/fetch-cot.mjs` from the [CFTC Public Reporting API](https://publicreporting.cftc.gov) (futures-only TFF and Disaggregated reports, since 2016). Markets are matched by CFTC contract code. A GitHub Action (`.github/workflows/refresh-data.yml`) runs every Saturday and Monday, and commits new data when a report is out. Vercel redeploys on that commit.

## Develop

```bash
npm install
node scripts/fetch-cot.mjs   # optional: pull the latest report
npm run dev
```

Next.js 14 (static generation), TypeScript, Tailwind, Recharts.

Not investment advice.
