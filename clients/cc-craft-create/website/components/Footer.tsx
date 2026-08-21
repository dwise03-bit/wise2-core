import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-cc-dark text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-lora font-bold mb-4">CC Craft & Create</h3>
            <p className="text-sm text-gray-300">
              Crafted for the moment. Created for the memory.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-poppins font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-cc-gold transition-colors">All Products</Link></li>
              <li><Link href="/occasions" className="hover:text-cc-gold transition-colors">By Occasion</Link></li>
              <li><Link href="/business" className="hover:text-cc-gold transition-colors">Business Packages</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-poppins font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-cc-gold transition-colors">About CC</Link></li>
              <li><Link href="/contact" className="hover:text-cc-gold transition-colors">Contact</Link></li>
              <li><Link href="/gallery" className="hover:text-cc-gold transition-colors">Gallery</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>📧 <a href="mailto:cc@craftandcreate.com" className="hover:text-cc-gold transition-colors">Email</a></li>
              <li>📱 <a href="tel:+1234567890" className="hover:text-cc-gold transition-colors">Phone</a></li>
              <li className="pt-2">
                <a href="#" className="hover:text-cc-gold transition-colors">Instagram</a> •{' '}
                <a href="#" className="hover:text-cc-gold transition-colors">Facebook</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 CC Craft & Create. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
