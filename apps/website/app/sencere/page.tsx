import { UtilityBar } from '@/components/sencere/UtilityBar';
import { Navbar } from '@/components/sencere/Navbar';
import { Hero } from '@/components/sencere/Hero';
import { BrandShowcase } from '@/components/sencere/BrandShowcase';
import { BlakkhailHeader } from '@/components/sencere/blakkhail/BlakkhailHeader';
import { BlakkhailHero } from '@/components/sencere/blakkhail/BlakkhailHero';
import { BlakkhailProducts } from '@/components/sencere/blakkhail/BlakkhailProducts';
import { BlakkhailFooter } from '@/components/sencere/blakkhail/BlakkhailFooter';
import { PiffCityHeader } from '@/components/sencere/piff-city/PiffCityHeader';
import { PiffCityHero } from '@/components/sencere/piff-city/PiffCityHero';
import { PiffCityProducts } from '@/components/sencere/piff-city/PiffCityProducts';
import { PiffCityFooter } from '@/components/sencere/piff-city/PiffCityFooter';
import { VandalsHeader } from '@/components/sencere/vandals/VandalsHeader';
import { VandalsHero } from '@/components/sencere/vandals/VandalsHero';
import { VandalsProducts } from '@/components/sencere/vandals/VandalsProducts';
import { VandalsFooter } from '@/components/sencere/vandals/VandalsFooter';
import { Newsletter } from '@/components/sencere/Newsletter';
import { Footer } from '@/components/sencere/Footer';

export default function SenCereHomePage() {
  return (
    <>
      <UtilityBar />
      <Navbar />
      <Hero />
      <BrandShowcase />

      {/* BLAKKHAIL Brand Section */}
      <div id="blakkhail-section" className="scroll-mt-16">
        <BlakkhailHeader />
        <BlakkhailHero />
        <BlakkhailProducts />
        <BlakkhailFooter />
      </div>

      {/* PIFF CITY Brand Section */}
      <div id="piff-city-section" className="scroll-mt-16">
        <PiffCityHeader />
        <PiffCityHero />
        <PiffCityProducts />
        <PiffCityFooter />
      </div>

      {/* VANDALS Brand Section */}
      <div id="vandals-section" className="scroll-mt-16">
        <VandalsHeader />
        <VandalsHero />
        <VandalsProducts />
        <VandalsFooter />
      </div>

      <Newsletter />
      <Footer />
    </>
  );
}
