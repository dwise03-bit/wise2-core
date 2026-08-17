'use client';

import Link from 'next/link';
import { Footer } from '@/components/wise';

const SERVICES = [
  {
    id: 'audit',
    icon: '🎯',
    title: 'AI Business Audit',
    price: '$149',
    duration: '60 minutes',
    description: 'Complete business systems audit. We analyze your workflows, identify AI opportunities, and deliver a personalized automation roadmap.',
    deliverables: ['AI Readiness Score (0-100)', 'Opportunity Report', 'Quick-Win Recommendations', 'Priority 90-Day Plan'],
    cta: 'Book Audit',
    href: '/consulting/audit',
    color: '#0094FF',
  },
  {
    id: 'live-build',
    icon: '⚡',
    title: 'WISE² Live Build Session',
    price: '$497',
    duration: '60 minutes',
    description: 'Build something REAL with us. Choose your project, and we\'ll implement it live during our session. You leave with working code.',
    deliverables: ['Working Implementation', 'Configured Systems', 'Integration Setup', 'Next-Steps Roadmap'],
    cta: 'Book Live Build',
    href: '/consulting/live-build',
    color: '#39FF14',
    highlight: true,
  },
  {
    id: 'implementation-day',
    icon: '🚀',
    title: 'AI Implementation Day',
    price: '$997',
    duration: 'Up to 6 hours',
    description: 'Comprehensive implementation for larger scope projects. Multiple automations, integrations, dashboards, and workflows built together.',
    deliverables: ['Multiple Automations', 'AI Assistants', 'Custom Integrations', 'Training & Documentation'],
    cta: 'Book Implementation',
    href: '/consulting/implementation-day',
    color: '#0094FF',
  },
  {
    id: 'management',
    icon: '📊',
    title: 'WISE² Management',
    price: '$297/mo',
    duration: 'Ongoing',
    description: 'Recurring management and optimization. Monthly reviews, system tuning, new automations, and ongoing support.',
    deliverables: ['Monthly Strategy Call', 'System Optimization', 'AI Monitoring', 'Priority Support'],
    cta: 'Start Management',
    href: '/consulting/management',
    color: '#00D9FF',
  },
];

const BENEFITS = [
  { icon: '✓', title: 'Real Solutions', description: 'Not theory. We build working implementations during sessions.' },
  { icon: '✓', title: 'No Code Required', description: 'Leveraging AI and no-code tools means you don\'t need technical teams.' },
  { icon: '✓', title: 'Immediate Results', description: 'Leave each session with working systems, not recommendations.' },
  { icon: '✓', title: 'AI-Powered', description: 'Leveraging the latest AI models and automation frameworks.' },
  { icon: '✓', title: 'Proven Methods', description: 'Based on real business operations we\'ve built and scaled.' },
  { icon: '✓', title: 'Next-Step Ready', description: 'Every session includes a clear roadmap for what\'s next.' },
];

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Choose Your Path',
    description: 'Select an audit, live build, or implementation day based on your scope.',
  },
  {
    step: '2',
    title: 'Share Your Needs',
    description: 'Complete a brief intake form telling us about your business and goals.',
  },
  {
    step: '3',
    title: 'We Qualify',
    description: 'We review and recommend the best service for your specific situation.',
  },
  {
    step: '4',
    title: 'Book & Prepare',
    description: 'Schedule your session and we send prep materials to get you ready.',
  },
  {
    step: '5',
    title: 'Build Together',
    description: 'During the session, we build real solutions with you in real-time.',
  },
  {
    step: '6',
    title: 'Get Results',
    description: 'Leave with working implementations, reports, and a clear next-step plan.',
  },
];

const FAQ = [
  {
    q: 'Do I need technical experience?',
    a: 'Not at all. We handle the technical side. You just need to know your business and be ready to make decisions.',
  },
  {
    q: 'What if the project takes longer than the session?',
    a: 'We scope projects to fit the time. If something\'s too big, we recommend the longer Implementation Day or offer Management follow-ups.',
  },
  {
    q: 'Can you work with my specific tools/platforms?',
    a: 'We integrate with 500+ platforms and tools. If it has an API or Zapier connector, we can likely connect it.',
  },
  {
    q: 'What happens after the session?',
    a: 'You get a deliverable report, a roadmap for next steps, and an option to subscribe to our Management plan.',
  },
  {
    q: 'Is the session recorded?',
    a: 'Yes, we record every session for your reference and for our follow-up communications.',
  },
  {
    q: 'Can you manage the system afterward?',
    a: 'Yes! We offer our Management plan ($297/month) for ongoing optimization and support.',
  },
];

export default function ConsultingPage() {
  return (
    <>
      <main className="min-h-screen bg-[#050505] text-white">
        {/* Hero Section */}
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
              DON'T LEARN AI.<br />
              <span style={{ color: '#39FF14' }}>BUILD WITH IT. LIVE.</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10" style={{ color: '#8D98A5' }}>
              Your business. Your workflows. Built together with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/intake"
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
                Start with AI Audit →
              </Link>
              <Link
                href="/consulting/live-build"
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
                Book Live Build
              </Link>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-6 border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>Choose Your Path</h2>
              <p style={{ color: '#8D98A5' }}>Four packages designed for different needs and budgets</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {SERVICES.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl p-8 relative transition-all duration-200"
                  style={{
                    background: service.highlight ? 'linear-gradient(135deg, rgba(57, 255, 20, 0.15), rgba(0, 148, 255, 0.05))' : 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
                    border: service.highlight ? '2px solid #39FF14' : '1px solid rgba(57, 255, 20, 0.2)',
                    boxShadow: service.highlight ? '0 0 30px rgba(57, 255, 20, 0.2)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.4)';
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(57, 255, 20, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = service.highlight ? '2px solid #39FF14' : '1px solid rgba(57, 255, 20, 0.2)';
                    e.currentTarget.style.boxShadow = service.highlight ? '0 0 30px rgba(57, 255, 20, 0.2)' : 'none';
                  }}
                >
                  {service.highlight && (
                    <div
                      className="absolute top-0 left-0 right-0 px-4 py-1 text-center"
                      style={{
                        background: '#39FF14',
                        color: '#050505',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        borderRadius: '0 0 8px 8px',
                      }}
                    >
                      MOST POPULAR
                    </div>
                  )}

                  <div className="text-5xl mb-4">{service.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                  <div className="mb-4">
                    <div className="text-3xl font-bold" style={{ color: service.color }}>
                      {service.price}
                    </div>
                    <div style={{ color: '#8D98A5', fontSize: '14px' }}>{service.duration}</div>
                  </div>

                  <p className="mb-6" style={{ color: '#C0C0C0' }}>
                    {service.description}
                  </p>

                  <div className="mb-8">
                    <div style={{ color: '#8D98A5', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>DELIVERABLES</div>
                    <ul className="space-y-2">
                      {service.deliverables.map((item, idx) => (
                        <li key={idx} style={{ color: '#A0A0A0', fontSize: '14px' }}>
                          ✓ {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={service.href}
                    className="block w-full text-center py-4 rounded-xl font-bold transition-all duration-200"
                    style={{
                      background: service.color,
                      color: service.id === 'live-build' ? '#050505' : '#050505',
                      boxShadow: `0 0 20px ${service.color}30`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 30px ${service.color}60`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 20px ${service.color}30`;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {service.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-6 border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
              Why WISE² Consulting
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {BENEFITS.map((benefit, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 148, 255, 0.1), rgba(57, 255, 20, 0.05))',
                    border: '1px solid rgba(57, 255, 20, 0.15)',
                  }}
                >
                  <div className="text-3xl mb-4" style={{ color: '#39FF14' }}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p style={{ color: '#A0A0A0' }}>{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((item, idx) => (
                <div key={idx} className="relative">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-4"
                    style={{
                      background: '#39FF14',
                      color: '#050505',
                    }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p style={{ color: '#A0A0A0' }}>{item.description}</p>
                  {idx < HOW_IT_WORKS.length - 1 && (
                    <div
                      className="hidden md:block absolute top-12 left-16 w-16 h-px"
                      style={{ background: 'rgba(57, 255, 20, 0.2)' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
              Frequently Asked
            </h2>
            <div className="space-y-4">
              {FAQ.map((item, idx) => (
                <details
                  key={idx}
                  className="group p-6 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #1A1A1A, #0F0F0F)',
                    border: '1px solid rgba(57, 255, 20, 0.2)',
                  }}
                >
                  <summary className="text-lg font-bold flex items-center justify-between" style={{ color: '#39FF14' }}>
                    {item.q}
                    <span className="text-2xl group-open:rotate-180 transition-transform duration-200">›</span>
                  </summary>
                  <p className="mt-4" style={{ color: '#A0A0A0' }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 text-center border-t" style={{ borderColor: 'rgba(57, 255, 20, 0.15)' }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>
              Ready to Build?
            </h2>
            <p className="text-xl mb-10" style={{ color: '#8D98A5' }}>
              Choose your consulting path and let's start building your future.
            </p>
            <Link
              href="/intake"
              className="inline-block px-12 py-6 rounded-xl font-black text-lg transition-all duration-200"
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
              Start Your Audit Today →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
