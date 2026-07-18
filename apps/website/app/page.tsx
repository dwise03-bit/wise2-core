'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Zap,
  Brain,
  TrendingUp,
  Users,
  Code2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play,
  LogIn,
  UserPlus,
  Menu,
  X,
} from 'lucide-react';

// Premium Header
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#C5C5C5]/10 bg-black/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-[#0055FF] to-[#2A7AFF] rounded-lg flex items-center justify-center font-bold text-white text-sm">
            W²
          </div>
          <span className="text-xl font-bold text-white tracking-tight">WISE²</span>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-12">
          <a href="#features" className="text-[#C5C5C5] hover:text-white transition-colors duration-300 text-sm font-medium">
            Features
          </a>
          <a href="/studio" className="text-[#C5C5C5] hover:text-white transition-colors duration-300 text-sm font-medium flex items-center gap-2">
            <Play className="w-4 h-4" /> Studio
          </a>
          <a href="#pricing" className="text-[#C5C5C5] hover:text-white transition-colors duration-300 text-sm font-medium">
            Pricing
          </a>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <motion.a
            href="/auth/login"
            className="hidden sm:flex text-[#C5C5C5] hover:text-white transition-colors duration-300 text-sm font-medium items-center gap-2"
            whileHover={{ x: 4 }}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </motion.a>
          <motion.a
            href="/auth/signup"
            className="px-6 py-2.5 bg-[#0055FF] hover:bg-[#2A7AFF] text-white rounded-lg font-semibold text-sm transition-all duration-300"
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(0, 85, 255, 0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Start</span>
          </motion.a>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          className="lg:hidden border-t border-[#C5C5C5]/10 bg-black/90 backdrop-blur"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-6 py-4 space-y-4">
            <a href="#features" className="block text-[#C5C5C5] hover:text-white text-sm font-medium">
              Features
            </a>
            <a href="/studio" className="block text-[#C5C5C5] hover:text-white text-sm font-medium">
              Studio
            </a>
            <a href="#pricing" className="block text-[#C5C5C5] hover:text-white text-sm font-medium">
              Pricing
            </a>
          </div>
        </motion.div>
      )}
    </header>
  );
};

// Premium Hero
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20 px-6">
    {/* Premium gradient background */}
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0055FF]/20 rounded-full mix-blend-screen filter blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FF5535]/10 rounded-full mix-blend-screen filter blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black" />
    </div>

    <motion.div
      className="max-w-5xl mx-auto text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Premium Badge */}
      <motion.div
        className="inline-block mb-8 px-4 py-2 border border-[#0055FF]/30 rounded-full bg-[#0055FF]/5 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <span className="text-[#0055FF] font-semibold text-sm">🚀 Enterprise AI Platform</span>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        className="text-6xl md:text-7xl lg:text-8xl font-black leading-tight mb-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Build, Automate,
        <br />
        <span className="bg-gradient-to-r from-[#0055FF] via-[#2A7AFF] to-[#0055FF] bg-clip-text text-transparent">
          Dominate
        </span>
      </motion.h1>

      {/* Subheading */}
      <motion.p
        className="text-xl md:text-2xl text-[#C5C5C5] mb-12 max-w-3xl mx-auto font-light leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        The AI Operating System for Modern Business. Automate workflows, analyze data, create content—all from one unified platform.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.a
          href="/auth/signup"
          className="px-10 py-4 bg-[#0055FF] hover:bg-[#2A7AFF] text-white rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0, 85, 255, 0.5)' }}
          whileTap={{ scale: 0.95 }}
        >
          Start Free Trial <ArrowRight className="w-5 h-5" />
        </motion.a>
        <motion.a
          href="/studio"
          className="px-10 py-4 border-2 border-[#0055FF]/30 text-white rounded-lg font-bold text-lg hover:border-[#0055FF]/60 hover:bg-[#0055FF]/5 transition-all duration-300 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="w-5 h-5" /> Explore Studio
        </motion.a>
      </motion.div>

      {/* Trust indicators */}
      <motion.div
        className="mt-16 pt-8 border-t border-[#C5C5C5]/10 text-sm text-[#C5C5C5]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="font-semibold text-white mb-4">Trusted by Enterprise Teams</p>
        <div className="flex justify-center items-center gap-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">10M+</div>
            <div className="text-xs">AI Tasks Completed</div>
          </div>
          <div className="w-px h-12 bg-[#C5C5C5]/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">99.99%</div>
            <div className="text-xs">Uptime SLA</div>
          </div>
          <div className="w-px h-12 bg-[#C5C5C5]/10" />
          <div className="text-center">
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="text-xs">Automations</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  </section>
);

// Features Grid
const FeaturesSection = () => (
  <section id="features" className="relative py-24 px-6 bg-black">
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
          Powerful Features for Enterprise
        </h2>
        <p className="text-xl text-[#C5C5C5] max-w-2xl mx-auto">
          Everything you need to scale AI operations across your organization
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Brain, title: 'AI-First Architecture', desc: 'Built from ground up with AI at the core' },
          { icon: Zap, title: 'Instant Automation', desc: 'Automate workflows with intelligent agents' },
          { icon: Sparkles, title: 'Content Studio', desc: 'Create, edit, publish professional content' },
          { icon: TrendingUp, title: 'Real-Time Analytics', desc: 'Live dashboards with actionable insights' },
          { icon: Users, title: 'Team Collaboration', desc: 'Built-in tools for seamless teamwork' },
          { icon: Code2, title: 'Developer APIs', desc: 'Powerful APIs and webhook integrations' },
        ].map((feature, i) => (
          <motion.div
            key={i}
            className="p-8 rounded-xl border border-[#0055FF]/20 bg-gradient-to-br from-[#0055FF]/5 to-transparent hover:border-[#0055FF]/50 hover:bg-[#0055FF]/10 transition-all duration-300 group cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
          >
            <feature.icon className="w-12 h-12 text-[#0055FF] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
            <p className="text-[#C5C5C5] font-light">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// Pricing Section
const PricingSection = () => (
  <section id="pricing" className="relative py-24 px-6 bg-black">
    <div className="max-w-7xl mx-auto">
      <motion.div
        className="text-center mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
          Transparent Pricing
        </h2>
        <p className="text-xl text-[#C5C5C5]">
          Scale from startup to enterprise
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { name: 'Starter', price: '$199', desc: 'Perfect for teams' },
          { name: 'Professional', price: '$499', desc: 'For growing businesses', popular: true },
          { name: 'Enterprise', price: 'Custom', desc: 'For large scale' },
        ].map((plan, i) => (
          <motion.div
            key={i}
            className={`p-8 rounded-xl border transition-all duration-300 ${
              plan.popular
                ? 'border-[#0055FF] bg-gradient-to-br from-[#0055FF]/10 to-[#0055FF]/5 scale-105'
                : 'border-[#0055FF]/20 bg-[#0055FF]/5 hover:border-[#0055FF]/50'
            }`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            {plan.popular && (
              <div className="inline-block px-3 py-1 bg-[#0055FF] text-white text-xs font-bold rounded-full mb-4">
                RECOMMENDED
              </div>
            )}
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="text-4xl font-black text-white mb-2">{plan.price}</div>
            <p className="text-[#C5C5C5] mb-6">{plan.desc}</p>
            <button className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
              plan.popular
                ? 'bg-[#0055FF] hover:bg-[#2A7AFF] text-white'
                : 'border border-[#0055FF]/30 text-white hover:border-[#0055FF]/60'
            }`}>
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="border-t border-[#C5C5C5]/10 bg-black py-16 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-4 gap-12 mb-12">
        <div>
          <h4 className="font-bold text-white mb-4">Product</h4>
          <ul className="space-y-2 text-[#C5C5C5] text-sm">
            <li><a href="#features" className="hover:text-white transition">Features</a></li>
            <li><a href="/studio" className="hover:text-white transition">Studio</a></li>
            <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
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
          <h4 className="font-bold text-white mb-4">Resources</h4>
          <ul className="space-y-2 text-[#C5C5C5] text-sm">
            <li><a href="#" className="hover:text-white transition">Docs</a></li>
            <li><a href="#" className="hover:text-white transition">API</a></li>
            <li><a href="#" className="hover:text-white transition">Support</a></li>
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
      </div>
      <div className="border-t border-[#C5C5C5]/10 pt-8 text-center text-[#C5C5C5] text-sm">
        <p>&copy; 2026 WISE² Enterprise. All rights reserved. | contact@wise2.net</p>
      </div>
    </div>
  </footer>
);

// Main Page
export default function HomePage() {
  return (
    <div className="bg-black text-white overflow-hidden">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
