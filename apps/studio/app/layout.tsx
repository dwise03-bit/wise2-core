import type { Metadata } from 'next';
import '../styles/globals.css';
import { StudioNav } from '../components/Navigation/StudioNav';
import { SupportWidget } from '../components/SupportWidget';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorToastContainer } from '../components/ErrorToast';

export const metadata: Metadata = {
  title: 'WISE² | Organized Chaos Command Center',
  description: 'The all-in-one AI operating system for businesses, creators, and entrepreneurs. Build, automate, dominate.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body className="bg-black text-white">
        <ErrorBoundary>
          <main className="min-h-screen">{children}</main>
          <SupportWidget />
          <ErrorToastContainer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
