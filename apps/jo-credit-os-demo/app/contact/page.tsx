'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/wise';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', business: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch('/api/v1/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.business || form.name,
          contactName: form.name,
          email: form.email,
          primaryProblem: form.message,
          leadSource: 'contact-page',
          tags: ['contact', 'website'],
        }),
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <>
      <main className="min-h-screen bg-[#050505] text-white pb-20">
        {/* Hero */}
        <section className="pt-32 pb-16 px-6 text-center">
          <div
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
            style={{ background: 'rgba(0,148,255,0.1)', border: '1px solid rgba(0,148,255,0.3)', color: '#0094FF' }}
          >
            LET&apos;S TALK
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Get In <span style={{ color: '#0094FF' }}>Touch</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Whether you want a consultation, have questions about WISE², or want to explore what&apos;s possible for your business — we&apos;re here.
          </p>
          <Link
            href="/audit"
            className="inline-block px-6 py-3 rounded-lg font-bold text-sm transition"
            style={{ background: 'rgba(0,148,255,0.15)', border: '1px solid rgba(0,148,255,0.4)', color: '#0094FF' }}
          >
            Skip the form — Run your FREE AI Audit →
          </Link>
        </section>

        {/* Contact Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold mb-8">Send a Message</h2>

              {status === 'sent' ? (
                <div
                  className="rounded-2xl p-10 text-center"
                  style={{ background: 'rgba(0,148,255,0.08)', border: '1px solid rgba(0,148,255,0.3)' }}
                >
                  <div className="text-5xl mb-4">✓</div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#0094FF' }}>Message Received</h3>
                  <p className="text-gray-400">We&apos;ll respond within 1 business day.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {status === 'error' && (
                    <div className="p-4 rounded-lg text-red-300" style={{ background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.3)' }}>
                      Something went wrong. Email us directly at hello@wise2.net
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={update('name')}
                      placeholder="First and last name"
                      className="w-full px-4 py-3 rounded-lg bg-[#0f0f0f] text-white placeholder-gray-600 focus:outline-none transition"
                      style={{ border: '1px solid rgba(0,148,255,0.25)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={update('email')}
                      placeholder="you@yourbusiness.com"
                      className="w-full px-4 py-3 rounded-lg bg-[#0f0f0f] text-white placeholder-gray-600 focus:outline-none transition"
                      style={{ border: '1px solid rgba(0,148,255,0.25)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Business Name</label>
                    <input
                      type="text"
                      value={form.business}
                      onChange={update('business')}
                      placeholder="Your business or organization"
                      className="w-full px-4 py-3 rounded-lg bg-[#0f0f0f] text-white placeholder-gray-600 focus:outline-none transition"
                      style={{ border: '1px solid rgba(0,148,255,0.25)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">How Can We Help? *</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={update('message')}
                      rows={5}
                      placeholder="Tell us about your business and what you're trying to accomplish..."
                      className="w-full px-4 py-3 rounded-lg bg-[#0f0f0f] text-white placeholder-gray-600 focus:outline-none transition resize-none"
                      style={{ border: '1px solid rgba(0,148,255,0.25)' }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full py-4 rounded-lg font-bold text-[#050505] transition disabled:opacity-60"
                    style={{ background: '#0094FF', boxShadow: '0 0 20px rgba(0,148,255,0.35)' }}
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Other Ways to Connect</h2>
                <div className="space-y-4">
                  <a
                    href="mailto:hello@wise2.net"
                    className="flex items-center gap-4 p-5 rounded-xl transition group"
                    style={{ background: 'rgba(0,148,255,0.06)', border: '1px solid rgba(0,148,255,0.2)' }}
                  >
                    <span className="text-2xl">✉️</span>
                    <div>
                      <div className="font-semibold text-white">Email</div>
                      <div className="text-sm" style={{ color: '#0094FF' }}>hello@wise2.net</div>
                    </div>
                  </a>
                  <Link
                    href="/consulting"
                    className="flex items-center gap-4 p-5 rounded-xl transition"
                    style={{ background: 'rgba(0,148,255,0.06)', border: '1px solid rgba(0,148,255,0.2)' }}
                  >
                    <span className="text-2xl">📞</span>
                    <div>
                      <div className="font-semibold text-white">Book a Consultation</div>
                      <div className="text-sm text-gray-400">Schedule a call with our AI strategy team</div>
                    </div>
                  </Link>
                  <Link
                    href="/audit"
                    className="flex items-center gap-4 p-5 rounded-xl transition"
                    style={{ background: 'rgba(0,148,255,0.06)', border: '1px solid rgba(0,148,255,0.2)' }}
                  >
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="font-semibold text-white">Free AI Business Audit</div>
                      <div className="text-sm text-gray-400">Get your score + personalized recommendation in 5 minutes</div>
                    </div>
                  </Link>
                </div>
              </div>

              <div
                className="rounded-2xl p-8"
                style={{ background: 'linear-gradient(135deg, rgba(0,148,255,0.1) 0%, rgba(0,148,255,0.04) 100%)', border: '1px solid rgba(0,148,255,0.2)' }}
              >
                <h3 className="text-xl font-bold mb-3">Enterprise Inquiry?</h3>
                <p className="text-gray-400 mb-4 text-sm">
                  Need a custom WISE² implementation for your organization? We offer dedicated onboarding, custom integrations, and enterprise-grade support.
                </p>
                <Link
                  href="/consulting"
                  className="inline-block px-6 py-3 rounded-lg font-bold text-sm transition"
                  style={{ background: '#0094FF', color: '#050505' }}
                >
                  Book Enterprise Call →
                </Link>
              </div>

              <div>
                <p className="text-gray-500 text-sm">
                  WISE² is based in Atlanta, Georgia.<br />
                  We typically respond within 1 business day.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
