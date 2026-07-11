'use client'

import { Button } from '@wise2/ui-components'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="hero-gradient min-h-screen flex items-center justify-center py-3xl px-md sm:px-lg lg:px-xl">
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-lg">
            <span className="inline-block px-md py-sm bg-blue-500/20 border border-blue-500/50 rounded-full text-sm font-medium text-blue-400">
              ✨ ORGANIZED CHAOS
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-lg leading-tight">
            Build Your Brand
            <br />
            <span className="gradient-text">with AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-2xl max-w-2xl mx-auto">
            Create, manage, and grow your brand with professional-grade AI tools.
            Audio branding, video production, design, and marketing—all in one unified platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-lg justify-center items-center mb-3xl">
            <button className="px-2xl py-lg bg-blue-500 hover:bg-blue-400 text-black font-bold rounded-lg transition-all duration-200 hover:scale-105">
              Start Free Trial
            </button>
            <button className="px-2xl py-lg bg-transparent border-2 border-chrome hover:bg-chrome/10 text-chrome font-bold rounded-lg transition-all duration-200">
              Watch Demo
            </button>
          </div>

          <p className="text-sm text-gray-500">
            14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-3xl px-md sm:px-lg lg:px-xl bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-3xl">
            <h2 className="text-4xl sm:text-5xl font-bold mb-lg">
              One Platform. Unlimited Possibilities.
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to build professional brands
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2xl">
            {[
              {
                icon: '🎵',
                title: 'WISE Sound Labs',
                description: 'Professional audio branding with AI assistance. Create sonic logos, brand anthems, and commercial audio in minutes.',
              },
              {
                icon: '🎬',
                title: 'LIVE Command Center',
                description: 'Stream directly to YouTube, Twitch, and more. Real-time chat, viewer stats, and production management.',
              },
              {
                icon: '🤝',
                title: 'Community & Collaboration',
                description: 'Discord-integrated community with challenges, leaderboards, and creator showcases.',
              },
              {
                icon: '🧠',
                title: 'AI Assistants',
                description: 'Hermes orchestrates a team of specialized AI agents to help with every step of your creative process.',
              },
              {
                icon: '📊',
                title: 'Analytics & Insights',
                description: 'Track project performance, audience engagement, and measure your brand impact.',
              },
              {
                icon: '💳',
                title: 'Flexible Billing',
                description: 'Creator ($29), Pro ($99), Enterprise. Pay for what you use with our credit system.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="feature-card p-2xl bg-gray-800/50 border border-chrome/20 rounded-lg hover:border-blue-500/50"
              >
                <div className="text-4xl mb-md">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-md">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WISE SOUND LABS SHOWCASE ===== */}
      <section id="sound-labs" className="py-3xl px-md sm:px-lg lg:px-xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3xl items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-lg leading-tight">
                The Future of Audio Branding
              </h2>
              <p className="text-lg text-gray-400 mb-lg">
                WISE Sound Labs is the world's first AI-powered platform for professional audio branding.
                Create sonic logos, brand anthems, podcast intros, and commercial audio in minutes—not weeks.
              </p>
              <ul className="space-y-md mb-2xl">
                {[
                  'Brand DNA Engine powered by Claude AI',
                  'Professional-grade mixing and mastering',
                  'Sonic logo generation',
                  'Real-time collaboration',
                  'Multi-format exports',
                  'Brand vault for asset management',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-md">
                    <span className="text-blue-500 font-bold mt-1">✓</span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <button className="px-2xl py-lg bg-blue-500 hover:bg-blue-400 text-black font-bold rounded-lg transition-all duration-200">
                Explore Sound Labs
              </button>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-chrome/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-md">🎵</div>
                  <p className="text-gray-400">Live Studio Demo</p>
                  <p className="text-sm text-gray-500 mt-md">Coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section id="pricing" className="py-3xl px-md sm:px-lg lg:px-xl bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-3xl">
            <h2 className="text-4xl sm:text-5xl font-bold mb-lg">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2xl">
            {[
              {
                name: 'Creator',
                price: '$29',
                period: '/month',
                description: 'Perfect for solo creators',
                features: [
                  'Unlimited projects',
                  'Basic AI features',
                  '10 exports/month',
                  '1GB storage',
                  'Community access',
                ],
                cta: 'Start Free',
                featured: false,
              },
              {
                name: 'Pro',
                price: '$99',
                period: '/month',
                description: 'For teams and agencies',
                features: [
                  'Everything in Creator',
                  'Advanced AI features',
                  'Unlimited exports',
                  '100GB storage',
                  'Team collaboration',
                  'Priority support',
                ],
                cta: 'Get Started',
                featured: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'pricing',
                description: 'For large organizations',
                features: [
                  'Everything in Pro',
                  'Custom AI models',
                  'Dedicated support',
                  'On-premise option',
                  'Custom integrations',
                  'SLA guarantee',
                ],
                cta: 'Contact Sales',
                featured: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`p-2xl rounded-lg border transition-all duration-200 ${
                  plan.featured
                    ? 'bg-blue-500/10 border-blue-500/50 scale-105 shadow-2xl'
                    : 'bg-gray-800/50 border-chrome/20 hover:border-chrome/50'
                }`}
              >
                <h3 className="text-2xl font-bold mb-md">{plan.name}</h3>
                <div className="mb-lg">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-400 ml-md">{plan.period}</span>
                </div>
                <p className="text-gray-400 mb-2xl">{plan.description}</p>
                <ul className="space-y-md mb-2xl">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-md text-sm">
                      <span className="text-blue-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-md font-bold rounded-lg transition-all duration-200 ${
                    plan.featured
                      ? 'bg-blue-500 hover:bg-blue-400 text-black'
                      : 'bg-transparent border border-chrome hover:bg-chrome/10 text-chrome'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-3xl px-md sm:px-lg lg:px-xl">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-lg">
            Ready to Transform Your Brand?
          </h2>
          <p className="text-lg text-gray-400 mb-2xl">
            Join creators and agencies building the future of brand creation.
          </p>
          <button className="px-2xl py-lg bg-blue-500 hover:bg-blue-400 text-black font-bold rounded-lg transition-all duration-200 hover:scale-105">
            Start Your Free Trial
          </button>
          <p className="text-sm text-gray-500 mt-lg">
            14-day free trial. Cancel anytime.
          </p>
        </div>
      </section>
    </>
  )
}
