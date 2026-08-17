'use client';

import { useState, useEffect } from 'react';
import { Container } from './Container';

interface StageData {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
}

const STAGES: StageData[] = [
  {
    id: 'idea',
    name: 'Idea',
    title: 'Define Your Vision',
    description: 'Start with your core idea. What problem are you solving? What\'s your unique angle?',
    icon: '💡',
  },
  {
    id: 'strategy',
    name: 'Strategy',
    title: 'Build Your Blueprint',
    description: 'Develop a strategic roadmap. Market positioning, target audience, competitive advantage.',
    icon: '🎯',
  },
  {
    id: 'build',
    name: 'Build',
    title: 'Bring It to Life',
    description: 'Execute your vision. Design, develop, produce. Turn strategy into tangible assets.',
    icon: '🔨',
  },
  {
    id: 'launch',
    name: 'Launch',
    title: 'Go Public',
    description: 'Release to market. Marketing campaigns, PR, community engagement. Create momentum.',
    icon: '🚀',
  },
  {
    id: 'multiply',
    name: 'Multiply',
    title: 'Scale & Grow',
    description: 'Amplify your reach. Optimize performance, expand markets, build sustainable growth.',
    icon: '📈',
  },
];

export const StartYourBuildClient: React.FC = () => {
  const [activeStage, setActiveStage] = useState(0);

  const handleStageClick = (index: number) => {
    setActiveStage(index);
  };

  return (
    <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20">
      <Container>
        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
            START YOUR <span className="text-wise-accent-green">BUILD</span>
          </h1>
          <p className="text-xl text-wise-text-secondary max-w-3xl mx-auto">
            Transform your vision into reality through 5 strategic phases: Idea, Strategy, Build, Launch, and Multiply.
          </p>
        </div>

        {/* Interactive Stage Timeline */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-12">
            {STAGES.map((stage, index) => (
              <button
                key={stage.id}
                onClick={() => handleStageClick(index)}
                className={`relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                  activeStage === index
                    ? 'bg-wise-accent-green/20 border-2 border-wise-accent-green shadow-lg scale-105'
                    : 'bg-wise-bg-secondary border-2 border-wise-accent-green/30 hover:border-wise-accent-green/60'
                }`}
              >
                {/* Progress indicator */}
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-wise-accent-green/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-wise-accent-green">{index + 1}</span>
                </div>

                <div className="text-4xl mb-3">{stage.icon}</div>
                <h3 className="font-bold text-white text-lg">{stage.name}</h3>
                <p className="text-xs text-wise-text-muted mt-2">Phase {index + 1}</p>
              </button>
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-wise-bg-secondary rounded-full overflow-hidden mb-12">
            <div
              className="h-full bg-gradient-to-r from-wise-accent-green to-wise-accent-green transition-all duration-300"
              style={{ width: `${((activeStage + 1) / STAGES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Active Stage Detail Card */}
        <div className="mb-20">
          <div className="bg-wise-bg-secondary border-2 border-wise-accent-green/40 rounded-3xl p-12 backdrop-blur-xl hover:border-wise-accent-green/60 transition-colors duration-300">
            {/* Animated stage indicator */}
            <div className="flex items-center gap-6 mb-8">
              <div className="text-7xl animate-bounce">{STAGES[activeStage].icon}</div>
              <div>
                <span className="inline-block px-4 py-2 rounded-full bg-wise-accent-green/20 border border-wise-accent-green/40 text-wise-accent-green text-sm font-bold mb-2">
                  Phase {activeStage + 1} of {STAGES.length}
                </span>
                <h2 className="text-5xl font-bold text-white">{STAGES[activeStage].title}</h2>
              </div>
            </div>

            <p className="text-xl text-wise-text-secondary leading-relaxed mb-8">
              {STAGES[activeStage].description}
            </p>

            {/* Stage-specific details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="p-6 bg-wise-bg-primary rounded-xl border border-wise-accent-green/30">
                <h4 className="text-wise-accent-green font-bold mb-3">Key Focus</h4>
                {activeStage === 0 && (
                  <ul className="text-wise-text-secondary space-y-2 text-sm">
                    <li>✓ Problem identification</li>
                    <li>✓ Market opportunity</li>
                    <li>✓ Unique value proposition</li>
                    <li>✓ Target customer</li>
                  </ul>
                )}
                {activeStage === 1 && (
                  <ul className="text-wise-text-secondary space-y-2 text-sm">
                    <li>✓ Market analysis</li>
                    <li>✓ Competitive positioning</li>
                    <li>✓ Brand strategy</li>
                    <li>✓ Go-to-market plan</li>
                  </ul>
                )}
                {activeStage === 2 && (
                  <ul className="text-wise-text-secondary space-y-2 text-sm">
                    <li>✓ Design & aesthetics</li>
                    <li>✓ Development</li>
                    <li>✓ Content creation</li>
                    <li>✓ Quality assurance</li>
                  </ul>
                )}
                {activeStage === 3 && (
                  <ul className="text-wise-text-secondary space-y-2 text-sm">
                    <li>✓ Marketing campaigns</li>
                    <li>✓ PR & media relations</li>
                    <li>✓ Community building</li>
                    <li>✓ Launch events</li>
                  </ul>
                )}
                {activeStage === 4 && (
                  <ul className="text-wise-text-secondary space-y-2 text-sm">
                    <li>✓ Performance analytics</li>
                    <li>✓ User feedback loops</li>
                    <li>✓ Market expansion</li>
                    <li>✓ Revenue optimization</li>
                  </ul>
                )}
              </div>

              <div className="p-6 bg-wise-bg-primary rounded-xl border border-wise-accent-green/30">
                <h4 className="text-wise-accent-green font-bold mb-3">Timeline</h4>
                {activeStage === 0 && <p className="text-wise-text-secondary text-sm">2-4 weeks to validate your core idea</p>}
                {activeStage === 1 && <p className="text-wise-text-secondary text-sm">3-6 weeks to finalize strategy</p>}
                {activeStage === 2 && <p className="text-wise-text-secondary text-sm">4-12 weeks to complete build</p>}
                {activeStage === 3 && <p className="text-wise-text-secondary text-sm">2-4 weeks intensive launch push</p>}
                {activeStage === 4 && <p className="text-wise-text-secondary text-sm">Ongoing optimization & scaling</p>}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-4 justify-between">
              <button
                onClick={() => activeStage > 0 && handleStageClick(activeStage - 1)}
                disabled={activeStage === 0}
                className="px-8 py-3 rounded-lg border-2 border-wise-accent-green/40 text-wise-accent-green font-bold transition-all duration-300 hover:border-wise-accent-green/60 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {activeStage === STAGES.length - 1 ? (
                <button className="px-12 py-3 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold hover:brightness-110 transition-all duration-300">
                  Get Started
                </button>
              ) : (
                <button
                  onClick={() => handleStageClick(activeStage + 1)}
                  className="px-12 py-3 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold hover:brightness-110 transition-all duration-300"
                >
                  Next Stage →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 px-8 bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to start your build?</h3>
          <p className="text-wise-text-secondary mb-8 max-w-2xl mx-auto">
            Let's work together to take your vision from concept to reality. Each stage gets more powerful.
          </p>
          <button className="px-12 py-4 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold text-lg hover:brightness-110 transition-all duration-300 shadow-lg">
            ✦ Schedule Your Build Consultation
          </button>
        </div>
      </Container>
    </main>
  );
};
