// Pulls weekly Commitments of Traders data from the CFTC public reporting API
// and writes data/cot.json. Run with: node scripts/fetch-cot.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MARKETS, fetchReport, groupRows } from '../lib/cftc.mjs';

async function main() {
  const [tff, disagg] = await Promise.all([fetchReport('tff'), fetchReport('disagg')]);
  const rowsByCode = groupRows('disagg', disagg, groupRows('tff', tff));

  const markets = MARKETS.map(([id, name, sector, report, code]) => {
    const rows = [...(rowsByCode.get(code)?.values() ?? [])].sort((a, b) => a.d.localeCompare(b.d));
    if (rows.length < 156) throw new Error(`${id} (${code}) returned only ${rows.length} weeks`);
    return { id, name, sector, report, code, rows };
  });

  const asOf = markets.reduce((max, m) => (m.rows.at(-1).d > max ? m.rows.at(-1).d : max), '');
  const out = { asOf, generatedAt: new Date().toISOString(), source: 'CFTC Public Reporting API (futures only)', markets };

  const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'cot.json');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(out));
  console.log(`Wrote ${markets.length} markets, latest report ${asOf}`);
  for (const m of markets) console.log(`  ${m.id.padEnd(4)} ${m.rows.length} weeks ${m.rows[0].d} -> ${m.rows.at(-1).d}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
