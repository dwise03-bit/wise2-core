import './styles.css';
import './eval.css';
import './eval-setup.css';
import './academy.css';
import './ai.css';
import './premium.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'WISE² Trading', description: 'WISE² client operations for signal intelligence, NinjaTrader, and funded-account workflows.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
