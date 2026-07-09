'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FormSectionProps {
  title: string;
  number: number;
  side?: 'left' | 'right'; // left = blue, right = red
  children: React.ReactNode;
  className?: string;
}

export default function FormSection({
  title,
  number,
  side = 'left',
  children,
  className = '',
}: FormSectionProps) {
  const isLeft = side === 'left';
  const borderColor = isLeft ? 'border-[#00D9FF]' : 'border-[#FF4D4D]';
  const accentColor = isLeft ? 'text-[#00D9FF]' : 'text-[#FF4D4D]';
  const glowColor = isLeft ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255, 77, 77, 0.1)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className={`border-2 ${borderColor} p-6 bg-black/40 backdrop-blur-sm rounded-sm ${className}`}
      style={{
        boxShadow: `inset 0 0 20px ${glowColor}`,
      }}
    >
      {/* Section Header */}
      <div className="mb-6">
        {/* Section Number - Large and colored */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className={`text-5xl md:text-6xl font-black ${accentColor} mb-2`}
          style={{
            textShadow: isLeft
              ? '0 0 20px rgba(0, 217, 255, 0.4)'
              : '0 0 20px rgba(255, 77, 77, 0.4)',
          }}
        >
          {String(number).padStart(2, '0')}
        </motion.div>

        {/* Section Title */}
        <h3
          className={`text-sm md:text-base uppercase font-black ${accentColor} tracking-widest`}
          style={{
            textShadow: isLeft
              ? '0 0 10px rgba(0, 217, 255, 0.2)'
              : '0 0 10px rgba(255, 77, 77, 0.2)',
          }}
        >
          {title}
        </h3>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {children}
      </div>
    </motion.div>
  );
}
