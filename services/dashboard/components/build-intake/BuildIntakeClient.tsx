import HeroSection from './HeroSection';
import FormSection from './FormSection';
import WorkflowProgression from './WorkflowProgression';
import { BackgroundGrid } from './Background/BackgroundGrid';
import { FloatingParticles } from './Background/FloatingParticles';
import { FloatingCharacters } from './FloatingCharacters';
import { Header } from './Header';

export default function BuildIntakeClient() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation Header */}
      <Header />

      {/* Background Effects */}
      <BackgroundGrid />
      <FloatingParticles />
      <FloatingCharacters />

      {/* Main Content */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-12 pt-24">
          {/* Hero Section - Static, renders with characters */}
          <HeroSection />

          {/* Form Container - Client component for interactivity */}
          <FormSection />

          {/* Workflow Progression */}
          <WorkflowProgression />
        </div>
      </div>
    </div>
  );
}
