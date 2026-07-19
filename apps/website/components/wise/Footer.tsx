'use client';

export const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-lime-400 font-black mb-2 text-lg" style={{ fontFamily: '"Beyond The Mountains", sans-serif' }}>
              WISE<sup className="text-xs">²</sup>
            </h3>
            <p className="text-gray-500 text-sm font-mono">Organized Chaos</p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm font-mono tracking-wider">EXPLORE</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-lime-400 transition">Intake Form</a></li>
              <li><a href="/studio" className="hover:text-lime-400 transition">Studio</a></li>
              <li><a href="/live" className="hover:text-lime-400 transition">Live</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm font-mono tracking-wider">COMPANY</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/work" className="hover:text-lime-400 transition">Work</a></li>
              <li><a href="/heroes" className="hover:text-lime-400 transition">Visionaries</a></li>
              <li><a href="/contact" className="hover:text-lime-400 transition">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 text-sm font-mono tracking-wider">LEGAL</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-lime-400 transition">Privacy</a></li>
              <li><a href="#" className="hover:text-lime-400 transition">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-xs text-gray-600 font-mono tracking-wider">
            © 2026 WISE² • Wise Defense LLC • All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};
