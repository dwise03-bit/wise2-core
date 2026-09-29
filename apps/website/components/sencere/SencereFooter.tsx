import Link from 'next/link';

export function SencereFooter() {
  return (
    <footer className="bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company */}
          <div>
            <h3 className="font-bold mb-4">SenCere Creative</h3>
            <p className="text-sm text-gray-400">AI-native creative studio for apparel, design, and digital services.</p>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sencere/blakkhail" className="text-gray-400 hover:white">Blakkhail</Link></li>
              <li><Link href="/sencere/piff-city" className="text-gray-400 hover:white">Piff City</Link></li>
              <li><Link href="/sencere/products" className="text-gray-400 hover:white">All Products</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sencere/contact" className="text-gray-400 hover:white">Contact</Link></li>
              <li><a href="mailto:support@sencere.creative" className="text-gray-400 hover:white">Email Support</a></li>
              <li><Link href="/faq" className="text-gray-400 hover:white">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-gray-400 hover:white">Terms</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:white">Privacy</Link></li>
              <li><a href="https://instagram.com/sencere" className="text-gray-400 hover:white">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 SenCere Creative LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
