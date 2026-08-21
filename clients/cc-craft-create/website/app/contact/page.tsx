'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/Button';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="bg-cc-lilac py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-lora font-bold text-cc-dark mb-2">Contact Us</h1>
            <p className="text-cc-dark">Have questions? We'd love to hear from you!</p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="text-center">
              <div className="text-4xl mb-3">📧</div>
              <h3 className="font-bold text-cc-dark mb-2">Email</h3>
              <a href="mailto:cc@craftandcreate.com" className="text-cc-purple hover:text-cc-gold">
                cc@craftandcreate.com
              </a>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold text-cc-dark mb-2">Phone</h3>
              <a href="tel:+1234567890" className="text-cc-purple hover:text-cc-gold">
                (123) 456-7890
              </a>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📍</div>
              <h3 className="font-bold text-cc-dark mb-2">Hours</h3>
              <p className="text-cc-dark text-sm">
                Mon-Fri: 9am-6pm<br />
                Sat-Sun: 10am-4pm
              </p>
            </div>
          </div>

          <div className="bg-cc-lilac rounded-lg p-8">
            <h2 className="text-2xl font-lora font-bold text-cc-dark mb-6">Send us a Message</h2>

            {submitted ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                ✓ Thank you! We'll get back to you soon.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-cc-dark mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-cc-dark mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-cc-dark mb-2">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="custom">Custom Order</option>
                    <option value="bulk">Bulk Order</option>
                    <option value="support">Order Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-cc-dark mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-cc-lavender rounded-lg focus:outline-none focus:border-cc-purple resize-none"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
