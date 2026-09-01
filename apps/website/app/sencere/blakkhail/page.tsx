import { BlakkhailHeader } from '@/components/sencere/blakkhail/BlakkhailHeader';
import { BlakkhailStorefront } from '@/components/sencere/blakkhail/BlakkhailStorefront';
import { BlakkhailFooter } from '@/components/sencere/blakkhail/BlakkhailFooter';
import { BlakkhailMobileShopBar } from '@/components/sencere/blakkhail/BlakkhailMobileShopBar';
import { BLAKKHAIL_LAYOUT } from '@/components/sencere/blakkhail/brand-tokens';

export default function BlakkhailPage() {
  return (
    <div className={`${BLAKKHAIL_LAYOUT.page} scroll-smooth pb-20 md:pb-0`} style={{ backgroundColor: '#0A0A0A', color: '#A8A8A8' }}>
      <BlakkhailHeader />
      <main>
        <BlakkhailStorefront />
      </main>
      <BlakkhailFooter />
      <BlakkhailMobileShopBar />
    </div>
  );
}
