'use client';

import Link from 'next/link';
import { Heart, Instagram, Plus, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { cherryListCustomers } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_CUSTOMERS } from '@/lib/demo-data';

type Customer = (typeof DEMO_CUSTOMERS)[number];

export default function CustomersPage() {
  const { isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    cherryListCustomers()
      .then((data) => {
        if (data.length > 0) {
          setCustomers(
            data.map((c) => ({
              id: c.id,
              name: c.name,
              phone: c.phone ?? '',
              instagram: c.instagram ?? '',
              preferredSize: c.preferredSize ?? '',
              favoriteColors: c.favoriteColors ?? [],
              vipStatus: c.vipStatus,
              lifetimeValue: Number(c.lifetimeValue) || 0,
              notes: c.notes ?? '',
              demand: c.notes
                ? [{ request: c.notes, count: 1 }]
                : [],
            })),
          );
        }
      })
      .catch(() => {/* keep demo data */})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return (
    <div className={`${CHERRY_LAYOUT.container} py-6`}>
      <DemoModeBanner />
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold uppercase">Customers</h1>
          <p className="text-sm text-white/50">
            {loading ? 'Loading live CRM...' : 'Turn shoppers into regulars'}
          </p>
        </div>
        <Link href="/customers/new" className="touch-target flex h-10 w-10 items-center justify-center rounded-full bg-cherry-hot shadow-glow-sm">
          <Plus className="h-5 w-5" />
        </Link>
      </header>

      <div className="space-y-3" data-tour="customers-list">
        {customers.map((c) => (
          <GlassCard key={c.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{c.name}</p>
                  {c.vipStatus && (
                    <span className="flex items-center gap-0.5 rounded-full bg-cherry-hot/20 px-2 py-0.5 text-[10px] font-bold text-cherry-hot">
                      <Star className="h-3 w-3" /> VIP
                    </span>
                  )}
                </div>
                {c.phone && <p className="text-xs text-white/50">{c.phone}</p>}
              </div>
              <p className="text-sm font-semibold text-cherry-bubblegum">
                ${c.lifetimeValue.toLocaleString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {c.instagram && (
                <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
                  <Instagram className="h-3 w-3" /> {c.instagram}
                </span>
              )}
              {c.preferredSize && (
                <span className="rounded-full bg-white/10 px-2 py-1">Size: {c.preferredSize}</span>
              )}
              {c.favoriteColors.map((color) => (
                <span key={color} className="rounded-full bg-cherry-plum/50 px-2 py-1 text-cherry-lavender">
                  {color}
                </span>
              ))}
            </div>

            {c.demand && (
              <div className="border-t border-white/10 pt-3">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-white/40">Customer Demand</p>
                {c.demand.map((d) => (
                  <div key={d.request} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3 text-cherry-hot" />
                      &quot;{d.request}&quot;
                    </span>
                    <span className="text-cherry-hot font-semibold">{d.count}x requested</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
