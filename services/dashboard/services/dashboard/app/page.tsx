'use client';

import { ChromeTitle, Button, HUDPanel, FeatureCard } from '@/components/enterprise';

export default function Home() {
  return (
    <main className="min-h-screen blueprint-bg">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-96 h-96 bg-chaos-electric rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-chaos-blue rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-4xl text-center">
          <div className="mb-8 inline-block">
            <div className="text-6xl font-bold text-white mb-2">
              <span className="chrome-text">WISE²</span>
            </div>
            <div className="text-xl text-chaos-ice font-mono">ENTERPRISE • PROJECT GENESIS</div>
          </div>

          <ChromeTitle as="h1" className="text-5xl md:text-6xl mb-6">
            Build the<br />
            <span className="text-chaos-ice">FUTURE</span>
          </ChromeTitle>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            WISE² Enterprise is the AI-powered operating system for modern businesses. From creative production to business operations, community and AI automation—everything you need in one intelligent platform.
          </p>

          <p className="text-lg text-chaos-ice mb-12 font-mono">
            ORGANIZED CHAOS.<br />
            <span className="text-white">PERFECTLY EXECUTED.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="primary" size="lg">
              Get Started
            </Button>
            <Button variant="secondary" size="lg">
              View Features
            </Button>
          </div>

          <div className="text-sm text-gray-400 font-mono">
            Scroll to explore • AI Powered • Enterprise Ready • Infinitely Scalable
          </div>
        </div>
      </section>

      {/* WHAT IS WISE² */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          What is WISE²?
        </ChromeTitle>

        <HUDPanel className="mb-12">
          <p className="text-lg text-gray-200 mb-6">
            WISE² Enterprise is the AI-powered operating system for modern businesses. From creative production to business operations, community, and AI automation—everything you need in one intelligent platform.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['AI POWERED', 'BUILT IN PUBLIC', 'COMMUNITY DRIVEN', 'SECURE & SCALABLE', 'FUTURE READY'].map((item) => (
              <div key={item} className="text-center">
                <div className="text-xs font-mono text-chaos-ice uppercase tracking-wider">{item}</div>
              </div>
            ))}
          </div>
        </HUDPanel>
      </section>

      {/* THE PROMISE */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          The WISE² Promise
        </ChromeTitle>

        <div className="grid md:grid-cols-2 gap-6">
          {[
            'ONE PLATFORM. INFINITE POSSIBILITIES.',
            'TOTAL CLARITY.',
            'MAXIMUM IMPACT.',
            'ORGANIZED CHAOS.',
            'PERFECTLY EXECUTED.'
          ].map((promise, i) => (
            <HUDPanel key={i}>
              <div className="flex items-start gap-4">
                <div className="text-chaos-ice text-2xl flex-shrink-0">✓</div>
                <div className="text-lg font-semibold text-white">{promise}</div>
              </div>
            </HUDPanel>
          ))}
        </div>
      </section>

      {/* 12 STEPS */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          12 Steps to Get Started
        </ChromeTitle>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { num: 1, title: 'BUILD THE FOUNDATION', desc: 'Complete vision, PRD, experience guide, architecture, and repo structure.' },
            { num: 2, title: 'REPOSITORY AUDIT', desc: 'Verify structure, dependencies, Docker, CI/CD, docs, and deployment.' },
            { num: 3, title: 'DESIGN SYSTEM', desc: 'Build one reusable system. Components for UI, charts, form, HUD & more.' },
            { num: 4, title: 'LANDING WEBSITE', desc: 'Create the front door. Home, about, services, pricing, UX, community, and more.' },
            { num: 5, title: 'AUTHENTICATION', desc: 'Login, orgs, teams, roles, permissions, billing, and secure sessions.' },
            { num: 6, title: 'WISE² HEADQUARTERS', desc: 'Your main dashboard. Mission control for all operations and intelligence.' },
            { num: 7, title: 'WISE SOUND LABS', desc: 'Launch the flagship product. Brand DNA, music creation, AI producer, and more.' },
            { num: 8, title: 'LIVE COMMAND CENTER', desc: 'Livestreams, live chat, Discord, roadmap, events, and real-time updates.' },
            { num: 9, title: 'COMMUNITY', desc: 'Discord hub, tutorials, leaderboards, challenges, events, and creation.' },
            { num: 10, title: 'HERMES AI', desc: 'AI assistant layer for creativity, business support, and intelligent automation.' },
            { num: 11, title: 'MARKETPLACE', desc: 'Templates, AI agents, plugins, music, brands, tools, and more.' },
            { num: 12, title: 'INFINITY SCALE', desc: 'Unlimited expansion. Ecosystem growth. Global reach. Enterprise evolution.' },
          ].map(({ num, title, desc }) => (
            <FeatureCard key={num} title={`${num}. ${title}`} description={desc} />
          ))}
        </div>
      </section>

      {/* SOUND LABS CTA */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <ChromeTitle as="h2" className="text-4xl mb-6">
          Ready to Build Your Sound?
        </ChromeTitle>
        <p className="text-lg text-gray-300 mb-8">
          WISE² Sound Labs creates original music, sonic branding, and content for your brand.
        </p>
        <Button variant="primary" size="lg">
          Explore Sound Labs
        </Button>
      </section>

      {/* TECH STACK */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Technology Stack
        </ChromeTitle>

        <HUDPanel className="text-center">
          <div className="grid md:grid-cols-5 gap-8">
            {[
              { label: 'FRONTEND', tech: 'Next.js, React, TypeScript, Tailwind CSS' },
              { label: 'BACKEND', tech: 'Node.js, Express, TypeScript, PostgreSQL, Redis' },
              { label: 'INFRASTRUCTURE', tech: 'Docker, CI/CD, Kubernetes, Object Storage' },
              { label: 'PAYMENTS', tech: 'Stripe, Webhooks' },
              { label: 'AI LAYER', tech: 'Claude API, Orchestrator, Multi-Model Automation' },
            ].map(({ label, tech }) => (
              <div key={label}>
                <div className="text-chaos-ice text-sm font-mono font-bold mb-2">{label}</div>
                <div className="text-xs text-gray-300">{tech}</div>
              </div>
            ))}
          </div>
        </HUDPanel>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 border-t border-chaos-glow/30 max-w-6xl mx-auto">
        <div className="text-center text-sm text-gray-400">
          <p className="mb-4">WISE² Enterprise • Organized Chaos. Perfectly Executed.</p>
          <div className="flex justify-center gap-6 text-xs">
            <a href="#" className="hover:text-chaos-ice">Privacy</a>
            <a href="#" className="hover:text-chaos-ice">Terms</a>
            <a href="#" className="hover:text-chaos-ice">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
