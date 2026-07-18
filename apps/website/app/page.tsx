'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Zap,
  TrendingUp,
  Users,
  Code2,
  ArrowRight,
  Sparkles,
  Play,
  LogIn,
  Menu,
  X,
  CheckCircle2,
  Github,
  Linkedin,
  Twitter,
} from 'lucide-react';

// Animated background gradient
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-black" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50" />
    </div>
  );
};

// Premium Header
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-lg shadow-blue-500/50">
            W²
          </div>
          <span className="text-2xl font-black text-white tracking-tight">WISE²</span>
        </motion.div>

        <nav className="hidden lg:flex items-center gap-8">
          <a href="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Features</a>
          <a href="#pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Pricing</a>
          <a href="/studio" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Studio</a>
        </nav>

        <div className="flex items-center gap-3">
          <motion.a href="/auth/login" className="hidden sm:block text-gray-300 hover:text-white text-sm font-medium transition-colors">Sign In</motion.a>
          <motion.a href="/auth/signup" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-500/30" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Get Started</motion.a>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
};

// Hero Section with Premium Design
const HeroSection = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section suppressHydrationWarning className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-20 px-6">
      <motion.div
        className="absolute w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"
        animate={{
          x: mousePosition.x / 10,
          y: mousePosition.y / 10,
        }}
        transition={{ type: 'spring', damping: 30 }}
      />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <span className="inline-block px-4 py-2 border border-blue-500/30 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold uppercase tracking-widest">
            The Enterprise AI Operating System
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-7xl md:text-8xl lg:text-9xl font-black leading-none mb-6 text-white"
        >
          Transform Your
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Business Intelligence
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Enterprise-grade AI that learns your business. Automate workflows, predict outcomes, and scale operations without breaking a sweat.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <motion.a
            href="/auth/signup"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-bold text-lg transition-all shadow-lg shadow-blue-500/50"
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' }}
            whileTap={{ scale: 0.95 }}
          >
            Start Building Now <ArrowRight className="inline ml-2 w-5 h-5" />
          </motion.a>
          <motion.button
            className="px-8 py-4 border border-gray-600 hover:border-blue-500 text-white rounded-lg font-bold text-lg transition-all"
            whileHover={{ borderColor: 'rgb(59, 130, 246)', scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="inline mr-2 w-5 h-5" /> Watch Demo
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12 border-t border-gray-700/50"
        >
          <div>
            <div className="text-3xl font-black text-blue-400">10M+</div>
            <div className="text-sm text-gray-400">AI Operations</div>
          </div>
          <div>
            <div className="text-3xl font-black text-cyan-400">99.99%</div>
            <div className="text-sm text-gray-400">Uptime SLA</div>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-400">500+</div>
            <div className="text-sm text-gray-400">Enterprise Clients</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Premium Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI That Learns Your Business',
      description: 'Custom models trained on your data. Understands your workflows, predicts your needs, scales with you.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Autonomous Automation',
      description: 'Zero-config workflows that adapt. One-click deployments. Handles edge cases other systems miss.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Intelligence',
      description: 'Live dashboards, predictive analytics, anomaly detection. See business outcomes before they happen.',
      color: 'from-emerald-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Built for distributed teams. Real-time sync, version control, audit trails for compliance.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Code2,
      title: 'Developer Friendly',
      description: 'Type-safe APIs, SDKs for every language. OpenAPI spec. Webhook support. Built by engineers for engineers.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Sparkles,
      title: 'Creative Studio',
      description: 'Generate content, design assets, video scripts. AI-powered creativity at enterprise scale.',
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Capabilities That Scale
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Enterprise features without the enterprise complexity. Purpose-built for modern teams.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-8 rounded-2xl border border-gray-800 hover:border-gray-700 bg-gray-900/50 hover:bg-gray-900/80 transition-all backdrop-blur"
              whileHover={{ y: -5 }}
            >
              <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Social Proof Section
const SocialProofSection = () => {
  return (
    <section className="relative py-32 px-6 border-y border-gray-800">
      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-8">Trusted by leading enterprises</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {['Morgan Stanley', 'Goldman Sachs', 'Stripe', 'Figma'].map((company, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="text-gray-600 font-bold text-lg hover:text-gray-300 transition-colors"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Premium Pricing Section
const PricingSection = () => {
  const plans = [
    {
      name: 'Starter',
      price: 199,
      description: 'For teams exploring AI automation',
      features: ['Up to 5 team members', 'Basic AI workflows', '10GB storage', 'Email support', 'Public API access'],
      cta: 'Get Started',
    },
    {
      name: 'Professional',
      price: 499,
      description: 'For growing businesses scaling AI',
      features: ['Unlimited team members', 'Advanced AI models', 'Unlimited storage', '2-hour priority support', 'Full API + webhooks', 'Custom integrations', 'Advanced analytics'],
      cta: 'Start Free Trial',
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: null,
      description: 'For large organizations',
      features: ['Everything in Professional', 'Dedicated account manager', '24/7 priority support', 'SLA guarantee', 'On-premises deployment', 'Custom models', 'Advanced security'],
      cta: 'Contact Sales',
    },
  ];

  return (
    <section id="pricing" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-400">Pay for what you use. No hidden fees. Cancel anytime.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-8 rounded-2xl border transition-all ${
                plan.recommended
                  ? 'border-blue-500/50 bg-gradient-to-br from-blue-950/50 to-cyan-950/50 ring-2 ring-blue-500/20'
                  : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
              }`}
              whileHover={{ y: plan.recommended ? -10 : -5 }}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full text-white text-xs font-bold">
                  RECOMMENDED
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-6 text-sm">{plan.description}</p>
              <div className="mb-6">
                {plan.price ? (
                  <>
                    <div className="text-4xl font-black text-white">${plan.price}</div>
                    <div className="text-gray-400 text-sm">/month billed annually</div>
                  </>
                ) : (
                  <div className="text-2xl font-bold text-white">Custom Pricing</div>
                )}
              </div>
              <button className={`w-full py-3 rounded-lg font-bold mb-8 transition-all ${
                plan.recommended
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                  : 'border border-gray-700 text-white hover:border-gray-600'
              }`}>
                {plan.cta}
              </button>
              <ul className="space-y-3">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-3 text-gray-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Premium Footer
const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-black/50 backdrop-blur py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">W²</div>
              <span className="font-black text-white">WISE²</span>
            </div>
            <p className="text-gray-500 text-sm">Enterprise AI for business transformation.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Studio</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition"><Github className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
          <p>© 2026 WISE² Enterprise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Page
export default function Home() {
  return (
    <main className="bg-black text-white overflow-x-hidden">
      <AnimatedBackground />
      <Header />
      <HeroSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
