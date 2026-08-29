'use client';

import { Bot, Sparkles } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_AI_INSIGHT } from '@/lib/demo-data';

const AI_CAPABILITIES = [
  'Forecast inventory needs',
  'Identify best sellers',
  'Suggest restocks',
  'Generate packing lists',
  'Analyze sales trends',
  'Recommend pricing',
  'Summarize events',
  'Surface customer demand',
  'Daily business insights',
];

export default function AiPage() {
  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <header className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cherry-hot/30 to-cherry-royal/30 text-4xl">
          🤖
        </div>
        <h1 className="font-serif text-2xl font-bold uppercase">Cherry AI</h1>
        <p className="mt-1 text-sm text-cherry-lavender">Powered by WISE² Intelligence</p>
        <p className="mt-2 text-sm text-white/50">
          Your smart business partner that works 24/7
        </p>
      </header>

      <GlassCard className="mb-6" glow data-tour="ai-briefing">
        <p className="text-lg font-medium">{DEMO_AI_INSIGHT.greeting}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">{DEMO_AI_INSIGHT.tip}</p>
      </GlassCard>

      <SectionHeader title="What Cherry AI Can Do" />
      <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {AI_CAPABILITIES.map((cap) => (
          <GlassCard key={cap} className="flex items-center gap-2 py-3 text-sm">
            <Sparkles className="h-4 w-4 shrink-0 text-cherry-hot" />
            {cap}
          </GlassCard>
        ))}
      </div>

      <button className={`w-full ${CHERRY_LAYOUT.btnPrimary}`}>
        <Bot className="mr-2 h-5 w-5" />
        Ask Cherry AI
      </button>

      <p className="mt-4 text-center text-[10px] text-white/30">
        AI provides read-only recommendations. Destructive actions require your confirmation.
      </p>
    </div>
  );
}
