import { Navigation, Footer } from '@/components/wise';
import Image from 'next/image';

export default function PoweredBusinessesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300 backdrop-blur mb-8">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            Powered by WISE²
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            POWERED <span className="text-[#0094FF]">BUSINESSES</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Three distinct brands. One unified vision. Equal. Powered. Unstoppable.
          </p>
          <p className="text-sm font-mono text-gray-500">BUILDING EMPIRES. CHANGING CULTURE.</p>
        </div>
      </section>

      {/* Three Pillars Grid */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* PIFF CITY - Purple Pillar */}
          <a href="/piff-city" className="group">
            <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-purple-900/30 to-transparent border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 h-full hover:shadow-xl hover:shadow-purple-500/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(163,60,255,0.15),transparent_50%)]" />
              <div className="relative z-10">
                <div className="w-16 h-16 mb-4 relative">
                  <Image
                    src="/images/piff-city-rabbit.png"
                    alt="PIFF CITY Logo"
                    width={64}
                    height={64}
                    className="object-cover rounded"
                  />
                </div>
                <h2 className="text-3xl font-black text-white mb-3">PIFF CITY</h2>
                <p className="text-purple-300 font-bold mb-3">CULTURE. CREATIVITY. CONSCIOUSNESS.</p>
                <p className="text-gray-400 text-sm mb-6">
                  Where culture meets commerce. Apparel, media, events, and music converge to create trend-setting experiences that resonate globally.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>👕 Apparel & Fashion</div>
                  <div>📸 Media & Content</div>
                  <div>🎭 Events & Experiences</div>
                  <div>🎵 Music & Entertainment</div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-purple-400 font-bold group-hover:gap-4 transition-all">
                  Explore <span>→</span>
                </div>
              </div>
            </div>
          </a>

          {/* WISE² - Blue Pillar (Center) */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(0,148,255,0.2),rgba(0,120,212,0.1))] blur-xl opacity-50" />
            <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-blue-900/40 to-transparent border-2 border-blue-500/50 h-full">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(0,148,255,0.2),transparent_50%)]" />
              <div className="relative z-10">
                <div className="text-5xl font-black text-blue-400 mb-4">⚙️</div>
                <h2 className="text-3xl font-black text-white mb-3">WISE²</h2>
                <p className="text-blue-300 font-bold mb-3">THE PARENT PLATFORM</p>
                <p className="text-gray-300 text-sm mb-6">
                  The unified command center that powers everything. Cloud infrastructure, AI agents, and enterprise tools unified into one synchronized experience.
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <div>☁️ Cloud Infrastructure</div>
                  <div>🤖 AI Agents & Automation</div>
                  <div>📊 Analytics & Insights</div>
                  <div>🔗 Integration Platform</div>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-blue-300 font-bold text-sm">COMMAND CENTER FOR EVERYTHING</p>
                </div>
              </div>
            </div>
          </div>

          {/* WISE SHINE - Gold Pillar */}
          <a href="/wise-shine" className="group">
            <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-yellow-900/30 to-transparent border border-yellow-500/30 hover:border-yellow-500/50 transition-all duration-300 h-full hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(242,182,50,0.15),transparent_50%)]" />
              <div className="relative z-10">
                <div className="text-5xl font-black text-yellow-400 mb-4">✨</div>
                <h2 className="text-3xl font-black text-white mb-3">WISE SHINE</h2>
                <p className="text-yellow-300 font-bold mb-3">PREMIUM. EXCLUSIVE. LUMINOUS.</p>
                <p className="text-gray-400 text-sm mb-6">
                  Luxury experiences and exclusive offerings. Premium services, VIP access, and high-end solutions that shine brighter than the rest.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>💎 Premium Services</div>
                  <div>🌟 Exclusive Access</div>
                  <div>👑 VIP Experiences</div>
                  <div>🏆 Elite Community</div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-yellow-400 font-bold group-hover:gap-4 transition-all">
                  Explore <span>→</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-12">CORE VALUES</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '⚡', label: 'EQUAL', desc: 'Three distinct voices. One unified vision.' },
              { icon: '🚀', label: 'POWERED', desc: 'Technology and innovation at every level.' },
              { icon: '🏆', label: 'UNSTOPPABLE', desc: 'Relentless pursuit of excellence.' },
              { icon: '🌍', label: 'GLOBAL', desc: 'Impact that extends worldwide.' },
            ].map((value) => (
              <div key={value.label} className="p-6 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-blue-500/30 transition-all">
                <div className="text-3xl mb-3">{value.icon}</div>
                <h3 className="font-bold text-white mb-2">{value.label}</h3>
                <p className="text-sm text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Movement?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Connect with one of our powered businesses and become part of the revolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/prospects/new" className="px-8 py-3 bg-[#0094FF] text-white rounded-lg font-bold hover:bg-blue-600 transition-all">
              Get Started
            </a>
            <a href="/" className="px-8 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg font-bold hover:border-blue-500 transition-all">
              Back to Home
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
