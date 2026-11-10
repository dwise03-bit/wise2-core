import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Paper desk',
  description: 'Simulated MNQ paper trading desk. Prices, fills, and PLOT reads are sample data.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, height: '100vh', background: '#131722', color: '#d1d4dc' }}>{children}</body>
    </html>
  );
}
