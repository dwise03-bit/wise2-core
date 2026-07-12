'use client'

import type { Metadata } from 'next'
import { motion } from 'framer-motion'
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
import { PageContainer, SectionContainer } from '@/components/layout/PageContainer'

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export default function SoundLabsPage() {
  return (
    <motion.div
      className="space-y-12 md:space-y-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants}>
        <SoundLabsHero />
      </motion.div>

      {/* Audio Showcase */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="Studio Quality Audio" subtitle="Experience our production capabilities">
          <AudioShowcase />
        </SectionContainer>
      </motion.div>

      {/* Outcome Grid */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="What You'll Get" subtitle="Professional deliverables tailored to your vision">
          <OutcomeGrid />
        </SectionContainer>
      </motion.div>

      {/* Package Selector */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="Choose Your Package" subtitle="Flexible pricing for every project size">
          <PackageSelector />
        </SectionContainer>
      </motion.div>

      {/* Deliverables */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="Production Signal Chain" subtitle="How we craft your sound">
          <DeliverablesSignalChain />
        </SectionContainer>
      </motion.div>

      {/* Production Journey */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="Your Production Journey" subtitle="From brief to delivery in weeks, not months">
          <ProductionJourney />
        </SectionContainer>
      </motion.div>

      {/* Audience Grid */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="Who We Serve" subtitle="From startups to enterprises">
          <AudienceGrid />
        </SectionContainer>
      </motion.div>

      {/* FAQ */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="Frequently Asked Questions" subtitle="Everything you need to know">
          <SoundLabsFAQ />
        </SectionContainer>
      </motion.div>

      {/* Project Intake Form */}
      <motion.div variants={itemVariants}>
        <SectionContainer title="Let's Start Your Project" subtitle="Tell us about your sonic vision">
          <ProjectIntake />
        </SectionContainer>
      </motion.div>

      {/* Final CTA */}
      <motion.div variants={itemVariants}>
        <SoundLabsFinalCTA />
      </motion.div>
    </motion.div>
  )
}
