'use client';

import Link from 'next/link';
import {
  BarChart3,
  Bot,
  ChevronRight,
  FileText,
  Phone,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import { GlassCard, Wise2Badge } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { useCherryTour } from '@/contexts/TourContext';

const MORE_LINKS = [
  { href: '/phone', label: 'AI Phone', icon: Phone, desc: '24/7 call answering & lead capture' },
  { href: '/sales', label: 'Sales', icon: BarChart3, desc: 'Track revenue & profit' },
  { href: '/customers', label: 'Customers', icon: Users, desc: 'CRM & demand signals' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, desc: 'Growth insights' },
  { href: '/ai', label: 'Cherry AI', icon: Bot, desc: 'Your smart business partner' },
  { href: '/reports', label: 'Reports', icon: FileText, desc: 'Export summaries' },
  { href: '/settings', label: 'Settings', icon: Settings, desc: 'Brand & preferences' },
  { href: '/presentation', label: 'Client Presentation', icon: Sparkles, desc: '15-slide deck' },
];

export default function MorePage() {
  const { start } = useCherryTour();

  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <header className="mb-6">
        <h1 className="font-serif text-2xl font-bold uppercase">More</h1>
      </header>

      <button
        type="button"
        onClick={start}
        className="mb-4 flex w-full items-center gap-4 rounded-cherry border border-cherry-hot/30 bg-cherry-hot/10 p-4 text-left transition hover:border-cherry-hot/50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-cherry bg-cherry-hot/20">
          <Sparkles className="h-5 w-5 text-cherry-hot" />
        </div>
        <div className="flex-1">
          <p className="font-medium">AI Guided Tour</p>
          <p className="text-xs text-white/50">Walk through the app with Cherry AI</p>
        </div>
        <ChevronRight className="h-4 w-4 text-cherry-hot" />
      </button>

      <div className="space-y-2">
        {MORE_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <GlassCard className="flex items-center gap-4 py-4 transition hover:border-cherry-hot/30">
              <div className="flex h-10 w-10 items-center justify-center rounded-cherry bg-cherry-hot/15">
                <link.icon className="h-5 w-5 text-cherry-hot" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{link.label}</p>
                <p className="text-xs text-white/50">{link.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-white/30" />
            </GlassCard>
          </Link>
        ))}
      </div>

      <Wise2Badge className="mt-8 text-center" />
    </div>
  );
}
