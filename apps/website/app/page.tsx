'use client';

import React from 'react';
import { Header, HeroSection, FeaturesSection, ProductsSection, Footer } from '@/components/homepage';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ProductsSection />

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
              <div className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
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
          <h2 className="text-4xl font-black text-center mb-4 text-white">TRUSTED BY INNOVATORS</h2>
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
              <div key={i} className="bg-gradient-to-br from-blue-950/40 to-cyan-950/40 border border-cyan-500/20 rounded-lg p-6 backdrop-blur hover:border-cyan-500/50 transition">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">{testimonial.quote}</p>
                <p className="font-bold text-sm text-white">{testimonial.author}</p>
                <p className="text-xs text-gray-400">{testimonial.title}</p>
              </div>
            ))}
          </div>

          {/* Company Logos */}
          <div className="border-t border-cyan-500/20 pt-12">
            <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-8">Used by leading companies</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
              {['ELEVATE', 'NextLevel', 'LUXE', 'HUSTLE', 'VISIONARY', 'CHAOS'].map((logo, i) => (
                <div key={i} className="text-gray-600 font-bold text-sm hover:text-cyan-400 transition">
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
          <h2 className="text-4xl font-black text-center mb-4 text-white">SIMPLE PRICING, POWERFUL OPTIONS.</h2>
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
                <div
                  className={`h-full bg-gradient-to-br border rounded-lg p-8 backdrop-blur transition ${
                    plan.popular
                      ? 'from-blue-600 to-cyan-600 border-cyan-400 shadow-2xl'
                      : 'from-blue-950/40 to-cyan-950/40 border-cyan-500/20 hover:border-cyan-500/50'
                  }`}
                >
                  <h3 className="text-xl font-bold mb-2 text-white">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-gray-400 ml-2">/month</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-cyan-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`w-full py-3 font-bold rounded transition ${
                      plan.popular
                        ? 'bg-black hover:bg-gray-900 text-white'
                        : 'border border-cyan-500/50 hover:bg-cyan-500/10 text-white'
                    }`}
                  >
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 via-black to-cyan-950/40 opacity-50" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl font-black leading-tight mb-6">
              <span className="text-white">BUILD.</span>
              <br />
              <span className="text-red-600">AUTOMATE.</span>
              <br />
              <span className="text-red-600">DOMINATE.</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8">WISE² is more than software. It's your unfair advantage.</p>
            <button className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded transition transform hover:scale-105">
              START FREE TODAY
            </button>
            <p className="text-sm text-gray-500 mt-4">No credit card required</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-black text-white mb-4">W2</div>
              <p className="text-2xl font-black uppercase tracking-widest text-white">ORGANIZED CHAOS</p>
              <p className="text-gray-400 text-sm mt-4">COMMAND CENTER</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
