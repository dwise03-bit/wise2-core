"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

export function CTA4K() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1],
      },
    },
  };

  return (
    <section className="relative py-24 px-6 bg-[#050607] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full filter-glow-cyan blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: "translate(-50%, -50%)" }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-green-500/15 rounded-full filter-glow-green blur-3xl"
          animate={{
            x: [100, -100, 100],
            y: [50, -50, 50],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transform: "translate(-50%, -50%)" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.div
          className="glass-card-4k p-12 text-center space-y-8 border-neon-cyan-4k/30"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-4k">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-neon-green-4k">
                Enterprise Ready
              </span>
            </div>

            <h2 className="text-heading-4k font-black text-white">
              Deploy with confidence
            </h2>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              WISE² Genesis is production-tested and deployed at enterprise
              scale. Start building your autonomous operating system today.
            </p>
          </motion.div>

          {/* Metrics Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8"
          >
            {[
              { value: "4K", label: "Display Resolution" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "Sub-100ms", label: "Response Time" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="space-y-2 p-6 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-colors"
              >
                <div className="text-3xl font-black text-neon-cyan-4k">
                  {stat.value}
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <button className="btn-neon-gradient-4k ripple-effect px-10 py-4 rounded-lg font-bold text-lg inline-flex items-center gap-2">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </button>
            <button className="btn-glass-neon-4k px-10 py-4 inline-flex items-center gap-2">
              Schedule Demo <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4 justify-center items-center py-6 text-sm text-gray-400 border-t border-white/10"
          >
            <span className="flex items-center gap-1">
              ✓ No credit card required
            </span>
            <span className="flex items-center gap-1">
              ✓ 14-day free trial
            </span>
            <span className="flex items-center gap-1">
              ✓ 24/7 support
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
