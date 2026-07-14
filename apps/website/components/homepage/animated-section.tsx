'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  staggerChildren?: boolean;
}

const staggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const noStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function AnimatedSection({
  children,
  className = '',
  staggerChildren = true,
}: AnimatedSectionProps) {
  const variants = staggerChildren ? staggerVariants : noStaggerVariants;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      variants={variants}
      viewport={{ once: true, margin: '-100px' }}
    >
      {children}
    </motion.div>
  );
}
