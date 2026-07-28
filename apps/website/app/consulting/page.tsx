'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Footer } from '@/components/wise';

const SERVICES = [
  {
    icon: '🎯',
    title: 'AI Strategy Session',
    price: '$497',
    duration: '90 minutes',
    description: 'Deep-dive consultation with a WISE² expert. We analyze your current tools, workflows, and revenue gaps — then map an AI implementation roadmap with clear ROI.',
    deliverables: ['Business AI score + audit report', 'Custom automation roadmap', 'Tool stack recommendations', 'Quick-win action plan (90 days)'],
    cta: 'Book Strategy Session',
    href: '/contact',
    color: '#0094FF',
  },
  {
    icon: '🔧',
    title: 'WISE² Implementation',
    price: 'From $2,500',
    duration: '2–4 weeks',
    description: 'Full WISE² deployment tailored to your business. We build, configure, and launch your command center — then train your team to use it like operators.',
    deliverables: ['Complete WISE² setup', 'Custom workflow automation', 'Team training sessions', '30-day support included'],
    cta: 'Start Implementation',
    href: '/contact',
    color: '#39FF14',
    highlight: true,
  },
  {
    icon: '📈',
    title: 'Growth Advisory',
    price: '$1,200/mo',
    duration: 'Monthly retainer',
    description: 'Ongoing strategic advisory from Daniel and Darrin Wise. Monthly sessions, performance reviews, system optimization, and growth strategy as you scale.',
    deliverables: ['Monthly strategy call', 'KPI review & optimization', 'New automation identification', 'Priority support access'],
    cta: 'Apply for Advisory',
    href: '/contact',
    color: '#0094FF',
  },
];

const TESTIMONIALS = [
  {
    quote: 'WISE² automated 80% of our manual processes in under 3 weeks. Our team can now focus on growth instead of admin.',
    name: 'Marcus T.',
    role: 'CEO, Retail Operations',
  },
  {
    quote: 'The strategy session alone paid for itself. We found $18K in annual savings we were leaving on the table.',
    name: 'Janelle R.',
    role: 'Operations Director, Services Firm',
  },
  {
    quote: 'Daniel and Darrin don\'t just consult — they build. Our system was live and running before the call was over.',
    name: 'Kevin O.',
    role: 'Founder, E-Commerce Brand',
  },
];

export default function ConsultingPage() {
  return (
    <>
      <main className="min-h-screen bg-[#050505] text-white">
        {/* Hero */}
        <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center top, rgba(57, 255, 20, 0.12) 0%, transparent 70%)',
            }}
          />
          <div className="relative max-w-4xl mx-auto">
            <div
              className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
              style={{ background: 'rgba(57, 255, 20, 0.12)', border: '1px solid rgba(57, 255, 20, 0.35)', color: '#39FF14' }}
            >
              WISE² CONSULTING
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
              We Don&apos;t Just<br />
              <span style={{ color: '#39FF14' }}>Advise. We Build.</span>
            </h1>
            <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: '#8D98A5' }}>
              WISE² consulting goes beyond strategy decks. We work alongside you to implement the systems, automate the workflows, and build the infrastructure your business needs to scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-10 py-5 rounded-xl font-black text-lg transition-all duration-200"
                style={{
                  background: '#39FF14',
                  color: '#050505',
                  boxShadow: '0 0 25px rgba(57, 255, 20, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 35px rgba(57, 255, 20, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(57, 255, 20, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Book a Consultation →
              </Link>
              <Link
                href="/audit"
                className="px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200"
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
                Free AI Audit First
              </Link>
            </div>
          </div>
        </section>

        {/* Founders */}
        <section className="py-20 px-6 border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>Meet Your Consultants</h2>
              <p style={{ color: '#8D98A5' }}>WISE² is led by two operators who&apos;ve built the systems — not just talked about them.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div
                className="p-8 rounded-2xl flex gap-6 items-start transition-all duration-200"
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
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '2px solid rgba(57, 255, 20, 0.4)' }}>
                  <Image src="/uploads/daniel-real.jpg" alt="Daniel Wise" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Daniel Wise</h3>
                  <p className="text-sm font-semibold mb-3" style={{ color: '#39FF14' }}>Founder & System Architect</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#8D98A5' }}>
                    AI automation expert and systems architect who built WISE² from the ground up. Daniel specializes in business intelligence, infrastructure, and AI-first operations.
                  </p>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {['AI Automation', 'Systems Design', 'Infrastructure'].map((t) => (
                      <span key={t} className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(57, 255, 20, 0.15)', color: '#39FF14' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="p-8 rounded-2xl flex gap-6 items-start transition-all duration-200"
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
                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ border: '2px solid rgba(57, 255, 20, 0.4)' }}>
                  <Image src="/uploads/darrin-real.jpg" alt="Darrin Wise" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Darrin Wise</h3>
                  <p className="text-sm font-semibold mb-3" style={{ color: '#39FF14' }}>Operations & Growth Leader</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#8D98A5' }}>
                    Operations master and growth strategist who drives execution across WISE²&apos;s portfolio. Darrin specializes in team systems, brand building, and community-driven growth.
                  </p>
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {['Operations', 'Growth Strategy', 'Brand Building'].map((t) => (
                      <span key={t} className="px-2 py-1 rounded text-xs" style={{ background: 'rgba(57, 255, 20, 0.15)', color: '#39FF14' }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 px-6 border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div
                className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
                style={{ background: 'rgba(57, 255, 20, 0.1)', border: '1px solid rgba(57, 255, 20, 0.3)', color: '#39FF14' }}
              >
                OUR SERVICES
              </div>
              <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>Choose Your Engagement</h2>
              <p style={{ color: '#8D98A5' }} className="max-w-xl mx-auto">Start where you are. Scale to where you want to be.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {SERVICES.map((service, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-8 flex flex-col transition-all duration-200"
                  style={service.highlight ? {
                    background: `linear-gradient(to bottom, rgba(57, 255, 20, 0.12), rgba(57, 255, 20, 0.04))`,
                    border: `2px solid ${service.color}`,
                  } : {
                    background: 'linear-gradient(135deg, #0B0B0B, #1A1A1A)',
                    border: '1px solid rgba(57, 255, 20, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    if (!service.highlight) {
                      e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.4)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!service.highlight) {
                      e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.2)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {service.highlight && (
                    <div className="mb-4 inline-block px-3 py-1 rounded-full text-xs font-bold w-fit" style={{ background: '#39FF14', color: '#050505' }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div className="text-3xl mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-black" style={{ color: service.color }}>{service.price}</span>
                    <span style={{ color: '#8D98A5' }} className="text-sm">· {service.duration}</span>
                  </div>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: '#8D98A5' }}>{service.description}</p>

                  <div className="flex-1">
                    <p className="text-xs font-bold tracking-widest mb-3" style={{ color: '#8D98A5' }}>WHAT YOU GET</p>
                    <ul className="space-y-2 mb-8">
                      {service.deliverables.map((d, di) => (
                        <li key={di} className="flex items-start gap-2 text-sm" style={{ color: '#BFC4C9' }}>
                          <span style={{ color: service.color }} className="flex-shrink-0 mt-0.5">✓</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={service.href}
                    className="block text-center py-4 rounded-xl font-bold transition-all duration-200"
                    style={service.highlight
                      ? {
                          background: '#39FF14',
                          color: '#050505',
                          boxShadow: `0 0 20px rgba(57, 255, 20, 0.3)`,
                        }
                      : {
                          background: `rgba(57, 255, 20, 0.1)`,
                          border: `1px solid ${service.color}40`,
                          color: service.color,
                        }}
                    onMouseEnter={(e) => {
                      if (service.highlight) {
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (service.highlight) {
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.3)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {service.cta} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          className="py-20 px-6 border-t"
          style={{
            background: 'rgba(255,255,255,0.01)',
            borderColor: 'rgba(57, 255, 20, 0.15)',
          }}
        >
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>What Clients Say</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #0B0B0B, #1A1A1A)',
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
                  <p className="text-sm leading-relaxed mb-6 italic" style={{ color: '#BFC4C9' }}>&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs" style={{ color: '#8D98A5' }}>{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-24 px-6 text-center"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(57, 255, 20, 0.1) 0%, transparent 70%)',
            borderTop: '1px solid rgba(57, 255, 20, 0.12)',
          }}
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
              Ready to Build Something<br />
              <span style={{ color: '#39FF14' }}>That Lasts?</span>
            </h2>
            <p className="text-xl mb-10" style={{ color: '#BFC4C9' }}>
              Start with a free AI Audit or go straight to booking — either way, we&apos;re ready to build with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-10 py-5 rounded-xl font-black text-lg transition-all duration-200"
                style={{
                  background: '#39FF14',
                  color: '#050505',
                  boxShadow: '0 0 25px rgba(57, 255, 20, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 35px rgba(57, 255, 20, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(57, 255, 20, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Book a Consultation →
              </Link>
              <Link
                href="/audit"
                className="px-10 py-5 rounded-xl font-bold text-lg transition-all duration-200"
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
                Free AI Audit First
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
