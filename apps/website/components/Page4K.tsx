"use client";

import { Navigation4K } from "./Navigation4K";
import { Hero4K } from "./Hero4K";
import { FeatureCards4K } from "./FeatureCards4K";
import { CTA4K } from "./CTA4K";
import { Footer4K } from "./Footer4K";

export function Page4K() {
  return (
    <div className="min-h-screen bg-[#050607] overflow-hidden">
      {/* Navigation */}
      <Navigation4K />

      {/* Hero Section */}
      <Hero4K />

      {/* Features Grid */}
      <FeatureCards4K />

      {/* Call to Action */}
      <CTA4K />

      {/* Footer */}
      <Footer4K />

      {/* Scanlines Effect (subtle, optional) */}
      <div className="fixed inset-0 pointer-events-none scanlines opacity-[0.02]" />

      {/* Responsive Adjustments */}
      <style>{`
        @media (max-width: 640px) {
          .grid-features-4k {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .text-display-4k {
            font-size: clamp(2rem, 10vw, 4rem);
          }

          .text-heading-4k {
            font-size: clamp(1.25rem, 6vw, 2.5rem);
          }
        }

        /* Optimize touch targets for mobile */
        @media (max-width: 640px) {
          .btn-glass-neon-4k,
          .btn-neon-gradient-4k {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
}
