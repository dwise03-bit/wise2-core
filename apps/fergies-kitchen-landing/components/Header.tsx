import { ChefHat } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cream border-b border-sage/20">
      <div className="container-custom py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="w-8 h-8 text-bronze" />
          <span className="text-2xl font-bold text-charcoal">Fergie's Kitchen</span>
        </div>
        <nav className="hidden md:flex gap-8">
          <a href="#experience" className="text-charcoal hover:text-sage transition">Experience</a>
          <a href="#about" className="text-charcoal hover:text-sage transition">About</a>
          <a href="#contact" className="text-charcoal hover:text-sage transition">Contact</a>
        </nav>
        <button className="bg-bronze text-cream px-6 py-2 rounded-lg hover:bg-bronze/90 transition">
          Book Now
        </button>
      </div>
    </header>
  )
}
