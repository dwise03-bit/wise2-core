'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {

  const services = [
    {
      name: 'Dashboard',
      desc: 'Central hub for managing projects and workflows',
      icon: '📊',
      url: 'https://wise2.net/dashboard',
      devUrl: 'http://localhost:3002',
      status: 'active',
    },
    {
      name: 'Admin Panel',
      desc: 'System administration and user management',
      icon: '⚙️',
      url: 'https://wise2.net/admin',
      devUrl: 'http://localhost:3003',
      status: 'active',
    },
    {
      name: 'SoundLabs Studio',
      desc: 'Professional audio production and branding',
      icon: '🎵',
      url: 'https://wise2.net/studio',
      devUrl: 'http://localhost:3005',
      status: 'active',
    },
    {
      name: 'API Documentation',
      desc: 'Developer API reference and integration guides',
      icon: '📚',
      url: 'https://wise2.net/api/docs',
      devUrl: 'http://localhost:3010/api/docs',
      status: 'active',
    },
    {
      name: 'Live Stream Studio',
      desc: 'Real-time streaming production tools',
      icon: '📡',
      url: 'https://wise2.net/stream',
      devUrl: 'http://localhost:3006',
      status: 'active',
    },
    {
      name: 'Grafana Monitoring',
      desc: 'System health and performance metrics',
      icon: '📈',
      url: 'https://wise2.net/monitoring',
      devUrl: 'http://localhost:3100',
      status: 'active',
    },
  ];

  const modules = [
    {
      name: 'AI COMMAND CENTER',
      desc: 'Intelligent automation hub',
      icon: '🤖',
    },
    {
      name: 'SOUNDLAB',
      desc: 'Professional audio branding',
      icon: '🎵',
    },
    {
      name: 'LIVE STUDIO',
      desc: 'Livestream production suite',
      icon: '📡',
    },
    {
      name: 'DROP SHIPPING AI',
      desc: 'E-commerce automation',
      icon: '📦',
    },
    {
      name: 'CRM & CLIENTS',
      desc: 'Customer relationship hub',
      icon: '👥',
    },
    {
      name: 'ANALYTICS',
      desc: 'Real-time dashboards',
      icon: '📊',
    },
    {
      name: 'MARKETING SUITE',
      desc: 'Campaign management',
      icon: '📢',
    },
    {
      name: 'DEVELOPER API',
      desc: 'Powerful integrations',
      icon: '💻',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-black">W2</div>
            <div className="text-sm text-gray-400">WISE² COMMAND CENTER</div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-300 hover:text-blue-400">PRODUCTS</a>
            <a href="#" className="text-sm text-gray-300 hover:text-blue-400">SOLUTIONS</a>
            <a href="#" className="text-sm text-gray-300 hover:text-blue-400">PRICING</a>
            <a href="#" className="text-sm text-gray-300 hover:text-blue-400">RESOURCES</a>
            <a href="#" className="text-sm text-gray-300 hover:text-blue-400">COMPANY</a>
            <Link href="/auth/login" className="text-sm text-gray-300 hover:text-blue-400">LOGIN</Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-500">START FREE</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <div className="text-6xl font-black tracking-tighter mb-3" style={{ textShadow: '0 0 40px rgba(0, 85, 255, 0.3)' }}>
              ORGANIZED
              <br />
              CHAOS
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-6">COMMAND CENTER</div>
          </div>

          <p className="text-xl text-gray-300 mb-4 max-w-3xl mx-auto">
            The AI Operating System for Modern Business
          </p>

          <p className="text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Build, automate, and scale your business with advanced AI-powered platform. All your tools in one unified system designed to help you dominate your market.
          </p>

          <div className="flex gap-4 justify-center mb-12">
            <Link href="/auth/signup" className="px-8 py-4 bg-blue-600 text-white rounded font-bold hover:bg-blue-500 transition text-lg">
              START FREE TODAY
            </Link>
            <button className="px-8 py-4 border border-gray-600 text-gray-300 rounded font-bold hover:border-blue-400 hover:text-blue-400 transition text-lg">
              ▶ WATCH DEMO
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex justify-center items-center gap-4 text-sm text-gray-400">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600"></div>
              ))}
            </div>
            <span>Trusted by 10,000+ businesses worldwide</span>
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-16">ALL-IN-ONE BUSINESS OPERATING SYSTEM</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((mod) => (
              <div
                key={mod.name}
                className="p-6 border border-gray-700 rounded hover:border-blue-500 hover:bg-blue-500/5 transition cursor-pointer group"
              >
                <div className="text-3xl mb-3">{mod.icon}</div>
                <h3 className="font-bold text-sm mb-2 group-hover:text-blue-400 transition">{mod.name}</h3>
                <p className="text-xs text-gray-500">{mod.desc}</p>
                <div className="mt-4 text-xs text-blue-400 group-hover:translate-x-1 transition">Learn More →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-blue-950/20 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-black text-blue-400">99.99%</div>
              <p className="text-sm text-gray-400 mt-2">UPTIME</p>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-400">10M+</div>
              <p className="text-sm text-gray-400 mt-2">AI TASKS COMPLETED</p>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-400">500+</div>
              <p className="text-sm text-gray-400 mt-2">AUTOMATIONS</p>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-400">24/7</div>
              <p className="text-sm text-gray-400 mt-2">AI WORKFORCE</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Access Section */}
      <section className="py-24 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-black text-center mb-4">PLATFORM ACCESS</h2>
            <p className="text-center text-gray-400 text-sm">Connect to all WISE² services and tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <a
                key={service.name}
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-6 border border-gray-700 rounded hover:border-blue-500 hover:bg-blue-500/5 transition group cursor-pointer"
                title={`Dev: ${service.devUrl}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{service.icon}</div>
                  {service.status === 'active' && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-xs font-bold text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      LIVE
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm mb-2 group-hover:text-blue-400 transition">{service.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{service.desc}</p>
                <div className="flex items-center gap-2 text-xs text-blue-400 group-hover:translate-x-1 transition">
                  <span>Launch Service</span>
                  <span>→</span>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 p-6 bg-blue-950/30 border border-blue-900/50 rounded">
            <p className="text-xs text-gray-400 text-center">
              <span className="font-bold text-blue-400">Local Development:</span> Hover over any service card to see the localhost URL (port 3002-3100).
              Production links point to wise2.net. All services should return to this homepage when accessed locally from localhost:3000.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-5 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-sm mb-4">PRODUCTS</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-blue-400">AI Command Center</a></li>
                <li><a href="#" className="hover:text-blue-400">SoundLab</a></li>
                <li><a href="#" className="hover:text-blue-400">Live Studio</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">SOLUTIONS</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-blue-400">For Creators</a></li>
                <li><a href="#" className="hover:text-blue-400">For Agencies</a></li>
                <li><a href="#" className="hover:text-blue-400">For Developers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">RESOURCES</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-blue-400">Docs</a></li>
                <li><a href="#" className="hover:text-blue-400">Tutorials</a></li>
                <li><a href="#" className="hover:text-blue-400">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-4">COMPANY</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-blue-400">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400">Contact</a></li>
              </ul>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black mb-2">W2</div>
              <p className="text-xs text-gray-500">WISE²</p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex justify-between items-center text-xs text-gray-500">
            <p>© 2025 Wise Defense LLC. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-blue-400">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400">Terms of Service</a>
            </div>
          </div>

          <div className="text-center text-xs text-gray-600 mt-8">
            ORGANIZED CHAOS COMMAND CENTER
          </div>
        </div>
      </footer>
    </div>
  );
}
