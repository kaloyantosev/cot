# ⚡ COT Pro — Institutional Intelligence Platform

An institutional-grade **Commitment of Traders (COT)** analytics and positioning intelligence terminal built for macro portfolio managers, systematic CTAs, and discretionary derivatives traders.

---

## 🌐 Overview

**COT Pro** translates weekly CFTC Commitment of Traders filings (Legacy and Disaggregated formats) into actionable statistical and structural positioning intelligence across **30+ liquid global futures markets**.

Instead of viewing static tables, traders can analyze institutional crowding, commercial hedging pressure, zero-line crossovers, and dealer delta-hedging flows across **3 years (156 weeks)** of data.

---

## 🚀 Key Features

### 1. 📊 Interactive Terminal Dashboard
- **5 Global Asset Classes:** Equity Indices, FX / Currencies, Rates & Bonds, Energy Commodities, Metals & Ags.
- **Micro Sparklines:** 26-week directional net position trajectories at a glance.
- **Positioning Gauge:** Percentile rankings ($0\%$ to $100\%$) indicating statistical crowding relative to 3-year historical bands.
- **Signal Badges:** Auto-classifies markets into `🔴 EXTREME SHORT`, `🟢 EXTREME LONG`, `⚡ CROSSOVER`, and `⚪ NEUTRAL`.

### 2. 🔬 Institutional Deep Dive
- **Participant Breakdown:**
  - *Financials:* **Dealers / Intermediaries** (contra-indicator analysis), **Asset Managers / Institutional**, and **Leveraged Funds (CTAs / Speculators)**.
  - *Commodities:* **Commercial Producers / Merchants**, **Managed Money**, and **Other Reportables**.
  - Displays Longs, Shorts, Net Exposure, and L/S Ratios with week-over-week contract shifts.
- **Positioning Timeline Chart:**
  - Multi-line area charts tracking institutional net curves over `13W`, `26W`, `52W`, or `3Y`.
  - **Interactive Price Overlay:** Correlates speculative positioning peaks with market tops, bottoms, and squeeze points.
- **3Y Speedometer Gauges:**
  - Dynamic SVG dials illustrating current net positioning against 3-year highs and lows.
  - Generates algorithmic commentary on mean-reversion risk and squeeze vulnerability.
- **Two-Date Comparison Matrix:**
  - Compare any two historical reporting weeks to measure exact capital deployment and liquidation velocity.
  - Includes an auto-generated narrative synthesis of net positioning bias.

### 3. 🌐 Cross-Market Positioning Heatmap
- **$5 \times 4$ Global Matrix:** Visualizes capital concentration across all participant categories and asset classes simultaneously.
- **Top 6 Crowded Trades Leaderboard:** Ranked by absolute statistical distance from neutral.

### 4. ⚡ Multi-Asset Signal Screener
- Search and filter all 30+ markets by:
  - `Extreme Long (>85th %ile)`
  - `Extreme Short (<15th %ile)`
  - `Zero-Line Crossovers`
  - `Largest WoW Contract Changes`

### 5. 📚 Educational Sidebar
- Integrated institutional reference guide explaining CFTC reporting mechanics, commercial vs. speculative behavior, and why dealer hedging acts as an equity contra-indicator.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark Terminal Palette: `#050810`, `#6366f1`, `#10b981`, `#ef4444`)
- **Charting:** Recharts & SVG Speedometer Visualizations
- **Animations:** Framer Motion
- **Deployment:** Vercel

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/cot-pro.git

# Navigate to the folder
cd cot-pro

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Deployment to Vercel

This repository is pre-configured with `vercel.json` for zero-configuration Next.js deployment:

1. Push your repository to **GitHub**.
2. Connect the repository in your [Vercel Dashboard](https://vercel.com).
3. Click **Deploy**.

---

## 📄 Disclaimer
*Data provided in this demonstration repository uses realistic simulated historical CFTC formats for educational and portfolio demonstration purposes.*
