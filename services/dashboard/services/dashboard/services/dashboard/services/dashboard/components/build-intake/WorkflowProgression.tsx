'use client';

import { motion } from 'framer-motion';

export default function WorkflowProgression() {
  const steps = [
    { number: '01', title: 'Intake', description: 'Tell us your vision' },
    { number: '02', title: 'Strategy', description: 'We plan the path' },
    { number: '03', title: 'Build', description: 'We create excellence' },
    { number: '04', title: 'Launch', description: 'You go live' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center space-y-12"
    >
      <h2 className="text-4xl font-black"
        style={{
          color: '#00D9FF',
          textShadow: '0 0 40px rgba(0, 217, 255, 0.3)',
          letterSpacing: '-0.02em'
        }}>
        The WISE² Process
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="p-6 border-2 border-[#00D9FF]/30 rounded-lg bg-black/50 hover:bg-[#00D9FF]/5 transition"
          >
            <div className="text-4xl font-black text-[#FF4D4D] mb-2">{step.number}</div>
            <h3 className="text-xl font-bold text-[#00D9FF] mb-2">{step.title}</h3>
            <p className="text-gray-400">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
