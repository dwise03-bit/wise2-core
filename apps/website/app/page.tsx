'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Zap,
  TrendingUp,
  Users,
  Code2,
  Music,
  Tv2,
  Box,
  BarChart3,
  Megaphone,
  Play,
  LogIn,
  Menu,
  X,
  CheckCircle2,
  Github,
  Linkedin,
  Twitter,
  ShieldCheck,
  Zap as ZapIcon,
} from 'lucide-react';

// Color constants from brand reference
const colors = {
  primary: '#0055FF',
  primaryHover: '#2A7AFF',
  red: '#FF5535',
  black: '#000000',
  chrome: '#C5C5C5',
  success: '#2CD588',
};

// Premium Header
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/80 border-b border-[#C5C5C5]/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-10 h-10 bg-[#C5C5C5] rounded flex items-center justify-center font-black text-black text-sm">
            W²
          </div>
          <div>
            <div className="text-lg font-black text-white">WISE²</div>
            <div className="text-[10px] text-[#C5C5C5] uppercase tracking-widest">Organized Chaos</div>
          </div>
        </motion.div>

        <nav className="hidden lg:flex items-center gap-8">
          <a href="#modules" className="text-[#C5C5C5] hover:text-white transition text-sm font-medium">Products</a>
          <a href="#pricing" className="text-[#C5C5C5] hover:text-white transition text-sm font-medium">Pricing</a>
          <a href="#" className="text-[#C5C5C5] hover:text-white transition text-sm font-medium">Docs</a>
        </nav>

        <div className="flex items-center gap-3">
          <motion.a href="/auth/login" className="hidden sm:block text-[#C5C5C5] hover:text-white text-sm font-medium transition">Login</motion.a>
          <motion.a href="/auth/signup" className="px-5 py-2 bg-[#0055FF] hover:bg-[#2A7AFF] text-white rounded font-semibold text-sm transition-all" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            START FREE
          </motion.a>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section suppressHydrationWarning className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-20 px-6">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-black" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#0055FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF5535]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <span className="inline-block text-[#0055FF] text-sm font-semibold uppercase tracking-widest mb-4">
            🚀 Welcome to WISE²
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-4 text-white"
        >
          ORGANIZED
          <br />
          <span className="text-[#0055FF]">CHAOS</span>
          <br />
          COMMAND CENTER
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-[#C5C5C5] mb-8 max-w-3xl mx-auto leading-relaxed"
        >
          The AI Operating System for Modern Business
          <br />
          Build, automate, and scale your business with AI-powered tools
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <motion.a
            href="/auth/signup"
            className="px-8 py-4 bg-[#0055FF] hover:bg-[#2A7AFF] text-white rounded font-bold text-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            START FREE TODAY
          </motion.a>
          <motion.button
            className="px-8 py-4 border-2 border-[#0055FF] text-[#0055FF] rounded font-bold text-lg transition-all hover:bg-[#0055FF]/10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="inline mr-2 w-5 h-5" /> WATCH DEMO
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex gap-4 justify-center mb-16"
        >
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-[#C5C5C5] border-2 border-black" />
            ))}
          </div>
          <div className="text-[#C5C5C5] text-sm font-medium">
            Trusted by 10,000+ businesses worldwide
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="p-4 border border-[#C5C5C5]/30 rounded bg-black/50">
            <div className="text-2xl font-black text-[#0055FF]">99.99%</div>
            <div className="text-xs text-[#C5C5C5] uppercase tracking-wider">Uptime</div>
          </div>
          <div className="p-4 border border-[#C5C5C5]/30 rounded bg-black/50">
            <div className="text-2xl font-black text-[#2CD588]">10M+</div>
            <div className="text-xs text-[#C5C5C5] uppercase tracking-wider">AI Tasks</div>
          </div>
          <div className="p-4 border border-[#C5C5C5]/30 rounded bg-black/50">
            <div className="text-2xl font-black text-[#FF5535]">500+</div>
            <div className="text-xs text-[#C5C5C5] uppercase tracking-wider">Automations</div>
          </div>
          <div className="p-4 border border-[#C5C5C5]/30 rounded bg-black/50">
            <div className="text-2xl font-black text-[#0055FF]">24/7</div>
            <div className="text-xs text-[#C5C5C5] uppercase tracking-wider">AI Workforce</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Modules Grid Section
const ModulesSection = () => {
  const modules = [
    {
      icon: Brain,
      name: 'AI Command Center',
      description: 'Orchestrate AI automation and manage your intelligent workforce',
      color: '#0055FF',
    },
    {
      icon: Music,
      name: 'SoundLab',
      description: 'Create, edit, and master professional audio content',
      color: '#FF5535',
    },
    {
      icon: Tv2,
      name: 'Live Studio',
      description: 'Stream, collaborate, and engage in real-time production',
      color: '#0055FF',
    },
    {
      icon: Box,
      name: 'Drop Shipping AI',
      description: 'Automate e-commerce operations and inventory management',
      color: '#FF5535',
    },
    {
      icon: Users,
      name: 'CRM & Clients',
      description: 'Manage customers, leads, and relationships at scale',
      color: '#0055FF',
    },
    {
      icon: BarChart3,
      name: 'Analytics',
      description: 'Real-time dashboards and predictive insights',
      color: '#2CD588',
    },
    {
      icon: Megaphone,
      name: 'Marketing Suite',
      description: 'Campaign management, scheduling, and performance tracking',
      color: '#FF5535',
    },
    {
      icon: Code2,
      name: 'Developer API',
      description: 'Powerful APIs, webhooks, and developer platform',
      color: '#0055FF',
    },
  ];

  return (
    <section id="modules" className="relative py-32 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4">
            ALL-IN-ONE BUSINESS OPERATING SYSTEM
          </h2>
          <p className="text-[#C5C5C5] text-lg">8 powerful modules, 1 unified platform</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              viewport={{ once: true }}
              className="p-6 rounded border-2 border-[#C5C5C5]/30 hover:border-[#0055FF]/50 bg-black hover:bg-black/80 transition-all cursor-pointer"
              whileHover={{ y: -5 }}
            >
              <div className="mb-4 p-3 rounded inline-block" style={{ backgroundColor: `${module.color}20` }}>
                <module.icon className="w-6 h-6" style={{ color: module.color }} />
              </div>
              <h3 className="text-lg font-black text-white mb-2">{module.name}</h3>
              <p className="text-sm text-[#C5C5C5] mb-4">{module.description}</p>
              <a href="#" className="text-[#0055FF] hover:text-[#2A7AFF] text-sm font-bold transition">
                Learn More →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Tagline Section
const TaglineSection = () => {
  return (
    <section className="relative py-24 px-6 bg-black border-y border-[#C5C5C5]/30">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-black mb-6">
            <span style={{ color: '#0055FF' }}>BUILD.</span>
            {' '}
            <span style={{ color: '#C5C5C5' }}>AUTOMATE.</span>
            {' '}
            <span style={{ color: '#FF5535' }}>DOMINATE.</span>
          </h2>
          <p className="text-[#C5C5C5] text-xl mb-8">
            WISE² is more than software. It's your unfair competitive advantage.
          </p>
          <motion.a
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-[#0055FF] hover:bg-[#2A7AFF] text-white rounded font-bold text-lg transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            START FREE TODAY
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  return (
    <section id="pricing" className="relative py-32 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-4">Simple Pricing</h2>
          <p className="text-[#C5C5C5] text-lg">No credit card required</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Starter', price: 199, color: '#0055FF' },
            { name: 'Professional', price: 499, color: '#2A7AFF', recommended: true },
            { name: 'Enterprise', price: null, color: '#FF5535' },
          ].map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`p-8 rounded border-2 transition-all ${
                plan.recommended
                  ? `border-[#0055FF] bg-black`
                  : 'border-[#C5C5C5]/30 bg-black hover:border-[#0055FF]/50'
              }`}
              whileHover={{ y: -5 }}
            >
              {plan.recommended && (
                <div className="text-[#0055FF] text-xs font-black uppercase tracking-widest mb-4">★ Recommended</div>
              )}
              <h3 className="text-2xl font-black text-white mb-4">{plan.name}</h3>
              {plan.price ? (
                <div className="mb-6">
                  <div className="text-4xl font-black text-white">${plan.price}</div>
                  <div className="text-[#C5C5C5] text-sm">/month</div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="text-2xl font-black text-[#FF5535]">Custom</div>
                </div>
              )}
              <button className="w-full py-3 rounded font-bold mb-6" style={{ backgroundColor: plan.color, color: '#000' }}>
                Get Started
              </button>
              <ul className="space-y-3">
                <li className="flex gap-2 text-[#C5C5C5] text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: plan.color }} />
                  Full feature access
                </li>
                <li className="flex gap-2 text-[#C5C5C5] text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: plan.color }} />
                  Priority support
                </li>
                <li className="flex gap-2 text-[#C5C5C5] text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: plan.color }} />
                  API access
                </li>
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="border-t border-[#C5C5C5]/30 bg-black px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#C5C5C5] rounded flex items-center justify-center text-black font-black text-xs">W²</div>
              <span className="font-black text-white">WISE²</span>
            </div>
            <p className="text-[#C5C5C5] text-sm">The AI Operating System for Modern Business</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Products</h4>
            <ul className="space-y-2 text-[#C5C5C5] text-sm">
              <li><a href="#" className="hover:text-white transition">AI Command Center</a></li>
              <li><a href="#" className="hover:text-white transition">SoundLab</a></li>
              <li><a href="#" className="hover:text-white transition">Live Studio</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-[#C5C5C5] text-sm">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-[#C5C5C5] text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-[#C5C5C5] hover:text-[#0055FF] transition"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-[#C5C5C5] hover:text-[#0055FF] transition"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-[#C5C5C5] hover:text-[#0055FF] transition"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#C5C5C5]/20 pt-8 text-center text-[#C5C5C5] text-sm">
          <p>© 2026 Wise Defense LLC. ORGANIZED CHAOS COMMAND CENTER</p>
        </div>
      </div>
    </footer>
  );
};

// Main Page
export default function Home() {
  return (
    <main className="bg-black text-white overflow-x-hidden">
      <Header />
      <HeroSection />
      <ModulesSection />
      <TaglineSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
