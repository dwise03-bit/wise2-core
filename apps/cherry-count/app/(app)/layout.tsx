import { MobileNav } from '@/components/MobileNav';
import { CherryAiGuide } from '@/components/CherryAiGuide';
import { CherryTourOverlay } from '@/components/tour/CherryTourOverlay';
import { CherryTourPrompt } from '@/components/tour/CherryTourPrompt';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cherry-black pb-24">
      {children}
      <CherryTourOverlay />
      <CherryTourPrompt />
      <CherryAiGuide />
      <MobileNav />
    </div>
  );
}
