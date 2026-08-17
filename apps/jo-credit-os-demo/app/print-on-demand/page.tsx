'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Printer, ShoppingCart, Zap, Palette, Truck, Users, CheckCircle2, Edit3, Clock } from 'lucide-react';
import IntakeForm from '@/components/IntakeForm';
import { Footer } from '@/components/wise';

const stats = [
  { label: 'Orders Fulfilled', value: '47,892' },
  { label: 'Happy Customers', value: '12,456' },
  { label: 'Same-Day Setup', value: '100%' },
];

const products = [
  { name: 'Business Cards', icon: '🖨️', desc: 'Custom design, instant print' },
  { name: 'Flyers & Brochures', icon: '📄', desc: 'High-impact marketing materials' },
  { name: 'T-Shirts & Apparel', icon: '👕', desc: 'Premium quality, custom cuts' },
  { name: 'Mugs & Drinkware', icon: '☕', desc: 'Branded gifts and merchandise' },
  { name: 'Banners & Signage', icon: '🪧', desc: 'Indoor & outdoor solutions' },
  { name: 'Stickers & Labels', icon: '🏷️', desc: 'Custom sizes and finishes' },
  { name: 'Hoodies & Sweats', icon: '🧥', desc: 'Premium embroidered options' },
  { name: 'Tote Bags & Pouches', icon: '👜', desc: 'Eco-friendly carrying solutions' },
];

const features = [
  {
    icon: Palette,
    title: 'Design Studio',
    description: 'Use our intuitive design tool or upload your own artwork. Real-time preview for all products.',
  },
  {
    icon: Edit3,
    title: 'Template Library',
    description: '1000+ professionally designed templates for every product category and industry.',
  },
  {
    icon: Zap,
    title: 'Instant Quotes',
    description: 'Get accurate pricing instantly based on product, quantity, and options.',
  },
  {
    icon: Clock,
    title: 'Fast Turnaround',
    description: 'Rush printing available. Most orders ship within 2-5 business days.',
  },
  {
    icon: Truck,
    title: 'Shipping Solutions',
    description: 'Flat-rate shipping, bulk discounts, and direct-to-customer options available.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Invite team members, manage approvals, and track orders together in real-time.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For small projects',
    features: [
      '10 designs per month',
      'Basic template access',
      'Standard shipping only',
      'Community forum support',
      'Watermark on previews',
    ],
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For active creators',
    features: [
      'Unlimited designs',
      '1000+ premium templates',
      'Bulk order discounts',
      'Priority support',
      'No watermarks',
      'Advanced analytics',
      'Custom branding',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For agencies & resellers',
    features: [
      'Everything in Professional',
      'White-label platform',
      'API access & integrations',
      'Dedicated account manager',
      'Wholesale pricing',
      'Custom fulfillment options',
      'Advanced reporting',
    ],
  },
];

const portfolio = [
  {
    category: 'Business Materials',
    items: [
      { name: 'Minimalist Business Cards', img: '🖨️' },
      { name: 'Premium Letterhead', img: '📄' },
      { name: 'Brand Package Deal', img: '📦' },
    ],
  },
  {
    category: 'Apparel & Merchandise',
    items: [
      { name: 'Tech Company Tees', img: '👕' },
      { name: 'Branded Hoodies', img: '🧥' },
      { name: 'Merch Collections', img: '🎁' },
    ],
  },
  {
    category: 'Marketing Materials',
    items: [
      { name: 'Event Flyers', img: '📢' },
      { name: 'Campaign Banners', img: '🪧' },
      { name: 'Promotional Postcards', img: '📮' },
    ],
  },
];

const testimonials = [
  {
    quote: 'The quality is incredible. We switched from our local printer and saved 40% on costs while improving turnaround time.',
    author: 'James Wilson',
    role: 'Operations Manager, StartupHub',
    img: '👨‍💼',
  },
  {
    quote: 'The design studio is so easy to use. Our clients can see exactly what they\'re getting before we print.',
    author: 'Emma Thompson',
    role: 'Marketing Lead, Creative Agency',
    img: '👩‍💼',
  },
  {
    quote: 'We handle our own merchandise now. The pricing is fair and the quality is professional-grade.',
    author: 'David Chang',
    role: 'Brand Director, E-Sports Team',
    img: '👨‍💼',
  },
];

const faqs = [
  {
    q: 'What file formats do you accept?',
    a: 'We accept PDF, PNG, JPG, SVG, and native files from design tools. Our design studio converts everything automatically.',
  },
  {
    q: 'How long does printing actually take?',
    a: 'Standard turnaround is 2-5 business days. We offer 24-hour rush printing for an additional fee on most products.',
  },
  {
    q: 'Do you handle international shipping?',
    a: 'Yes! We ship to 150+ countries. Use our calculator to see exact costs and delivery times for your location.',
  },
  {
    q: 'Can I order just 10 items or do you require minimum quantities?',
    a: 'No minimums! Order 1 item or 10,000. Bulk pricing kicks in automatically as quantities increase.',
  },
  {
    q: 'What\'s your quality guarantee?',
    a: 'We stand behind every print. If you\'re not satisfied, we reprint free or provide a full refund.',
  },
  {
    q: 'Do you offer white-label solutions?',
    a: 'Absolutely! Enterprise customers can white-label our platform completely and add their own branding.',
  },
];

export default function PrintOnDemandPage() {
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(0,217,255,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(191,196,201,0.08),transparent_28%),linear-gradient(180deg,#050505_0%,#0a0d12_45%,#020505_100%)]" />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
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
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200 backdrop-blur-xl">
                <CheckCircle2 className="h-4 w-4" />
                Professional Print On Demand
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">WISE² FULFILLMENT</p>
                <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl" style={{ fontFamily: 'Beyond The Mountains' }}>
                  Print Anything, Instantly
                </h1>
                <p className="max-w-2xl text-lg text-slate-300 md:text-xl">
                  Professional printing for business cards, apparel, merchandise, and marketing materials. Design online, print on-demand, ship worldwide—zero minimum order.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#design"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#00d9ff,#005eff)] px-6 py-4 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(0,153,255,0.25)] transition hover:brightness-110"
                >
                  Start Designing
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/10"
                >
                  See Pricing
                </Link>
                <button
                  type="button"
                  onClick={() => setIntakeOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 px-6 py-4 text-sm font-semibold text-slate-200 backdrop-blur-xl transition hover:bg-white/5"
                >
                  Get Bulk Discount
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[24px] border border-cyan-400/15 bg-white/5 p-4 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,153,255,0.08)]"
                  >
                    <div className="text-xs uppercase tracking-[0.35em] text-slate-500">{item.label}</div>
                    <div className="mt-2 text-2xl font-bold text-cyan-400">{item.value}</div>
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
              <div className="rounded-[32px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(0,217,255,0.08),rgba(10,13,18,0.98))] p-4 shadow-[0_0_60px_rgba(0,153,255,0.12)] backdrop-blur-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Design Studio</div>
                    <div className="text-xl font-semibold text-white">Create & Preview</div>
                  </div>
                  <span className="rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">
                    LIVE
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_center,_rgba(0,153,255,0.18),transparent_26%),linear-gradient(180deg,#0a0d12_0%,#020505_100%)]">
                  <div className="aspect-[16/10] flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Printer className="h-16 w-16 text-cyan-400 mx-auto opacity-70" />
                      <div className="text-sm text-slate-400">Business Card Preview</div>
                      <div className="flex justify-center gap-2 px-4">
                        <div className="w-32 h-20 border-2 border-cyan-400/40 rounded-lg flex items-center justify-center bg-white/5">
                          <div className="text-center">
                            <div className="text-xs font-bold text-slate-300">ACME Corp</div>
                            <div className="text-xs text-slate-400">john@acme.com</div>
                          </div>
                        </div>
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
                      <div className="mb-3 inline-flex rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-3 text-cyan-300">
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

        {/* Product Catalog Section */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Beyond The Mountains' }}>
              Complete Product Catalog
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Print business materials, branded apparel, merchandise, and more. Everything in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {products.map((product, idx) => (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="rounded-[24px] border border-cyan-400/15 bg-white/5 p-6 backdrop-blur-2xl hover:border-cyan-400/40 hover:bg-cyan-500/8 transition-all duration-300 cursor-pointer"
              >
                <div className="text-4xl mb-3">{product.icon}</div>
                <h3 className="font-bold text-white mb-2">{product.name}</h3>
                <p className="text-sm text-slate-400">{product.desc}</p>
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
              Design, produce, and ship on your terms. Professional grade, from start to finish.
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
                  className="rounded-[28px] border border-cyan-400/15 bg-white/5 p-8 backdrop-blur-2xl"
                >
                  <div className="mb-4 inline-flex rounded-2xl border border-cyan-400/30 bg-cyan-500/15 p-3 text-cyan-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-white mb-3 text-lg">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Portfolio Section */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Beyond The Mountains' }}>
              Portfolio Showcase
            </h2>
            <p className="text-lg text-slate-400">See what's possible with our print services</p>
          </div>

          <div className="space-y-16">
            {portfolio.map((category, catIdx) => (
              <div key={category.category}>
                <h3 className="text-2xl font-bold mb-6 text-cyan-300">{category.category}</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {category.items.map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: (catIdx * 3 + idx) * 0.08 }}
                      className="rounded-[24px] border border-cyan-400/15 bg-white/5 p-6 backdrop-blur-2xl hover:border-cyan-400/40 transition-all duration-300"
                    >
                      <div className="text-5xl mb-4">{item.img}</div>
                      <h4 className="font-bold text-white">{item.name}</h4>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: 'Beyond The Mountains' }}>
              Simple Pricing Plans
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Start free. Scale as you grow. No setup fees or surprises.
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
                    ? 'border-cyan-400/40 bg-cyan-500/15 shadow-[0_0_60px_rgba(0,153,255,0.2)] scale-105'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {tier.highlighted && (
                  <div className="inline-block bg-cyan-400/20 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
                    BEST VALUE
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-sm mb-6">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-black text-cyan-400">{tier.price}</span>
                  {tier.period && <span className="text-slate-400 text-sm">{tier.period}</span>}
                </div>
                <button
                  onClick={() => setIntakeOpen(true)}
                  className={`w-full py-3 rounded-xl font-bold transition-all duration-300 mb-8 ${
                    tier.highlighted
                      ? 'bg-cyan-400 text-black hover:brightness-110'
                      : 'border border-white/20 text-white hover:border-white/40 hover:bg-white/5'
                  }`}
                >
                  Get Started
                </button>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
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
              Trusted by Teams Everywhere
            </h2>
            <p className="text-lg text-slate-400">From startups to enterprises</p>
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
              Common Questions
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
                  <span className={`text-cyan-400 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`}>
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
        <section id="design" className="mx-auto max-w-6xl px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] border border-cyan-400/30 bg-[linear-gradient(135deg,rgba(0,217,255,0.1),rgba(0,153,255,0.05))] p-8 md:p-16 backdrop-blur-2xl text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ fontFamily: 'Beyond The Mountains' }}>
              Start Printing Today
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses printing professionally online. No minimums, no hassle, just quality prints delivered fast.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/studio"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#00d9ff,#005eff)] px-8 py-4 text-sm font-semibold text-white hover:brightness-110 transition-all duration-300"
              >
                Open Design Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setIntakeOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white hover:bg-white/10 transition-all duration-300"
              >
                Schedule Demo
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
