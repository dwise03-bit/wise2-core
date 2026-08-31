import { MobileNav } from '@/components/MobileNav';
import { FergieAiGuide } from '@/components/FergieAiGuide';
import { FergieTourOverlay } from '@/components/tour/FergieTourOverlay';
import { FergieTourPrompt } from '@/components/tour/FergieTourPrompt';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="smoke-bg min-h-screen pb-28 pt-[var(--safe-top)]">
      {children}
      <FergieTourOverlay />
      <FergieTourPrompt />
      <FergieAiGuide />
      <MobileNav />
    </div>
  );
}
