'use client'

import HeroSection from '@/components/HeroSection'
import FeaturedBlends from '@/components/FeaturedBlends'
import RitualSection from '@/components/RitualSection'
import SubscriptionCTA from '@/components/SubscriptionCTA'
import TestimonialSection from '@/components/TestimonialSection'
import BrandStory from '@/components/BrandStory'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Header />
      <HeroSection />
      <FeaturedBlends />
      <RitualSection />
      <BrandStory />
      <TestimonialSection />
      <SubscriptionCTA />
      <Footer />
    </main>
  )
}
