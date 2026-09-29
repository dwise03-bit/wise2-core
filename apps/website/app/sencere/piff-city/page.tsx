import { PiffCityHeader } from '@/components/sencere/piff-city/PiffCityHeader';
import { PiffCityHero } from '@/components/sencere/piff-city/PiffCityHero';
import { PiffCityProducts } from '@/components/sencere/piff-city/PiffCityProducts';
import { PiffCityFooter } from '@/components/sencere/piff-city/PiffCityFooter';

export const metadata = {
  title: 'PIFF CITY | The Flagship Brand | SenCere Creative',
  description: 'Experience PIFF CITY - the lifestyle brand defining culture and creating the future. Exclusive drops, community, and movement. Part of SenCere Creative.',
};

export default function PiffCityPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <PiffCityHeader />
      <PiffCityHero />
      <PiffCityProducts />
      <PiffCityFooter />
    </div>
  );
}
