'use client'

import { ChefHat, Clock, Users, Star, ArrowRight, Heart } from 'lucide-react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Testimonials from '@/components/Testimonials'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
