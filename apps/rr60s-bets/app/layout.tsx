import type { Metadata, Viewport } from 'next';
import './styles.css';
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export const metadata: Metadata = { title: 'RR 60s Bets | AI Finds. You Decide.', description: 'Hodge × Eazy sports betting intelligence. Demo experience with simulated odds; no wager placement.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
