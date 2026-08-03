import type { Metadata } from 'next'
import { SoundLabsPageClient } from '@/components/sound-labs/SoundLabsPageClient'

export const metadata: Metadata = {
  title: 'WISE² Sound Labs - Custom Music & Sonic Branding',
  description:
    'Professional music production and sonic branding for businesses, creators, and brands. Original compositions, commercial licensing, and launch-ready content.',
  keywords: [
    'custom music',
    'sonic branding',
    'music production',
    'commercial licensing',
    'jingle creation',
    'audio branding',
  ],
  openGraph: {
    title: 'WISE² Sound Labs - Custom Music & Sonic Branding',
    description:
      'Professional music production and sonic branding for businesses, creators, and brands.',
    type: 'website',
    url: 'https://wise2.net/sound-labs',
  },
}

export default function SoundLabsPage() {
  return <SoundLabsPageClient />
}
