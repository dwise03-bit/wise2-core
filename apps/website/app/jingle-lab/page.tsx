'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Music, Zap, Volume2, Download, Share2, CheckCircle2 } from 'lucide-react';
import IntakeForm from '@/components/IntakeForm';
import { Footer } from '@/components/wise';

const stats = [
  { label: 'Jingles Created', value: '8,432' },
  { label: 'Brands Served', value: '2,156' },
  { label: 'Avg Creation Time', value: '2 min' },
];

const templates = [
  { name: 'Upbeat Corporate', icon: '🎯', desc: 'Professional, energetic, trust-building' },
  { name: 'Luxury Premium', icon: '👑', desc: 'Sophisticated, elegant, high-end' },
  { name: 'Tech Innovation', icon: '⚡', desc: 'Modern, futuristic, cutting-edge' },
  { name: 'Funky Groove', icon: '🎸', desc: 'Creative, playful, memorable' },
  { name: 'Minimalist Zen', icon: '🧘', desc: 'Calm, minimal, focused' },
  { name: 'Epic Cinematic', icon: '🎬', desc: 'Grand, dramatic, impactful' },
];

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description: 'Generate professional jingles instantly using advanced AI music composition technology.',
  },
  {
    icon: Music,
    title: 'Template Library',
    description: 'Choose from 50+ professionally designed templates across all industries and moods.',
  },
  {
    icon: Zap,
    title: 'Customization',
    description: 'Fine-tune tempo, instruments, length, and brand voice to match your exact needs.',
  },
  {
    icon: Volume2,
    title: 'Real-Time Preview',
    description: 'Hear your jingle instantly and iterate until it\'s perfect.',
  },
  {
    icon: Download,
    title: 'Multi-Format Export',
    description: 'Download as MP3, WAV, or STEMS for maximum compatibility.',
  },
  {
    icon: Share2,
    title: 'Share & Collaborate',
    description: 'Share jingles with team members and get feedback in real-time.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for exploring',
    features: [
      '5 jingles per month',
      '5-15 second lengths',
      '10 templates',
      'MP3 export only',
      'Community support',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For active creators',
    features: [
      'Unlimited jingles',
      '5-30 second lengths',
      '50+ templates',
      'MP3, WAV, STEMS export',
      'Priority support',
      'Custom instrument packs',
      'Brand voice library',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For agencies & brands',
    features: [
      'Everything in Pro',
      'White-label solutions',
      'Dedicated account manager',
      'API access',
      'Custom voice training',
      'Unlimited users',
      'Commercial rights included',
    ],
  },
];

const testimonials = [
  {
    quote: 'Jingle Lab cut our audio branding production time by 80%. What used to take weeks now takes minutes.',
    author: 'Sarah Chen',
    role: 'Creative Director, TechStart Inc',
    img: '👩‍💼',
  },
  {
    quote: 'The quality is studio-grade. Our clients can\'t believe we\'re creating these jingles in real-time.',
    author: 'Marcus Johnson',
    role: 'Audio Producer, Sound Studios LA',
    img: '👨‍💼',
  },
  {
    quote: 'Finally, a tool that understands brand voice. The customization options are incredible.',
    author: 'Lisa Rodriguez',
    role: 'Brand Manager, Global Media Corp',
    img: '👩‍💼',
  },
];

const faqs = [
  {
    q: 'Can I use the jingles commercially?',
    a: 'Yes! All jingles created with Jingle Lab can be used commercially. Pro and Enterprise tiers include full commercial rights.',
  },
  {
    q: 'What audio formats are supported?',
    a: 'We support MP3, WAV, and STEMS export. STEMS allow you to remix individual instrument tracks.',
  },
  {
    q: 'How are the jingles generated?',
    a: 'Our AI uses advanced music theory and deep learning trained on thousands of professional jingles to generate unique, high-quality audio.',
  },
  {
    q: 'Can I customize existing jingles?',
    a: 'Absolutely! Every jingle can be endlessly customized. Adjust tempo, instruments, length, and more until it\'s perfect.',
  },
  {
    q: 'Do you offer team collaboration?',
    a: 'Yes! Pro and Enterprise tiers support unlimited team members, version control, and real-time feedback.',
  },
  {
    q: 'What if I\'m not happy with a jingle?',
    a: 'Regenerate instantly! If you don\'t like a result, simply click regenerate and we\'ll create a new variation.',
  },
];

export default function JingleLabPage() {
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(57,255,20,0.15),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(0,217,255,0.12),transparent_28%),linear-gradient(180deg,#050505_0%,#0a1408_45%,#020505_100%)]" />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(57,255,20,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20">
          <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-500/10 px-4 py-2 text-sm text-lime-200 backdrop-blur-xl">
                <CheckCircle2 className="h-4 w-4" />
                AI-Powered Audio Branding
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">WISE² CREATIVE SUITE</p>
                <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl" style={{ fontFamily: 'Beyond The Mountains' }}>
                  Professional Jingles in Seconds
                </h1>
                <p className="max-w-2xl text-lg text-slate-300 md:text-xl">
                  Create studio-quality jingles, sonic logos, and brand audio instantly. Choose from professional templates, customize with AI precision, and export to any format.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#create"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#39FF14,#00ff88)] px-6 py-4 text-sm font-semibold text-black shadow-[0_18px_60px_rgba(57,255,20,0.25)] transition hover:brightness-110"
                >
                  Start Creating
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10"
                >
                  View Pricing
                </Link>
                <button
                  type="button"
                  onClick={() => setIntakeOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-6 py-4 text-sm font-semibold text-slate-200 backdrop-blur-xl transition hover:bg-white/5"
                >
                  Request Demo
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-lime-400/15 bg-white/5 p-4 backdrop-blur-2xl shadow-[0_0_40px_rgba(57,255,20,0.08)]"
                  >
                    <div className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.label}</div>
                    <div className="mt-2 text-2xl font-bold text-lime-400">{item.value}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Preview */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-4"
            >
              <div className="rounded-[32px] border border-lime-400/20 bg-[linear-gradient(180deg,rgba(57,255,20,0.08),rgba(10,20,8,0.98))] p-4 shadow-[0_0_60px_rgba(57,255,20,0.12)] backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Jingle Creator</div>
                    <div className="text-xl font-semibold text-white">Real-time. No waiting.</div>
                  </div>
                  <span className="rounded-full border border-lime-400/40 bg-lime-500/15 px-3 py-1 text-xs font-semibold text-lime-300">
                    LIVE
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(57,255,20,0.18),transparent_26%),linear-gradient(180deg,#0a1408_0%,#020505_100%)]">
                  <div className="aspect-[16/10] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Music className="h-16 w-16 text-lime-400 mx-auto opacity-70" />
                      <div className="text-sm text-slate-400">🎵 Tech Startup Jingle</div>
                      <div className="flex justify-center gap-2">
                        <div className="w-1 h-12 bg-lime-400/40 rounded-full" />
                        <div className="w-1 h-8 bg-lime-400/60 rounded-full" />
                        <div className="w-1 h-16 bg-lime-400 rounded-full" />
                        <div className="w-1 h-10 bg-lime-400/50 rounded-full" />
                        <div className="w-1 h-14 bg-lime-400/70 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {features.slice(0, 4).map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={feature.title}
                      className="rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl"
                    >
                      <div className="mb-3 inline-flex rounded-2xl border border-lime-400/20 bg-lime-500/10 p-3 text-lime-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-sm font-semibold text-white">{feature.title}</div>
                      <p className="mt-2 text-xs text-slate-400">{feature.description}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Template Library Section */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Beyond The Mountains' }}>
              Professional Templates
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Start with 50+ professionally designed templates crafted for every industry and brand personality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {templates.map((template, idx) => (
              <motion.div
                key={template.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-[24px] border border-lime-400/15 bg-white/5 p-6 backdrop-blur-2xl hover:border-lime-400/40 hover:bg-lime-500/8 transition-all duration-300 cursor-pointer"
              >
                <div className="text-4xl mb-3">{template.icon}</div>
                <h3 className="font-bold text-white mb-2">{template.name}</h3>
                <p className="text-sm text-slate-400">{template.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Deep Dive */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Beyond The Mountains' }}>
              Powerful Features
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Everything you need to create, customize, and deploy professional audio branding.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="rounded-[28px] border border-lime-400/15 bg-white/5 p-8 backdrop-blur-2xl"
                >
                  <div className="mb-4 inline-flex rounded-2xl border border-lime-400/30 bg-lime-500/15 p-3 text-lime-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-lg">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Beyond The Mountains' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`rounded-[28px] border p-8 backdrop-blur-2xl transition-all duration-300 ${
                  tier.highlighted
                    ? 'border-lime-400/40 bg-lime-500/15 shadow-[0_0_60px_rgba(57,255,20,0.2)] scale-105'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {tier.highlighted && (
                  <div className="inline-block bg-lime-400/20 text-lime-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-lime-400">{tier.price}</span>
                  {tier.period && <span className="text-slate-400 text-sm">{tier.period}</span>}
                </div>
                <button
                  onClick={() => setIntakeOpen(true)}
                  className={`w-full py-3 rounded-xl font-bold transition-all duration-300 mb-8 ${
                    tier.highlighted
                      ? 'bg-lime-400 text-black hover:brightness-110'
                      : 'border border-white/20 text-white hover:border-white/40 hover:bg-white/5'
                  }`}
                >
                  Get Started
                </button>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-lime-400 flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Beyond The Mountains' }}>
              Loved by Creators
            </h2>
            <p className="text-lg text-slate-400">Hear from professionals using Jingle Lab daily</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-2xl"
              >
                <p className="text-slate-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{testimonial.img}</span>
                  <div>
                    <p className="font-bold text-white">{testimonial.author}</p>
                    <p className="text-xs text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Beyond The Mountains' }}>
              Frequently Asked
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="rounded-[20px] border border-white/10 bg-white/5 backdrop-blur-2xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-white">{faq.q}</span>
                  <span className={`text-lime-400 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 py-4 border-t border-white/10 text-slate-400 text-sm">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section id="create" className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] border border-lime-400/30 bg-[linear-gradient(135deg,rgba(57,255,20,0.1),rgba(0,255,136,0.05))] p-8 md:p-16 backdrop-blur-2xl text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Beyond The Mountains' }}>
              Ready to Create?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of creators and brands using Jingle Lab to create professional audio instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/studio"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#39FF14,#00ff88)] px-8 py-4 text-sm font-semibold text-black hover:brightness-110 transition-all duration-300"
              >
                Start Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setIntakeOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-300"
              >
                Talk to Us
              </button>
            </div>
          </motion.div>
        </section>
      </main>

      <IntakeForm isOpen={intakeOpen} onClose={() => setIntakeOpen(false)} />
      <Footer />
    </div>
  );
}
