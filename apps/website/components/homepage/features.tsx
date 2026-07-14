'use client';

import React from 'react';
import { Card } from '@wise2/design-system/components';
import { AnimatedCard } from './animated-card';
import { AnimatedSection } from './animated-section';

export function FeaturesSection() {
  const features = [
    { title: 'AI POWERED AUTOMATION', icon: '⚡' },
    { title: 'REAL-TIME ANALYTICS', icon: '📊' },
    { title: 'BUILT FOR SCALE', icon: '📈' },
    { title: 'SECURE BY DESIGN', icon: '🔒' },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black via-blue-950/20 to-black">
      <AnimatedSection className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, i) => (
          <AnimatedCard key={i} delay={i * 0.1}>
            <div className="group">
              <Card
                className="h-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-6 backdrop-blur hover:border-cyan-500/50 transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg text-white group-hover:text-cyan-400 transition">{feature.title}</h3>
              </Card>
            </div>
          </AnimatedCard>
        ))}
      </AnimatedSection>
    </section>
  );
}
