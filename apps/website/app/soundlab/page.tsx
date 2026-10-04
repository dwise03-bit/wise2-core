'use client';

import { SoundLabModalsProvider } from '@/components/soundlab/SoundLabModals';
import { ProjectIntake } from '@/components/soundlab/ProjectIntake';
import { StudioPlayerProvider } from '@/components/soundlab/studio/StudioPlayerContext';
import { StudioHeader } from '@/components/soundlab/studio/StudioHeader';
import { StudioHero } from '@/components/soundlab/studio/StudioHero';
import { CapabilityCards } from '@/components/soundlab/studio/CapabilityCards';
import { SamplesReleases } from '@/components/soundlab/studio/SamplesReleases';
import { ProductionWorkflow } from '@/components/soundlab/studio/ProductionWorkflow';
import { StudioToolsRow } from '@/components/soundlab/studio/StudioToolsRow';
import { PackagesPricing } from '@/components/soundlab/studio/PackagesPricing';
import { StudioPlayerBar } from '@/components/soundlab/studio/StudioPlayerBar';

export default function SoundLabPage() {
  return (
    <SoundLabModalsProvider>
      <StudioPlayerProvider>
        <div className="min-h-screen bg-[#02050A] text-[#F7FBFF] antialiased pb-24 selection:bg-[#008CFF]/30">
          <StudioHeader />
          <main>
            <StudioHero />
            <CapabilityCards />
            <SamplesReleases />
            <ProductionWorkflow />
            <StudioToolsRow />
            <PackagesPricing />
          </main>
          <StudioPlayerBar />
          <ProjectIntake />
        </div>
      </StudioPlayerProvider>
    </SoundLabModalsProvider>
  );
}
