'use client';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { OwnerSection } from './components/OwnerSection';
import { Services } from './components/Services';
import { Transformations } from './components/Transformations';
import { Benefits } from './components/Benefits';
import { Reviews } from './components/Reviews';
import { BookingCTA } from './components/BookingCTA';
import { Footer } from './components/Footer';

export default function UltraWiseDetail() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <OwnerSection />
        <Services />
        <Transformations />
        <Benefits />
        <Reviews />
        <BookingCTA />
      </main>
      <Footer />
    </div>
  );
}
