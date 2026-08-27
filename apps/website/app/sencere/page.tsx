import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Hero } from '@/components/sencere/Hero';
import { BrandShowcase } from '@/components/sencere/BrandShowcase';
import { FeaturedCollection } from '@/components/sencere/FeaturedCollection';
import { BrandStory } from '@/components/sencere/BrandStory';
import { Newsletter } from '@/components/sencere/Newsletter';
import { Footer } from '@/components/sencere/Footer';

export default function SenCereHomePage() {
  return (
    <>
      <UtilityBar />
      <Navbar />
      <Hero />
      <BrandShowcase />
      <FeaturedCollection />
      <BrandStory />
      <Newsletter />
      <Footer />
    </>
  );
}
