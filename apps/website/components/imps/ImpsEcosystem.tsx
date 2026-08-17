'use client';

export function ImpsEcosystem() {
  const units = [
    {
      number: '01',
      name: 'BYTE MINI',
      role: 'The Interface',
      description: 'Visual status, voice, alerts, and fast control. Your primary interaction point with the WISE² ecosystem.',
      highlight: true,
    },
    {
      number: '02',
      name: 'POCKET NODE',
      role: 'The Wearable',
      description: 'Portable presence, field alerts, and sensor input. Stays with you wherever you go.',
    },
    {
      number: '03',
      name: 'C5 NODE',
      role: 'The Connector',
      description: 'Links radios, sensors, tools, and custom modules. The flexible hub of your setup.',
    },
    {
      number: '04',
      name: 'WIMP GATEWAY',
      role: 'The Coordinator',
      description: 'Routes messages, runs automations, and manages devices. The orchestration layer.',
    },
    {
      number: '05',
      name: 'BIG BLIMP NODE',
      role: 'The Heavy Hitter',
      description: 'Edge AI, vision, storage, dashboards, and orchestration. Maximum capabilities.',
    },
  ];

  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-black via-blue-950/5 to-black border-t border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-bold tracking-widest text-blue-400">FIVE UNITS. ONE ECOSYSTEM.</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white">
            WISE² IMPS
            <br />
            <span className="text-blue-400">FAMILY</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Start with BYTE MINI. Expand with additional units as your needs grow.
          </p>
        </div>

        {/* Units Grid */}
        <div className="grid gap-6">
          {units.map((unit) => (
            <div
              key={unit.number}
              className={`group p-6 sm:p-8 rounded-xl border transition ${
                unit.highlight
                  ? 'bg-gradient-to-r from-blue-950/40 to-black border-blue-400/60'
                  : 'bg-black border-blue-500/20 hover:border-blue-400/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Number */}
                <div className="flex-shrink-0">
                  <div className="text-4xl sm:text-5xl font-black text-blue-400/30 group-hover:text-blue-400/60 transition">
                    {unit.number}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow space-y-3">
                  <div className="space-y-1">
                    <p className={`text-xs font-bold tracking-widest ${unit.highlight ? 'text-blue-300' : 'text-blue-400'}`}>
                      {unit.role.toUpperCase()}
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">
                      {unit.name}
                    </h3>
                  </div>
                  <p className="text-base text-gray-400 leading-relaxed">
                    {unit.description}
                  </p>
                  {unit.highlight && (
                    <div className="pt-4 flex items-center gap-2 text-sm text-blue-400 font-semibold">
                      <span>→ Featured on this page</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ecosystem Call-to-Action */}
        <div className="mt-16 p-8 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center space-y-4">
          <p className="text-lg font-bold text-white">Ready to Build Your WISE² Ecosystem?</p>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Start with BYTE MINI 4.0 and expand with additional units as your project evolves. Each unit is designed to work independently or in harmony with the rest of the system.
          </p>
          <button className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-black font-bold rounded-lg transition">
            EXPLORE THE FULL ECOSYSTEM →
          </button>
        </div>
      </div>
    </section>
  );
}
