'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function WebsiteMockupPage() {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const services = [
    {
      id: 'vinyl-cutter',
      name: 'Vinyl Cutter',
      icon: '✂️',
      description: 'Professional vinyl cutting for decals, signs, and custom graphics',
      specs: 'Roland CAMM1 GS-24 | 24" cutting width',
      price: '$700 - $1,200'
    },
    {
      id: 'laser-engraver',
      name: 'Laser Engraver',
      icon: '🔥',
      description: 'High-precision laser engraving and cutting for various materials',
      specs: 'CO2 Laser 100W | Up to 32" x 20" workbed',
      price: '$1,200 - $2,500'
    },
    {
      id: 'sublimation-printer',
      name: 'Sublimation Printer',
      icon: '🖨️',
      description: 'Professional sublimation printing for vibrant, durable transfers',
      specs: 'Epson SureColor F-Series | 5760x1440 DPI',
      price: '$800 - $1,500'
    },
    {
      id: 'heat-press',
      name: 'Heat Press System',
      icon: '🔥',
      description: 'Industrial heat press for t-shirts, mugs, and promotional products',
      specs: '15\" x 15\" Swing-Away | Digital temperature control',
      price: '$300 - $700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-950">SC</span>
            </div>
            <span className="font-bold text-white">SenCere Creative</span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#services" className="text-slate-300 hover:text-amber-400 transition text-sm">Equipment</a>
            <a href="#capabilities" className="text-slate-300 hover:text-amber-400 transition text-sm">Capabilities</a>
            <a href="#contact" className="text-slate-300 hover:text-amber-400 transition text-sm">Contact</a>
            <button className="px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition text-sm">
              Request Quote
            </button>
          </div>
        </div>
      </nav>

      {/* Hero with Website Mockup */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Professional Equipment
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                Manufacturing Services
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Industry-leading equipment for vinyl cutting, laser engraving, sublimation printing, and heat press operations. Equipment identification, cost estimation, and asset tracking for enterprise clients.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition">
                View Equipment
              </button>
              <button className="px-8 py-3 border border-amber-400 text-amber-400 font-bold rounded-lg hover:bg-amber-400/10 transition">
                Get Specifications
              </button>
            </div>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg h-96 flex items-center justify-center border border-slate-600">
              <div className="text-center">
                <div className="text-6xl mb-4">🏭</div>
                <p className="text-slate-400">Equipment Showcase</p>
                <p className="text-sm text-slate-500 mt-2">6 Professional Systems</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Grid */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white mb-4">Equipment Lineup</h2>
        <p className="text-slate-400 mb-12">Professional-grade manufacturing equipment with complete specifications and pricing</p>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              onMouseEnter={() => setHoveredService(service.id)}
              onMouseLeave={() => setHoveredService(null)}
              className={`bg-gradient-to-br from-slate-800 to-slate-900 border rounded-xl p-8 transition cursor-pointer transform ${
                hoveredService === service.id
                  ? 'border-amber-400 shadow-lg shadow-amber-500/20 -translate-y-1'
                  : 'border-slate-700'
              }`}
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">{service.name}</h3>
              <p className="text-slate-300 mb-4">{service.description}</p>

              <div className="bg-slate-950/50 rounded-lg p-4 mb-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2"><span className="text-amber-400 font-semibold">Specs:</span> {service.specs}</p>
                <p className="text-sm text-slate-400"><span className="text-amber-400 font-semibold">Estimated:</span> {service.price}</p>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-amber-400/10 border border-amber-400 text-amber-400 rounded-lg hover:bg-amber-400/20 transition text-sm font-semibold">
                  Details
                </button>
                <button className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition text-sm font-semibold">
                  Inquire
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white mb-12">Core Capabilities</h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 hover:border-amber-400/30 transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">Equipment Audits</h3>
            <p className="text-slate-300 text-sm mb-4">Complete equipment identification, specifications, and cost estimation for enterprise asset tracking.</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Full equipment inventory</li>
              <li>✓ Replacement cost analysis</li>
              <li>✓ Operational assessment</li>
            </ul>
          </div>

          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 hover:border-amber-400/30 transition">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-3">Manufacturing Services</h3>
            <p className="text-slate-300 text-sm mb-4">End-to-end production services from design through manufacturing and final delivery.</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Design consultation</li>
              <li>✓ Production planning</li>
              <li>✓ Quality assurance</li>
            </ul>
          </div>

          <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-8 hover:border-amber-400/30 transition">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-bold text-white mb-3">Technical Support</h3>
            <p className="text-slate-300 text-sm mb-4">Professional support and consulting for equipment optimization and maintenance.</p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ Equipment training</li>
              <li>✓ Troubleshooting</li>
              <li>✓ Maintenance planning</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-amber-400/10 via-amber-500/10 to-amber-600/10 border border-amber-400/20 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Connect with SenCere Creative LLC today to discuss your equipment and manufacturing needs. Get a detailed equipment audit or production quote.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition">
              Request Equipment Audit
            </button>
            <button className="px-8 py-4 border border-amber-400 text-amber-400 font-bold rounded-lg hover:bg-amber-400/10 transition">
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-950">SC</span>
                </div>
                <span className="font-bold text-white">SenCere</span>
              </div>
              <p className="text-sm text-slate-400">Professional equipment and manufacturing services</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-amber-400 transition">Equipment Audit</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Manufacturing</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-amber-400 transition">About</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Contact</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-amber-400 transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Twitter</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Email</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>SenCere Creative LLC × WISE² — Professional Equipment & Manufacturing Services</p>
            <p className="mt-2">© {new Date().getFullYear()} Powered by WISE²</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
