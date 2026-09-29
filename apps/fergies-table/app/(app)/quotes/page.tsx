'use client';

import { GlassCard, PageHeader, StatusPill } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_QUOTES } from '@/lib/demo-data';

export default function QuotesPage() {
  return (
    <div className={`${FERGIE_LAYOUT.container} py-6`}>
      <PageHeader title="Quotes" subtitle="Proposals" />
      <div className="space-y-2">
        {DEMO_QUOTES.map((quote) => (
          <GlassCard key={quote.id} gold={quote.status === 'Sent'}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-fergie-gold">{quote.id}</p>
                <p className="font-medium">{quote.client}</p>
                <p className="text-xs text-white/50">
                  {quote.packageName} · {quote.date}
                </p>
              </div>
              <div className="text-right">
                <StatusPill
                  label={quote.status}
                  tone={quote.status === 'Accepted' ? 'gold' : quote.status === 'Sent' ? 'purple' : 'muted'}
                />
                <p className="mt-2 font-serif text-xl text-fergie-gold">${quote.amount.toLocaleString()}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
