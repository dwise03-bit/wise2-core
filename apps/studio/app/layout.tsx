import type { Metadata } from 'next';
import '../styles/globals.css';
import { StudioNav } from '../components/Navigation/StudioNav';

export const metadata: Metadata = {
  title: 'WISE² | Organized Chaos Command Center',
  description: 'The all-in-one AI operating system for businesses, creators, and entrepreneurs. Build, automate, dominate.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="bg-black text-white">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
