'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CherryLogo, GlassCard, Wise2Badge } from '@/components/ui';
import { CHERRY_LAYOUT } from '@/lib/brand-tokens';
import { DEMO_CONTAINERS, DEMO_CUSTOMERS, DEMO_PACKING, DEMO_PRODUCTS, DEMO_STATS } from '@/lib/demo-data';

const TOTAL_SLIDES = 15;

function SlideShell({
  headline,
  subheadline,
  children,
}: {
  headline: string;
  subheadline?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="slide-enter flex min-h-[calc(100vh-8rem)] flex-col justify-center px-6 py-8">
      <h2 className="font-serif text-3xl font-bold uppercase leading-tight sm:text-4xl lg:text-5xl">
        {headline}
      </h2>
      {subheadline && <p className="mt-3 text-lg text-cherry-bubblegum">{subheadline}</p>}
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Slide01() {
  return (
    <div className="slide-enter flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 text-center">
      <div className="mb-8 h-48 w-full max-w-md rounded-cherry-lg bg-gradient-to-br from-cherry-plum via-cherry-hot/20 to-cherry-black flex items-center justify-center text-8xl">
        👗
      </div>
      <CherryLogo size="lg" />
      <p className="mt-6 font-script text-3xl text-cherry-bubblegum sm:text-4xl">
        Track It. Pack It. Profit.
      </p>
      <p className="mt-4 text-sm uppercase tracking-[0.3em] text-white/50">
        Inventory + Pop-Ups + Sales
      </p>
      <Wise2Badge className="mt-8" />
    </div>
  );
}

function Slide02() {
  return (
    <SlideShell headline="Your Business. Finally Organized Around You.">
      <p className="max-w-2xl text-lg leading-relaxed text-white/70">
        Cherry Count gives you one beautiful place to manage products, inventory, pop-ups, sales, and customers.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {['Less chaos.', 'More control.', 'More profit.'].map((t) => (
          <GlassCard key={t} className="text-center py-6" glow>
            <p className="font-serif text-xl font-bold text-cherry-hot">{t}</p>
          </GlassCard>
        ))}
      </div>
    </SlideShell>
  );
}

function Slide03() {
  const problems = [
    'Too many spreadsheets',
    'Inventory stored everywhere',
    'Forgetting products',
    'Not knowing what\'s selling',
    'Running out of popular sizes',
    'Manual sales tracking',
    'Packing confusion',
    'Customer requests forgotten',
    'No clear profit visibility',
  ];
  return (
    <SlideShell headline="Pop-Ups Shouldn't Feel This Hard.">
      <div className="grid gap-3 sm:grid-cols-3">
        {problems.map((p) => (
          <GlassCard key={p} className="flex items-center gap-3 py-3 text-sm">
            <span className="text-cherry-red">✕</span> {p}
          </GlassCard>
        ))}
      </div>
    </SlideShell>
  );
}

function Slide04() {
  const modules = ['Inventory', 'Pop-Ups', 'Sales', 'Customers', 'Analytics', 'AI Assistant'];
  return (
    <SlideShell headline="Meet Cherry Count." subheadline="One system. One login. One beautiful experience.">
      <GlassCard className="mb-6 p-2" glow>
        <div className="rounded-cherry bg-cherry-black p-4 text-center text-sm text-white/50">
          [ Dashboard Preview — Mobile + Desktop ]
        </div>
      </GlassCard>
      <div className="flex flex-wrap gap-2">
        {modules.map((m) => (
          <span key={m} className="rounded-full bg-cherry-hot/20 px-4 py-2 text-sm font-medium text-cherry-hot">
            {m}
          </span>
        ))}
      </div>
    </SlideShell>
  );
}

function Slide05() {
  const steps = [
    { n: '1', title: 'Add Inventory', desc: 'Products, photos, prices and sizes.' },
    { n: '2', title: 'Plan Your Pop-Up', desc: 'Create the event and select inventory.' },
    { n: '3', title: 'Pack Smart', desc: 'Cherry Count creates your packing checklist.' },
    { n: '4', title: 'Go Live', desc: 'Track inventory and sales during the event.' },
    { n: '5', title: 'End Event', desc: 'See what sold and return remaining inventory.' },
    { n: '6', title: 'Grow', desc: 'Use analytics and AI to improve the next event.' },
  ];
  return (
    <SlideShell headline="How It Works">
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cherry-hot font-bold">
              {s.n}
            </div>
            <div className="flex-1">
              <p className="font-semibold uppercase">{s.title}</p>
              <p className="text-sm text-white/50">{s.desc}</p>
            </div>
            {i < steps.length - 1 && <div className="hidden sm:block text-white/20">↓</div>}
          </div>
        ))}
      </div>
    </SlideShell>
  );
}

function Slide06() {
  const product = DEMO_PRODUCTS[0];
  return (
    <SlideShell headline="Know Exactly What You Have.">
      <GlassCard glow>
        <div className="flex gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-cherry bg-cherry-plum text-4xl">👗</div>
          <div>
            <p className="font-semibold text-lg">{product.name}</p>
            <p className="text-sm text-white/50">SKU: {product.sku} · ${product.retailPrice}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {product.variants.map((v) => (
                <span key={v.id} className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                  {v.size}/{v.color} ({v.quantity})
                </span>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        {['Photos', 'QR Code', 'Low Stock Alert', 'Collections', 'Vendor', 'History'].map((f) => (
          <GlassCard key={f} className="py-3">{f}</GlassCard>
        ))}
      </div>
    </SlideShell>
  );
}

function Slide07() {
  return (
    <SlideShell headline="Your Entire Pop-Up. In Your Pocket." subheadline="Signature Cherry Count feature">
      <div className="mx-auto max-w-xs">
        <GlassCard className="border-cherry-hot/40 p-4" glow>
          <p className="text-center text-xs text-cherry-hot font-bold uppercase">Pop-Up Mode</p>
          <p className="mt-4 text-center text-2xl font-bold">${DEMO_STATS.todaySales}</p>
          <p className="text-center text-xs text-white/50">Today&apos;s Sales</p>
          <div className="mt-4 space-y-2 text-sm">
            {['Event checklist', 'Packed / Missing', 'Live sales', 'Bin locations', 'Return inventory'].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cherry-hot" /> {f}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </SlideShell>
  );
}

function Slide08() {
  return (
    <SlideShell headline="Never Wonder What You Forgot." subheadline="Scan → Know → Move → Sell">
      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_CONTAINERS.map((c) => (
          <GlassCard key={c.id}>
            <p className="font-semibold text-cherry-hot">{c.name}</p>
            <p className="text-sm">{c.description}</p>
          </GlassCard>
        ))}
      </div>
      <p className="mt-4 text-sm text-white/50">Each container gets a QR code. Scan it to instantly see what&apos;s inside.</p>
    </SlideShell>
  );
}

function Slide09() {
  return (
    <SlideShell headline="Know What's Making You Money.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Today's Sales", v: `$${DEMO_STATS.todaySales}` },
          { l: 'Gross Revenue', v: '$4,280' },
          { l: 'Est. Profit', v: '$2,140' },
          { l: 'Units Sold', v: '47' },
        ].map((s) => (
          <GlassCard key={s.l} className="text-center">
            <p className="text-xs text-white/50">{s.l}</p>
            <p className="text-xl font-bold text-cherry-hot">{s.v}</p>
          </GlassCard>
        ))}
      </div>
    </SlideShell>
  );
}

function Slide10() {
  const customer = DEMO_CUSTOMERS[0];
  return (
    <SlideShell headline="Turn Shoppers Into Regulars.">
      <GlassCard glow>
        <p className="font-semibold text-lg">{customer.name} {customer.vipStatus && '⭐ VIP'}</p>
        <p className="text-sm text-white/50">{customer.instagram} · Size {customer.preferredSize}</p>
        <p className="mt-2 text-cherry-bubblegum font-semibold">${customer.lifetimeValue} lifetime spend</p>
        <div className="mt-4 space-y-2">
          {customer.demand?.map((d) => (
            <div key={d.request} className="flex justify-between text-sm">
              <span>&quot;{d.request}&quot;</span>
              <span className="text-cherry-hot">Requested {d.count} times</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </SlideShell>
  );
}

function Slide11() {
  return (
    <SlideShell headline="Your Business Just Got Smarter." subheadline="Powered by WISE² Intelligence">
      <div className="flex items-start gap-6">
        <div className="text-6xl">🤖</div>
        <div className="space-y-2 text-sm">
          {['Forecast inventory', 'Identify best sellers', 'Generate packing lists', 'Analyze trends', 'Daily insights'].map((t) => (
            <p key={t} className="flex items-center gap-2"><span className="text-cherry-hot">✓</span> {t}</p>
          ))}
        </div>
      </div>
      <p className="mt-6 text-white/50">Your smart business partner that works 24/7.</p>
    </SlideShell>
  );
}

function Slide12() {
  return (
    <SlideShell headline="Beautiful. Powerful. Anywhere.">
      <div className="flex justify-center gap-6 text-center">
        {['📱 iPhone', '📱 iPad', '💻 Laptop'].map((d) => (
          <GlassCard key={d} className="px-6 py-4">
            <p className="text-2xl">{d.split(' ')[0]}</p>
            <p className="mt-1 text-sm">{d.split(' ').slice(1).join(' ')}</p>
          </GlassCard>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {['Mobile-first', 'Cloud synced', 'Offline-capable', 'Secure backups'].map((f) => (
          <span key={f} className="rounded-full border border-cherry-bubblegum/30 px-3 py-1 text-xs">{f}</span>
        ))}
      </div>
    </SlideShell>
  );
}

function Slide13() {
  return (
    <SlideShell headline="Beautiful on the Outside. Powerful Underneath.">
      <GlassCard className="text-center py-8" glow>
        <p className="text-xs uppercase tracking-[0.3em] text-cherry-chrome">WISE²</p>
        <p className="mt-2 font-serif text-2xl font-bold">Business Operating System</p>
      </GlassCard>
      <div className="mt-6 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        {['Secure auth', 'Cloud infra', 'AI intelligence', 'Automation', 'Analytics', 'Backups', 'Multi-device sync', 'Scalable'].map((f) => (
          <GlassCard key={f} className="py-2 text-center text-xs">{f}</GlassCard>
        ))}
      </div>
      <p className="mt-4 text-sm text-white/50">Enterprise technology. Beautifully hidden.</p>
    </SlideShell>
  );
}

function Slide14() {
  const launch = ['Custom branded platform', 'Inventory management', 'Pop-Up Planner', 'Packing Assistant', 'Sales Tracking', 'Customer CRM', 'Analytics', 'QR & Barcode', 'Cherry AI', 'Mobile + Desktop'];
  const coming = ['Square integration', 'Shopify sync', 'Offline sync', 'Barcode scanner hardware'];
  return (
    <SlideShell headline="Built For Your Business.">
      <p className="mb-2 text-xs font-bold uppercase text-cherry-hot">Available at Launch</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {launch.map((f) => <span key={f} className="rounded-full bg-cherry-hot/15 px-3 py-1 text-xs">{f}</span>)}
      </div>
      <p className="mb-2 text-xs font-bold uppercase text-white/40">Coming Next</p>
      <div className="flex flex-wrap gap-2">
        {coming.map((f) => <span key={f} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">{f}</span>)}
      </div>
    </SlideShell>
  );
}

function Slide15() {
  const steps = ['Confirm Brand + Workflow', 'Build Cherry Count MVP', 'Load Initial Inventory', 'Client Testing', 'Training', 'Launch'];
  return (
    <div className="slide-enter flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-6 text-center">
      <h2 className="font-serif text-3xl font-bold uppercase sm:text-4xl">Let&apos;s Build Your System.</h2>
      <div className="mt-8 grid w-full max-w-md gap-3">
        {steps.map((s, i) => (
          <GlassCard key={s} className="flex items-center gap-4 py-3 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cherry-hot text-sm font-bold">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-sm font-medium">{s}</span>
          </GlassCard>
        ))}
      </div>
      <div className="mt-10">
        <CherryLogo />
        <p className="mt-2 font-script text-xl text-cherry-bubblegum">Track It. Pack It. Profit.</p>
        <Wise2Badge className="mt-4" />
      </div>
    </div>
  );
}

const SLIDES = [Slide01, Slide02, Slide03, Slide04, Slide05, Slide06, Slide07, Slide08, Slide09, Slide10, Slide11, Slide12, Slide13, Slide14, Slide15];

export default function PresentationPage() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, TOTAL_SLIDES - 1)), []);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [next, prev]);

  const Slide = SLIDES[current];

  return (
    <div className="min-h-screen bg-cherry-black">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-cherry-bubblegum/10 bg-cherry-black/80 px-4 py-3 backdrop-blur-xl">
        <CherryLogo size="sm" />
        <span className="text-xs text-white/40">
          {current + 1} / {TOTAL_SLIDES}
        </span>
        <Link href="/" className="touch-target p-2 text-white/50 hover:text-white">
          <X className="h-5 w-5" />
        </Link>
      </header>

      <main className="pt-16">
        <Slide />
      </main>

      <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-cherry-bubblegum/10 bg-cherry-black/80 px-4 py-3 backdrop-blur-xl">
        <button
          onClick={prev}
          disabled={current === 0}
          className="touch-target flex items-center gap-1 text-sm text-white/60 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? 'w-6 bg-cherry-hot' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          disabled={current === TOTAL_SLIDES - 1}
          className="touch-target flex items-center gap-1 text-sm text-white/60 disabled:opacity-30"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </div>
  );
}
