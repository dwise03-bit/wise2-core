'use client';

import { ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

const demos = [
  {
    name: 'Action Dispatch',
    description: 'Home services and emergency dispatch coordination',
    url: 'https://wise2.net/action-dispatch/',
    status: 'active',
    clientType: 'Demo',
    features: ['Real-time dispatch', 'Job tracking', 'Team coordination']
  },
  {
    name: 'Fergies Table',
    description: 'Premium catering and events management platform',
    url: 'https://wise2.net/fergies-table/',
    status: 'active',
    clientType: 'Demo',
    features: ['Catering orders', 'Event scheduling', 'Customer management']
  },
  {
    name: 'Lexis Inks',
    description: 'Retail operations and inventory management',
    url: 'https://wise2.net/lexis-inks/',
    status: 'active',
    clientType: 'Demo',
    features: ['Point of sale', 'Inventory tracking', 'Customer database']
  },
  {
    name: 'Cherry Count',
    description: 'Pop-up retail and mobile commerce platform',
    url: 'https://wise2.net/cherry-count/',
    status: 'maintenance',
    clientType: 'Demo',
    features: ['Mobile checkout', 'Analytics', 'Inventory sync']
  },
  {
    name: 'WISE HVAC Demo',
    description: 'Field technician toolkit for HVAC services',
    url: 'https://hvac.wise2.net/wise-hvac-demo/',
    status: 'active',
    clientType: 'Featured',
    features: ['Job management', 'Diagnostics', 'Photo capture', 'Offline sync']
  },
  {
    name: 'WISE² Platform',
    description: 'Enterprise command center and dashboard',
    url: 'https://wise2.net/',
    status: 'active',
    clientType: 'Core',
    features: ['Analytics', 'User management', 'Settings', 'Integration hub']
  }
];

export default function DemosPage() {
  const activeCount = demos.filter(d => d.status === 'active').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">WISE² <span className="text-cyan-400">DEMOS</span></h1>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300">← Back</Link>
        </div>
      </div>

      <div className="pt-24 pb-16">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black mb-4">
              Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Business Demos</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Operating systems for different industries. All powered by WISE².
            </p>
            <div className="inline-flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>{activeCount} Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span>{demos.length - activeCount} In Development</span>
              </div>
            </div>
          </div>

          {/* Demos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demos.map((demo) => (
              <a
                key={demo.name}
                href={demo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 transition-all hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {demo.status === 'active' ? (
                    <div className="flex items-center gap-1 bg-green-500/20 text-green-300 text-xs px-3 py-1 rounded-full border border-green-500/30">
                      <CheckCircle className="w-3 h-3" />
                      Live
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30">
                      <Clock className="w-3 h-3" />
                      Maintenance
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                    {demo.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">{demo.description}</p>

                  {/* Client Type Badge */}
                  <div className="inline-block text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20 mb-4">
                    {demo.clientType}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {demo.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-2 text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-semibold">
                    {demo.status === 'active' ? 'Launch Demo' : 'Coming Soon'}
                  </span>
                  {demo.status === 'active' && <ExternalLink className="w-4 h-4" />}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Integration Section */}
        <div className="max-w-7xl mx-auto px-6 border-t border-cyan-500/20 pt-16">
          <h3 className="text-3xl font-bold mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Discord Integration
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 border border-cyan-500/20 rounded-xl p-6">
              <h4 className="font-bold mb-3 text-cyan-400">Demo Status Alerts</h4>
              <p className="text-sm text-slate-400">
                Real-time notifications for demo deployments, status changes, and client feedback via Discord webhook.
              </p>
            </div>
            <div className="bg-slate-800/30 border border-cyan-500/20 rounded-xl p-6">
              <h4 className="font-bold mb-3 text-cyan-400">Demo Commands</h4>
              <p className="text-sm text-slate-400">
                `/demo status` — Check live demo health and availability across all platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="max-w-7xl mx-auto px-6 mt-16 text-center">
          <p className="text-slate-400 mb-6">
            Ready to build your operating system?
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
          >
            Schedule a Demo
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
