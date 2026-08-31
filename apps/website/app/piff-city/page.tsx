import { PublicFooter } from '@/components/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function PiffCityPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B36BFF]/30 bg-[#B36BFF]/10 px-4 py-2 text-sm text-[#B36BFF] backdrop-blur mb-8">
                <span className="w-2 h-2 bg-[#B36BFF] rounded-full"></span>
                Powered by WISE²
              </div>
              <h1 className="text-5xl md:text-6xl font-black uppercase tracking-[0.08em] mb-6">
                <span className="text-[#B36BFF]">PIFF</span> <span className="text-white">CITY</span>
              </h1>
              <p className="text-2xl font-bold text-[#B36BFF] mb-6">
                CULTURE. SOUND. SIGNAL.
              </p>
              <p className="text-xl text-[#B7BDC8] mb-8">
                The creative media arm of WISE². A studio for sound, visuals, and culture-making work that moves like a record label and looks like a poster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/prospects/new" className="px-6 py-3 bg-[#B36BFF] text-white rounded-lg font-bold hover:brightness-110 transition-all">
                  Join PIFF CITY
                </Link>
                <Link href="/powered-businesses" className="px-6 py-3 bg-white/[0.04] border border-white/10 text-white rounded-lg font-bold hover:border-[#B36BFF]/40 transition-all">
                  Back
                </Link>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden border-2 border-[#B36BFF]/50">
              <div className="absolute inset-0 bg-gradient-to-br from-[#B36BFF]/30 via-transparent to-transparent z-10" />
              <Image
                src="/images/piff-city-rabbit.png"
                alt="PIFF CITY - Steampunk Rabbit Logo"
                fill
                className="object-contain object-center p-4"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is PIFF CITY */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center uppercase tracking-[0.08em]">What is Piff City?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-white/[0.04] border border-[#B36BFF]/20">
              <h3 className="text-2xl font-bold text-[#B36BFF] mb-4">🎭 Our Mission</h3>
              <p className="text-[#B7BDC8] leading-relaxed">
                Piff City is the culture engine inside WISE². We make creative work that feels premium, sharp, and built for replay value.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-white/[0.04] border border-[#B36BFF]/20">
              <h3 className="text-2xl font-bold text-[#B36BFF] mb-4">🌍 Our Reach</h3>
              <p className="text-[#B7BDC8] leading-relaxed">
                Operating with Atlanta energy and global ambition. Piff City creates media and experiences that make the whole WISE² ecosystem feel alive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Divisions */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center uppercase tracking-[0.08em]">Our Divisions</h2>
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
              <div key={division.title} className="p-6 rounded-xl bg-white/[0.04] border border-[#B36BFF]/20 hover:border-[#B36BFF]/50 transition-all">
                <div className="text-4xl mb-3">{division.emoji}</div>
                <h3 className="text-lg font-bold text-[#B36BFF] mb-2">{division.title}</h3>
                <p className="text-sm text-[#B7BDC8]">{division.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-white/[0.02] border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-12 text-center uppercase tracking-[0.08em]">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🎨', label: 'AUTHENTICITY', desc: 'Keep it real. Always.' },
              { icon: '🚀', label: 'INNOVATION', desc: 'Push boundaries relentlessly.' },
              { icon: '🤝', label: 'COMMUNITY', desc: 'Strong together. Always.' },
            ].map((value) => (
              <div key={value.label} className="text-center">
                <div className="text-5xl mb-4">{value.icon}</div>
                <h3 className="text-2xl font-bold text-[#B36BFF] mb-2">{value.label}</h3>
                <p className="text-[#B7BDC8]">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 uppercase tracking-[0.08em]">Ready to Join the Culture?</h2>
          <p className="text-[#B7BDC8] mb-8 text-lg">
            Step into Piff City and help build the creative side of the WISE² legacy.
          </p>
          <Link href="/prospects/new" className="px-8 py-4 bg-[#B36BFF] text-white rounded-lg font-bold hover:brightness-110 transition-all inline-block">
            Start Your Journey
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
