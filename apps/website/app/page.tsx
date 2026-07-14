'use client';

import React from 'react';
import {
  Header,
  HeroSection,
  FeaturesSection,
  ProductsSection,
  StatsSection,
  TestimonialsSection,
  PricingSection,
  CTASection,
  Footer
} from '@/components/homepage';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ProductsSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />

      <Footer />
    </div>
  );
}
