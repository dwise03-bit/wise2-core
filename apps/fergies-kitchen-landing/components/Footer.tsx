import { ChefHat } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream py-12">
      <div className="container-custom">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-6 h-6 text-bronze" />
              <span className="text-lg font-bold">Fergie's Kitchen</span>
            </div>
            <p className="text-cream/70 text-sm">Premium catering and culinary experiences powered by WISE².</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="#" className="hover:text-cream transition">Corporate Events</a></li>
              <li><a href="#" className="hover:text-cream transition">Weddings</a></li>
              <li><a href="#" className="hover:text-cream transition">Private Dining</a></li>
              <li><a href="#" className="hover:text-cream transition">Catering</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="#" className="hover:text-cream transition">About Us</a></li>
              <li><a href="#" className="hover:text-cream transition">Our Team</a></li>
              <li><a href="#" className="hover:text-cream transition">Blog</a></li>
              <li><a href="#" className="hover:text-cream transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="#" className="hover:text-cream transition">Facebook</a></li>
              <li><a href="#" className="hover:text-cream transition">Instagram</a></li>
              <li><a href="#" className="hover:text-cream transition">Twitter</a></li>
              <li><a href="#" className="hover:text-cream transition">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-cream/20 pt-8">
          <p className="text-sm text-cream/70 text-center">
            © 2024 Fergie's Kitchen. All rights reserved. Powered by WISE² Genesis.
          </p>
        </div>
      </div>
    </footer>
  )
}
