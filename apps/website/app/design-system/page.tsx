'use client';

import Link from 'next/link';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="border-b border-[#39FF14]/20 bg-gradient-to-b from-[#0B0B0B] to-[#050505] px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-black mb-4" style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}>
            WISE² DESIGN SYSTEM
          </h1>
          <p className="text-[#8D98A5] text-lg max-w-2xl">
            The ORGANIZED CHAOS™ visual language for enterprise mission control. Neon Green accents, Electric Blue highlights, and premium steel aesthetics.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Color System */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Orbitron', color: '#39FF14' }}>
            COLOR SYSTEM
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { name: 'Neon Green', hex: '#39FF14', desc: 'Primary accent, CTAs' },
              { name: 'Electric Blue', hex: '#0094FF', desc: 'Secondary accent, links' },
              { name: 'Pure Black', hex: '#050505', desc: 'Background' },
              { name: 'Dark Steel', hex: '#0B0B0B', desc: 'Surfaces' },
              { name: 'Steel Panel', hex: '#1A1A1A', desc: 'Cards, panels' },
              { name: 'Chrome', hex: '#BFC4C9', desc: 'Premium accents' },
              { name: 'Muted Gray', hex: '#8D98A5', desc: 'Secondary text' },
              { name: 'Success', hex: '#22C55E', desc: 'Completion badges' },
            ].map((color) => (
              <div key={color.hex} className="border border-[#39FF14]/20 rounded-lg p-4 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
                <div
                  className="w-full h-16 rounded-lg mb-3 border border-white/10"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="font-bold text-white">{color.name}</p>
                <p className="text-sm text-[#8D98A5] font-mono">{color.hex}</p>
                <p className="text-xs text-[#8D98A5] mt-2">{color.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Orbitron', color: '#39FF14' }}>
            TYPOGRAPHY
          </h2>

          <div className="space-y-6">
            <div className="border border-[#39FF14]/20 rounded-lg p-6 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <h3 className="text-5xl font-black mb-2" style={{ fontFamily: 'Orbitron', letterSpacing: '0.15em' }}>
                Display Heading
              </h3>
              <p className="text-[#8D98A5]">Orbitron, font-weight: 900, uppercase, wide tracking</p>
            </div>

            <div className="border border-[#39FF14]/20 rounded-lg p-6 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Orbitron' }}>
                Section Heading
              </h2>
              <p className="text-[#8D98A5]">Orbitron, font-weight: 700, bold and prominent</p>
            </div>

            <div className="border border-[#39FF14]/20 rounded-lg p-6 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <p className="text-lg mb-2" style={{ fontFamily: 'Raleway', fontWeight: 400 }}>
                Body text uses Raleway for clean readability with proper line height and spacing.
              </p>
              <p className="text-[#8D98A5]">Raleway, font-weight: 400, line-height: 1.6</p>
            </div>

            <div className="border border-[#39FF14]/20 rounded-lg p-6 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <p className="text-sm text-[#8D98A5] mb-2" style={{ fontFamily: 'Raleway', fontWeight: 500 }}>
                SECONDARY TEXT
              </p>
              <p className="text-[#8D98A5] text-xs">Raleway, font-weight: 500, uppercase, labels</p>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Orbitron', color: '#39FF14' }}>
            COMPONENTS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons */}
            <div className="border border-[#39FF14]/20 rounded-lg p-6 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <h3 className="font-bold mb-4 text-[#39FF14]">Neon Green Button (Primary)</h3>
              <button
                className="btn-glow-neon px-6 py-3 rounded-lg font-bold"
                onClick={() => {}}
              >
                Primary Action
              </button>
            </div>

            <div className="border border-[#39FF14]/20 rounded-lg p-6 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <h3 className="font-bold mb-4 text-[#0094FF]">Electric Blue Button (Secondary)</h3>
              <button
                className="btn-glow-blue px-6 py-3 rounded-lg font-bold"
                onClick={() => {}}
              >
                Secondary Action
              </button>
            </div>

            {/* Status Badges */}
            <div className="border border-[#39FF14]/20 rounded-lg p-6 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <h3 className="font-bold mb-4 text-[#39FF14]">Status Badges</h3>
              <div className="flex gap-3 flex-wrap">
                <span className="px-3 py-1 rounded text-xs font-bold bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
                  ACTIVE
                </span>
                <span className="px-3 py-1 rounded text-xs font-bold bg-[#F2B632]/20 text-[#F2B632] border border-[#F2B632]/30">
                  PENDING
                </span>
                <span className="px-3 py-1 rounded text-xs font-bold bg-[#E53935]/20 text-[#E53935] border border-[#E53935]/30">
                  ERROR
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="border border-[#39FF14]/20 rounded-lg p-6 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
              <h3 className="font-bold mb-4 text-[#39FF14]">Enterprise Card</h3>
              <div className="border border-[#39FF14]/20 rounded-lg p-4 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] hover:border-[#39FF14]/50 transition-all">
                <p className="font-bold text-white mb-2">Card Title</p>
                <p className="text-[#8D98A5] text-sm">Cards use gradient backgrounds with soft green borders and hover glow effects.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Guide */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Orbitron', color: '#39FF14' }}>
            IMPLEMENTATION GUIDE
          </h2>

          <div className="border border-[#39FF14]/20 rounded-lg p-8 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] space-y-4">
            <h3 className="font-bold text-lg text-white">Global CSS Variables</h3>
            <pre className="bg-black/50 p-4 rounded overflow-x-auto text-sm">
{`/* Use these CSS variables throughout the site */
background: var(--wise-black);
color: var(--wise-white);
border-color: rgba(57, 255, 20, 0.2); /* Neon Green with opacity */
box-shadow: 0 0 20px rgba(57, 255, 20, 0.2); /* Glow effects */

/* Fonts */
font-family: var(--font-headers); /* Orbitron */
font-family: var(--font-body);    /* Raleway */`}
            </pre>

            <h3 className="font-bold text-lg text-white mt-8">Utility Classes</h3>
            <ul className="space-y-2 text-[#8D98A5]">
              <li>• <code className="bg-black/30 px-2 py-1 rounded">btn-glow-neon</code> - Primary action buttons</li>
              <li>• <code className="bg-black/30 px-2 py-1 rounded">btn-glow-blue</code> - Secondary action buttons</li>
              <li>• <code className="bg-black/30 px-2 py-1 rounded">border-glow-neon</code> - Neon borders with glow</li>
              <li>• <code className="bg-black/30 px-2 py-1 rounded">text-glow-neon</code> - Glowing text effect</li>
              <li>• <code className="bg-black/30 px-2 py-1 rounded">bg-enterprise-gradient</code> - Gradient backgrounds</li>
            </ul>

            <h3 className="font-bold text-lg text-white mt-8">Tailwind Color Names</h3>
            <p className="text-[#8D98A5]">Use hex values directly or extend tailwind config with custom colors:</p>
            <pre className="bg-black/50 p-4 rounded overflow-x-auto text-sm">
{`className="border border-[#39FF14]/20"  /* Neon with 20% opacity */
className="bg-[#050505]"              /* Pure Black */
className="text-[#8D98A5]"            /* Muted Gray */`}
            </pre>
          </div>
        </section>

        {/* Pages to Update */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Orbitron', color: '#39FF14' }}>
            PAGES IMPLEMENTING DESIGN SYSTEM
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Audit OS Hub', href: '/audits', status: '✅ Complete' },
              { name: 'Audit OS Detail', href: '/audits/demo', status: '✅ Complete' },
              { name: 'Global Design System', href: '/design-system', status: '✅ Active' },
              { name: 'Homepage', href: '/', status: '🔄 In Progress' },
              { name: 'Consulting', href: '/consulting', status: '⏳ Planned' },
              { name: 'Pricing', href: '/pricing', status: '⏳ Planned' },
            ].map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="border border-[#39FF14]/20 rounded-lg p-4 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A] hover:border-[#39FF14]/50 transition-all"
              >
                <p className="font-bold text-white">{page.name}</p>
                <p className="text-[#8D98A5] text-sm mt-1">{page.status}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Key Principles */}
        <section>
          <h2 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Orbitron', color: '#39FF14' }}>
            KEY PRINCIPLES
          </h2>

          <div className="space-y-4">
            {[
              { title: 'Mission Control Aesthetic', desc: 'Every page should feel like an enterprise command center with HUD-style elements.' },
              { title: 'Color Hierarchy', desc: 'Neon Green for primary actions, Electric Blue for secondary, Chrome for accents.' },
              { title: 'Typography Contrast', desc: 'Orbitron for impact and authority, Raleway for clarity and readability.' },
              { title: 'Subtle Glow Effects', desc: 'Soft shadows with color-matched glows (20-50ms transitions) for premium feel.' },
              { title: 'Transparent Borders', desc: 'All borders use RGBA with opacity (20%+ hover state) instead of solid colors.' },
              { title: 'Gradient Backgrounds', desc: 'Surfaces use subtle gradients from dark-steel to black for depth and premium look.' },
            ].map((principle, i) => (
              <div key={i} className="border border-[#39FF14]/20 rounded-lg p-4 bg-gradient-to-br from-[#0B0B0B] to-[#1A1A1A]">
                <p className="font-bold text-white mb-2">{principle.title}</p>
                <p className="text-[#8D98A5] text-sm">{principle.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
