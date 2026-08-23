'use client';

import { motion } from 'framer-motion';
import { Facebook, Instagram, Music, Youtube, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-black border-t border-gray-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded border-2 border-orange-500 flex items-center justify-center">
                <div className="text-orange-500 font-black text-xs">UWD</div>
              </div>
              <div>
                <div className="text-white font-black text-sm leading-tight">
                  ULTRA WISE
                </div>
                <div className="text-blue-500 font-black text-sm leading-tight">
                  DETAIL
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Premium detailing and auto recon services that bring your vehicle back to life.
            </p>
            <p className="text-xs font-black text-orange-500 mb-1">
              NEW YORK MENTALITY.
            </p>
            <p className="text-xs font-black text-white">
              ULTRA WISE RESULTS.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-black text-white mb-4">QUICK LINKS</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition">
                  Packages
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition">
                  Reviews
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-400 hover:text-orange-500 transition font-bold">
                  Book My Detail
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Service Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-black text-white mb-4">SERVICE AREA</h3>
            <div className="flex items-start gap-2 mb-4">
              <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-bold text-white">
                  Proudly serving South Florida
                </p>
                <ul className="text-xs text-gray-400 space-y-1 mt-2">
                  <li>Broward County</li>
                  <li>Miami-Dade County</li>
                  <li>Palm Beach County</li>
                  <li>surrounding areas</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Social & Powered By */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-black text-white mb-4">FOLLOW US</h3>
            <div className="flex gap-3 mb-8">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center text-white transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center text-white transition"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center text-white transition"
              >
                <Music className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center text-white transition"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Powered By */}
            <div className="text-xs">
              <p className="text-gray-500 mb-2">POWERED BY</p>
              <p className="text-white font-black text-sm">
                WISE² <span className="text-orange-500">AUTOMATION</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            © {currentYear} Ultra Wise Detail. All Rights Reserved.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Premium detailing and auto recon services serving South Florida.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
