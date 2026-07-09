'use client';

import { motion } from 'framer-motion';

const workflowSteps = [
  { phase: 'DISCOVER', subtitle: 'WE LISTEN', icon: '🎯' },
  { phase: 'PLAN', subtitle: 'WE STRATEGIZE', icon: '📋' },
  { phase: 'BUILD', subtitle: 'WE CREATE', icon: '🔨' },
  { phase: 'AUTOMATE', subtitle: 'WE SYSTEMIZE', icon: '⚙️' },
  { phase: 'SCALE', subtitle: 'WE GROW', icon: '📈' },
  { phase: 'DOMINATE', subtitle: 'WE WIN', icon: '👑' },
];

export default function WorkflowProgression() {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className="py-16 border-t-2 border-[#00D9FF]/30"
    >
      {/* Workflow Steps */}
      <div className="relative mb-12">
        {/* Connection Line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00D9FF] via-[#FF4D4D] to-[#00D9FF] opacity-30" />

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
          {workflowSteps.map((step, idx) => (
            <motion.div
              key={step.phase}
              variants={itemVariants}
              className="flex flex-col items-center text-center"
            >
              {/* Icon Circle */}
              <motion.div
                whileHover={{ scale: 1.15 }}
                className="mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#00D9FF]/20 to-[#FF4D4D]/20 border-2 border-[#00D9FF] flex items-center justify-center relative z-20"
                style={{
                  boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
                }}
              >
                <span className="text-2xl">{step.icon}</span>
              </motion.div>

              {/* Phase Name */}
              <p className="text-xs md:text-sm font-black text-white uppercase mb-1">
                {step.phase}
              </p>

              {/* Subtitle */}
              <p className="text-xs text-gray-500 font-bold uppercase">
                {step.subtitle}
              </p>

              {/* Arrow to next step */}
              {idx < workflowSteps.length - 1 && (
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -right-2 text-[#00D9FF] font-black opacity-60 hidden lg:block"
                >
                  →
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Tagline */}
      <motion.div
        variants={itemVariants}
        className="text-center space-y-6 mt-16"
      >
        {/* Main Tagline */}
        <motion.p
          className="text-sm md:text-base uppercase tracking-widest text-[#00D9FF] font-bold"
          style={{
            textShadow: '0 0 20px rgba(0, 217, 255, 0.3)',
          }}
        >
          ONE PLATFORM. INFINITE KNOWLEDGE. UNLIMITED CREATION.
        </motion.p>

        {/* WISE² Logo */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            textShadow: [
              '0 0 10px rgba(0, 217, 255, 0)',
              '0 0 30px rgba(0, 217, 255, 0.5)',
              '0 0 10px rgba(0, 217, 255, 0)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl md:text-7xl font-black text-white"
        >
          W²
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-xs md:text-sm text-gray-500 font-bold uppercase"
        >
          BUILDING BRANDS. AUTOMATING SUCCESS.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
