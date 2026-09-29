import { VandalsHeader } from '@/components/sencere/vandals/VandalsHeader';
import { VandalsHero } from '@/components/sencere/vandals/VandalsHero';
import { VandalsProducts } from '@/components/sencere/vandals/VandalsProducts';
import { VandalsFooter } from '@/components/sencere/vandals/VandalsFooter';

export const metadata = {
  title: 'PIFF CITY VANDALS | The Underground | SenCere Creative',
  description: 'Join the rebellion. PIFF CITY VANDALS — uncensored, unapologetic, underground. Limited releases and art collective. Part of SenCere Creative.',
};

export default function VandalsPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <VandalsHeader />
      <VandalsHero />
      <VandalsProducts />
      <VandalsFooter />
    </div>
  );
}
