import type { Metadata } from 'next';
import { ImpsHeader } from '@/components/imps/ImpsHeader';
import { ImpsByteMiniHero } from '@/components/imps/ImpsByteMiniHero';
import { ImpsSpecStrip } from '@/components/imps/ImpsSpecStrip';
import { ImpsFeaturesGrid } from '@/components/imps/ImpsFeaturesGrid';
import { ImpsCoreEmblem } from '@/components/imps/ImpsCoreEmblem';
import { ImpsGallery } from '@/components/imps/ImpsGallery';
import { ImpsLaunchEdition } from '@/components/imps/ImpsLaunchEdition';
import { ImpsEcosystem } from '@/components/imps/ImpsEcosystem';
import { ImpsTechnicalSpecs } from '@/components/imps/ImpsTechnicalSpecs';
import { ImpsCTA } from '@/components/imps/ImpsCTA';

export const metadata: Metadata = {
  title: 'WISE² IMPS BYTE MINI 4.0 | AI Companion & Edge Computing Device',
  description: 'Meet WISE² IMPS BYTE MINI 4.0: A physical AI companion with ESP32-C5, 4" touchscreen, voice interaction, and local processing. Build, customize, own your edge AI.',
  keywords: 'WISE² IMPS, BYTE MINI, edge AI, ESP32, IoT device, AI companion, DIY robotics, local AI, touchscreen device',
  openGraph: {
    type: 'website',
    url: 'https://wise2.net/products/imps',
    title: 'WISE² IMPS BYTE MINI 4.0 | AI Companion & Edge Computing Device',
    description: 'Physical AI companion with ESP32-C5, 4" touchscreen, and local edge processing.',
    siteName: 'WISE²',
    images: [
      {
        url: '/products/imps-og-image.png',
        width: 1200,
        height: 630,
        alt: 'WISE² IMPS BYTE MINI 4.0 product render',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WISE² IMPS BYTE MINI 4.0 | AI Companion & Edge Computing Device',
    description: 'Physical AI companion with ESP32-C5, 4" touchscreen, and local edge processing.',
  },
  alternates: {
    canonical: 'https://wise2.net/products/imps',
  },
};

export default function ImpsByteMiniPage() {
  return (
    <>
      <ImpsHeader />
      <main className="bg-black">
        <ImpsByteMiniHero />
        <ImpsSpecStrip />
        <ImpsFeaturesGrid />
        <ImpsCoreEmblem />
        <ImpsGallery />
        <ImpsLaunchEdition />
        <ImpsEcosystem />
        <ImpsTechnicalSpecs />
        <ImpsCTA />
      </main>
    </>
  );
}
