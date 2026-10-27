'use client';

import { useEffect, useState } from 'react';

type ApiStatus = 'checking' | 'online' | 'offline';

const PLATFORMS = [
  { name: 'TikTok', emoji: '♪' },
  { name: 'Instagram', emoji: '📷' },
  { name: 'YouTube', emoji: '▶️' },
  { name: 'X', emoji: '𝕏' },
  { name: 'Discord', emoji: '💬' },
];

const FEATURES = [
  { title: 'CLIENT CLIPS', icon: '✓', desc: 'Turn long-form into 15-60s clips\n✓ AI captions, hooks, and titles\n✓ Brand overlays & templates\n✓ Ready for all platforms' },
  { title: 'AI PROMO VIDEOS', icon: '✨', desc: 'AI-generated hooks & scripts\n✓ B-roll, stock footage, and visuals\n✓ Captions, CTAs, ad variants\n✓ Multiple versions for testing' },
  { title: 'FACELESS CONTENT', icon: '🤖', desc: 'Script → voiceover → AI visuals\n✓ On-brand templates\n✓ Fully automated workflow\n✓ Schedule short-form posts' },
  { title: 'PERFORMANCE RE-CLIPS', icon: '📈', desc: 'Analyze top-performing clips\n✓ Create new angles and versions\n✓ Boost retention & engagement\n✓ Turn winners into series' },
];

const STEPS = [
  { num: 1, title: 'Upload Your Video', desc: 'Podcast, interview, livestream, or service video' },
  { num: 2, title: 'AI Finds Best Moments', desc: 'Transcribe, detect highlights, generate hooks' },
  { num: 3, title: 'Generate Branded Clips', desc: 'Add captions, branding, and CTAs' },
  { num: 4, title: 'Approve & Post', desc: 'Schedule to all platforms with one click' },
  { num: 5, title: 'Track Leads & Growth', desc: 'Views, engagement, leads, and ROI' },
];

const PACKAGES = [
  { name: 'Clip Starter', price: '$299', features: ['30 clips/month', 'AI captions', 'Scheduling', '5 templates'] },
  { name: 'Spryth Engine', price: '$1,250', popular: true, features: ['Unlimited clips', 'AI promo videos', 'Analytics', 'White-label options'] },
  { name: 'Growth Engine', price: 'Custom', features: ['Everything above', 'Priority support', 'Custom integrations', 'Dedicated account'] },
];

export default function ClipperLanding() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.wise2.net';

    fetch(`${API_BASE}/api/health`, { cache: 'no-store', signal: controller.signal })
      .then((res) => setApiStatus(res.ok ? 'online' : 'offline'))
      .catch(() => setApiStatus('offline'))
      .finally(() => clearTimeout(timeout));

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-wise-navy text-white overflow-x-hidden">
      <header className="border-b border-wise-cyan/15 bg-wise-navy/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="wordmark text-4xl" aria-label="WISE squared">WISE<sup className="text-wise-cyan">2</sup></p>
            <span className="hidden sm:block border-l border-wise-cyan/20 pl-3 text-sm text-wise-cyan/70">CLIPPER</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${apiStatus === 'online' ? 'bg-wise-neon' : 'bg-red-500'}`} />
            <span className="text-wise-cyan/70">{apiStatus === 'online' ? 'API Online' : 'API Offline'}</span>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative py-20 px-4 text-center bg-gradient-to-b from-wise-cyan/5 to-wise-navy">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Turn One Video Into A<br />
              <span className="text-wise-neon">Full Content Engine</span>
            </h1>
            <p className="text-xl text-wise-cyan/80 mb-8">
              AI clips • Captions • Branding • Posting • Leads & Growth
            </p>
            <button className="bg-wise-neon text-wise-navy px-8 py-3 rounded-lg font-bold hover:bg-wise-neon/90 transition">
              Get Started →
            </button>
          </div>
        </section>

        {/* Platforms */}
        <section className="py-12 px-4 border-b border-wise-cyan/10">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-8 flex-wrap">
            {PLATFORMS.map((p) => (
              <div key={p.name} className="text-center">
                <div className="text-3xl mb-2">{p.emoji}</div>
                <div className="text-sm text-wise-cyan/70">{p.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 5-Step Workflow */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-wise-cyan">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {STEPS.map((step, i) => (
                <div key={step.num} className="relative">
                  <div className="bg-wise-navy/60 border border-wise-cyan/20 rounded-xl p-6 text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-wise-cyan text-wise-navy font-bold mb-3">
                      {step.num}
                    </div>
                    <h3 className="font-bold text-sm mb-2 text-white">{step.title}</h3>
                    <p className="text-xs text-wise-cyan/70">{step.desc}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-wise-cyan/30">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Clips */}
        <section className="py-16 px-4 bg-wise-navy/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-wise-cyan">Featured Clips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-wise-navy/80 border border-wise-cyan/10 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                  <div className="text-wise-cyan/30 text-sm">Clip {i + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-wise-cyan">What You Can Create</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-wise-navy/60 border border-wise-cyan/20 rounded-xl p-6">
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <h3 className="font-bold text-wise-neon mb-2">{f.title}</h3>
                  <p className="text-sm text-wise-cyan/70 whitespace-pre-line">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="py-16 px-4 bg-wise-navy/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-wise-cyan">Dashboard Preview</h2>
            <div className="bg-wise-navy/80 border border-wise-cyan/20 rounded-xl p-6 aspect-video flex items-center justify-center">
              <div className="text-wise-cyan/30">Dashboard Preview</div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-wise-neon">1.2M</div>
              <div className="text-sm text-wise-cyan/70">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-wise-neon">↑ 248%</div>
              <div className="text-sm text-wise-cyan/70">Average Growth</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-wise-neon">42K</div>
              <div className="text-sm text-wise-cyan/70">Engagements</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-wise-neon">1,860</div>
              <div className="text-sm text-wise-cyan/70">Leads</div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 px-4 bg-wise-navy/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-wise-cyan">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PACKAGES.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`rounded-xl p-8 border transition ${
                    pkg.popular
                      ? 'border-wise-neon bg-wise-neon/10'
                      : 'border-wise-cyan/20 bg-wise-navy/60'
                  }`}
                >
                  {pkg.popular && <div className="text-wise-neon text-xs font-bold mb-2">Most Popular</div>}
                  <h3 className="text-xl font-bold mb-1">{pkg.name}</h3>
                  <div className="text-2xl font-bold text-wise-neon mb-6">{pkg.price}</div>
                  <ul className="space-y-2 text-sm text-wise-cyan/70">
                    {pkg.features.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                  <button className="w-full mt-6 bg-wise-cyan text-wise-navy px-4 py-2 rounded-lg font-bold hover:bg-wise-cyan/90 transition">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="py-16 px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">LET'S BUILD YOUR CONTENT ENGINE →</h2>
          <button className="bg-wise-neon text-wise-navy px-8 py-3 rounded-lg font-bold hover:bg-wise-neon/90 transition">
            Start Free Trial
          </button>
        </section>
      </main>
    </div>
  );
}
