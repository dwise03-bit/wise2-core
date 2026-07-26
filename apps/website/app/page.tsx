'use client';

import Link from 'next/link';
import { Hero, PoweredBusinesses, Features, Stats, About, Footer } from '@/components/wise';

// ── Section: What's Broken (Problem) ──────────────────────────────────────────
function ProblemSection() {
  const problems = [
    { icon: '🔀', title: 'Tools That Don\'t Talk', text: '11+ disconnected apps. Zero unified view. Your team wastes hours each week stitching systems together.' },
    { icon: '🕳️', title: 'Revenue Leaking Daily', text: 'Leads fall through the cracks, follow-ups slip, and invoices sit unpaid. Every gap costs you money.' },
    { icon: '🔬', title: 'Decisions Made Blind', text: 'No real-time dashboard. No AI insight. You\'re flying without instruments while competitors use data.' },
    { icon: '🔁', title: 'Hiring to Fix Systems', text: 'You\'re paying people to do things software should automate. That\'s not a team — that\'s a workaround.' },
  ];

  return (
    <section className="bg-[#050505] py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
            style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)', color: '#ff5555' }}
          >
            THE PROBLEM
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Most Businesses Are <span style={{ color: '#ff5555' }}>Running on Chaos</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The average small business uses 14 disconnected tools. That fragmentation costs you time, money, and your competitive edge.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((p, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl flex gap-5"
              style={{ background: 'rgba(255,50,50,0.05)', border: '1px solid rgba(255,50,50,0.15)' }}
            >
              <span className="text-3xl flex-shrink-0 mt-1">{p.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-6">Sound familiar? You're not alone — and there&apos;s a fix.</p>
          <Link
            href="/audit"
            className="inline-block px-8 py-4 rounded-lg font-bold transition"
            style={{ background: '#0094FF', color: '#050505', boxShadow: '0 0 20px rgba(0,148,255,0.35)' }}
          >
            Get Your Free Business AI Audit →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Section: How It Works ──────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Audit Your Operation',
      text: 'Take our 5-minute Business AI Audit. We analyze your workflows, tools, team, and revenue — and show you exactly where AI will move the needle.',
      cta: 'Start Free Audit',
      href: '/audit',
      color: '#0094FF',
    },
    {
      num: '02',
      title: 'Get Your AI Strategy',
      text: 'A WISE² consultant reviews your audit results and maps a custom implementation plan — prioritized by ROI, not buzzwords.',
      cta: 'Book a Consultation',
      href: '/consulting',
      color: '#A63CFF',
    },
    {
      num: '03',
      title: 'Run Your Empire',
      text: 'We deploy your WISE² Command Center: automations firing, dashboards live, revenue tracked. One system. Total control.',
      cta: 'See the Platform',
      href: '/platform',
      color: '#F2B632',
    },
  ];

  return (
    <section className="bg-[#080808] py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
            style={{ background: 'rgba(0,148,255,0.1)', border: '1px solid rgba(0,148,255,0.3)', color: '#0094FF' }}
          >
            HOW IT WORKS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            From Chaos to <span style={{ color: '#0094FF' }}>Command Center</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Three steps from where you are to a business that runs with intelligence.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-8 p-8 rounded-2xl items-start"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="text-4xl font-black flex-shrink-0 w-16 text-center leading-none pt-1"
                style={{ color: step.color, opacity: 0.7 }}
              >
                {step.num}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed mb-4">{step.text}</p>
                <Link
                  href={step.href}
                  className="inline-block text-sm font-bold transition"
                  style={{ color: step.color }}
                >
                  {step.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: AI Audit CTA ──────────────────────────────────────────────────────
function AuditCTASection() {
  return (
    <section
      className="py-24 px-6"
      style={{
        background: 'linear-gradient(135deg, rgba(0,80,200,0.15) 0%, rgba(0,148,255,0.06) 50%, rgba(0,0,0,0) 100%)',
        borderTop: '1px solid rgba(0,148,255,0.15)',
        borderBottom: '1px solid rgba(0,148,255,0.15)',
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <div
          className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
          style={{ background: 'rgba(0,148,255,0.15)', border: '1px solid rgba(0,148,255,0.4)', color: '#0094FF' }}
        >
          FREE — NO CREDIT CARD REQUIRED
        </div>

        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
          What&apos;s Your<br />
          <span style={{ color: '#0094FF' }}>Business AI Score?</span>
        </h2>

        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
          In 5 minutes, get a personalized score from 0–100 that shows exactly where AI can save you time, money, and manual work — with specific recommendations for your business type.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/audit"
            className="px-10 py-5 rounded-xl font-black text-lg transition w-full sm:w-auto text-center"
            style={{ background: '#0094FF', color: '#050505', boxShadow: '0 0 30px rgba(0,148,255,0.5)', letterSpacing: '0.05em' }}
          >
            TAKE THE FREE AI AUDIT
          </Link>
          <Link
            href="/consulting"
            className="px-10 py-5 rounded-xl font-bold text-lg transition w-full sm:w-auto text-center"
            style={{ background: 'rgba(0,148,255,0.1)', border: '1px solid rgba(0,148,255,0.35)', color: '#0094FF' }}
          >
            Book a Consultation →
          </Link>
        </div>

        <div className="flex gap-8 justify-center flex-wrap">
          {['5-minute assessment', 'Personalized AI score', 'Custom recommendations', 'Zero spam, ever'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-sm text-gray-400">
              <span style={{ color: '#0094FF' }}>✓</span>
              {badge}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Pricing Teaser ────────────────────────────────────────────────────
function PricingTeaserSection() {
  const plans = [
    {
      name: 'Starter',
      planId: 'STARTER',
      price: 29,
      tagline: 'Get the foundation right',
      features: ['1 workspace', 'Core dashboard', 'Basic analytics', 'Email support'],
      cta: 'Start Free Trial',
      highlight: false,
      color: '#0094FF',
    },
    {
      name: 'Professional',
      planId: 'PRO',
      price: 99,
      tagline: 'For growing operations',
      features: ['5 workspaces', 'Advanced analytics', 'API access', 'Priority support', 'Custom integrations', 'RBAC'],
      cta: 'Start 14-Day Trial',
      highlight: true,
      color: '#0094FF',
    },
    {
      name: 'Enterprise',
      planId: 'ENTERPRISE',
      price: null,
      tagline: 'Custom for your organization',
      features: ['Unlimited workspaces', 'Dedicated API', '24/7 support', 'SSO & compliance', 'Custom onboarding'],
      cta: 'Schedule Demo',
      highlight: false,
      color: '#A63CFF',
    },
  ];

  return (
    <section className="bg-[#050505] py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
            style={{ background: 'rgba(0,148,255,0.1)', border: '1px solid rgba(0,148,255,0.3)', color: '#0094FF' }}
          >
            PRICING
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, <span style={{ color: '#0094FF' }}>Transparent Pricing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            14-day free trial. Cancel anytime. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="rounded-2xl p-8"
              style={plan.highlight ? {
                background: 'linear-gradient(to bottom, rgba(0,148,255,0.12), rgba(0,148,255,0.04))',
                border: `2px solid ${plan.color}`,
              } : {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {plan.highlight && (
                <div className="mb-4 inline-block px-3 py-1 rounded-full text-xs font-bold text-[#050505]"
                  style={{ background: '#0094FF' }}>
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-6">{plan.tagline}</p>

              <div className="mb-8">
                {plan.price ? (
                  <>
                    <span className="text-4xl font-black" style={{ color: plan.color }}>${plan.price}</span>
                    <span className="text-gray-400 text-sm ml-1">/mo</span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-white">Custom</span>
                )}
              </div>

              <ul className="space-y-2 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-sm text-gray-300">
                    <span style={{ color: plan.color }}>✓</span>{f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.price === null ? '/contact' : `/checkout?plan=${plan.planId}`}
                className="block text-center py-3 rounded-lg font-bold text-sm transition"
                style={plan.highlight
                  ? { background: '#0094FF', color: '#050505', boxShadow: '0 0 16px rgba(0,148,255,0.4)' }
                  : { background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/pricing" className="text-sm font-semibold" style={{ color: '#0094FF' }}>
            See full pricing comparison →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ── Section: Consulting CTA ────────────────────────────────────────────────────
function ConsultingCTASection() {
  return (
    <section className="bg-[#080808] py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
              style={{ background: 'rgba(166,60,255,0.1)', border: '1px solid rgba(166,60,255,0.3)', color: '#A63CFF' }}
            >
              WISE² CONSULTING
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Want Expert Eyes on Your Business?
            </h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              Our consulting team — led by Daniel and Darrin Wise — will audit your operation, build your AI strategy, and implement WISE² to spec. We don&apos;t just give you software. We give you a running system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/consulting"
                className="px-8 py-4 rounded-lg font-bold text-center transition"
                style={{ background: '#A63CFF', color: '#fff', boxShadow: '0 0 20px rgba(166,60,255,0.35)' }}
              >
                Explore Consulting →
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-lg font-bold text-center transition"
                style={{ background: 'rgba(166,60,255,0.1)', border: '1px solid rgba(166,60,255,0.35)', color: '#A63CFF' }}
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { icon: '🎯', title: 'AI Strategy Session', text: 'Map out your automation roadmap in a 90-minute strategy call with a WISE² expert.' },
              { icon: '🔧', title: 'Implementation', text: 'We build, configure, and deploy your custom WISE² setup — done for you.' },
              { icon: '📈', title: 'Ongoing Advisory', text: 'Monthly check-ins, system optimization, and growth strategy as you scale.' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-5 rounded-xl"
                style={{ background: 'rgba(166,60,255,0.06)', border: '1px solid rgba(166,60,255,0.15)' }}
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section: Final CTA ─────────────────────────────────────────────────────────
function FinalCTASection() {
  return (
    <section
      className="py-28 px-6 text-center"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(0,148,255,0.12) 0%, rgba(0,0,0,0) 70%)',
        borderTop: '1px solid rgba(0,148,255,0.12)',
      }}
    >
      <div className="max-w-3xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
          Ready to Run Your<br />
          <span style={{ color: '#0094FF' }}>Business Like a System?</span>
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
          Join businesses using WISE² to automate operations, make smarter decisions, and build lasting legacies.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/audit"
            className="px-10 py-5 rounded-xl font-black text-lg transition"
            style={{ background: '#0094FF', color: '#050505', boxShadow: '0 0 30px rgba(0,148,255,0.5)', letterSpacing: '0.05em' }}
          >
            START FREE — GET MY AI SCORE
          </Link>
          <Link
            href="/pricing"
            className="px-10 py-5 rounded-xl font-bold text-lg transition"
            style={{ background: 'rgba(0,148,255,0.1)', border: '1px solid rgba(0,148,255,0.35)', color: '#0094FF' }}
          >
            See Pricing
          </Link>
        </div>
        <p className="mt-6 text-gray-600 text-sm">14-day free trial • No credit card required • Cancel anytime</p>
      </div>
    </section>
  );
}

// ── Root Page ──────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main>
      {/* 1. Cinematic Hero with founder portraits + primary CTA */}
      <Hero />

      {/* 2. Problem — what's broken for most businesses */}
      <ProblemSection />

      {/* 3. Stats — impact numbers */}
      <Stats />

      {/* 4. How It Works — 3-step journey */}
      <HowItWorksSection />

      {/* 5. AI Audit CTA — primary revenue entry */}
      <AuditCTASection />

      {/* 6. Platform Capabilities */}
      <Features />

      {/* 7. Powered Businesses — PIFF CITY, WISE SHINE */}
      <PoweredBusinesses />

      {/* 8. About — mission and founders */}
      <About />

      {/* 9. Pricing Teaser */}
      <PricingTeaserSection />

      {/* 10. Consulting CTA */}
      <ConsultingCTASection />

      {/* 11. Final CTA */}
      <FinalCTASection />

      {/* 12. Footer */}
      <Footer />
    </main>
  );
}
