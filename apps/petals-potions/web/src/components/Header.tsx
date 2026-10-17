'use client'

import { motion } from 'framer-motion'

export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-display text-purple font-bold"
        >
          Petals & Potions
        </motion.div>

        <div className="hidden md:flex gap-8">
          <a href="#products" className="text-gray-700 hover:text-purple transition">
            Products
          </a>
          <a href="#rituals" className="text-gray-700 hover:text-purple transition">
            Rituals
          </a>
          <a href="#about" className="text-gray-700 hover:text-purple transition">
            About
          </a>
        </div>

        <div className="flex gap-4 items-center">
          <button className="relative w-8 h-8 flex items-center justify-center hover:text-purple transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          <button className="btn-primary text-sm">Sign In</button>
        </div>
      </nav>
    </header>
  )
}
