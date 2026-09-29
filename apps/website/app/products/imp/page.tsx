import type { Metadata } from 'next';
import { ImpHero } from '@/components/imp/ImpHero';
import { ImpSpecs } from '@/components/imp/ImpSpecs';
import { ImpPlatforms } from '@/components/imp/ImpPlatforms';
import { ImpFeatures } from '@/components/imp/ImpFeatures';
import { ImpCTA } from '@/components/imp/ImpCTA';

export const metadata: Metadata = {
  title: 'WISE² IMP | AI-Powered Desktop Companion',
  description:
    'Meet WISE² IMP: Your intelligent desktop sidekick. Live in your browser, install on Windows, or get the K10 hardware. Zero setup, local storage, always there.',
  keywords: 'WISE² IMP, desktop companion, AI assistant, Windows pet, K10 hardware, desktop overlay',
  openGraph: {
    type: 'website',
    url: 'https://wise2.net/products/imp',
    title: 'WISE² IMP | AI-Powered Desktop Companion',
    description: 'Intelligent desktop companion. Browser app, Windows install, or K10 hardware. Zero setup, local storage.',
    siteName: 'WISE²',
    images: [
      {
        url: '/products/wise-imp.png',
        width: 512,
        height: 512,
        alt: 'WISE² IMP desktop companion with cyan eyes',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WISE² IMP | Desktop Companion',
    description: 'Intelligent desktop sidekick. Browser, Windows, or hardware.',
  },
  alternates: {
    canonical: 'https://wise2.net/products/imp',
  },
};

export default function WiseImpProductPage() {
  return (
    <>
      <main className="bg-black">
        <ImpHero />
        <ImpSpecs />
        <ImpPlatforms />
        <ImpFeatures />
        <ImpCTA />
      </main>
    </>
  );
}
