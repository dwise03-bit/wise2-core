'use client'

import HeroSection from '@/components/HeroSection'
import FeaturedBlends from '@/components/FeaturedBlends'
import RitualSection from '@/components/RitualSection'
import SubscriptionCTA from '@/components/SubscriptionCTA'
import TestimonialSection from '@/components/TestimonialSection'
import BrandStory from '@/components/BrandStory'

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedBlends />
      <RitualSection />
      <BrandStory />
      <TestimonialSection />
      <SubscriptionCTA />
    </div>
  )
}
