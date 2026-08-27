import { BlakkhailHeader } from '@/components/sencere/blakkhail/BlakkhailHeader';
import { BlakkhailHero } from '@/components/sencere/blakkhail/BlakkhailHero';
import { BlakkhailProducts } from '@/components/sencere/blakkhail/BlakkhailProducts';
import { BlakkhailFooter } from '@/components/sencere/blakkhail/BlakkhailFooter';

export const metadata = {
  title: 'BLAKK HAIL | Original Fashion since 1994 | SenCere Creative',
  description: 'Discover BLAKK HAIL - the legacy brand defining culture through authentic style and heritage. Part of the SenCere Creative ecosystem.',
};

export default function BlakkhailPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <BlakkhailHeader />
      <BlakkhailHero />
      <BlakkhailProducts />
      <BlakkhailFooter />
    </div>
  );
}
