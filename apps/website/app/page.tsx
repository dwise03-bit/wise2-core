'use client';

import Link from 'next/link';
import Image from 'next/image';
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
    <section className="bg-[#050505] py-24 px-6 border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
            style={{ background: 'rgba(57, 255, 20, 0.1)', border: '1px solid rgba(57, 255, 20, 0.3)', color: '#39FF14' }}
          >
            THE PROBLEM
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
            Most Businesses Are <span style={{ color: '#E53935' }}>Running on Chaos</span>
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#8D98A5' }}>
            The average small business uses 14 disconnected tools. That fragmentation costs you time, money, and your competitive edge.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((p, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl flex gap-5 transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #0B0B0B, #1A1A1A)',
                border: '1px solid rgba(57, 255, 20, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.4)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span className="text-3xl flex-shrink-0 mt-1">{p.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8D98A5' }}>{p.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm mb-6" style={{ color: '#8D98A5' }}>Sound familiar? You're not alone — and there&apos;s a fix.</p>
          <Link
            href="/audit"
            className="inline-block px-8 py-4 rounded-lg font-bold transition-all duration-200"
            style={{
              background: '#39FF14',
              color: '#050505',
              boxShadow: '0 0 20px rgba(57, 255, 20, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
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
      color: '#39FF14',
    },
    {
      num: '03',
      title: 'Run Your Empire',
      text: 'We deploy your WISE² Command Center: automations firing, dashboards live, revenue tracked. One system. Total control.',
      cta: 'See the Platform',
      href: '/platform',
      color: '#39FF14',
    },
  ];

  return (
    <section className="bg-[#0B0B0B] py-24 px-6 border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
            style={{ background: 'rgba(57, 255, 20, 0.1)', border: '1px solid rgba(57, 255, 20, 0.3)', color: '#39FF14' }}
          >
            HOW IT WORKS
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
            From Chaos to <span style={{ color: '#39FF14' }}>Command Center</span>
          </h2>
          <p className="text-xl max-w-xl mx-auto" style={{ color: '#8D98A5' }}>
            Three steps from where you are to a business that runs with intelligence.
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-8 p-8 rounded-2xl items-start transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #050505, #1A1A1A)',
                border: '1px solid rgba(57, 255, 20, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.4)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                className="text-4xl font-black flex-shrink-0 w-16 text-center leading-none pt-1"
                style={{ color: step.color, opacity: 0.8 }}
              >
                {step.num}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="leading-relaxed mb-4" style={{ color: '#8D98A5' }}>{step.text}</p>
                <Link
                  href={step.href}
                  className="inline-block text-sm font-bold transition-all duration-200"
                  style={{ color: step.color, textShadow: `0 0 10px rgba(${step.color === '#39FF14' ? '57, 255, 20' : '0, 148, 255'}, 0)` }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textShadow = `0 0 10px rgba(${step.color === '#39FF14' ? '57, 255, 20' : '0, 148, 255'}, 0.5)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textShadow = `0 0 10px rgba(${step.color === '#39FF14' ? '57, 255, 20' : '0, 148, 255'}, 0)`;
                  }}
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
        background: 'linear-gradient(135deg, rgba(57, 255, 20, 0.08) 0%, rgba(57, 255, 20, 0.03) 50%, rgba(0,0,0,0) 100%)',
        borderTop: '1px solid rgba(57, 255, 20, 0.15)',
        borderBottom: '1px solid rgba(57, 255, 20, 0.15)',
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <div
          className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
          style={{ background: 'rgba(57, 255, 20, 0.15)', border: '1px solid rgba(57, 255, 20, 0.4)', color: '#39FF14' }}
        >
          FREE — NO CREDIT CARD REQUIRED
        </div>

        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
          What&apos;s Your<br />
          <span style={{ color: '#39FF14' }}>Business AI Score?</span>
        </h2>

        <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: '#BFC4C9' }}>
          In 5 minutes, get a personalized score from 0–100 that shows exactly where AI can save you time, money, and manual work — with specific recommendations for your business type.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/audit"
            className="px-10 py-5 rounded-xl font-black text-lg transition-all duration-200 w-full sm:w-auto text-center"
            style={{
              background: '#39FF14',
              color: '#050505',
              boxShadow: '0 0 30px rgba(57, 255, 20, 0.3)',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(57, 255, 20, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            TAKE THE FREE AI AUDIT
          </Link>
          <Link
            href="/consulting"
            className="px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200 w-full sm:w-auto text-center"
            style={{
              background: 'rgba(57, 255, 20, 0.1)',
              border: '1px solid rgba(57, 255, 20, 0.35)',
              color: '#39FF14',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.5)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(57, 255, 20, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.35)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Book a Consultation →
          </Link>
        </div>

        <div className="flex gap-8 justify-center flex-wrap">
          {['5-minute assessment', 'Personalized AI score', 'Custom recommendations', 'Zero spam, ever'].map((badge) => (
            <div key={badge} className="flex items-center gap-2 text-sm" style={{ color: '#8D98A5' }}>
              <span style={{ color: '#39FF14' }}>✓</span>
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
      color: '#39FF14',
    },
    {
      name: 'Enterprise',
      planId: 'ENTERPRISE',
      price: null,
      tagline: 'Custom for your organization',
      features: ['Unlimited workspaces', 'Dedicated API', '24/7 support', 'SSO & compliance', 'Custom onboarding'],
      cta: 'Schedule Demo',
      highlight: false,
      color: '#0094FF',
    },
  ];

  return (
    <section className="bg-[#050505] py-24 px-6 border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
            style={{ background: 'rgba(57, 255, 20, 0.1)', border: '1px solid rgba(57, 255, 20, 0.3)', color: '#39FF14' }}
          >
            PRICING
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
            Simple, <span style={{ color: '#39FF14' }}>Transparent Pricing</span>
          </h2>
          <p className="text-xl max-w-xl mx-auto" style={{ color: '#8D98A5' }}>
            14-day free trial. Cancel anytime. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {plans.map((plan, i) => (
            <div
              key={i}
              className="rounded-2xl p-8 transition-all duration-200"
              style={plan.highlight ? {
                background: 'linear-gradient(to bottom, rgba(57, 255, 20, 0.12), rgba(57, 255, 20, 0.04))',
                border: `2px solid ${plan.color}`,
              } : {
                background: 'linear-gradient(135deg, #0B0B0B, #1A1A1A)',
                border: '1px solid rgba(57, 255, 20, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = plan.highlight ? plan.color : 'rgba(57, 255, 20, 0.4)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = plan.highlight ? plan.color : 'rgba(57, 255, 20, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {plan.highlight && (
                <div className="mb-4 inline-block px-3 py-1 rounded-full text-xs font-bold text-[#050505]"
                  style={{ background: '#39FF14' }}>
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-sm mb-6" style={{ color: '#8D98A5' }}>{plan.tagline}</p>

              <div className="mb-8">
                {plan.price ? (
                  <>
                    <span className="text-4xl font-black" style={{ color: plan.color }}>${plan.price}</span>
                    <span className="text-sm ml-1" style={{ color: '#8D98A5' }}>/mo</span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-white">Custom</span>
                )}
              </div>

              <ul className="space-y-2 mb-8">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-sm" style={{ color: '#BFC4C9' }}>
                    <span style={{ color: plan.color }}>✓</span>{f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.price === null ? '/contact' : `/checkout?plan=${plan.planId}`}
                className="block text-center py-3 rounded-lg font-bold text-sm transition-all duration-200"
                style={plan.highlight
                  ? {
                      background: '#39FF14',
                      color: '#050505',
                      boxShadow: '0 0 16px rgba(57, 255, 20, 0.3)',
                    }
                  : {
                      background: 'rgba(57, 255, 20, 0.1)',
                      color: '#0094FF',
                      border: '1px solid rgba(0, 148, 255, 0.3)',
                    }}
                onMouseEnter={(e) => {
                  if (plan.highlight) {
                    e.currentTarget.style.boxShadow = '0 0 25px rgba(57, 255, 20, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.highlight) {
                    e.currentTarget.style.boxShadow = '0 0 16px rgba(57, 255, 20, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/pricing" className="text-sm font-semibold transition-all duration-200" style={{ color: '#39FF14' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textShadow = '0 0 10px rgba(57, 255, 20, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textShadow = 'none';
            }}
          >
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
    <section className="bg-[#0B0B0B] py-24 px-6 border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
              style={{ background: 'rgba(57, 255, 20, 0.1)', border: '1px solid rgba(57, 255, 20, 0.3)', color: '#39FF14' }}
            >
              WISE² CONSULTING
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
              Want Expert Eyes on Your Business?
            </h2>
            <p className="leading-relaxed mb-8" style={{ color: '#8D98A5' }}>
              Our consulting team — led by Daniel and Darrin Wise — will audit your operation, build your AI strategy, and implement WISE² to spec. We don&apos;t just give you software. We give you a running system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/consulting"
                className="px-8 py-4 rounded-lg font-bold text-center transition-all duration-200"
                style={{
                  background: '#39FF14',
                  color: '#050505',
                  boxShadow: '0 0 20px rgba(57, 255, 20, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Explore Consulting →
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 rounded-lg font-bold text-center transition-all duration-200"
                style={{
                  background: 'rgba(57, 255, 20, 0.1)',
                  border: '1px solid rgba(57, 255, 20, 0.35)',
                  color: '#39FF14',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.35)';
                }}
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
                className="flex gap-4 p-5 rounded-xl transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #050505, #1A1A1A)',
                  border: '1px solid rgba(57, 255, 20, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.4)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(57, 255, 20, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.2)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm" style={{ color: '#8D98A5' }}>{item.text}</p>
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
        background: 'radial-gradient(ellipse at center, rgba(57, 255, 20, 0.08) 0%, rgba(0,0,0,0) 70%)',
        borderTop: '1px solid rgba(57, 255, 20, 0.12)',
      }}
    >
      <div className="max-w-3xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
          Ready to Run Your<br />
          <span style={{ color: '#39FF14' }}>Business Like a System?</span>
        </h2>
        <p className="text-xl mb-10 max-w-xl mx-auto" style={{ color: '#BFC4C9' }}>
          Join businesses using WISE² to automate operations, make smarter decisions, and build lasting legacies.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/audit"
            className="px-10 py-5 rounded-xl font-black text-lg transition-all duration-200"
            style={{
              background: '#39FF14',
              color: '#050505',
              boxShadow: '0 0 30px rgba(57, 255, 20, 0.3)',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(57, 255, 20, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            START FREE — GET MY AI SCORE
          </Link>
          <Link
            href="/pricing"
            className="px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200"
            style={{
              background: 'rgba(57, 255, 20, 0.1)',
              border: '1px solid rgba(57, 255, 20, 0.35)',
              color: '#39FF14',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.5)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(57, 255, 20, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(57, 255, 20, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.35)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            See Pricing
          </Link>
        </div>
        <p className="mt-6 text-sm" style={{ color: '#8D98A5' }}>14-day free trial • No credit card required • Cancel anytime</p>
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
