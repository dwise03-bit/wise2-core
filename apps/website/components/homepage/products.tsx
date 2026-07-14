'use client';

import React from 'react';
import { Card } from '@wise2/design-system/components';

export function ProductsSection() {
  const products = [
    { title: 'AI COMMAND CENTER', description: 'AI agents, automation, and intelligent workflows', icon: '🤖' },
    { title: 'SOUNDLAB', description: 'AI music generation, mastering, and audio tools', icon: '🎵' },
    { title: 'LIVE STUDIO', description: 'Live streaming, podcasting, and video production', icon: '📹' },
    { title: 'DROP SHIPPING AI', description: 'AI-powered store builder and fulfillment', icon: '📦' },
    { title: 'CRM & CLIENTS', description: 'Manage customers, leads, and relationships', icon: '👥' },
    { title: 'ANALYTICS', description: 'Real-time analytics and custom dashboards', icon: '📈' },
    { title: 'MARKETING SUITE', description: 'Viral content, ads, and growth tools', icon: '📢' },
    { title: 'DEVELOPER API', description: 'Powerful API and developer platform', icon: '</>' },
  ];

  return (
    <section id="products" className="py-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-black mb-12 text-center text-white">ALL-IN-ONE BUSINESS OPERATING SYSTEM</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <div key={i} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition blur" />
              <Card className="relative bg-black/50 border border-cyan-500/20 rounded-lg p-6 backdrop-blur hover:border-cyan-500/50 transition h-full">
                <div className="text-4xl mb-4">{product.icon}</div>
                <h3 className="font-bold text-sm uppercase tracking-wide mb-2 text-white group-hover:text-cyan-400 transition">{product.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{product.description}</p>
                <a href="#" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1">
                  Learn More →
                </a>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
