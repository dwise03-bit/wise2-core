'use client';

export function ImpsCoreEmblem() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-black via-blue-950/5 to-black border-y border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-12">
          {/* W² Emblem */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-gradient-conic from-blue-500 via-cyan-400 to-blue-600 rounded-full blur-2xl opacity-40 animate-spin" style={{ animationDuration: '6s' }} />

            {/* Inner Circle */}
            <div className="absolute inset-4 bg-black rounded-full flex items-center justify-center border-2 border-blue-400/50">
              {/* W² Text */}
              <div className="text-center space-y-2">
                <div className="text-5xl sm:text-7xl font-black text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text">
                  W²
                </div>
                <div className="text-xs sm:text-sm font-bold tracking-widest text-blue-400 uppercase">
                  Build It
                </div>
              </div>
            </div>

            {/* Orbiting dots */}
            <div className="absolute inset-0 rounded-full">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <div className="absolute bottom-0 right-0 translate-x-4 w-2 h-2 bg-cyan-300 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="absolute bottom-0 left-0 -translate-x-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>

          {/* Philosophy Text */}
          <div className="text-center space-y-8 max-w-2xl">
            <div className="space-y-4">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-white">
                BUILD IT. CODE IT.
                <br />
                <span className="text-blue-400">OWN IT.</span>
              </h3>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
                WISE² IMPS represents a new philosophy: intelligent edge devices designed for creators who want to own their hardware, software, and workflows. No lock-in. No compromises.
              </p>
            </div>

            {/* Three Pillars */}
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 bg-blue-950/20 border border-blue-500/20 rounded-lg">
                <div className="text-2xl mb-3">🔨</div>
                <h4 className="font-bold text-blue-400 mb-2">BUILDABLE</h4>
                <p className="text-sm text-gray-400">Own every layer: hardware, firmware, apps.</p>
              </div>
              <div className="p-6 bg-blue-950/20 border border-blue-500/20 rounded-lg">
                <div className="text-2xl mb-3">🚀</div>
                <h4 className="font-bold text-blue-400 mb-2">EXTENSIBLE</h4>
                <p className="text-sm text-gray-400">Expand with custom modules and integrations.</p>
              </div>
              <div className="p-6 bg-blue-950/20 border border-blue-500/20 rounded-lg">
                <div className="text-2xl mb-3">🔒</div>
                <h4 className="font-bold text-blue-400 mb-2">PRIVATE</h4>
                <p className="text-sm text-gray-400">Local-first architecture means your data stays yours.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
