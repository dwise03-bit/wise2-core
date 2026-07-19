'use client';

import Link from 'next/link';
import { Navigation, Footer } from '@/components/wise';

export default function HeroesPage() {
  const heroes = [
    {
      id: 1,
      name: 'Daniel Wise',
      title: 'Founder & Visionary',
      role: 'Visionary, Strategy',
      vision: 'Organized Chaos is the foundation of innovation',
      bio: 'Visionary founder building the next generation of enterprise AI operating systems.',
      color: 'lime-400',
    },
    {
      id: 2,
      name: 'Darren',
      title: 'Co-Founder & CTO',
      role: 'Technical Leadership',
      vision: 'Build it right, scale it fast',
      bio: 'Technical leader architecting enterprise-scale solutions for creative entrepreneurs.',
      color: 'cyan-400',
    },
  ];

  return (
    <>
      <Navigation />
      <main className="bg-black min-h-screen pt-20">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-black mb-6 text-lime-400" style={{ fontFamily: '"Beyond The Mountains", sans-serif' }}>
              Meet The Visionaries
            </h1>
            <p className="text-gray-400 mb-4 font-mono text-lg tracking-wider">
              Leadership driving WISE² Enterprise forward
            </p>
            <div className="h-px bg-gradient-to-r from-transparent via-lime-400/30 to-transparent max-w-md mx-auto"></div>
          </div>

          {/* Heroes Grid */}
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {heroes.map((hero, index) => (
              <div
                key={hero.id}
                className="group relative"
                style={{
                  animation: `scale-entrance 0.6s ease-out ${index * 0.2}s backwards`,
                }}
              >
                {/* Glow Background */}
                <div className="absolute -inset-1 bg-gradient-to-r from-lime-400/20 to-cyan-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Card */}
                <div className="relative bg-gray-900/50 border border-gray-800 rounded-2xl p-8 backdrop-blur-xl hover:border-lime-400/50 transition-all duration-300">
                  {/* Hero Image Placeholder */}
                  <div className="mb-8 relative">
                    <div className="w-full aspect-square bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border border-gray-700 flex items-center justify-center overflow-hidden">
                      {/* Placeholder Avatar - Professional */}
                      <div className="text-6xl text-lime-400/30">
                        {hero.id === 1 ? '👤' : '🏗️'}
                      </div>
                    </div>
                    {/* Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="px-4 py-2 bg-lime-400/10 border border-lime-400/50 rounded-full text-lime-400 text-xs font-mono font-bold tracking-widest">
                        {hero.id === 1 ? 'FOUNDER' : 'CO-FOUNDER'}
                      </div>
                    </div>
                  </div>

                  {/* Hero Info */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Rajdhani' }}>
                        {hero.name}
                      </h2>
                      <p className="text-lime-400 font-mono text-sm tracking-wider">
                        {hero.title}
                      </p>
                    </div>

                    {/* Role Tag */}
                    <div className="flex gap-2">
                      {hero.role.split(',').map((r, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-gray-300 text-xs font-mono">
                          {r.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Vision Statement */}
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-gray-300 italic text-sm mb-3">
                        "{hero.vision}"
                      </p>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {hero.bio}
                      </p>
                    </div>

                    {/* Call to Action */}
                    <div className="pt-6 border-t border-gray-700">
                      <div className="flex gap-3">
                        <button className="flex-1 px-4 py-2 bg-lime-400/10 border border-lime-400/50 text-lime-400 rounded-lg hover:bg-lime-400/20 transition-all text-sm font-mono font-bold">
                          Profile
                        </button>
                        <button className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-all text-sm font-mono font-bold">
                          LinkedIn
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mission Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-lime-400/10 to-transparent border border-lime-400/30 rounded-2xl p-12 text-center">
              <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Rajdhani' }}>
                Our Mission
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                We're building the WISE² Enterprise platform to empower creators, entrepreneurs, and businesses with organized chaos as our foundation. Every feature, every decision, and every innovation is driven by our commitment to excellence and our vision of transforming how ideas become reality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/about"
                  className="px-8 py-3 bg-lime-400 text-black font-bold rounded-lg hover:bg-lime-300 transition-all duration-300 hover:scale-105"
                >
                  Learn About WISE²
                </Link>
                <Link
                  href="/contact"
                  className="px-8 py-3 border border-lime-400/50 text-lime-400 font-bold rounded-lg hover:bg-lime-400/10 transition-all duration-300"
                >
                  Get In Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
