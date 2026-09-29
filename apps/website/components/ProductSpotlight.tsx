"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const spotlightProducts = [
  {
    id: 0,
    title: "WISE² Command",
    tagline: "One operating view for all decision-making",
    description:
      "The central hub connecting all WISE² systems. See every deployment, every team, every signal in real-time. Command is where scattered work becomes synchronized momentum.",
    features: [
      "Real-time visibility across all operations",
      "Automated decision support with AI",
      "Custom dashboards per role and team",
      "Historical data and trend analysis",
      "Integration with 50+ business tools",
    ],
    metrics: { deployments: "500+", users: "2000+", uptime: "99.7%" },
    image: "⚡",
    color: "from-cyan-500 to-blue-500",
    href: "/platform",
  },
  {
    id: 1,
    title: "AI Phone System",
    tagline: "Intelligent voice for non-stop business",
    description:
      "A voice system that never sleeps. Takes messages, makes callbacks, routes calls intelligently, and learns from every conversation. One phone number. Infinite scaling.",
    features: [
      "Voicemail transcription and smart routing",
      "SMS and follow-up automation",
      "Call recording and analysis",
      "Multi-language support (8 languages)",
      "CRM integration (HubSpot, Salesforce, etc)",
    ],
    metrics: { calls: "50K+/mo", coverage: "8 states", quality: "99.2%" },
    image: "📱",
    color: "from-green-500 to-emerald-500",
    href: "/phone",
  },
  {
    id: 2,
    title: "Field Tech Mobile",
    tagline: "Complete job-site intelligence and dispatch",
    description:
      "Mobile-first platform for field teams. Real-time job dispatch, GPS routing, photo capture, signature collection, and instant reporting. Turn every field moment into data.",
    features: [
      "Real-time job dispatch with GPS",
      "Photo and signature capture",
      "Offline-first architecture",
      "Team communication and coordination",
      "Historical job data and patterns",
    ],
    metrics: { jobs: "1M+/year", teams: "500+", adoption: "98%" },
    image: "🚀",
    color: "from-orange-500 to-red-500",
    href: "/fieldtech",
  },
];

export function ProductSpotlight() {
  const [activeProduct, setActiveProduct] = useState(0);

  return (
    <section className="w-full bg-slate-950 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-cyan-400 text-sm font-mono uppercase tracking-widest mb-4">
            Spotlight
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Core Products That Power Everything
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            These three products form the foundation. Everything else connects to them.
          </p>
        </div>

        {/* Product Carousel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="flex lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
            {spotlightProducts.map((product, idx) => (
              <motion.button
                key={idx}
                onClick={() => setActiveProduct(idx)}
                whileHover={{ x: activeProduct === idx ? 0 : 4 }}
                className={`flex-shrink-0 lg:flex-shrink text-left px-4 py-3 rounded-lg font-semibold transition-all ${
                  activeProduct === idx
                    ? "bg-cyan-500/20 border border-cyan-500 text-cyan-300"
                    : "bg-slate-800 border border-slate-700 text-gray-400 hover:text-gray-300 hover:border-slate-600"
                }`}
              >
                <div className="text-sm whitespace-nowrap">{product.image} {product.title}</div>
              </motion.button>
            ))}
          </div>

          {/* Product Detail */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProduct}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {spotlightProducts.map((product) => {
                  if (product.id !== activeProduct) return null;

                  return (
                    <div key={product.id} className="space-y-8">
                      {/* Header */}
                      <div>
                        <p className="text-cyan-400 text-sm font-mono uppercase tracking-widest mb-2">
                          Featured Product
                        </p>
                        <h3 className={`text-4xl font-bold bg-gradient-to-r ${product.color} bg-clip-text text-transparent mb-2`}>
                          {product.title}
                        </h3>
                        <p className="text-xl text-gray-300 mb-4">{product.tagline}</p>
                        <p className="text-gray-400 text-lg leading-relaxed">{product.description}</p>
                      </div>

                      {/* Features */}
                      <div>
                        <h4 className="text-white font-bold text-lg mb-4">Key Features</h4>
                        <div className="space-y-3">
                          {product.features.map((feature, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-start space-x-3"
                            >
                              <Check className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300">{feature}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4 p-6 bg-slate-800 rounded-xl border border-slate-700">
                        {Object.entries(product.metrics).map(([key, value]) => (
                          <div key={key} className="text-center">
                            <p className={`text-2xl font-bold bg-gradient-to-r ${product.color} bg-clip-text text-transparent`}>
                              {value}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 capitalize">{key}</p>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Link
                        href={product.href}
                        className={`inline-flex items-center space-x-2 bg-gradient-to-r ${product.color} hover:shadow-lg hover:shadow-${product.color.split('-')[1]}-500/50 text-white font-semibold px-8 py-4 rounded-lg transition-all`}
                      >
                        <span>Explore {product.title}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
