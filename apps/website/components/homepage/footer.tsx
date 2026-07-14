'use client';

import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-cyan-500/20 bg-black/50 backdrop-blur py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded flex items-center justify-center font-bold text-white text-sm">
                W2
              </div>
              <span className="font-bold text-white">WISE²</span>
            </div>
            <p className="text-xs text-gray-400">The AI operating system for modern business owners</p>
          </div>

          {[
            {
              title: 'PRODUCTS',
              links: ['AI Command Center', 'SoundLab', 'Live Studio', 'Drop Shipping AI'],
            },
            {
              title: 'SOLUTIONS',
              links: ['For Businesses', 'For Creators', 'For Agencies', 'For Developers'],
            },
            {
              title: 'RESOURCES',
              links: ['Documentation', 'API Reference', 'Blog', 'Help Center'],
            },
            {
              title: 'COMPANY',
              links: ['About Us', 'Careers', 'Partners', 'Contact'],
            },
          ].map((column, i) => (
            <div key={i}>
              <h4 className="font-bold text-sm mb-4 uppercase tracking-wide text-white">{column.title}</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="hover:text-cyan-400 transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-cyan-500/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>© 2025 Wise Defense LLC. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-cyan-400 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-cyan-400 transition">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
