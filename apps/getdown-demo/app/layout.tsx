import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/shell/AppShell';
import { TourProvider } from '@/components/tour/TourProvider';
import { TourOverlay } from '@/components/tour/TourOverlay';
import { Closing, Splash } from '@/components/tour/Splash';
import { Assistant } from '@/components/assistant/Assistant';

export const metadata: Metadata = {
  title: 'Get Down Pressure Washing — Business Command Center',
  description:
    'Owner demonstration of the Get Down Pressure Washing command center, powered by the WISE² Revenue Engine. All data shown is simulated.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gd-void text-white antialiased">
        <TourProvider>
          <Splash />
          <AppShell>{children}</AppShell>
          <Assistant />
          <TourOverlay />
          <Closing />
        </TourProvider>
      </body>
    </html>
  );
}
