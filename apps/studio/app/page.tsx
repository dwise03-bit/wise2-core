'use client';

import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ===== HEADER/NAVIGATION ===== */}
      <header className="sticky top-0 z-50 border-b border-blue-500/30 bg-black/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center font-bold text-black">
              W2
            </div>
            <span className="font-bold text-xl hidden sm:inline">WISE²</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="/live-studio" className="hover:text-blue-400 transition">LIVE STUDIO</a>
            <a href="/live-streaming" className="hover:text-blue-400 transition">LIVE STREAMING</a>
            <a href="#products" className="hover:text-blue-400 transition">PRODUCTS</a>
            <a href="#pricing" className="hover:text-blue-400 transition">PRICING</a>
            <a href="#company" className="hover:text-blue-400 transition">COMPANY</a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <a href="/auth" className="px-6 py-2 text-sm font-semibold border border-blue-500/50 hover:bg-blue-600/10 transition rounded">
              LOGIN
            </a>
            <a href="/auth" className="px-6 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-black transition rounded">
              START FREE
            </a>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-black to-blue-950/40 opacity-50" />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <div>
            <div className="inline-block px-4 py-2 bg-blue-600/10 border border-blue-500/50 rounded-full text-xs font-semibold text-blue-400 mb-6">
              ✨ WELCOME TO WISE²
            </div>

            <h1 className="text-6xl lg:text-7xl font-black mb-6 leading-tight">
              ORGANIZED
              <br />
              CHAOS
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                COMMAND CENTER
              </span>
            </h1>

            <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed">
              The all-in-one AI operating system for businesses, creators, and entrepreneurs ready to dominate.
            </p>

            {/* Features Row */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">✦</span>
                <span className="text-sm font-semibold">AI POWERED AUTOMATION</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">✦</span>
                <span className="text-sm font-semibold">REAL-TIME ANALYTICS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">✦</span>
                <span className="text-sm font-semibold">BUILT FOR SCALE</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">✦</span>
                <span className="text-sm font-semibold">SECURE BY DESIGN</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a href="/auth" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-black font-bold rounded transition transform hover:scale-105 flex items-center justify-center gap-2">
                START FREE TODAY
                <span>→</span>
              </a>
              <button className="px-8 py-4 border-2 border-blue-500/50 hover:bg-blue-600/10 font-bold rounded transition flex items-center justify-center gap-2">
                <span>▶</span>
                WATCH DEMO
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">★</span>
                ))}
              </div>
              <div className="border-l border-gray-600 pl-4">
                <p className="text-sm font-semibold">Trusted by 10,000+ businesses worldwide</p>
              </div>
            </div>
          </div>

          {/* Right Side - Command Center Dashboard */}
          <div className="relative hidden lg:block">
            <div className="aspect-square bg-gradient-to-br from-blue-950/50 to-blue-950/50 rounded-2xl border border-cyan-500/30 p-6 backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full" />
                  <span className="text-xs font-bold text-blue-400">W2 COMMAND CENTER</span>
                </div>
                <div className="flex gap-2">
                  <button className="w-4 h-4 bg-blue-600/20 rounded hover:bg-blue-600/40 transition" />
                  <button className="w-4 h-4 bg-blue-600/20 rounded hover:bg-blue-600/40 transition" />
                  <button className="w-4 h-4 bg-blue-600/20 rounded hover:bg-blue-600/40 transition" />
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="space-y-4">
                {/* Revenue Card */}
                <div className="bg-black/50 border border-blue-500/30 rounded p-4 backdrop-blur">
                  <p className="text-xs text-gray-400 mb-1">REVENUE TODAY</p>
                  <p className="text-3xl font-bold text-blue-400">$24,583.00</p>
                  <p className="text-xs text-green-400 mt-1">↑ 24.5% from yesterday</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/50 border border-blue-500/30 rounded p-3 backdrop-blur">
                    <p className="text-xs text-gray-400">ACTIVE AUTOMATIONS</p>
                    <p className="text-xl font-bold text-blue-400">127</p>
                  </div>
                  <div className="bg-black/50 border border-blue-500/30 rounded p-3 backdrop-blur">
                    <p className="text-xs text-gray-400">AI TASKS COMPLETED</p>
                    <p className="text-xl font-bold text-blue-400">3,245</p>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-black/50 border border-blue-500/30 rounded p-4 backdrop-blur">
                  <p className="text-xs text-gray-400 mb-2">SYSTEM STATUS</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-400">● All Systems Operational</span>
                      <span className="text-blue-400">99.99% UPTIME</span>
                    </div>
                    <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-r from-green-500 to-cyan-500" />
                    </div>
                  </div>
                </div>

                {/* Footer Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs border-t border-blue-500/30 pt-3">
                  <div>
                    <p className="text-gray-400">TOTAL USERS</p>
                    <p className="font-bold text-blue-400">3,240 +24 today</p>
                  </div>
                  <div>
                    <p className="text-gray-400">SERVER LOAD</p>
                    <p className="font-bold text-blue-400">32%</p>
                  </div>
                </div>
              </div>

              {/* AI Assistant Card */}
              <div className="absolute -right-8 -bottom-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg p-4 w-48 shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
                    🤖
                  </div>
                  <div className="text-sm font-semibold">AI ASSISTANT</div>
                </div>
                <p className="text-xs text-blue-100">Good morning, Daniel! All systems ready. What would you like to automate today?</p>
                <button className="mt-3 w-full py-2 bg-blue-900/30 hover:bg-blue-900/50 rounded text-xs font-semibold transition">
                  OPEN AI COMMAND
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID (4 items) ===== */}
      <section className="py-20 px-6 bg-gradient-to-b from-black via-blue-950/20 to-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'AI POWERED AUTOMATION', icon: '⚡' },
            { title: 'REAL-TIME ANALYTICS', icon: '📊' },
            { title: 'BUILT FOR SCALE', icon: '📈' },
            { title: 'SECURE BY DESIGN', icon: '🔒' },
          ].map((feature, i) => (
            <div key={i} className="group">
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/10 border border-blue-500/30 rounded-lg p-6 backdrop-blur hover:border-blue-500/50 transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg group-hover:text-blue-400 transition">{feature.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRODUCT SHOWCASE GRID ===== */}
      <section id="products" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black mb-12 text-center">ALL-IN-ONE BUSINESS OPERATING SYSTEM</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'AI COMMAND CENTER', description: 'AI agents, automation, and intelligent workflows', icon: '🤖', link: '#' },
              { title: 'SOUNDLAB', description: 'AI music generation, mastering, and audio tools', icon: '🎵', link: '#' },
              { title: 'LIVE STUDIO', description: 'Live streaming, podcasting, and video production', icon: '📹', link: '/live-studio' },
              { title: 'DROP SHIPPING AI', description: 'AI-powered store builder and fulfillment', icon: '📦', link: '#' },
              { title: 'CRM & CLIENTS', description: 'Manage customers, leads, and relationships', icon: '👥', link: '#' },
              { title: 'ANALYTICS', description: 'Real-time analytics and custom dashboards', icon: '📈', link: '#' },
              { title: 'MARKETING SUITE', description: 'Viral content, ads, and growth tools', icon: '📢', link: '#' },
              { title: 'DEVELOPER API', description: 'Powerful API and developer platform', icon: '</>', link: '#' },
            ].map((product, i) => (
              <a key={i} href={product.link} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition blur" />
                <div className="relative bg-black/50 border border-blue-500/30 rounded-lg p-6 backdrop-blur hover:border-blue-500/50 transition h-full">
                  <div className="text-4xl mb-4">{product.icon}</div>
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-2 group-hover:text-blue-400 transition">{product.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{product.description}</p>
                  <span className="text-xs font-bold text-blue-400 hover:text-cyan-300 transition flex items-center gap-1">
                    Learn More →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-20 px-6 bg-gradient-to-b from-black via-cyan-950/20 to-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: '99.99%', value: 'UPTIME' },
            { label: '10M+', value: 'AI TASKS COMPLETED' },
            { label: '500+', value: 'AUTOMATIONS' },
            { label: '24/7', value: 'AI WORKFORCE' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2">
                {stat.label}
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-gray-400">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-4">TRUSTED BY INNOVATORS</h2>
          <p className="text-center text-gray-400 mb-12">Leading companies and creators trust WISE²</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                quote: '"WISE² replaced 6 different subscriptions. Everything we need in one powerful platform."',
                author: 'Marcus Johnson',
                title: 'CEO, Elevate Brands',
                rating: 5,
              },
              {
                quote: '"The automation and AI features have saved us 30+ hours per week. Game changer for our business."',
                author: 'Sarah Chen',
                title: 'Founder, Luxe Digital',
                rating: 5,
              },
              {
                quote: '"The Organized Chaos interface gives us enterprise power without the enterprise complexity."',
                author: 'David Rodriguez',
                title: 'CTO, Next Level Agency',
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-gradient-to-br from-blue-950/40 to-blue-950/40 border border-blue-500/30 rounded-lg p-6 backdrop-blur hover:border-blue-500/50 transition">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">{testimonial.quote}</p>
                <p className="font-bold text-sm">{testimonial.author}</p>
                <p className="text-xs text-gray-400">{testimonial.title}</p>
              </div>
            ))}
          </div>

          {/* Company Logos */}
          <div className="border-t border-blue-500/30 pt-12">
            <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-8">Used by leading companies</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
              {['ELEVATE', 'NextLevel', 'LUXE', 'HUSTLE', 'VISIONARY', 'CHAOS'].map((logo, i) => (
                <div key={i} className="text-gray-600 font-bold text-sm hover:text-blue-400 transition">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section id="pricing" className="py-20 px-6 bg-gradient-to-b from-black via-blue-950/20 to-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-4">SIMPLE PRICING, POWERFUL OPTIONS.</h2>
          <p className="text-center text-gray-400 mb-12">Choose the plan that's right for you</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'STARTER',
                price: '$29',
                popular: false,
                features: ['AI Assistant', 'Basic Automations', 'Dashboard Access', 'Community Support'],
              },
              {
                name: 'PROFESSIONAL',
                price: '$99',
                popular: true,
                tag: 'MOST POPULAR',
                features: ['Everything in Starter', 'SoundLab Access', 'Live Studio Suite', 'Advanced AI Models', 'Priority Support'],
              },
              {
                name: 'ENTERPRISE',
                price: 'Custom',
                popular: false,
                features: ['Everything in Professional', 'Unlimited AI & Automations', 'White Label Options', 'API Access', 'Dedicated Support'],
              },
            ].map((plan, i) => (
              <div key={i} className={`relative ${plan.popular ? 'lg:scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                    {plan.tag}
                  </div>
                )}
                <div className={`h-full bg-gradient-to-br border rounded-lg p-8 backdrop-blur transition ${
                  plan.popular
                    ? 'from-blue-600 to-blue-600 border-blue-400 shadow-2xl'
                    : 'from-blue-950/40 to-blue-950/40 border-blue-500/30 hover:border-blue-500/50'
                }`}>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-gray-400 ml-2">/month</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <span className="text-blue-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 font-bold rounded transition ${
                    plan.popular
                      ? 'bg-black hover:bg-gray-900 text-white'
                      : 'border border-blue-500/50 hover:bg-blue-600/10'
                  }`}>
                    {plan.price === 'Custom' ? 'CONTACT SALES' : 'START FREE'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA SECTION ===== */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-black to-blue-950/40 opacity-50" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl font-black leading-tight mb-6">
              <span className="text-white">BUILD.</span>
              <br />
              <span className="text-red-600">AUTOMATE.</span>
              <br />
              <span className="text-red-600">DOMINATE.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              WISE² is more than software. It's your unfair advantage.
            </p>
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-black font-bold rounded transition transform hover:scale-105">
              START FREE TODAY
            </button>
            <p className="text-sm text-gray-500 mt-4">No credit card required</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-black mb-4">W2</div>
              <p className="text-2xl font-black uppercase tracking-widest">ORGANIZED CHAOS</p>
              <p className="text-gray-400 text-sm mt-4">COMMAND CENTER</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-blue-500/30 bg-black/50 backdrop-blur py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center font-bold text-black text-sm">
                  W2
                </div>
                <span className="font-bold">WISE²</span>
              </div>
              <p className="text-xs text-gray-400">The AI operating system for modern business owners</p>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide">PRODUCTS</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition">AI Command Center</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">SoundLab</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Live Studio</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Drop Shipping AI</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide">SOLUTIONS</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition">For Businesses</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">For Creators</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">For Agencies</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">For Developers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide">RESOURCES</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">API Reference</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide">COMPANY</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Partners</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-cyan-500/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
            <p>© 2025 Wise Defense LLC. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-400 transition">Privacy Policy</a>
              <a href="#" className="hover:text-blue-400 transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
