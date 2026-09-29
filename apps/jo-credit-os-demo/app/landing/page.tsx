'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      window.location.href = '/auth/signup';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5]">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-[#2CD588]/20 text-[#2CD588] rounded-full text-sm">✨ AI-Native Platform</span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-[#2CD588]">Transform</span> Your Creative Vision
                </h1>
                <p className="text-lg text-[#A0A0A0] leading-relaxed max-w-2xl">
                  WISE² is an all-in-one AI operating system for creators, businesses, and entrepreneurs.
                  Create, automate, and scale with the power of AI.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-6 py-3 bg-[#2CD588] text-black font-bold rounded">
                  <Link href="/auth/signup">Get Started Free</Link>
                </button>
                <button className="px-6 py-3 border border-[#2CD588] text-[#2CD588] font-bold rounded">
                  <Link href="/services">Explore Services</Link>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[#1A1A1A]">
                <div>
                  <p className="text-2xl font-bold text-[#2CD588]">500+</p>
                  <p className="text-sm text-[#A0A0A0]">Active Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2CD588]">10K+</p>
                  <p className="text-sm text-[#A0A0A0]">Projects</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#2CD588]">99.9%</p>
                  <p className="text-sm text-[#A0A0A0]">Uptime</p>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative h-96 rounded-2xl bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] border border-[#2CD588]/20 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[#2CD588]/10 via-transparent to-transparent"></div>
              <div className="relative text-center">
                <p className="text-[#2CD588] font-bold text-lg">Creative Studio Preview</p>
                <p className="text-[#A0A0A0] text-sm mt-2">Advanced AI-powered creation tools</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-[#0A0A0A] border-y border-[#1A1A1A]">
        <div>
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powered by WISE² AI</h2>
            <p className="text-[#A0A0A0] text-lg max-w-2xl mx-auto">
              Everything you need to create, automate, and scale your business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Creative Studio',
                description: 'Professional-grade audio and video production tools powered by AI',
                icon: '🎬'
              },
              {
                title: 'Consulting OS',
                description: 'End-to-end consulting platform for audits, proposals, and client management',
                icon: '📊'
              },
              {
                title: 'Automation Engine',
                description: 'Intelligent workflows to streamline repetitive tasks and save time',
                icon: '⚙️'
              },
              {
                title: 'Intelligence Hub',
                description: 'AI-powered analytics and insights for data-driven decisions',
                icon: '🧠'
              },
              {
                title: 'App Integrations',
                description: 'Connect with 50+ popular tools and services seamlessly',
                icon: '🔗'
              },
              {
                title: 'Business Tools',
                description: 'Invoicing, payments, billing, and financial management built-in',
                icon: '💰'
              }
            ].map((feature, idx) => (
              <Card key={idx} variant="default" className="hover:border-[#2CD588] transition-colors">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-[#A0A0A0] text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div>
          <Card variant="elevated" className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold">Ready to Transform Your Creative Vision?</h2>
              <p className="text-[#A0A0A0] text-lg max-w-2xl mx-auto">
                Join 500+ creators and businesses already using WISE² to create amazing content and scale their operations.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto w-full">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitted}
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-[#2CD588] text-black font-bold rounded"
                disabled={submitted}
              >
                {submitted ? 'Redirecting...' : 'Start Free Trial'}
              </button>
            </form>

            {submitted && (
              <p className="text-[#2CD588] text-sm font-medium">
                ✓ Great! Redirecting to sign up...
              </p>
            )}
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] py-12 bg-[#0A0A0A]">
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold mb-4 text-[#2CD588]">Product</p>
              <ul className="space-y-2 text-sm text-[#A0A0A0]">
                <li><Link href="/services" className="hover:text-[#2CD588] transition">Services</Link></li>
                <li><Link href="/pricing" className="hover:text-[#2CD588] transition">Pricing</Link></li>
                <li><Link href="/about" className="hover:text-[#2CD588] transition">About</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4 text-[#2CD588]">Company</p>
              <ul className="space-y-2 text-sm text-[#A0A0A0]">
                <li><Link href="/contact" className="hover:text-[#2CD588] transition">Contact</Link></li>
                <li><Link href="/community" className="hover:text-[#2CD588] transition">Community</Link></li>
                <li><a href="#" className="hover:text-[#2CD588] transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4 text-[#2CD588]">Legal</p>
              <ul className="space-y-2 text-sm text-[#A0A0A0]">
                <li><a href="#" className="hover:text-[#2CD588] transition">Privacy</a></li>
                <li><a href="#" className="hover:text-[#2CD588] transition">Terms</a></li>
                <li><a href="#" className="hover:text-[#2CD588] transition">Security</a></li>
              </ul>
            </div>
            <div>
              <p className="font-bold mb-4 text-[#2CD588]">Connect</p>
              <ul className="space-y-2 text-sm text-[#A0A0A0]">
                <li><a href="#" className="hover:text-[#2CD588] transition">Twitter</a></li>
                <li><a href="#" className="hover:text-[#2CD588] transition">Discord</a></li>
                <li><a href="#" className="hover:text-[#2CD588] transition">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#1A1A1A] pt-8 text-center text-sm text-[#A0A0A0]">
            <p>&copy; 2026 WISE² AI. All rights reserved. Built with passion and AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
