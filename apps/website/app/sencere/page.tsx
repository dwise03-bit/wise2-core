import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Hero } from '@/components/sencere/Hero';
import { BrandShowcase } from '@/components/sencere/BrandShowcase';
import { BrandSection } from '@/components/sencere/BrandSection';
import { Newsletter } from '@/components/sencere/Newsletter';
import { Footer } from '@/components/sencere/Footer';
import { getAllBrands } from '@/lib/sencere/brands.config';

export default function SenCereHomePage() {
  const brands = getAllBrands();

  return (
    <>
      <UtilityBar />
      <Navbar />
      <Hero />
      <BrandShowcase />

      {/* Dynamic Brand Sections */}
      {brands.map((brand) => (
        <BrandSection key={brand.id} brand={brand} />
      ))}

      <Newsletter />
      <Footer />
    </>
  );
}
