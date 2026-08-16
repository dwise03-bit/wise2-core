import Link from 'next/link';
import { PublicFooter } from '@/components/navigation';

export default function WiseshinePage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#C7FF2E]/30 bg-[#C7FF2E]/10 px-4 py-2 text-sm text-[#C7FF2E] backdrop-blur mb-8">
                <span className="w-2 h-2 bg-[#C7FF2E] rounded-full"></span>
                Powered by WISE²
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-[0.08em] mb-6">
                <span className="text-[#C7FF2E]">WISE</span> <span className="text-white">SHINE</span>
              </h1>
              <p className="text-2xl font-bold text-[#C7FF2E] mb-6">
                PREMIUM. SHARP. LEGENDARY.
              </p>
              <p className="text-xl text-[#B7BDC8] mb-8">
                The premium detailing arm of WISE². Built for finish, first impressions, and the kind of polish that signals a higher standard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/prospects/new" className="px-6 py-3 bg-[#C7FF2E] text-black rounded-lg font-bold hover:brightness-110 transition-all">
                  Access WISE SHINE
                </Link>
                <Link href="/powered-businesses" className="px-6 py-3 bg-white/[0.04] border border-white/10 text-white rounded-lg font-bold hover:border-[#C7FF2E]/40 transition-all">
                  Back
                </Link>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden border border-[#C7FF2E]/30 bg-[radial-gradient(circle_at_center,rgba(199,255,46,0.15),transparent_60%)]">
              <div className="absolute inset-0 flex items-center justify-center text-6xl">✨</div>
            </div>
          </div>
        </div>
      </section>

      {/* What is WISE SHINE */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center uppercase tracking-[0.08em]">What is Wise Shine?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white/[0.04] border border-[#C7FF2E]/20">
              <h3 className="text-2xl font-bold text-[#C7FF2E] mb-4">👑 The Premium Experience</h3>
              <p className="text-[#B7BDC8] leading-relaxed">
                Wise Shine is built for clients who want meticulous work and a result that reads expensive before anyone says a word.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/[0.04] border border-[#C7FF2E]/20">
              <h3 className="text-2xl font-bold text-[#C7FF2E] mb-4">💎 Our Commitment</h3>
              <p className="text-[#B7BDC8] leading-relaxed">
                Excellence at every touchpoint. Clean execution, clear standards, and a finish that strengthens the whole WISE² story.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Services */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center uppercase tracking-[0.08em]">Premium Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '🎯',
                title: 'PRIORITY SUPPORT',
                desc: '24/7 dedicated support team at your service.',
              },
              {
                emoji: '🚀',
                title: 'EARLY ACCESS',
                desc: 'First to experience new features and products.',
              },
              {
                emoji: '📈',
                title: 'ANALYTICS',
                desc: 'Advanced insights and custom reporting.',
              },
              {
                emoji: '🌟',
                title: 'CONCIERGE',
                desc: 'White-glove service tailored to your needs.',
              },
            ].map((service) => (
              <div key={service.title} className="p-6 rounded-xl bg-white/[0.04] border border-[#C7FF2E]/20 hover:border-[#C7FF2E]/50 transition-all">
                <div className="text-4xl mb-3">{service.emoji}</div>
                <h3 className="text-lg font-bold text-[#C7FF2E] mb-2">{service.title}</h3>
                <p className="text-sm text-[#B7BDC8]">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-20 px-6 bg-white/[0.02] border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center uppercase tracking-[0.08em]">Membership Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                tier: 'SILVER',
                price: '$99',
                features: ['Priority Support', 'Early Access', 'Community Access', 'Monthly Events'],
              },
              {
                tier: 'GOLD',
                price: '$299',
                features: ['All Silver Benefits', 'Advanced Analytics', 'Concierge Service', 'Exclusive Content'],
                highlight: true,
              },
              {
                tier: 'PLATINUM',
                price: 'Custom',
                features: ['All Gold Benefits', 'Custom Solutions', 'Strategic Consulting', 'VIP Events'],
              },
            ].map((tier) => (
              <div
                key={tier.tier}
                className={`p-8 rounded-2xl border transition-all ${
                tier.highlight
                    ? 'bg-gradient-to-br from-[#C7FF2E]/15 to-transparent border-[#C7FF2E]/50 ring-2 ring-[#C7FF2E]/20'
                    : 'bg-white/[0.04] border-white/10 hover:border-[#C7FF2E]/30'
                }`}
              >
                <h3 className="text-2xl font-bold text-[#C7FF2E] mb-2">{tier.tier}</h3>
                <p className="text-3xl font-black mb-6">
                  {tier.price}
                  {tier.price !== 'Custom' && <span className="text-sm text-gray-400">/month</span>}
                </p>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="text-[#B7BDC8] flex items-center gap-2">
                      <span className="text-[#C7FF2E]">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">CORE VALUES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '💎', label: 'EXCELLENCE', desc: 'Uncompromising quality in everything we do.' },
              { icon: '🌟', label: 'EXCLUSIVITY', desc: 'Curated experiences for the discerning.' },
              { icon: '🏆', label: 'PRESTIGE', desc: 'Luxury that speaks for itself.' },
            ].map((value) => (
              <div key={value.label} className="text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-yellow-300 mb-2">{value.label}</h3>
                <p className="text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-[0.08em]">Ready for the premium experience?</h2>
          <p className="text-[#B7BDC8] mb-8 text-lg">
            Join Wise Shine and bring a higher finish to the WISE² brand family.
          </p>
          <Link href="/prospects/new" className="px-8 py-4 bg-[#C7FF2E] text-black rounded-lg font-bold hover:brightness-110 transition-all inline-block">
            Join WISE SHINE
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
