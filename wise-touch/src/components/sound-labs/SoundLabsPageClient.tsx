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
import { SectionContainer } from '@/components/layout/PageContainer'

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

export function SoundLabsPageClient() {
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
