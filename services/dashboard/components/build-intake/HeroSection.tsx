import { motion } from 'framer-motion';

export default function HeroSection() {
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
    </motion.div>
  );
}
