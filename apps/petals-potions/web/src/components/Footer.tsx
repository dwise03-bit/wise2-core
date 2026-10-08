'use client'

export default function Footer() {
  return (
    <footer className="bg-purple text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-serif mb-4">Petals & Potions</h3>
            <p className="text-sm opacity-75">
              Luxury wellness blends for your daily rituals.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li><a href="#" className="hover:opacity-100 transition">All Blends</a></li>
              <li><a href="#" className="hover:opacity-100 transition">Collections</a></li>
              <li><a href="#" className="hover:opacity-100 transition">Subscriptions</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li><a href="#" className="hover:opacity-100 transition">About Us</a></li>
              <li><a href="#" className="hover:opacity-100 transition">Sustainability</a></li>
              <li><a href="#" className="hover:opacity-100 transition">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm opacity-75">
              <li><a href="#" className="hover:opacity-100 transition">Contact</a></li>
              <li><a href="#" className="hover:opacity-100 transition">Returns</a></li>
              <li><a href="#" className="hover:opacity-100 transition">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-75">
          <p>&copy; 2026 Petals & Potions. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:opacity-100 transition">Privacy</a>
            <a href="#" className="hover:opacity-100 transition">Terms</a>
            <a href="#" className="hover:opacity-100 transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
