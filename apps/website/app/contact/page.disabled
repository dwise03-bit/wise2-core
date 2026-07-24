'use client';

import React, { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#F5F5F5] flex items-center justify-center py-12">
        <Container maxWidth="md">
          <Card variant="elevated" className="text-center space-y-6">
            <div className="text-6xl">✓</div>
            <h1 className="text-3xl font-bold text-[#2CD588]">Message Sent!</h1>
            <p className="text-[#A0A0A0]">Thank you for reaching out. We'll get back to you soon.</p>
            <p className="text-sm text-[#727272]">Redirecting home...</p>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] py-12 sm:py-16 lg:py-24">
      <Container maxWidth="lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Info Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold">
                Get In <span className="text-[#2CD588]">Touch</span>
              </h1>
              <p className="text-lg text-[#A0A0A0]">
                Have a question or ready to get started? We'd love to hear from you.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: '📧',
                  label: 'Email',
                  value: 'hello@wise2.net',
                  href: 'mailto:hello@wise2.net',
                },
                {
                  icon: '💬',
                  label: 'Chat',
                  value: 'Use the chat widget',
                  href: '#',
                },
                {
                  icon: '📍',
                  label: 'Address',
                  value: 'Online-First Company',
                  href: '#',
                },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-sm text-[#A0A0A0]">{item.label}</p>
                  <p className="text-white font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <p className="text-sm text-[#A0A0A0]">Follow us on social media</p>
              <div className="flex gap-4">
                {['Twitter', 'Discord', 'GitHub'].map((social, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="px-4 py-2 bg-[#101114] border border-[#1A1A1A] rounded-lg hover:border-[#2CD588] transition-colors text-sm"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card variant="elevated">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-4 text-[#EF4444] text-sm">
                  {errors.submit}
                </div>
              )}

              <div>
                <Label htmlFor="name" required>Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />
              </div>

              <div>
                <Label htmlFor="email" required>Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Your company"
                  value={formData.company}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="message" required>Message</Label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-[#101114] text-[#F5F5F5] border border-[#1A1A1A] placeholder-[#727272] focus:outline-none focus:border-[#2CD588] focus:ring-2 focus:ring-[#2CD588]/20 transition-all duration-150 resize-none"
                />
                {errors.message && (
                  <p className="mt-2 text-sm text-[#EF4444]">{errors.message}</p>
                )}
              </div>

              <Button
                variant="primary"
                size="lg"
                type="submit"
                className="w-full"
                isLoading={loading}
                disabled={loading}
              >
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </Container>
    </div>
  );
}
