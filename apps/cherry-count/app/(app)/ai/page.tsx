'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bot, Phone, Sparkles } from 'lucide-react';
import { GlassCard, SectionHeader } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { cherryAiInsight } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
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
  'Answer customer calls 24/7',
];

const INSIGHT_TYPES = [
  { type: 'daily' as const, label: 'Daily Briefing' },
  { type: 'inventory' as const, label: 'Inventory' },
  { type: 'sales' as const, label: 'Sales' },
  { type: 'packing' as const, label: 'Packing' },
];

export default function AiPage() {
  const { isAuthenticated } = useAuth();
  const [greeting, setGreeting] = useState(DEMO_AI_INSIGHT.greeting);
  const [tip, setTip] = useState(DEMO_AI_INSIGHT.tip);
  const [insights, setInsights] = useState<string[]>([]);
  const [activeType, setActiveType] = useState<'daily' | 'inventory' | 'sales' | 'packing'>('daily');
  const [loading, setLoading] = useState(false);

  const loadInsight = (type: typeof activeType) => {
    setActiveType(type);
    setLoading(true);

    if (!isAuthenticated) {
      setTip(DEMO_AI_INSIGHT.tip);
      setInsights([DEMO_AI_INSIGHT.tip]);
      setLoading(false);
      return;
    }

    cherryAiInsight(type === 'packing' ? 'packing' : type)
      .then((data) => {
        if (data && typeof data === 'object') {
          if ('greeting' in data && typeof data.greeting === 'string') setGreeting(data.greeting);
          if ('tips' in data && Array.isArray(data.tips)) {
            setInsights(data.tips);
            setTip(data.tips[0] ?? DEMO_AI_INSIGHT.tip);
          } else if ('insights' in data && Array.isArray(data.insights)) {
            const messages = data.insights
              .map((i: { message?: string }) => i.message)
              .filter((m): m is string => Boolean(m));
            setInsights(messages);
            setTip(messages[0] ?? DEMO_AI_INSIGHT.tip);
          } else if ('message' in data && typeof data.message === 'string') {
            setTip(data.message);
            setInsights([data.message]);
          }
        }
      })
      .catch(() => {
        setTip(DEMO_AI_INSIGHT.tip);
        setInsights([DEMO_AI_INSIGHT.tip]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInsight('daily');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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

      <Link href="/phone" className="mb-6 block">
        <GlassCard className="flex items-center gap-4 border-cherry-royal/30 bg-cherry-royal/10 py-4 transition hover:border-cherry-hot/40" glow>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cherry-royal/25">
            <Phone className="h-6 w-6 text-cherry-lavender" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">AI Phone Service</p>
            <p className="text-xs text-white/50">Cherry answers calls, holds items, and captures leads</p>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-bold uppercase text-emerald-300">
            Live
          </span>
        </GlassCard>
      </Link>

      <div className="mb-4 flex flex-wrap gap-2">
        {INSIGHT_TYPES.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => loadInsight(item.type)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeType === item.type
                ? 'bg-cherry-hot text-white'
                : 'border border-white/10 text-white/60 hover:border-cherry-hot/40'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <GlassCard className="mb-6" glow data-tour="ai-briefing">
        <p className="text-lg font-medium">{greeting}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          {loading ? 'Thinking…' : tip}
        </p>
        {insights.length > 1 && (
          <ul className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm text-white/60">
            {insights.slice(1).map((line) => (
              <li key={line} className="flex gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cherry-hot" />
                {line}
              </li>
            ))}
          </ul>
        )}
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

      <Link href="/phone" className={`mb-3 block w-full text-center ${CHERRY_LAYOUT.btnPrimary}`}>
        <Phone className="mr-2 inline h-5 w-5" />
        Manage AI Phone
      </Link>

      <button
        type="button"
        onClick={() => loadInsight(activeType)}
        className={`w-full ${CHERRY_LAYOUT.btnGhost}`}
      >
        <Bot className="mr-2 inline h-5 w-5" />
        Refresh Insights
      </button>

      <p className="mt-4 text-center text-[10px] text-white/30">
        AI provides read-only recommendations. Destructive actions require your confirmation.
      </p>
    </div>
  );
}
