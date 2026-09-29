'use client';

export function ImpsLaunchEdition() {
  const includes = [
    { icon: '📦', label: 'WISE² IMP Device' },
    { icon: '🔋', label: '3000mAh Battery' },
    { icon: '🔌', label: 'USB-C Cable' },
    { icon: '✨', label: 'Exclusive IMPS Sticker' },
  ];

  return (
    <section id="shop" className="py-20 sm:py-32 bg-black border-y border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Launch Edition Card */}
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm font-bold tracking-widest text-blue-400">AVAILABLE NOW</p>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
                LAUNCH EDITION
                <br />
                <span className="text-blue-400">INCLUDES</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-400">
                Everything you need to start building with BYTE MINI 4.0, including exclusive limited-time bonuses.
              </p>
            </div>

            {/* What's Included */}
            <div className="space-y-3">
              {includes.map((item) => (
                <div key={item.label} className="flex items-center gap-4 p-4 bg-blue-950/20 border border-blue-500/20 rounded-lg hover:border-blue-400/40 transition">
                  <div className="text-2xl">{item.icon}</div>
                  <span className="font-medium text-gray-200">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Additional Note */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-gray-300">
                <span className="font-bold text-blue-400">Quick-start documentation</span> and guides included. Access to WISE² developer community and resources.
              </p>
            </div>

            <button className="w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 text-black font-bold rounded-lg transition transform hover:scale-105">
              ORDER YOUR LAUNCH EDITION
            </button>
          </div>

          {/* Right: Pricing Card */}
          <div className="space-y-8">
            <div className="relative">
              {/* Card */}
              <div className="p-8 sm:p-12 bg-gradient-to-br from-blue-950/40 to-black border-2 border-blue-400/60 rounded-2xl space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/50 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-blue-400">LIMITED TIME PRICING</span>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 font-semibold">STARTING AT</p>
                  <div className="text-6xl sm:text-7xl font-black text-white">
                    $129
                  </div>
                  <p className="text-sm text-blue-400 font-bold">LIMITED TIME PRICE</p>
                </div>

                {/* Price Details */}
                <div className="space-y-3 pt-6 border-t border-blue-500/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Device</span>
                    <span className="font-semibold text-white">$119</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Accessories Bundle</span>
                    <span className="font-semibold text-white">Included</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Sticker Pack (Exclusive)</span>
                    <span className="font-semibold text-white">Included</span>
                  </div>
                </div>

                {/* Guarantee */}
                <div className="space-y-4 pt-6 border-t border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="font-semibold text-white">30-Day Money-Back Guarantee</p>
                      <p className="text-xs text-gray-400">Not satisfied? Full refund, no questions asked.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="font-semibold text-white">1-Year Warranty</p>
                      <p className="text-xs text-gray-400">Manufacturing defects covered.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-lg">✅</span>
                    <div>
                      <p className="font-semibold text-white">Priority Support</p>
                      <p className="text-xs text-gray-400">Direct access to the builder community.</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <button className="w-full px-8 py-4 bg-blue-500 hover:bg-blue-600 text-black font-bold rounded-lg transition transform hover:scale-105">
                  PRE-ORDER NOW
                </button>
              </div>
            </div>

            {/* Small Print */}
            <p className="text-xs text-gray-500 text-center">
              Limited to first 500 units. Expected shipping: Summer 2025.<br />
              Price subject to change after launch promotion ends.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
