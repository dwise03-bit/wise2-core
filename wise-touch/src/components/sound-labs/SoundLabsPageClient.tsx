'use client'

import { motion } from 'framer-motion'
import { SoundLabsHero } from './SoundLabsHero'
import { AudioShowcase } from './AudioShowcase'
import { OutcomeGrid } from './OutcomeGrid'
import { PackageSelector } from './PackageSelector'
import { DeliverablesSignalChain } from './DeliverablesSignalChain'
import { ProductionJourney } from './ProductionJourney'
import { AudienceGrid } from './AudienceGrid'
import { SoundLabsFAQ } from './SoundLabsFAQ'
import { ProjectIntake } from './ProjectIntake'
import { SoundLabsFinalCTA } from './SoundLabsFinalCTA'
import { PremiumSectionContainer } from '@/components/layout/PremiumSections'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
}

export function SoundLabsPageClient() {
  return (
    <motion.div
      className="space-y-16 md:space-y-20"
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
        <PremiumSectionContainer
          title="Studio Quality Audio"
          subtitle="Experience our production capabilities"
          badge="Professional Grade"
        >
          <AudioShowcase />
        </PremiumSectionContainer>
      </motion.div>

      {/* Outcome Grid */}
      <motion.div variants={itemVariants}>
        <PremiumSectionContainer
          title="What You'll Get"
          subtitle="Professional deliverables tailored to your vision"
          badge="Complete Package"
        >
          <OutcomeGrid />
        </PremiumSectionContainer>
      </motion.div>

      {/* Package Selector */}
      <motion.div variants={itemVariants}>
        <PremiumSectionContainer
          title="Choose Your Package"
          subtitle="Flexible pricing for every project size"
          badge="Transparent Pricing"
        >
          <PackageSelector />
        </PremiumSectionContainer>
      </motion.div>

      {/* Deliverables */}
      <motion.div variants={itemVariants}>
        <PremiumSectionContainer
          title="Production Signal Chain"
          subtitle="How we craft your sound"
          badge="Engineering Process"
        >
          <DeliverablesSignalChain />
        </PremiumSectionContainer>
      </motion.div>

      {/* Production Journey */}
      <motion.div variants={itemVariants}>
        <PremiumSectionContainer
          title="Your Production Journey"
          subtitle="From brief to delivery in weeks, not months"
          badge="Fast Turnaround"
        >
          <ProductionJourney />
        </PremiumSectionContainer>
      </motion.div>

      {/* Audience Grid */}
      <motion.div variants={itemVariants}>
        <PremiumSectionContainer
          title="Who We Serve"
          subtitle="From startups to enterprises"
          badge="Industry Experience"
        >
          <AudienceGrid />
        </PremiumSectionContainer>
      </motion.div>

      {/* FAQ */}
      <motion.div variants={itemVariants}>
        <PremiumSectionContainer
          title="Frequently Asked Questions"
          subtitle="Everything you need to know"
          badge="Support"
        >
          <SoundLabsFAQ />
        </PremiumSectionContainer>
      </motion.div>

      {/* Project Intake Form */}
      <motion.div variants={itemVariants}>
        <PremiumSectionContainer
          title="Let's Start Your Project"
          subtitle="Tell us about your sonic vision"
          badge="Get Started"
        >
          <ProjectIntake />
        </PremiumSectionContainer>
      </motion.div>

      {/* Final CTA */}
      <motion.div variants={itemVariants}>
        <SoundLabsFinalCTA />
      </motion.div>
    </motion.div>
  )
}
