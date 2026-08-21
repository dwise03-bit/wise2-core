'use client';

import Image from 'next/image';

export default function SenCerePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-sm font-bold text-slate-950">SC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SenCere Creative LLC</h1>
              <p className="text-xs text-slate-400">Powered by WISE²</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-8">
            <a href="#services" className="text-slate-300 hover:text-amber-400 transition">Services</a>
            <a href="#demo" className="text-slate-300 hover:text-amber-400 transition">Demo</a>
            <a href="#contact" className="text-slate-300 hover:text-amber-400 transition">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Equipment & Manufacturing
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Capabilities Portfolio
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            SenCere Creative LLC provides estimated equipment identifications, replacement costs, and operational insight for enterprise asset tracking.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition">
              View Demo
            </button>
            <button className="px-8 py-3 border border-amber-400 text-amber-400 font-bold rounded-lg hover:bg-amber-400/10 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Demo Reference Board */}
        <section id="demo" className="mt-20">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12">
            <h3 className="text-3xl font-bold text-white mb-2">Reference Board</h3>
            <p className="text-slate-400 mb-12">Visual reference materials for SenCere Creative LLC capabilities</p>

            <div className="grid grid-cols-1 gap-8">
              {/* Reference Image 1 */}
              <div className="bg-white/5 rounded-xl p-6 border border-slate-700/50 hover:border-amber-400/30 transition">
                <h4 className="text-lg font-bold text-amber-400 mb-4">Equipment & Manufacturing Capabilities</h4>
                <div className="relative w-full h-96 bg-slate-800 rounded-lg overflow-hidden">
                  <Image
                    src="/sencere-assets/9225D3F1-4402-4023-A274-689371BD1062.jpeg"
                    alt="SenCere Equipment Portfolio"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Reference Image 2 */}
              <div className="bg-white/5 rounded-xl p-6 border border-slate-700/50 hover:border-amber-400/30 transition">
                <h4 className="text-lg font-bold text-amber-400 mb-4">Service Overview</h4>
                <div className="relative w-full h-96 bg-slate-800 rounded-lg overflow-hidden">
                  <Image
                    src="/sencere-assets/BCE35696-FD46-4874-A79E-C9650744D351.jpeg"
                    alt="SenCere Services"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Marketing Materials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6 border border-slate-700/50 hover:border-amber-400/30 transition">
                  <h4 className="text-lg font-bold text-amber-400 mb-4">Marketing Flyer</h4>
                  <div className="relative w-full h-80 bg-slate-800 rounded-lg overflow-hidden">
                    <Image
                      src="/sencere-assets/a_high_detail_marketing_flyer_landing_page_style_g.png"
                      alt="SenCere Marketing Flyer"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-slate-700/50 hover:border-amber-400/30 transition">
                  <h4 className="text-lg font-bold text-amber-400 mb-4">Website Mockup</h4>
                  <div className="relative w-full h-80 bg-slate-800 rounded-lg overflow-hidden">
                    <Image
                      src="/sencere-assets/a_high_resolution_website_landing_page_mockup_he.png"
                      alt="SenCere Website Mockup"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-slate-700/50 hover:border-amber-400/30 transition">
                  <h4 className="text-lg font-bold text-amber-400 mb-4">Promotional Poster</h4>
                  <div className="relative w-full h-80 bg-slate-800 rounded-lg overflow-hidden">
                    <Image
                      src="/sencere-assets/a_clean_high_contrast_promotional_poster_infograp.png"
                      alt="SenCere Promotional Poster"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 border border-slate-700/50 hover:border-amber-400/30 transition">
                  <h4 className="text-lg font-bold text-amber-400 mb-4">Brand Identity</h4>
                  <div className="relative w-full h-80 bg-slate-800 rounded-lg overflow-hidden">
                    <Image
                      src="/sencere-assets/a_polished_high_contrast_professional_brand_iden.png"
                      alt="SenCere Brand Identity"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="mt-20">
          <h3 className="text-3xl font-bold text-white mb-12">Core Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 hover:border-amber-400/30 transition">
              <div className="text-3xl mb-4">🖨️</div>
              <h4 className="text-xl font-bold text-white mb-3">Printing Equipment</h4>
              <p className="text-slate-300">Professional vinyl cutters, laser engravers, sublimation printers, and heat press systems.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 hover:border-amber-400/30 transition">
              <div className="text-3xl mb-4">📊</div>
              <h4 className="text-xl font-bold text-white mb-3">Asset Tracking</h4>
              <p className="text-slate-300">Comprehensive equipment identification, cost estimation, and operational oversight for enterprise clients.</p>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8 hover:border-amber-400/30 transition">
              <div className="text-3xl mb-4">🎯</div>
              <h4 className="text-xl font-bold text-white mb-3">Production Services</h4>
              <p className="text-slate-300">End-to-end creative production, from design through final manufacturing and delivery.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="contact" className="mt-20 bg-gradient-to-r from-amber-400/10 to-amber-600/10 border border-amber-400/20 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-slate-300 mb-8 text-lg">Connect with SenCere Creative LLC to discuss your equipment and manufacturing needs.</p>
          <button className="px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold rounded-lg hover:shadow-lg hover:shadow-amber-500/20 transition">
            Schedule a Demo
          </button>
        </section>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400">
          <p>SenCere Creative LLC × WISE² — Professional Equipment & Manufacturing Services</p>
          <p className="text-sm mt-2">© {new Date().getFullYear()} Powered by WISE²</p>
        </div>
      </footer>
    </div>
  );
}
