import type { Metadata, Viewport } from 'next';
import './styles.css';
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export const metadata: Metadata = { title: 'RR 60s Bets | AI Finds. You Decide.', description: 'Hodge × Eazy AI-assisted sports betting intelligence. Compare prices, scan plays, track results. No wager placement.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
