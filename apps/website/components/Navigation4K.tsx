"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navigation4K() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "Platform", href: "#platform" },
    { label: "Solutions", href: "#solutions" },
    { label: "Docs", href: "#docs" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav className="nav-sticky-glass">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo with Glow */}
          <Link href="/" className="logo-glow">
            <div className="font-black text-xl">
              WISE<span className="text-neon-cyan-4k">²</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item, idx) => (
              <motion.a
                key={idx}
                href={item.href}
                className="text-gray-300 hover:text-neon-cyan-4k font-medium text-sm transition-colors relative group"
                whileHover={{ y: -2 }}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-green-400 group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex gap-3">
            <button className="px-6 py-2 text-sm font-bold text-gray-300 hover:text-neon-cyan-4k transition-colors border border-gray-500/30 rounded-lg hover:border-cyan-400/50 hover:bg-cyan-400/5">
              Sign In
            </button>
            <button className="btn-neon-gradient-4k px-6 py-2 text-sm">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-4 space-y-2 pb-4"
          >
            {menuItems.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                className="block px-4 py-3 text-gray-300 hover:text-neon-cyan-4k hover:bg-white/5 rounded-lg transition-colors text-sm font-medium"
              >
                {item.label}
              </a>
            ))}
            <div className="space-y-2 pt-4">
              <button className="w-full px-4 py-3 text-sm font-bold text-gray-300 hover:text-neon-cyan-4k border border-gray-500/30 rounded-lg hover:border-cyan-400/50">
                Sign In
              </button>
              <button className="w-full btn-neon-gradient-4k py-3 text-sm">
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
