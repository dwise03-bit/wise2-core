import { Navigation, Footer } from '@/components/wise';
import Link from 'next/link';

export default function WiseshinePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm text-yellow-300 backdrop-blur mb-8">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                Powered by WISE²
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                <span className="text-yellow-400">WISE</span> <span className="text-yellow-400">SHINE</span>
              </h1>
              <p className="text-2xl font-bold text-yellow-300 mb-6">
                PREMIUM. EXCLUSIVE. LUMINOUS.
              </p>
              <p className="text-xl text-gray-400 mb-8">
                Where luxury meets innovation. Premium services and exclusive experiences designed for those who demand excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/prospects/new" className="px-6 py-3 bg-yellow-600 text-black rounded-lg font-bold hover:bg-yellow-500 transition-all">
                  Access WISE SHINE
                </Link>
                <Link href="/powered-businesses" className="px-6 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg font-bold hover:border-yellow-500 transition-all">
                  Back
                </Link>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden border border-yellow-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/40 via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center text-6xl">✨</div>
            </div>
          </div>
        </div>
      </section>

      {/* What is WISE SHINE */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">WHAT IS WISE SHINE?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-900/20 to-transparent border border-yellow-500/30">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">👑 The Premium Experience</h3>
              <p className="text-gray-300 leading-relaxed">
                WISE SHINE is our premium tier offering. Exclusive access to top-tier services, priority support, and VIP experiences. When you choose WISE SHINE, you're not just getting a service—you're joining an elite community.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-yellow-900/20 to-transparent border border-yellow-500/30">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">💎 Our Commitment</h3>
              <p className="text-gray-300 leading-relaxed">
                Excellence at every touchpoint. From personalized service to exclusive content, we've designed WISE SHINE for those who refuse to settle for anything less than extraordinary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Services */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">PREMIUM SERVICES</h2>
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
              <div key={service.title} className="p-6 rounded-xl bg-gray-900/50 border border-yellow-500/20 hover:border-yellow-500/50 transition-all">
                <div className="text-4xl mb-3">{service.emoji}</div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2">{service.title}</h3>
                <p className="text-sm text-gray-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-20 px-6 bg-yellow-900/10 border-t border-yellow-500/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">MEMBERSHIP TIERS</h2>
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
                    ? 'bg-gradient-to-br from-yellow-900/30 to-transparent border-yellow-500/50 ring-2 ring-yellow-500/30'
                    : 'bg-gray-900/50 border-gray-700 hover:border-yellow-500/30'
                }`}
              >
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">{tier.tier}</h3>
                <p className="text-3xl font-black mb-6">
                  {tier.price}
                  {tier.price !== 'Custom' && <span className="text-sm text-gray-400">/month</span>}
                </p>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="text-gray-300 flex items-center gap-2">
                      <span className="text-yellow-400">✓</span>
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready for the Premium Experience?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join WISE SHINE and experience excellence like never before.
          </p>
          <Link href="/prospects/new" className="px-8 py-4 bg-yellow-600 text-black rounded-lg font-bold hover:bg-yellow-500 transition-all inline-block">
            Join WISE SHINE
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
