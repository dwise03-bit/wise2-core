'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export default function LiveStudioPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Premium background grid effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0094FF]/5 via-black to-black" />
        <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(90deg,rgba(0,148,255,0.1)_1px,transparent_1px),linear-gradient(rgba(0,148,255,0.1)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="relative z-10">
        {/* HERO - Premium commanding section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-32 overflow-hidden">
          {/* Animated background elements */}
          <MotionDiv
            className="absolute top-40 left-1/4 w-72 h-72 bg-[#0094FF]/10 rounded-full blur-[80px]"
            animate={{ y: [0, 30, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <MotionDiv
            className="absolute bottom-40 right-1/4 w-96 h-96 bg-[#E53935]/5 rounded-full blur-[100px]"
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          />

          {/* Content */}
          <motion.div
            className="relative z-20 text-center max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0094FF]/30 bg-[#0094FF]/5 backdrop-blur-sm">
                <span className="inline-block w-2 h-2 rounded-full bg-[#0094FF] animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0094FF]">Live now. Organized chaos.</span>
              </div>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6"
            >
              <span className="block">The Operating System</span>
              <span className="block bg-gradient-to-r from-[#0094FF] via-[#0094FF] to-[#E53935] bg-clip-text text-transparent">
                for Organized Chaos
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Where creators, builders, and entrepreneurs command their empire. Real-time collaboration. Zero friction. Maximum impact.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <button className="group relative px-8 py-4 font-bold uppercase tracking-wider text-sm text-black bg-[#0094FF] rounded-lg hover:shadow-[0_0_40px_rgba(0,148,255,0.6)] transition-all duration-300 hover:-translate-y-0.5">
                Enter the Studio
                <span className="absolute inset-0 rounded-lg bg-[#0094FF] opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
              <button className="px-8 py-4 font-bold uppercase tracking-wider text-sm border border-[#0094FF]/50 text-[#0094FF] rounded-lg hover:border-[#0094FF] hover:bg-[#0094FF]/5 transition-all duration-300">
                Watch Demo
              </button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-8 justify-center text-center text-sm"
            >
              <div>
                <div className="text-2xl font-bold text-[#0094FF]">10k+</div>
                <div className="text-gray-400">Creators & Builders</div>
              </div>
              <div className="hidden sm:block w-px bg-gray-700" />
              <div>
                <div className="text-2xl font-bold text-[#0094FF]">$2.4B+</div>
                <div className="text-gray-400">Value Created</div>
              </div>
              <div className="hidden sm:block w-px bg-gray-700" />
              <div>
                <div className="text-2xl font-bold text-[#0094FF]">99.9%</div>
                <div className="text-gray-400">Uptime SLA</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-[#0094FF]/30 rounded-full flex justify-center pt-2">
              <div className="w-1 h-2 bg-[#0094FF] rounded-full animate-pulse" />
            </div>
          </motion.div>
        </section>

        {/* PILLARS - Core value propositions */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-20"
            >
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                Four Pillars of <span className="text-[#0094FF]">Organized Chaos</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl">
                Built for the modern entrepreneur who refuses to choose between power and simplicity.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  number: '01',
                  title: 'Command Central',
                  description: 'One dashboard. Infinite possibilities. Control everything from live streaming to financial operations.',
                  icon: '⚡',
                  color: '#0094FF',
                },
                {
                  number: '02',
                  title: 'Intelligent Automation',
                  description: 'AI that learns your chaos and turns it into order. Work smarter, not harder.',
                  icon: '🧠',
                  color: '#0094FF',
                },
                {
                  number: '03',
                  title: 'Real-Time Collaboration',
                  description: 'Your team, anywhere. Build together with zero lag. Live feedback loops that matter.',
                  icon: '🔗',
                  color: '#E53935',
                },
                {
                  number: '04',
                  title: 'Enterprise Security',
                  description: 'Bank-grade protection. Your empire stays yours. SOC 2. HIPAA. GDPR. Done.',
                  icon: '🛡️',
                  color: '#0094FF',
                },
              ].map((pillar, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="group relative overflow-hidden rounded-2xl border border-gray-800 hover:border-[#0094FF]/50 bg-gray-900/30 backdrop-blur-sm p-8 hover:bg-gray-900/50 transition-all duration-300"
                >
                  {/* Gradient accent */}
                  <div
                    className="absolute -top-1 -left-1 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-300"
                    style={{ backgroundColor: pillar.color }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-4xl font-black text-gray-700 group-hover:text-gray-600 transition">{pillar.number}</span>
                      <span className="text-4xl">{pillar.icon}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-[#0094FF] transition-colors duration-300">
                      {pillar.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">{pillar.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FEATURE SHOWCASE - Visual demonstration */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-20"
            >
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                See <span className="text-[#E53935]">Organized Chaos</span> in Action
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden border border-[#0094FF]/20 bg-gradient-to-b from-[#0094FF]/10 to-transparent p-1"
            >
              <div className="bg-black rounded-3xl p-8 sm:p-12">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#0094FF]/20 via-black to-[#E53935]/10 flex items-center justify-center border border-[#0094FF]/20">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-gray-400">Live Studio Command Center</p>
                    <p className="text-sm text-gray-600 mt-2">Real-time collaboration dashboard</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-4xl sm:text-5xl font-black mb-4">
                Trusted by <span className="text-[#0094FF]">Industry Leaders</span>
              </h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                {
                  quote: 'WISE² is how we scaled from zero to unicorn in 18 months.',
                  author: 'Sarah Chen',
                  role: 'Founder & CEO, Creative Studios Inc.',
                  avatar: '👩‍💼',
                },
                {
                  quote: 'The only platform that actually understands chaos as a feature, not a bug.',
                  author: 'Marcus Johnson',
                  role: 'CTO, Innovation Labs',
                  avatar: '👨‍💻',
                },
                {
                  quote: 'Our team productivity increased 340%. Your move, competitors.',
                  author: 'Alex Rivera',
                  role: 'Head of Operations, TechCorp',
                  avatar: '👨‍🔬',
                },
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="relative group rounded-2xl border border-gray-800 hover:border-[#0094FF]/50 bg-gray-900/30 backdrop-blur-sm p-8 hover:bg-gray-900/50 transition-all duration-300"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-[#0094FF]">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 text-lg leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-3 pt-6 border-t border-gray-800">
                    <span className="text-3xl">{testimonial.avatar}</span>
                    <div>
                      <p className="font-bold text-white">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl sm:text-6xl font-black mb-6">
                Ready to Command <span className="text-[#E53935]">Your</span> <span className="text-[#0094FF]">Chaos?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                Join 10,000+ creators and builders who've already made the leap. Your empire awaits.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/workspace" className="group relative px-8 py-4 font-bold uppercase tracking-wider text-sm text-black bg-[#0094FF] rounded-lg hover:shadow-[0_0_40px_rgba(0,148,255,0.6)] transition-all duration-300 hover:-translate-y-0.5 text-center">
                  Start Free Trial
                  <span className="absolute inset-0 rounded-lg bg-[#0094FF] opacity-0 group-hover:opacity-10 transition-opacity" />
                </a>
                <a href="mailto:demo@wise2.com" className="px-8 py-4 font-bold uppercase tracking-wider text-sm border border-[#E53935]/50 text-[#E53935] rounded-lg hover:border-[#E53935] hover:bg-[#E53935]/5 transition-all duration-300 text-center">
                  Schedule Demo
                </a>
              </div>

              <p className="text-sm text-gray-500 mt-8">
                No credit card required. 14 days free. Full access to all features.
              </p>
            </motion.div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="relative border-t border-gray-800 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div>
                <h3 className="text-2xl font-black mb-2">WISE²</h3>
                <p className="text-gray-500 text-sm">The operating system for organized chaos.</p>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[#0094FF]">Product</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-[#0094FF] transition">Studio</a></li>
                  <li><a href="#" className="hover:text-[#0094FF] transition">Analytics</a></li>
                  <li><a href="#" className="hover:text-[#0094FF] transition">Automation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[#0094FF]">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-[#0094FF] transition">About</a></li>
                  <li><a href="#" className="hover:text-[#0094FF] transition">Blog</a></li>
                  <li><a href="#" className="hover:text-[#0094FF] transition">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4 text-[#0094FF]">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-[#0094FF] transition">Privacy</a></li>
                  <li><a href="#" className="hover:text-[#0094FF] transition">Terms</a></li>
                  <li><a href="#" className="hover:text-[#0094FF] transition">Security</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
              <p>&copy; 2026 WISE² Inc. All rights reserved.</p>
              <div className="flex gap-4 mt-4 sm:mt-0">
                <a href="#" className="hover:text-[#0094FF] transition">Twitter</a>
                <a href="#" className="hover:text-[#0094FF] transition">LinkedIn</a>
                <a href="#" className="hover:text-[#0094FF] transition">GitHub</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
