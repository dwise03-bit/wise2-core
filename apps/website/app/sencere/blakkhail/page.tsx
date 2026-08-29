import { BlakkhailHeader } from '@/components/sencere/blakkhail/BlakkhailHeader';
import { BlakkhailHero } from '@/components/sencere/blakkhail/BlakkhailHero';
import { BlakkhailShopScroll } from '@/components/sencere/blakkhail/BlakkhailShopScroll';
import { BlakkhailMission } from '@/components/sencere/blakkhail/BlakkhailMission';
import { BlakkhailMedia } from '@/components/sencere/blakkhail/BlakkhailMedia';
import { BlakkhailProducts } from '@/components/sencere/blakkhail/BlakkhailProducts';
import { BlakkhailFooter } from '@/components/sencere/blakkhail/BlakkhailFooter';
import { BLAKKHAIL_LAYOUT } from '@/components/sencere/blakkhail/brand-tokens';

export default function BlakkhailPage() {
  return (
    <div className={BLAKKHAIL_LAYOUT.page}>
      <BlakkhailHeader />
      <main>
        <BlakkhailHero />
        <BlakkhailShopScroll />
        <BlakkhailMission />
        <BlakkhailMedia />
        <BlakkhailProducts />
      </main>
      <BlakkhailFooter />
    </div>
  );
}
