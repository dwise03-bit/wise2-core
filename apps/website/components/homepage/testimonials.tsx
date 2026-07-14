'use client';

import React from 'react';
import { Card } from '@wise2/design-system/components';

export function TestimonialsSection() {
  const testimonials = [
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
  ];

  const companies = ['ELEVATE', 'NextLevel', 'LUXE', 'HUSTLE', 'VISIONARY', 'CHAOS'];

  return (
    <section className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-black text-center mb-4 text-white">TRUSTED BY INNOVATORS</h2>
        <p className="text-center text-gray-400 mb-12">Leading companies and creators trust WISE²</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, i) => (
            <Card
              key={i}
              className="bg-gradient-to-br from-blue-950/40 to-cyan-950/40 border border-cyan-500/20 rounded-lg p-6 backdrop-blur hover:border-cyan-500/50 transition"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <span key={j} className="text-yellow-400">★</span>
                ))}
              </div>
              <p className="text-gray-300 mb-4 italic">{testimonial.quote}</p>
              <p className="font-bold text-sm text-white">{testimonial.author}</p>
              <p className="text-xs text-gray-400">{testimonial.title}</p>
            </Card>
          ))}
        </div>

        {/* Company Logos */}
        <div className="border-t border-cyan-500/20 pt-12">
          <p className="text-center text-gray-500 text-xs uppercase tracking-widest mb-8">Used by leading companies</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center">
            {companies.map((logo, i) => (
              <div key={i} className="text-gray-600 font-bold text-sm hover:text-cyan-400 transition">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
