'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function SenCereDemoPage() {
  const [activeTab, setActiveTab] = useState<'equipment' | 'capabilities' | 'pricing'>('equipment');
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>('vinyl-cutter');

  const equipmentData = {
    'vinyl-cutter': {
      name: 'Professional Vinyl Cutter',
      model: 'Roland CAMM1 GS-24',
      category: 'Cutting & Graphics',
      description: 'Industry-leading vinyl cutter for precision cutting of decals, signs, custom graphics, and promotional materials. Features automatic media feeding and dual-head capability for high-volume production.',
      specs: {
        'Cutting Width': '24 inches',
        'Max Speed': '500 mm/s',
        'Precision': '±0.5mm',
        'Materials': 'Vinyl, paper, fabric, magnetic sheets',
        'Pressure Range': '0-500 grams-force'
      },
      replacement: '$700 - $1,200',
      capabilities: ['Decal cutting', 'Sign production', 'Label creation', 'Thermal transfer prep'],
      image: '✂️'
    },
    'laser-engraver': {
      name: 'CO2 Laser Engraver',
      model: 'Trotec Speedy 400',
      category: 'Engraving & Cutting',
      description: 'High-performance CO2 laser system for engraving and cutting on wood, acrylic, leather, glass, and more. Features precision alignment and automatic material detection.',
      specs: {
        'Laser Power': '100W CO2',
        'Working Area': '32" x 20"',
        'Precision': '±0.01 inches',
        'Speed': 'Up to 140 inches/second',
        'Materials': '20+ material types'
      },
      replacement: '$1,200 - $2,500',
      capabilities: ['Engraving', 'Cutting', 'Marking', 'Scoring'],
      image: '🔥'
    },
    'sublimation-printer': {
      name: 'Sublimation Printing System',
      model: 'Epson SureColor F-Series',
      category: 'Printing & Transfer',
      description: 'Professional-grade sublimation printer for producing high-quality transfers and direct printing on polyester and ceramic products. Produces vibrant, durable results.',
      specs: {
        'Print Resolution': '5760 x 1440 DPI',
        'Max Width': '17 inches',
        'Color Accuracy': '99.3% Pantone Match',
        'Ink System': 'Sublimation 4-color',
        'Media Types': 'Paper, fabric, ceramics'
      },
      replacement: '$800 - $1,500',
      capabilities: ['Photo printing', 'Transfer creation', 'Mug printing', 'Apparel decoration'],
      image: '🖨️'
    },
    'heat-press': {
      name: 'Industrial Heat Press',
      model: 'Geo Knight DK20T Swing',
      category: 'Finishing & Application',
      description: 'Professional swing-away heat press with dual-temperature controls for t-shirts, mugs, and promotional products. Digital timer and temperature display for precision.',
      specs: {
        'Platen Size': '15" x 15"',
        'Max Temperature': '450°F',
        'Pressure Range': '0-5000 PSI',
        'Timer': '0-999 seconds',
        'Power': '240V / 15A'
      },
      replacement: '$300 - $700',
      capabilities: ['T-shirt pressing', 'Mug wrapping', 'Hat application', 'Polyester transfer'],
      image: '🔥'
    }
  };

  const allEquipment = Object.entries(equipmentData);
  const current = equipmentData[selectedEquipment as keyof typeof equipmentData] || equipmentData['vinyl-cutter'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">SenCere</span> Interactive Demo
          </h1>
          <a href="/sencere" className="text-slate-300 hover:text-amber-400 transition">← Back to Main</a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-12 border-b border-slate-800">
          {(['equipment', 'capabilities', 'pricing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 font-semibold transition capitalize ${
                activeTab === tab
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {allEquipment.map(([key, data]) => (
              <button
                key={key}
                onClick={() => setSelectedEquipment(key)}
                className={`p-4 rounded-xl border transition text-left ${
                  selectedEquipment === key
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }`}
              >
                <div className="text-3xl mb-2">{equipmentData[key as keyof typeof equipmentData].image}</div>
                <h3 className="font-bold text-white text-sm mb-1">{equipmentData[key as keyof typeof equipmentData].name.split(' ').slice(0, 2).join(' ')}</h3>
                <p className="text-xs text-slate-400">{equipmentData[key as keyof typeof equipmentData].category}</p>
              </button>
            ))}
          </div>
        )}

        {/* Equipment Details */}
        {activeTab === 'equipment' && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-12">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2">
                <div className="text-7xl mb-6">{current.image}</div>
                <h2 className="text-4xl font-bold text-white mb-2">{current.name}</h2>
                <p className="text-amber-400 font-semibold mb-6">{current.model}</p>
                <p className="text-lg text-slate-300 mb-8">{current.description}</p>

                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Technical Specifications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(current.specs).map(([spec, value]) => (
                      <div key={spec} className="bg-slate-950/50 rounded-lg p-4 border border-slate-700">
                        <p className="text-sm text-slate-400 mb-1">{spec}</p>
                        <p className="font-semibold text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Capabilities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {current.capabilities.map((cap, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <span className="text-slate-300">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="sticky top-24 bg-slate-950/50 rounded-xl border border-slate-700 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Estimated Value</h3>
                  <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-6">
                    {current.replacement}
                  </p>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-amber-400">✓</span>
                      <span>Equipment audit included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-amber-400">✓</span>
                      <span>Maintenance planning</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-amber-400">✓</span>
                      <span>Technical support</span>
                    </div>
                  </div>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition">
                    Get Detailed Quote
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Capabilities Tab */}
        {activeTab === 'capabilities' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-4">Equipment Auditing</h3>
              <p className="text-slate-300 mb-6">Comprehensive assessment and documentation of all manufacturing equipment.</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Complete equipment inventory with photographs</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Current market value estimation</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Operational condition assessment</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Maintenance history and recommendations</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-white mb-4">Production Services</h3>
              <p className="text-slate-300 mb-6">End-to-end manufacturing and production capabilities for all project types.</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Design consultation and optimization</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Small batch to large volume production</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Quality control and testing</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Packaging and delivery coordination</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8">
              <div className="text-5xl mb-4">🔧</div>
              <h3 className="text-2xl font-bold text-white mb-4">Technical Support</h3>
              <p className="text-slate-300 mb-6">Ongoing support, training, and optimization for maximum equipment efficiency.</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Operator training and certification</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Troubleshooting and repairs</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Preventive maintenance planning</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Workflow optimization consulting</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-2xl font-bold text-white mb-4">Asset Tracking</h3>
              <p className="text-slate-300 mb-6">Enterprise-level equipment tracking and management solutions.</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Digital asset registry and database</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Usage analytics and reporting</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Depreciation tracking</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-amber-400 font-bold">→</span>
                  <span className="text-slate-300">Compliance and audit trails</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Audit Service</h3>
              <p className="text-slate-400 mb-6">Single equipment assessment</p>
              <div className="text-4xl font-bold text-amber-400 mb-6">$500-$1500</div>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span>
                  <span>Equipment identification</span>
                </li>
                <li className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span>
                  <span>Valuation report</span>
                </li>
                <li className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span>
                  <span>Condition assessment</span>
                </li>
              </ul>
              <button className="w-full px-4 py-2 border border-amber-400 text-amber-400 font-bold rounded-lg hover:bg-amber-400/10 transition">
                Learn More
              </button>
            </div>

            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-400 rounded-xl p-8 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 px-4 py-1 rounded-full text-sm font-bold">
                  RECOMMENDED
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 mt-4">Complete Audit</h3>
              <p className="text-slate-300 mb-6">Full facility assessment</p>
              <div className="text-4xl font-bold text-amber-400 mb-6">$2000-$5000</div>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span>
                  <span>Full inventory (5-20 units)</span>
                </li>
                <li className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span>
                  <span>Detailed valuations</span>
                </li>
                <li className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span>
                  <span>Maintenance roadmap</span>
                </li>
                <li className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span>
                  <span>3-month support</span>
                </li>
              </ul>
              <button className="w-full px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition">
                Get Started
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Production Quote</h3>
              <p className="text-slate-400 mb-6">Custom project pricing</p>
              <div className="text-4xl font-bold text-amber-400 mb-6">Custom</div>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span>
                  <span>Design consultation</span>
                </li>
                <li className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span>
                  <span>Production planning</span>
                </li>
                <li className="flex gap-2 text-sm text-slate-300">
                  <span className="text-amber-400">✓</span>
                  <span>Quality assurance</span>
                </li>
              </ul>
              <button className="w-full px-4 py-2 border border-amber-400 text-amber-400 font-bold rounded-lg hover:bg-amber-400/10 transition">
                Request Quote
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CTA Footer */}
      <section className="max-w-7xl mx-auto px-6 py-20 mt-12">
        <div className="bg-gradient-to-r from-amber-400/10 to-amber-600/10 border border-amber-400/20 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Partner with SenCere?</h2>
          <p className="text-slate-300 mb-8">Get started with an equipment audit or production quote today</p>
          <button className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition">
            Contact SenCere
          </button>
        </div>
      </section>
    </div>
  );
}
