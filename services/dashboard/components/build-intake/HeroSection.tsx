'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  const images = [
    { src: '/01_wise2_the_operator_danny_wise.png', alt: 'The Operator' },
    { src: '/02_wise2_darrin_wise_solo.png', alt: 'Darrin' },
    { src: '/03_wise2_the_idea_hunters_darrin_danny.png', alt: 'Idea Hunters' },
    { src: '/04_wise2_core_brand_asset_board.png', alt: 'Brand Assets' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="text-center space-y-6 mt-20"
    >
      <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight"
        style={{
          color: '#FFFFFF',
          textShadow: '0 0 60px rgba(0, 217, 255, 0.5), 0 0 100px rgba(0, 217, 255, 0.2)',
          letterSpacing: '-0.03em',
          fontFamily: "'Bebas Neue', serif"
        }}>
        BUILD YOUR DREAM.
      </h1>
      <p className="text-xl sm:text-2xl text-gray-200 max-w-3xl mx-auto">
        From concept to production. We transform your vision into reality.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 max-w-5xl mx-auto"
      >
        {images.map((img, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="rounded-lg overflow-hidden border-2 border-[#00D9FF]/30 hover:border-[#00D9FF] transition-colors"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-64 md:h-80 object-cover"
            />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
