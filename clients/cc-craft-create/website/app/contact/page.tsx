'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { PageHero } from '@/components/PageHero';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
      }
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <PageHero
          title="Contact CC"
          subtitle="Tell us about your event, vision, or custom order — we'd love to create something special."
        />

        <section className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="cc-card p-6 text-center">
              <p className="text-3xl mb-3" aria-hidden>📧</p>
              <h3 className="font-bold text-cc-dark mb-2">Email</h3>
              <a href="mailto:hello@ccraftandcreate.com" className="text-cc-purple hover:text-cc-gold text-sm">
                hello@ccraftandcreate.com
              </a>
            </div>
            <div className="cc-card p-6 text-center">
              <p className="text-3xl mb-3" aria-hidden>📸</p>
              <h3 className="font-bold text-cc-dark mb-2">Instagram</h3>
              <a
                href="https://instagram.com/cc.craftandcreate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cc-purple hover:text-cc-gold text-sm"
              >
                @cc.craftandcreate
              </a>
            </div>
            <div className="cc-card p-6 text-center">
              <p className="text-3xl mb-3" aria-hidden>📍</p>
              <h3 className="font-bold text-cc-dark mb-2">Service Area</h3>
              <p className="text-sm text-cc-dark/80">Local pickup & delivery available</p>
            </div>
          </div>

          <div className="cc-card p-6 md:p-8">
            <h2 className="text-2xl font-lora font-bold text-cc-dark mb-6">Start Your Custom Order</h2>

            {submitted ? (
              <div className="rounded-lg border border-green-200 bg-green-50 text-green-800 px-4 py-4">
                Thank you! Your message was received. CC will respond within 1-2 business days.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                    {error}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-cc-dark mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="cc-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-cc-dark mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="cc-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-cc-dark mb-2">Subject</label>
                  <select
                    name="subject"
                    className="cc-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="custom">Custom Order</option>
                    <option value="bulk">Bulk Order</option>
                    <option value="business">Business Branding</option>
                    <option value="support">Order Support</option>
                    <option value="general">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-cc-dark mb-2">Message</label>
                  <textarea
                    name="message"
                    rows={6}
                    className="cc-input resize-none"
                    placeholder="Tell us about your event, colors, quantities, and timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full md:w-auto" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-cc-dark/60 mt-8">
            Prefer to browse first?{' '}
            <Link href="/shop" className="text-cc-purple font-semibold hover:underline">
              Shop our collections
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
