'use client';

export function ImpsCTA() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-black via-blue-950/10 to-black border-t border-blue-500/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Heading */}
        <div className="space-y-4">
          <p className="text-sm font-bold tracking-widest text-blue-400">READY TO INNOVATE?</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white">
            START WITH ONE IMP.
            <br />
            <span className="text-blue-400">GROW INTO THE PLATFORM.</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Limited launch edition now available. Join creators, builders, and innovators who are defining the future of edge AI.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-black font-bold text-sm rounded-lg transition transform hover:scale-105">
            PRE-ORDER NOW →
          </button>
          <button className="px-8 py-4 border border-gray-600 hover:border-blue-400 text-gray-300 hover:text-blue-400 font-bold text-sm rounded-lg transition">
            JOIN LAUNCH LIST
          </button>
        </div>

        {/* Guarantee */}
        <div className="grid sm:grid-cols-3 gap-6 pt-8 border-t border-blue-500/20">
          <div className="space-y-2">
            <div className="text-2xl">📦</div>
            <p className="font-semibold text-white">Ships Summer 2025</p>
            <p className="text-sm text-gray-400">Limited to first 500 units</p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">✅</div>
            <p className="font-semibold text-white">30-Day Guarantee</p>
            <p className="text-sm text-gray-400">Full refund if unsatisfied</p>
          </div>
          <div className="space-y-2">
            <div className="text-2xl">🔒</div>
            <p className="font-semibold text-white">1-Year Warranty</p>
            <p className="text-sm text-gray-400">Manufacturing defects covered</p>
          </div>
        </div>

        {/* Support Info */}
        <div className="pt-8 space-y-2 text-sm text-gray-500">
          <p>Questions? We're here to help.</p>
          <p>
            Email: <a href="mailto:hello@wise2.net" className="text-blue-400 hover:text-blue-300 transition">hello@wise2.net</a>
          </p>
        </div>
      </div>
    </section>
  );
}
