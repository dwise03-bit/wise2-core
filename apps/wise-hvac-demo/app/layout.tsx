import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'WISE HVAC Solutions Demo',
  description:
    'Interactive landing page demo for WISE HVAC Solutions, inspired by the uploaded fire-and-ice mockup.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
