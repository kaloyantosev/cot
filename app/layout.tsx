import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'COT Pro — Institutional Intelligence',
  description: 'Professional Commitment of Traders analytics platform for institutional traders and systematic macro researchers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#050810] text-[#f1f5f9] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
