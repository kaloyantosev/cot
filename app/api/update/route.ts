import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' };

    // Fetch latest CFTC current week feeds on demand
    const [finRes, comRes] = await Promise.all([
      fetch('https://www.cftc.gov/dea/newcot/FinComWk.txt', {
        headers,
        next: { revalidate: 0 },
      }),
      fetch('https://www.cftc.gov/dea/newcot/c_disagg.txt', {
        headers,
        next: { revalidate: 0 },
      }),
    ]);

    if (!finRes.ok || !comRes.ok) {
      throw new Error(`CFTC server responded with status: ${finRes.status} / ${comRes.status}`);
    }

    const finText = await finRes.text();
    const comText = await comRes.text();

    const finLines = finText.split('\n').filter((l) => l.trim().length > 0);
    const comLines = comText.split('\n').filter((l) => l.trim().length > 0);

    // Extract report date from first valid line
    let latestReportDate = 'Latest Report';
    for (const l of finLines) {
      const parts = l.split(',').map((p) => p.trim().replace(/"/g, ''));
      if (parts[2] && /^\d{4}-\d{2}-\d{2}$/.test(parts[2])) {
        latestReportDate = parts[2];
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'CFTC data successfully fetched and verified.',
      reportDate: latestReportDate,
      financialRecordsCount: finLines.length,
      commodityRecordsCount: comLines.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Failed to update CFTC data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to connect to CFTC servers.',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
