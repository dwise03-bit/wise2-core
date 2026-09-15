"use client";

import { motion } from "framer-motion";
import {
  Cpu,
  Workflow,
  Layers3,
  Gauge,
  ShieldCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Workflow,
    number: "01",
    title: "AI Workflows",
    description:
      "Turn repeatable work into intelligent systems that execute, remember, and improve automatically.",
    color: "cyan",
  },
  {
    icon: Layers3,
    number: "02",
    title: "Business Infrastructure",
    description:
      "Bring cloud, VPS, edge, desktop, and mobile operations into one coherent layer.",
    color: "green",
  },
  {
    icon: Gauge,
    number: "03",
    title: "Command Visibility",
    description:
      "See what is moving, what is stuck, and what deserves attention before it becomes critical.",
    color: "gold",
  },
  {
    icon: ShieldCheck,
    number: "04",
    title: "Durable Control",
    description:
      "Build with practical security, documented decisions, and systems your team can own.",
    color: "cyan",
  },
  {
    icon: Cpu,
    number: "05",
    title: "Edge Intelligence",
    description:
      "Deploy AI models to local hardware for offline-first operation and privacy-first architecture.",
    color: "green",
  },
  {
    icon: Zap,
    number: "06",
    title: "Real-Time Automation",
    description:
      "Trigger workflows instantly based on system events with millisecond-precision timing.",
    color: "gold",
  },
];

const colorMap = {
  cyan: {
    text: "text-neon-cyan-4k",
    bg: "hover:bg-cyan-500/5",
    border: "hover:border-cyan-400/40",
    glow: "hover:shadow-cyan-500/20",
  },
  green: {
    text: "text-neon-green-4k",
    bg: "hover:bg-green-500/5",
    border: "hover:border-green-400/40",
    glow: "hover:shadow-green-500/20",
  },
  gold: {
    text: "text-neon-gold-4k",
    bg: "hover:bg-yellow-500/5",
    border: "hover:border-yellow-400/40",
    glow: "hover:shadow-yellow-500/20",
  },
};

export function FeatureCards4K() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1], // Spring easing
      },
    },
  };

  return (
    <section className="relative py-20 px-6 bg-[#050607] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter-glow-cyan blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full filter-glow-green blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-4k mb-6">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-neon-cyan-4k">
              Core Capabilities
            </span>
          </div>

          <h2 className="text-heading-4k font-black mb-6">
            Everything you need,{" "}
            <span className="text-neon-green-4k">nothing you don't</span>
          </h2>

          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            WISE² provides six foundational systems that work together to create
            an autonomous operating system capable of managing complex enterprise
            workloads at scale.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid-features-4k"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const colors = colorMap[feature.color as keyof typeof colorMap];

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className={`group glass-card-4k ${colors.bg} ${colors.border} ${colors.glow} relative overflow-hidden`}
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div className="inline-flex">
                    <Icon className={`w-8 h-8 ${colors.text}`} />
                  </div>

                  {/* Number Badge */}
                  <div className={`text-4xl font-black ${colors.text}`}>
                    {feature.number}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 leading-relaxed transition-colors">
                    {feature.description}
                  </p>

                  {/* Learn More Link */}
                  <div className="pt-4">
                    <a
                      href="#"
                      className="underline-neon text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                    >
                      Explore <span>→</span>
                    </a>
                  </div>
                </div>

                {/* Animated Border on Hover */}
                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-current/20 transition-colors pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
