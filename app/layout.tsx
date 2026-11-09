import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { data, fmtDate, releaseDate } from '@/lib/cot';
import './globals.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'COT Positioning',
  description:
    'Weekly CFTC Commitments of Traders positioning for 28 liquid futures: net as % of open interest, 3-year COT index, z-scores and crowding extremes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="font-semibold tracking-tight">
              COT Positioning
            </Link>
            <nav className="flex items-center gap-5 text-sm text-muted">
              <span className="hidden sm:inline num">
                Positions {fmtDate(data.asOf)} · released {fmtDate(releaseDate(data.asOf))}
              </span>
              <Link href="/methodology" className="hover:text-fg">
                Methodology
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-line text-xs text-muted">
          <div className="mx-auto max-w-6xl px-4 py-5 flex flex-col sm:flex-row gap-2 justify-between">
            <span>
              Source: CFTC Commitments of Traders (futures only), refreshed weekly. Not investment advice.
            </span>
            <a href="https://github.com/kaloyantosev/cot" className="hover:text-fg">
              GitHub
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
