'use client';

import Link from 'next/link';
import { useState } from 'react';

export function MasterNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const products = [
    { name: 'Discord Bot Suite', href: '/systems/discord', icon: '🤖' },
    { name: 'WISE² IMP', href: '/systems/imp', icon: '📱' },
    { name: 'K10 Hardware', href: '/systems/hardware', icon: '🖥️' },
    { name: 'Mobile Apps', href: '/systems/mobile', icon: '📲' },
    { name: 'AI Router', href: '/systems/ai-router', icon: '⚡' },
    { name: 'Wearables', href: '/systems/wearables', icon: '👓' },
  ];

  const services = [
    { name: 'Field Tech', href: '/contractor', icon: '🔧' },
    { name: 'Sound Labs', href: '/soundlab', icon: '🎚️' },
    { name: 'Creative Studio', href: '/studio', icon: '🎨' },
    { name: 'App Development', href: '/systems/app-development', icon: '📲' },
    { name: 'Digital Twin', href: '/services/digital-twin/start', icon: '🌐' },
    { name: 'WISE Defense', href: '/wise-defense/dashboard', icon: '🛡️' },
  ];

  const resources = [
    { name: 'iOS Apps', href: '/apps', icon: '📱' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'API Docs', href: '/api-docs' },
    { name: 'Contact', href: '/contact' },
    { name: 'About', href: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-neon-green">W</span>
          <span className="text-sm font-semibold">WISE²</span>
        </Link>

        <div className="hidden md:flex gap-8">
          {/* Products */}
          <div className="relative group">
            <button className="text-white hover:text-neon-green transition">
              Products ▼
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-gray-900 border border-gray-700 rounded opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
              {products.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="block px-4 py-2 text-sm hover:bg-gray-800 hover:text-neon-green"
                >
                  {p.icon} {p.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="relative group">
            <button className="text-white hover:text-neon-green transition">
              Services ▼
            </button>
            <div className="absolute left-0 mt-0 w-48 bg-gray-900 border border-gray-700 rounded opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
              {services.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="block px-4 py-2 text-sm hover:bg-gray-800 hover:text-neon-green"
                >
                  {s.icon} {s.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          {resources.map((r) => (
            <Link key={r.href} href={r.href} className="text-white hover:text-neon-green transition text-sm">
              {r.icon ? `${r.icon} ${r.name}` : r.name}
            </Link>
          ))}
        </div>

        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-white hover:text-neon-green transition">
            Sign In
          </Link>
          <Link href="/pricing" className="px-4 py-2 bg-neon-green text-black rounded font-bold hover:bg-opacity-90 transition">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
