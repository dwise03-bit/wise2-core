import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Hero } from '@/components/sencere/Hero';
import { IndustryStrip } from '@/components/sencere/IndustryStrip';
import { CapabilityGrid } from '@/components/sencere/CapabilityGrid';
import { ProductShowcase } from '@/components/sencere/ProductShowcase';
import { SuccessStatsCTA } from '@/components/sencere/SuccessStatsCTA';
import { Footer } from '@/components/sencere/Footer';

export default function SenCereHomePage() {
  return (
    <>
      <UtilityBar />
      <Navbar />
      <Hero />
      <IndustryStrip />
      <CapabilityGrid />
      <ProductShowcase />
      <SuccessStatsCTA />
      <Footer />
    </>
  );
}
