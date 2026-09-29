import type { Metadata } from 'next'
import { SoundLabsHero } from '@/components/sound-labs/SoundLabsHero'
import { AudioShowcase } from '@/components/sound-labs/AudioShowcase'
import { OutcomeGrid } from '@/components/sound-labs/OutcomeGrid'
import { PackageSelector } from '@/components/sound-labs/PackageSelector'
import { DeliverablesSignalChain } from '@/components/sound-labs/DeliverablesSignalChain'
import { ProductionJourney } from '@/components/sound-labs/ProductionJourney'
import { AudienceGrid } from '@/components/sound-labs/AudienceGrid'
import { SoundLabsFAQ } from '@/components/sound-labs/SoundLabsFAQ'
import { ProjectIntake } from '@/components/sound-labs/ProjectIntake'
import { SoundLabsFinalCTA } from '@/components/sound-labs/SoundLabsFinalCTA'

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
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <SoundLabsHero />

      {/* Audio Showcase */}
      <AudioShowcase />

      {/* Outcome Grid */}
      <OutcomeGrid />

      {/* Package Selector */}
      <PackageSelector />

      {/* Deliverables */}
      <DeliverablesSignalChain />

      {/* Production Journey */}
      <ProductionJourney />

      {/* Audience Grid */}
      <AudienceGrid />

      {/* FAQ */}
      <SoundLabsFAQ />

      {/* Project Intake Form */}
      <ProjectIntake />

      {/* Final CTA */}
      <SoundLabsFinalCTA />
    </div>
  )
}
