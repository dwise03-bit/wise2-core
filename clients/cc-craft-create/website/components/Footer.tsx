import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cc-dark text-white mt-auto safe-bottom">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-lora font-bold mb-3">CC Craft & Create</h3>
            <p className="text-sm text-gray-300 mb-2">
              Crafted for the Moment. Created for the Memory.
            </p>
            <p className="text-sm font-script text-cc-gold text-xl">
              You Dream It. I&apos;ll Create It!
            </p>
            <p className="text-xs text-gray-400 mt-3 uppercase tracking-wide">
              Nurse. Entrepreneur. Creator. Purpose Driven.
            </p>
          </div>

          <div>
            <h4 className="font-poppins font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-cc-gold transition-colors">All Products</Link></li>
              <li><Link href="/occasions" className="hover:text-cc-gold transition-colors">By Occasion</Link></li>
              <li><Link href="/business" className="hover:text-cc-gold transition-colors">Business Packages</Link></li>
              <li><Link href="/gallery" className="hover:text-cc-gold transition-colors">Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-poppins font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-cc-gold transition-colors">About CC</Link></li>
              <li><Link href="/contact" className="hover:text-cc-gold transition-colors">Contact</Link></li>
              <li><Link href="/cart" className="hover:text-cc-gold transition-colors">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-poppins font-bold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:hello@ccraftandcreate.com" className="hover:text-cc-gold transition-colors">
                  hello@ccraftandcreate.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/cc.craftandcreate"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cc-gold transition-colors"
                >
                  @cc.craftandcreate
                </a>
              </li>
              <li className="text-gray-400 text-xs pt-2">
                Local pickup & delivery available
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400 space-y-2">
          <p className="text-cc-lilac tracking-wide">
            THE MATHIS: C + C = WISE — When It Comes to Crafting and Creating
          </p>
          <p>&copy; {new Date().getFullYear()} CC Craft & Create Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
