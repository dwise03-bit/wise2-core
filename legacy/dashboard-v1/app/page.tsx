'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Users, Award, CheckCircle, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main style={{backgroundColor: '#000000'}} className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-900">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
            Wise Defense
          </h1>
          <div className="flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a>
            <Link href="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">Training</Link>
            <Link href="/shop" className="text-gray-400 hover:text-white text-sm transition-colors">Shop</Link>
            <Link href="/auth/login" className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all text-sm font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden py-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-black to-black opacity-50"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl opacity-30"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-block px-4 py-2 bg-red-950/50 border border-red-600/50 rounded-full">
            <span className="text-red-400 text-sm font-semibold">🎯 Premium Firearms Training</span>
          </div>

          <h1 className="text-7xl font-bold leading-tight">
            <span className="text-white">Train with </span>
            <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">Purpose</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Professional firearms education from an NRA-certified instructor. Master safety, accuracy, and confidence through personalized coaching and community-driven learning.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/auth/signup">
              <button className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition-all font-semibold flex items-center gap-2">
                Start Training
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/pricing">
              <button className="px-8 py-4 border border-gray-700 text-white rounded-lg hover:border-red-600/50 hover:bg-red-950/20 transition-all font-semibold">
                View Plans
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose Wise Defense</h2>
            <p className="text-gray-400 text-lg">Everything you need to train smarter, safer, and with confidence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Safety First',
                desc: 'Every lesson starts with fundamentals. Master proper technique before speed.'
              },
              {
                icon: Zap,
                title: 'Rapid Progress',
                desc: 'Personalized drills matched to your goals. Track progress with real metrics.'
              },
              {
                icon: Users,
                title: 'Community',
                desc: 'Learn alongside other serious students. Share wins, ask questions, grow together.'
              },
              {
                icon: Award,
                title: 'Certified Instruction',
                desc: 'NRA-certified instructor with years of professional experience.'
              },
              {
                icon: CheckCircle,
                title: '1-on-1 Coaching',
                desc: 'Pro and VIP members get personalized sessions tailored to your needs.'
              },
              {
                icon: Zap,
                title: 'Flexible Learning',
                desc: 'Video library, live sessions, and drills. Learn at your pace.'
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-gradient-to-br from-gray-900/50 to-black p-8 rounded-lg border border-gray-800 hover:border-red-600/50 group transition-all">
                  <Icon className="w-12 h-12 text-red-600 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-6 bg-gradient-to-b from-black via-red-950/10 to-black border-t border-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your Path</h2>
            <p className="text-gray-400 text-lg">Simple pricing. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$99',
                features: ['2 sessions/month', 'Video library', 'Community access', 'Basic tracking']
              },
              {
                name: 'Pro',
                price: '$199',
                features: ['4 sessions/month', '1-on-1 coaching', 'Personalized drills', 'Priority support'],
                featured: true
              },
              {
                name: 'VIP',
                price: '$499',
                features: ['Unlimited sessions', 'Dedicated coaching', 'Custom training', '24/7 support']
              },
            ].map((tier, i) => (
              <div
                key={i}
                className={`rounded-lg border p-8 transition-all ${
                  tier.featured
                    ? 'bg-gradient-to-br from-red-600/20 to-red-950/20 border-red-600/50 ring-2 ring-red-600/30 scale-105'
                    : 'bg-gray-900/30 border-gray-800 hover:border-red-600/30'
                }`}
              >
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-white mb-6">{tier.price}<span className="text-lg text-gray-400">/mo</span></div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-red-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  tier.featured
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/pricing">
              <button className="px-8 py-3 border border-red-600/50 text-red-600 rounded-lg hover:bg-red-950/30 transition-all font-semibold">
                View Full Pricing
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Ready to Level Up?</h2>
          <p className="text-xl text-gray-400 mb-12">
            Join hundreds of students mastering firearms safety, accuracy, and confidence.
          </p>
          <Link href="/auth/signup">
            <button className="px-12 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition-all font-semibold text-lg flex items-center gap-2 mx-auto">
              Start Your Journey
              <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; 2026 Wise Defense LLC. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
