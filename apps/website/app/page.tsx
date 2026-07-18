'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  Target,
  BookOpen,
  Phone,
  Clock,
} from 'lucide-react';
import IntakeForm from '@/components/IntakeForm';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  icon: React.ReactNode;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface InsightItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

interface PricingTier {
  id: string;
  name: string;
  price: number;
  billing: string;
  description: string;
  features: string[];
  recommended: boolean;
}

interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true, amount: 0.3 },
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  viewport: { once: true, amount: 0.3 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  whileInView: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
  viewport: { once: true, amount: 0.3 },
};

const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true, amount: 0.3 },
};

const slideInRight = {
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true, amount: 0.3 },
};

// ============================================================================
// DATA
// ============================================================================

const projects: Project[] = [
  {
    id: '1',
    name: 'Financial Dashboard',
    description:
      'Real-time financial metrics and business intelligence for enterprise clients',
    tags: ['Analytics', 'Dashboard', 'Real-time'],
    metrics: [
      { label: 'ROI Increase', value: '+245%' },
      { label: 'Time Saved', value: '40hrs/wk' },
    ],
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    id: '2',
    name: 'AI Content Studio',
    description:
      'Generate, edit, and distribute content across all channels automatically',
    tags: ['Content', 'AI', 'Automation'],
    metrics: [
      { label: 'Content/Month', value: '500+' },
      { label: 'Engagement', value: '+180%' },
    ],
    icon: <Sparkles className="w-6 h-6" />,
  },
  {
    id: '3',
    name: 'Customer Intelligence',
    description:
      'Predictive analytics and behavioral insights for smarter sales and support',
    tags: ['CRM', 'AI', 'Insights'],
    metrics: [
      { label: 'Conversion Rate', value: '+62%' },
      { label: 'Churn Reduced', value: '-35%' },
    ],
    icon: <Brain className="w-6 h-6" />,
  },
];

const features: Feature[] = [
  {
    id: '1',
    title: 'AI-First Architecture',
    description:
      'Built from the ground up with AI at its core. Every feature leverages cutting-edge machine learning.',
    icon: <Brain className="w-8 h-8 text-wise-electric" />,
  },
  {
    id: '2',
    title: 'Advanced Automation',
    description:
      'Eliminate repetitive tasks. Automate workflows with intelligent, context-aware AI agents.',
    icon: <Zap className="w-8 h-8 text-purple-400" />,
  },
  {
    id: '3',
    title: 'Creative Studio',
    description:
      'Design, edit, and publish professional-grade content. From audio to video to graphics.',
    icon: <Sparkles className="w-8 h-8 text-pink-400" />,
  },
  {
    id: '4',
    title: 'Real-Time Analytics',
    description:
      'Comprehensive dashboards with live metrics. Get actionable insights at a glance.',
    icon: <TrendingUp className="w-8 h-8 text-emerald-400" />,
  },
  {
    id: '5',
    title: 'Team Collaboration',
    description:
      'Work together seamlessly. Real-time collaboration tools keep your team synchronized.',
    icon: <Users className="w-8 h-8 text-cyan-400" />,
  },
  {
    id: '6',
    title: 'Developer Tools',
    description:
      'Powerful APIs and webhooks. Build custom integrations and extend WISE² to your needs.',
    icon: <Code2 className="w-8 h-8 text-amber-400" />,
  },
];

const insights: InsightItem[] = [
  {
    id: '1',
    title: 'Revenue Optimization',
    description:
      'AI analysis suggests pricing adjustments could increase MRR by 18%. Review recommendations.',
    icon: <TrendingUp className="w-5 h-5" />,
    link: '#',
  },
  {
    id: '2',
    title: 'Customer Churn Risk',
    description:
      '3 high-value accounts show churn indicators. Proactive outreach recommended.',
    icon: <Target className="w-5 h-5" />,
    link: '#',
  },
  {
    id: '3',
    title: 'Efficiency Gains',
    description:
      'Automating your approval workflows would save 12 hours per week. Review setup guide.',
    icon: <Zap className="w-5 h-5" />,
    link: '#',
  },
  {
    id: '4',
    title: 'Content Performance',
    description:
      'Your AI-generated content outperforms manual by 3.2x. Increase production by 50%.',
    icon: <Sparkles className="w-5 h-5" />,
    link: '#',
  },
];

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 199,
    billing: '/month',
    description: 'Perfect for small teams and early-stage startups',
    features: [
      'Up to 5 team members',
      'Basic AI automation workflows',
      'Essential analytics dashboard',
      'Email support',
      '10GB cloud storage',
      'Basic API access',
    ],
    recommended: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 499,
    billing: '/month',
    description: 'The all-in-one operating system for growing businesses',
    features: [
      'Unlimited team members',
      'Advanced AI automation',
      'Creative Studio access',
      'Priority support (2-hour response)',
      'Unlimited cloud storage',
      'Full API + webhook access',
      'Custom integrations',
      'Advanced analytics & forecasting',
      'Team collaboration tools',
      'Monthly strategy sessions',
    ],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1999,
    billing: '/month',
    description: 'Custom solutions for large organizations',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom AI model training',
      '24/7 phone & email support',
      'SLA guarantees (99.99% uptime)',
      'White-label options',
      'Advanced security & compliance',
      'Custom data residency',
      'On-premise deployment options',
      'Quarterly executive reviews',
    ],
    recommended: false,
  },
];

const dashboardMetrics: DashboardMetric[] = [
  { label: 'Monthly Revenue', value: '$482,500', change: '+12.5%', trend: 'up' },
  { label: 'Active Users', value: '2,847', change: '+8.2%', trend: 'up' },
  { label: 'Avg. Response Time', value: '240ms', change: '-15.3%', trend: 'down' },
  { label: 'Customer Satisfaction', value: '4.8/5.0', change: '+0.3', trend: 'up' },
];

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Navigation Header - With Admin Panel link
 */
const Header = () => (
  <header className="fixed top-0 left-0 right-0 z-50 border-b border-wise-surface-2/50 bg-wise-bg/80 backdrop-blur-md">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <div className="text-2xl font-black text-wise-electric">WISE²</div>
      <nav className="flex items-center gap-8">
        <a href="#features" className="text-wise-text-secondary hover:text-wise-text-primary transition-colors text-sm">Features</a>
        <a href="#pricing" className="text-wise-text-secondary hover:text-wise-text-primary transition-colors text-sm">Pricing</a>
        <a href="#live-studio" className="text-wise-text-secondary hover:text-wise-text-primary transition-colors text-sm">Live Studio</a>
        <a href="/admin" className="px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover rounded-lg text-sm font-semibold transition-colors">
          Admin Panel
        </a>
      </nav>
    </div>
  </header>
);

/**
 * Hero Section - Main headline and CTA
 */
const HeroSection = ({ onBookConsultation }: { onBookConsultation: () => void }) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 px-6">
    {/* Animated gradient background */}
    <div className="absolute inset-0 -z-10">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-wise-primary/20 rounded-full mix-blend-screen filter blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-600/10 rounded-full mix-blend-screen filter blur-3xl" />
    </div>

    <motion.div
      className="max-w-5xl mx-auto text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Badge */}
      <motion.div
        className="inline-block mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="px-4 py-2 rounded-full border border-wise-primary/30 bg-wise-primary/10 backdrop-blur-sm">
          <span className="text-sm text-wise-electric font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Enterprise-Grade AI Operating System
          </span>
        </div>
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6 text-wise-text-primary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        The AI Operating System
        <br />
        <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
          for Modern Business
        </span>
      </motion.h1>

      {/* Tagline */}
      <motion.p
        className="text-xl md:text-2xl text-wise-text-secondary mb-4 font-light"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        Artificial Intelligence. Business Management. Creative Studio.
      </motion.p>

      <motion.p
        className="text-lg text-wise-text-muted mb-12 max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        One unified platform that combines AI automation, business intelligence, and creative tools. Transform how your team works.
      </motion.p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <motion.button
          className="px-8 py-4 bg-gradient-to-r from-wise-primary to-wise-primary-hover text-wise-text-primary rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-wise-primary/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wise-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBookConsultation}
          aria-label="Book a consultation with our sales team"
        >
          Book Your Consultation
          <ArrowRight className="w-5 h-5 inline-block ml-2" />
        </motion.button>

        <motion.button
          className="px-8 py-4 border border-wise-primary/40 text-wise-text-secondary rounded-lg font-bold text-lg hover:border-wise-primary hover:text-wise-electric hover:bg-wise-primary-hover/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wise-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.location.href = '/live-studio'}
          aria-label="Watch demo of the live studio workspace"
        >
          ▶ Watch Demo
        </motion.button>
      </div>

      {/* Social Proof */}
      <motion.div
        className="flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-wise-text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-gray-900"
              />
            ))}
          </div>
          <span>
            Trusted by <span className="text-wise-text-primary font-semibold">500+</span> enterprises
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-1 h-1 bg-gray-600 rounded-full" />
          <span>Average ROI: <span className="text-wise-text-primary font-semibold">340%</span></span>
        </div>
      </motion.div>
    </motion.div>
  </section>
);

/**
 * Live Studio Section - Embedded viewer and controls
 */
const LiveStudioSection = () => (
  <section id="live-studio" className="relative py-24 px-6 border-t border-wise-surface-2/50 bg-gradient-to-b from-wise-surface-2/50 to-wise-bg">
    <div className="max-w-6xl mx-auto">
      <motion.div {...fadeInUp} className="mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-wise-text-primary mb-4">
          Live Studio
        </h2>
        <p className="text-xl text-wise-text-muted">
          Stream, collaborate, and create in real-time
        </p>
      </motion.div>

      <motion.div
        {...slideInLeft}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Live Viewer */}
        <div className="lg:col-span-2">
          <div className="relative bg-gradient-to-br from-gray-900 to-wise-bg rounded-xl border border-wise-primary/20 overflow-hidden aspect-video">
            {/* Video placeholder with gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black to-purple-900/30 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-wise-primary/20 border border-wise-primary/50 mb-4">
                  <div className="w-6 h-6 rounded-full bg-red-500 animate-pulse" />
                </div>
                <p className="text-wise-text-muted font-semibold">LIVE NOW</p>
                <p className="text-gray-500 text-sm mt-2">Urban Grind Brand Anthem</p>
              </div>
            </div>

            {/* Live indicator badge */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-wise-bg/60 backdrop-blur px-3 py-2 rounded-full border border-red-500/50">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-red-400">LIVE</span>
            </div>

            {/* Stream stats overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-10 flex gap-4 text-xs bg-wise-bg/60 backdrop-blur p-3 rounded-lg border border-wise-primary/20/50">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-wise-electric" />
                <span className="text-wise-text-secondary">358 viewers</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-wise-text-secondary">42:17 elapsed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Studio Controls & Info */}
        <div className="space-y-6">
          {/* Control Panel */}
          <div className="bg-gradient-to-br from-wise-surface-2/50 to-wise-bg rounded-xl border border-wise-primary/30 p-6">
            <h3 className="text-lg font-bold text-wise-text-primary mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-wise-electric" />
              Studio Controls
            </h3>

            <div className="space-y-3">
              <a href="/studio" className="block w-full px-4 py-3 bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded-lg font-semibold transition-colors text-sm text-center">
                Enter Studio
              </a>
              <button className="w-full px-4 py-3 border border-wise-primary/30 hover:border-wise-primary text-wise-text-secondary hover:text-wise-electric rounded-lg font-semibold transition-colors text-sm">
                Join Chat
              </button>
              <a href="/live-studio" target="_blank" rel="noopener noreferrer" className="block w-full px-4 py-3 border border-wise-primary/30 hover:border-green-400 text-wise-text-secondary hover:text-green-400 rounded-lg font-semibold transition-colors text-sm text-center">
                Open in New Tab
              </a>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-wise-surface-2/50 to-wise-bg rounded-xl border border-wise-primary/20 p-6">
            <h3 className="text-sm font-bold text-wise-text-muted mb-4 uppercase tracking-wider">Stream Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-wise-text-muted text-sm">Viewers</span>
                <span className="text-wise-text-primary font-bold">358</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-wise-text-muted text-sm">Chat Messages</span>
                <span className="text-wise-text-primary font-bold">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-wise-text-muted text-sm">Duration</span>
                <span className="text-wise-text-primary font-bold">42m 17s</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-wise-primary/20">
                <span className="text-wise-text-muted text-sm">Quality</span>
                <span className="text-green-400 font-bold text-sm">4K 60fps</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

/**
 * Project Showcase Section
 */
const ProjectShowcase = () => (
  <section className="py-24 px-6 border-t border-wise-surface-2/50">
    <div className="max-w-6xl mx-auto">
      <motion.div {...fadeInUp} className="mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-wise-text-primary mb-4">
          Featured Case Studies
        </h2>
        <p className="text-xl text-wise-text-muted">
          See how enterprises are transforming with WISE²
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.2 }}
      >
        {projects.map((project) => (
          <motion.div
            key={project.id}
            variants={scaleIn}
            className="group relative p-6 rounded-xl border border-wise-primary/20 bg-gradient-to-br from-wise-surface-2/50 to-wise-bg hover:border-wise-primary/50 hover:bg-wise-surface-2/80 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {project.icon}
              </div>

              <h3 className="text-xl font-bold text-wise-text-primary mb-2 group-hover:text-wise-electric transition-colors">
                {project.name}
              </h3>

              <p className="text-wise-text-muted text-sm mb-4">{project.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-wise-primary/10 text-wise-electric border border-wise-primary/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {project.metrics.map((metric) => (
                  <div key={metric.label}>
                    <div className="text-lg font-bold text-wise-electric">
                      {metric.value}
                    </div>
                    <div className="text-xs text-gray-500">{metric.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 text-wise-electric group-hover:gap-3 transition-all">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-wise-primary rounded px-2 py-1"
                  aria-label={`Read case study: ${project.name}`}
                >
                  <span>Read Case Study</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

/**
 * Key Features Grid Section
 */
const FeaturesSection = () => (
  <section className="py-24 px-6 border-t border-wise-surface-2/50 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent">
    <div className="max-w-6xl mx-auto">
      <motion.div {...fadeInUp} className="mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-wise-text-primary mb-4">
          Powerful Features
        </h2>
        <p className="text-xl text-wise-text-muted">
          Everything you need to run your business on AI
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.2 }}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            variants={fadeInUp}
            className="group p-8 rounded-xl border border-wise-primary/20 bg-gradient-to-br from-wise-surface-2/50 to-wise-bg hover:border-wise-primary/50 hover:shadow-xl hover:shadow-wise-primary/10 transition-all duration-300"
          >
            <div className="mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
              {feature.icon}
            </div>

            <h3 className="text-lg font-bold text-wise-text-primary mb-2 group-hover:text-wise-electric transition-colors">
              {feature.title}
            </h3>

            <p className="text-wise-text-muted text-sm leading-relaxed">
              {feature.description}
            </p>

            <div className="mt-4 flex items-center gap-2 text-wise-electric opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-semibold">Learn more</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

/**
 * Business Health Dashboard Preview
 */
const DashboardPreview = () => (
  <section className="py-24 px-6 border-t border-wise-surface-2/50">
    <div className="max-w-6xl mx-auto">
      <motion.div {...fadeInUp} className="mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-wise-text-primary mb-4">
          Intelligent Dashboards
        </h2>
        <p className="text-xl text-wise-text-muted">
          Real-time business intelligence at your fingertips
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Dashboard visualization */}
        <motion.div
          className="relative"
          variants={slideInLeft}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="relative rounded-xl border border-wise-primary/20 bg-gradient-to-br from-gray-900 to-wise-bg p-8 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-wise-primary/10 rounded-full filter blur-3xl -z-10" />

            {/* Chart mockup */}
            <div className="space-y-8">
              <div className="flex items-end justify-center gap-3 h-48">
                {[40, 60, 45, 80, 55, 90, 70].map((height, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                    style={{ height: `${height}%` }}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${height}%` }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  />
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded bg-gray-800/50 border border-wise-primary/20">
                  <div className="text-xs text-wise-text-muted mb-1">Revenue</div>
                  <div className="text-lg font-bold text-wise-text-primary">$482K</div>
                  <div className="text-xs text-green-400 mt-1">+12.5%</div>
                </div>
                <div className="p-3 rounded bg-gray-800/50 border border-wise-primary/20">
                  <div className="text-xs text-wise-text-muted mb-1">Growth</div>
                  <div className="text-lg font-bold text-wise-text-primary">+34%</div>
                  <div className="text-xs text-green-400 mt-1">YoY</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics list */}
        <motion.div
          className="space-y-6"
          variants={slideInRight}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.3 }}
        >
          {dashboardMetrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              className="group p-4 rounded-lg border border-wise-primary/20 hover:border-wise-primary/50 hover:bg-wise-surface-2/50 transition-all"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-wise-text-muted text-sm font-medium">
                  {metric.label}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    metric.trend === 'up'
                      ? 'text-green-400 bg-green-500/10'
                      : 'text-red-400 bg-red-500/10'
                  }`}
                >
                  {metric.trend === 'up' ? '↑' : '↓'} {metric.change}
                </span>
              </div>
              <div className="text-2xl font-bold text-wise-text-primary group-hover:text-wise-electric transition-colors">
                {metric.value}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  </section>
);

/**
 * AI Insights Panel
 */
const InsightsSection = () => (
  <section className="py-24 px-6 border-t border-wise-surface-2/50 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
    <div className="max-w-6xl mx-auto">
      <motion.div {...fadeInUp} className="mb-16">
        <h2 className="text-4xl md:text-5xl font-black text-wise-text-primary mb-4">
          AI Insights & Recommendations
        </h2>
        <p className="text-xl text-wise-text-muted">
          Actionable intelligence generated automatically for your business
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.2 }}
      >
        {insights.map((insight) => (
          <motion.div
            key={insight.id}
            variants={fadeInUp}
            className="group p-6 rounded-lg border border-wise-primary/20 bg-gradient-to-br from-wise-surface-2/50 to-wise-bg hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1 text-purple-400 group-hover:scale-110 transition-transform">
                {insight.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-wise-text-primary mb-2 group-hover:text-purple-400 transition-colors">
                  {insight.title}
                </h3>
                <p className="text-wise-text-muted text-sm mb-4">{insight.description}</p>
                <a
                  href={insight.link}
                  className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                  aria-label={`Learn more about: ${insight.title}`}
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

/**
 * Pricing Section
 */
const PricingSection = ({ onGetStarted }: { onGetStarted: (tierId: string) => void }) => (
  <section className="py-24 px-6 border-t border-wise-surface-2/50">
    <div className="max-w-6xl mx-auto">
      <motion.div {...fadeInUp} className="mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-black text-wise-text-primary mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-wise-text-muted mb-4">
          No hidden fees. Cancel anytime. Choose the plan that fits your business.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8"
        variants={staggerContainer}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.2 }}
      >
        {pricingTiers.map((tier) => (
          <motion.div
            key={tier.id}
            variants={scaleIn}
            className={`relative rounded-xl border transition-all duration-300 overflow-hidden group ${
              tier.recommended
                ? 'border-wise-primary/50 bg-gradient-to-br from-blue-900/20 to-purple-900/20 shadow-xl shadow-wise-primary/10 md:scale-105'
                : 'border-wise-primary/20 bg-gradient-to-br from-wise-surface-2/50 to-wise-bg hover:border-wise-primary/30 hover:shadow-lg hover:shadow-wise-primary/5'
            }`}
          >
            {/* Glow effect */}
            {tier.recommended && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}

            {tier.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-wise-text-primary text-xs font-bold">
                  Recommended
                </div>
              </div>
            )}

            <div className="relative z-10 p-8">
              <h3 className="text-2xl font-bold text-wise-text-primary mb-2">{tier.name}</h3>
              <p className="text-wise-text-muted text-sm mb-6">{tier.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-black text-wise-text-primary">
                  ${tier.price}
                </span>
                <span className="text-wise-text-muted ml-2">{tier.billing}</span>
              </div>

              <motion.button
                className={`w-full py-3 rounded-lg font-bold transition-all duration-300 mb-8 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wise-primary ${
                  tier.recommended
                    ? 'bg-gradient-to-r from-wise-primary to-wise-primary-hover text-wise-text-primary hover:shadow-lg hover:shadow-wise-primary/50'
                    : 'border border-wise-primary/30 text-wise-text-secondary hover:border-wise-primary hover:text-wise-electric'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onGetStarted(tier.id)}
                aria-label={`Get started with ${tier.name} plan at $${tier.price} per month`}
              >
                Get Started
              </motion.button>

              <div className="space-y-3">
                {tier.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 text-sm text-wise-text-secondary"
                  >
                    <CheckCircle2 className="w-5 h-5 text-wise-electric flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <p className="text-wise-text-muted">
          Questions? <a href="#" className="text-wise-electric hover:text-wise-electric">Contact our sales team</a>
        </p>
      </motion.div>
    </div>
  </section>
);

/**
 * CTA Section
 */
const CTASection = ({ onBookConsultation }: { onBookConsultation: () => void }) => (
  <section className="py-24 px-6 border-t border-wise-surface-2/50">
    <motion.div
      className="max-w-4xl mx-auto text-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-wise-primary/20 rounded-full filter blur-3xl" />
      </div>

      <motion.h2
        className="text-5xl md:text-6xl font-black text-wise-text-primary mb-6"
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.3 }}
      >
        Ready to Transform Your Business?
      </motion.h2>

      <motion.p
        className="text-xl text-wise-text-secondary mb-12 max-w-2xl mx-auto"
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.3 }}
      >
        Join hundreds of enterprises that are already using WISE² to automate,
        analyze, and accelerate their business growth.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center"
        variants={fadeInUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.button
          className="px-8 py-4 bg-gradient-to-r from-wise-primary to-wise-primary-hover text-wise-text-primary rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-wise-primary/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wise-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBookConsultation}
          aria-label="Book a consultation with our sales team"
        >
          Book Your Consultation
          <ArrowRight className="w-5 h-5 inline-block ml-2" />
        </motion.button>

        <motion.button
          className="px-8 py-4 border border-wise-primary text-wise-electric rounded-lg font-bold text-lg hover:bg-wise-primary-hover/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wise-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBookConsultation}
          aria-label="Schedule a demo with our team"
        >
          Schedule a Demo
        </motion.button>
      </motion.div>

      <motion.div
        className="mt-12 text-sm text-wise-text-muted flex flex-col sm:flex-row gap-6 justify-center items-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-wise-electric" />
          <span>Contact: support@wise2.net</span>
        </div>
        <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full" />
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-wise-electric" />
          <span>Documentation: wise2.net/docs</span>
        </div>
      </motion.div>
    </motion.div>
  </section>
);

/**
 * Footer
 */
const Footer = () => (
  <footer className="py-16 px-6 border-t border-wise-surface-2/50 bg-wise-bg/50 backdrop-blur-sm">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div>
          <h3 className="font-bold text-wise-text-primary mb-4 text-sm">Platform</h3>
          <ul className="space-y-2 text-xs text-wise-text-muted">
            <li>
              <a href="/studio" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/#features" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Features
              </a>
            </li>
            <li>
              <a href="/#pricing" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Pricing
              </a>
            </li>
            <li>
              <a href="/status" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Status
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-wise-text-primary mb-4 text-sm">Documentation</h3>
          <ul className="space-y-2 text-xs text-wise-text-muted">
            <li>
              <a href="/docs" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Getting Started
              </a>
            </li>
            <li>
              <a href="/docs/api" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                API Reference
              </a>
            </li>
            <li>
              <a href="/docs/guides" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Guides
              </a>
            </li>
            <li>
              <a href="/docs/support" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Support
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-wise-text-primary mb-4 text-sm">Company</h3>
          <ul className="space-y-2 text-xs text-wise-text-muted">
            <li>
              <a href="/about" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                About
              </a>
            </li>
            <li>
              <a href="/blog" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Blog
              </a>
            </li>
            <li>
              <a href="/careers" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Careers
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-wise-text-primary mb-4 text-sm">Legal</h3>
          <ul className="space-y-2 text-xs text-wise-text-muted">
            <li>
              <a href="/privacy" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Privacy
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Terms
              </a>
            </li>
            <li>
              <a href="/security" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Security
              </a>
            </li>
            <li>
              <a href="/compliance" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric">
                Compliance
              </a>
            </li>
          </ul>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-wise-text-primary mb-2">W2</div>
          <p className="text-xs text-gray-500">WISE² Studio</p>
          <p className="text-xs text-gray-600 mt-4">
            © 2025 Wise Defense LLC
          </p>
        </div>
      </div>

      <div className="border-t border-wise-surface-2 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
        <p>All rights reserved. Built with precision and care.</p>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric" aria-label="Visit WISE² on Twitter">
            Twitter
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric" aria-label="Visit WISE² on LinkedIn">
            LinkedIn
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-wise-electric transition-colors focus:outline-none focus:text-wise-electric" aria-label="Visit WISE² on GitHub">
            GitHub
          </a>
        </div>
      </div>
    </div>
  </footer>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function Home() {
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering interactive content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = (tierId: string) => {
    if (!mounted) return;
    setSelectedTier(tierId);
    setIntakeOpen(true);
  };

  return (
    <div suppressHydrationWarning className="min-h-screen bg-wise-bg text-wise-text-primary overflow-hidden">
      <Header />
      <HeroSection onBookConsultation={() => mounted && setIntakeOpen(true)} />
      {mounted && <LiveStudioSection />}
      <ProjectShowcase />
      <FeaturesSection />
      <DashboardPreview />
      <InsightsSection />
      <PricingSection onGetStarted={handleGetStarted} />
      <CTASection onBookConsultation={() => mounted && setIntakeOpen(true)} />
      {mounted && <IntakeForm isOpen={intakeOpen} onClose={() => setIntakeOpen(false)} />}
      <Footer />
    </div>
  );
}
