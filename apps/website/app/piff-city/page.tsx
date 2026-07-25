import { Navigation, Footer } from '@/components/wise';
import Link from 'next/link';
import Image from 'next/image';

export default function PiffCityPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 backdrop-blur mb-8">
                <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                Powered by WISE²
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
                <span className="text-purple-400">PIFF</span> <span className="text-purple-400">CITY</span>
              </h1>
              <p className="text-2xl font-bold text-purple-300 mb-6">
                CULTURE. CREATIVITY. CONSCIOUSNESS.
              </p>
              <p className="text-xl text-gray-400 mb-8">
                Where music meets fashion. Where culture meets commerce. Where creativity becomes currency.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/prospects/new" className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all">
                  Join PIFF CITY
                </Link>
                <Link href="/powered-businesses" className="px-6 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg font-bold hover:border-purple-500 transition-all">
                  Back
                </Link>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden border-2 border-purple-500/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-transparent to-transparent z-10" />
              <Image
                src="/images/piff-city-rabbit.png"
                alt="PIFF CITY - Steampunk Rabbit Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is PIFF CITY */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">WHAT IS PIFF CITY?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">🎭 Our Mission</h3>
              <p className="text-gray-300 leading-relaxed">
                PIFF CITY is more than a brand—it's a movement. We're building a culture-first ecosystem where creativity isn't just encouraged, it's celebrated. From apparel to music to experiences, every product tells a story.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-transparent border border-purple-500/30">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">🌍 Our Reach</h3>
              <p className="text-gray-300 leading-relaxed">
                Operating globally with local relevance. PIFF CITY taps into global culture while maintaining authentic connections to communities. We don't just sell products—we create experiences that resonate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Divisions */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">OUR DIVISIONS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                emoji: '👕',
                title: 'APPAREL',
                desc: 'Premium fashion and streetwear that defines a generation.',
              },
              {
                emoji: '📸',
                title: 'MEDIA',
                desc: 'Content creation and visual storytelling at scale.',
              },
              {
                emoji: '🎭',
                title: 'EVENTS',
                desc: 'Immersive experiences that bring communities together.',
              },
              {
                emoji: '🎵',
                title: 'MUSIC',
                desc: 'Artist development, production, and distribution.',
              },
            ].map((division) => (
              <div key={division.title} className="p-6 rounded-xl bg-gray-900/50 border border-purple-500/20 hover:border-purple-500/50 transition-all">
                <div className="text-4xl mb-3">{division.emoji}</div>
                <h3 className="text-lg font-bold text-purple-400 mb-2">{division.title}</h3>
                <p className="text-sm text-gray-400">{division.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-purple-900/10 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center">CORE VALUES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎨', label: 'AUTHENTICITY', desc: 'Keep it real. Always.' },
              { icon: '🚀', label: 'INNOVATION', desc: 'Push boundaries relentlessly.' },
              { icon: '🤝', label: 'COMMUNITY', desc: 'Strong together. Always.' },
            ].map((value) => (
              <div key={value.label} className="text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-purple-300 mb-2">{value.label}</h3>
                <p className="text-gray-400">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Culture?</h2>
          <p className="text-gray-400 mb-8 text-lg">
            Become part of PIFF CITY and help shape the future of culture and creativity.
          </p>
          <Link href="/prospects/new" className="px-8 py-4 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all inline-block">
            Start Your Journey
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
