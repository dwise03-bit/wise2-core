"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const products = [
  {
    number: "01",
    label: "CORE OPERATIONS",
    title: "WISE² Command",
    detail: "One operating view",
    description: "Central dashboard for all business operations, decisions, and real-time visibility.",
    metrics: { deploys: 500, uptime: "99.7%", users: "2000+" },
    href: "/platform",
    color: "from-cyan-500 to-blue-500",
    icon: "⚡",
  },
  {
    number: "02",
    label: "COMMUNICATIONS",
    title: "AI Phone",
    detail: "Voice, SMS, follow-up",
    description: "Intelligent voice system for calls, voicemails, SMS, and follow-up automation.",
    metrics: { calls: "50K+/mo", uptime: "99.9%", coverage: "8 states" },
    href: "/phone",
    color: "from-green-500 to-emerald-500",
    icon: "📱",
  },
  {
    number: "03",
    label: "FIELD OPERATIONS",
    title: "Field Tech",
    detail: "Jobs, teams, history",
    description: "Mobile-first platform for job dispatch, team coordination, and historical tracking.",
    metrics: { deploys: 300, teams: "500+", jobs: "1M+" },
    href: "/fieldtech",
    color: "from-orange-500 to-red-500",
    icon: "🚀",
  },
  {
    number: "04",
    label: "HVAC INTELLIGENCE",
    title: "HVAC OS",
    detail: "Diagnostics + edge",
    description: "Real-time diagnostics, predictive maintenance, and edge AI for HVAC systems.",
    metrics: { systems: "1000+", alerts: "99% early", uptime: "99.8%" },
    href: "/hvac",
    color: "from-purple-500 to-pink-500",
    icon: "❄️",
  },
  {
    number: "05",
    label: "KNOWLEDGE",
    title: "Capture",
    detail: "Turn work into memory",
    description: "Automatically capture and organize work data into searchable institutional memory.",
    metrics: { docs: "100K+", search: "instant", teams: "400+" },
    href: "/apps",
    color: "from-yellow-500 to-orange-500",
    icon: "🧠",
  },
  {
    number: "06",
    label: "INFRASTRUCTURE",
    title: "WISE² Cloud",
    detail: "Host, deploy, monitor",
    description: "Unified cloud infrastructure for seamless deployment, scaling, and monitoring.",
    metrics: { regions: "12", datacenters: "35+", uptime: "99.99%" },
    href: "/cloud",
    color: "from-blue-600 to-cyan-600",
    icon: "☁️",
  },
  {
    number: "07",
    label: "XR OPERATIONS",
    title: "XR Command",
    detail: "Spatial operations",
    description: "Mixed reality command center for immersive team coordination and training.",
    metrics: { devices: "Quest 3S", rooms: "50+", training: "100+" },
    href: "/quest",
    color: "from-indigo-500 to-purple-500",
    icon: "🥽",
  },
  {
    number: "08",
    label: "HARDWARE",
    title: "Lil Lizzy",
    detail: "Playable connected hardware",
    description: "Smart ESP32 device with display, audio, and WiFi for distributed operations.",
    metrics: { deployed: "1000+", uptime: "98%+", refresh: "60fps" },
    href: "/lil-lizzy/led-tag",
    color: "from-pink-500 to-rose-500",
    icon: "🦎",
  },
  {
    number: "09",
    label: "DISCOVERY",
    title: "Business Audit",
    detail: "Find the next move",
    description: "Strategic analysis to identify bottlenecks, opportunities, and the next growth lever.",
    metrics: { audits: "200+", findings: "avg 15", roi: "3.2x avg" },
    href: "/audit",
    color: "from-emerald-500 to-green-500",
    icon: "📊",
  },
];

export function EnhancedEcosystemGrid() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section className="w-full bg-slate-950 py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-cyan-400 text-sm font-mono uppercase tracking-widest mb-4">
            One Platform / Nine Powerhouses
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            The WISE² Ecosystem
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Every product connects to every other. One operating system. Complete business intelligence.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={idx}
              className="group relative"
              onMouseEnter={() => setHoveredId(idx)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Link href={product.href}>
                <div className="relative h-full bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/10">
                  {/* Animated gradient background on hover */}
                  <div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${product.color}`}
                  />

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon + Number */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{product.icon}</span>
                      <span className="text-xs font-mono text-cyan-400 font-bold">
                        {product.number}
                      </span>
                    </div>

                    {/* Category */}
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                      {product.label}
                    </p>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {product.title}
                    </h3>

                    {/* Detail */}
                    <p className="text-sm text-gray-400 mb-4">{product.detail}</p>

                    {/* Description - shows on hover */}
                    <p className="text-sm text-gray-300 mb-4 h-10 overflow-hidden">
                      {hoveredId === idx && (
                        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                          {product.description}
                        </motion.div>
                      )}
                    </p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-slate-700/50">
                      {Object.entries(product.metrics).map(([key, value]) => (
                        <div key={key} className="text-center">
                          <p className="text-xs text-cyan-400 font-bold">{value}</p>
                          <p className="text-xs text-gray-500 capitalize">{key}</p>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center text-cyan-400 text-sm font-semibold group-hover:text-cyan-300 transition-colors">
                      Explore <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-4">All products work together seamlessly</p>
          <Link
            href="/platform"
            className="inline-flex items-center bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-all"
          >
            <Zap className="w-4 h-4 mr-2" />
            Explore Full Platform
          </Link>
        </div>
      </div>
    </section>
  );
}
