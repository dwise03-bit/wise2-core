'use client';

import { SoundLabModalsProvider } from '@/components/soundlab/SoundLabModals';
import { SoundLabHeader } from '@/components/soundlab/SoundLabHeader';
import { SoundLabHero } from '@/components/soundlab/SoundLabHero';
import { FeatureStrip } from '@/components/soundlab/FeatureStrip';
import { ServiceGrid } from '@/components/soundlab/ServiceGrid';
import { ProcessFlow } from '@/components/soundlab/ProcessFlow';
import { AIProducer } from '@/components/soundlab/AIProducer';
import { SampleGallery } from '@/components/soundlab/SampleGallery';
import { StudioTools } from '@/components/soundlab/StudioTools';
import { Pricing } from '@/components/soundlab/Pricing';
import { DeliveryPlatforms } from '@/components/soundlab/DeliveryPlatforms';
import { FAQ } from '@/components/soundlab/FAQ';
import { SoundLabFooter } from '@/components/soundlab/SoundLabFooter';
import { ProjectIntake } from '@/components/soundlab/ProjectIntake';

export default function SoundLabPage() {
  return (
    <SoundLabModalsProvider>
      <div className="min-h-screen bg-black text-white antialiased">
        <SoundLabHeader />
        <SoundLabHero />
        <FeatureStrip />
        <ServiceGrid />
        <ProcessFlow />
        <AIProducer />
        <SampleGallery />
        <StudioTools />
        <Pricing />
        <DeliveryPlatforms />
        <FAQ />
        <SoundLabFooter />
        <ProjectIntake />
      </div>
    </SoundLabModalsProvider>
  );
}
