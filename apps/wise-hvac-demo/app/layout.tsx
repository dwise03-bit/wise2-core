import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WISE HVAC Solutions Demo',
  description:
    'Interactive landing page demo for WISE HVAC Solutions, inspired by the uploaded fire-and-ice mockup.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
