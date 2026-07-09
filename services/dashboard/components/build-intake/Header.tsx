'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#00D9FF]/20"
    >
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <div className="text-2xl font-black text-white">W²</div>
          <span className="text-xs uppercase font-bold text-[#00D9FF] tracking-wider hidden sm:block">
            WISE² BUILD
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 md:gap-8">
          <Link
            href="/"
            className="text-sm uppercase font-bold text-gray-300 hover:text-[#00D9FF] transition tracking-wider"
          >
            Home
          </Link>
          <Link
            href="/start-your-build"
            className="text-sm uppercase font-bold text-gray-300 hover:text-[#00D9FF] transition tracking-wider"
          >
            Build Intake
          </Link>

          {/* Sign Up Button */}
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://wise2.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 md:px-6 py-2 md:py-2.5 border-2 border-[#FF4D4D] text-[#FF4D4D] font-bold uppercase text-xs md:text-sm rounded-sm hover:bg-[#FF4D4D]/10 transition tracking-wider"
            style={{
              boxShadow: '0 0 15px rgba(255, 77, 77, 0.2)',
            }}
          >
            Sign Up
          </motion.a>
        </nav>
      </div>
    </motion.header>
  );
}
