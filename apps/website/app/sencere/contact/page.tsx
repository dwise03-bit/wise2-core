'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to email service
    console.log('Contact form:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Contact SenCere</h1>
        
        {submitted && <div className="bg-green-100 p-4 mb-6 rounded">Message sent! We'll get back to you soon.</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-3 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Your email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 border rounded"
            required
          />
          <textarea
            placeholder="Your message"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="w-full p-3 border rounded h-32"
            required
          />
          <button type="submit" className="bg-black text-white px-6 py-3 rounded font-bold">
            Send Message
          </button>
        </form>

        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold mb-4">Direct Contact</h2>
          <p>Email: support@sencere.creative</p>
          <p>Response time: 24-48 hours</p>
        </div>
      </div>
    </div>
  );
}
