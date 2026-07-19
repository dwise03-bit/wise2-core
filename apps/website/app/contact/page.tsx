'use client';

import { useState } from 'react';
import { Navigation, Footer } from '@/components/wise';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to a backend service
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', company: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <>
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
              Get In <span className="text-wise-accent-green">Touch</span>
            </h1>
            <p className="text-xl text-wise-text-secondary max-w-2xl mx-auto">
              Let's discuss your project and find the perfect solution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: '📧', label: 'Email', value: 'hello@wise2.net' },
              { icon: '📱', label: 'Phone', value: '(555) 123-4567' },
              { icon: '📍', label: 'Location', value: 'Remote-First' },
            ].map((contact) => (
              <div key={contact.label} className="text-center">
                <div className="text-4xl mb-3">{contact.icon}</div>
                <p className="text-wise-text-muted text-sm mb-1">{contact.label}</p>
                <p className="text-white font-semibold">{contact.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl p-8 md:p-12">
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                <p className="text-wise-text-secondary">
                  Thank you for reaching out. We'll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-semibold mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="w-full px-4 py-3 bg-wise-bg-primary border-2 border-wise-accent-green/30 rounded-lg text-white placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-wise-bg-primary border-2 border-wise-accent-green/30 rounded-lg text-white placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Company (Optional)</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company"
                    className="w-full px-4 py-3 bg-wise-bg-primary border-2 border-wise-accent-green/30 rounded-lg text-white placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green"
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Tell us about your project..."
                    className="w-full px-4 py-3 bg-wise-bg-primary border-2 border-wise-accent-green/30 rounded-lg text-white placeholder-wise-text-muted focus:outline-none focus:border-wise-accent-green resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold text-lg hover:brightness-110 transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
