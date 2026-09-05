import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WISE² Trading | Quant Research Platform',
  description:
    'Liquidity-raid research, validation, risk controls, and execution workflows for MNQ, NQ, MES, and ES.',
  alternates: {
    canonical: 'https://wise2.net/trading',
  },
  openGraph: {
    title: 'WISE² Trading | Quant Research Platform',
    description:
      'Research, validate, and execute with discipline across MNQ, NQ, MES, and ES.',
    url: 'https://wise2.net/trading',
    type: 'website',
  },
};

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
