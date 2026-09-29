"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Zap } from "lucide-react";

export function Hero4K() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP-style parallax scroll effect
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollY = window.scrollY;
        const elements = containerRef.current.querySelectorAll("[data-parallax]");

        elements.forEach((el) => {
          const speed = parseFloat((el as HTMLElement).dataset.parallax || "0.5");
          (el as HTMLElement).style.transform = `translateY(${scrollY * speed}px)`;
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
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
        ease: [0.34, 1.56, 0.64, 1], // Spring easing
      },
    },
  };

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
      },
    },
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#050607] flex flex-col items-center justify-center"
    >
      {/* Animated Gradient Mesh Background */}
      <div className="absolute inset-0 hero-mesh-animated opacity-80 pointer-events-none" />

      {/* Gradient Mesh Overlay */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 50%, rgba(0, 217, 255, 0.15) 0%, transparent 50%),
                       radial-gradient(circle at 80% 80%, rgba(0, 255, 127, 0.1) 0%, transparent 60%)`,
        }}
      />

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-10 left-10 w-72 h-72 bg-cyan-500/10 rounded-full filter-glow-cyan blur-3xl"
        data-parallax="0.3"
        animate={{
          x: [0, 40, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-green-500/10 rounded-full filter-glow-green blur-3xl"
        data-parallax="0.5"
        animate={{
          x: [0, -50, 0],
          y: [0, -40, 0],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content Container */}
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Kicker Text */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-4k"
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-neon-cyan-4k">
            4K Maximum Impact Design System
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          variants={glowVariants}
          className="text-display-4k font-black leading-tight text-transparent bg-clip-text"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #F7F7F4 0%, #00D9FF 50%, #00FF7F 100%)",
            textShadow: `
              0 0 30px rgba(0, 217, 255, 0.4),
              0 0 60px rgba(0, 255, 127, 0.2)
            `,
          }}
        >
          Building Empires.<br />
          <span className="text-neon-green-4k">Changing Culture.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-subheading-4k text-gray-300 max-w-3xl mx-auto leading-relaxed"
        >
          WISE² Genesis is an{" "}
          <span className="text-neon-cyan-4k font-bold">AI-native operating system</span> that
          unifies cloud, edge, and local infrastructure into one synchronized
          command center.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
        >
          <button className="btn-neon-gradient-4k ripple-effect px-8 py-4 rounded-lg font-bold text-lg">
            Start Building
          </button>
          <button className="btn-glass-neon-4k px-8 py-4">
            Explore Platform
          </button>
        </motion.div>

        {/* Metrics Row */}
        <motion.div
          variants={itemVariants}
          className="grid-features-4k pt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {[
            {
              number: "01",
              label: "Connected Layer",
              desc: "Everything speaks to everything",
            },
            {
              number: "24/7",
              label: "Always Running",
              desc: "Momentum never stops",
            },
            {
              number: "∞",
              label: "Scale Unlimited",
              desc: "Grow as fast as you can",
            },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="glass-card-4k p-6 text-left hover:border-neon-cyan-4k/60"
            >
              <div className="text-3xl font-black text-neon-green-4k mb-2">
                {metric.number}
              </div>
              <h3 className="font-bold text-sm text-gray-200 mb-1">
                {metric.label}
              </h3>
              <p className="text-xs text-gray-400">{metric.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-6 h-6 text-neon-cyan-4k" />
      </motion.div>
    </div>
  );
}
