'use client';

export function ImpSpecs() {
  const specs = [
    {
      label: 'BROWSER',
      items: ['React App', 'Any browser', 'Local storage'],
      icon: '🌐',
    },
    {
      label: 'WINDOWS',
      items: ['Current-user install', 'No admin needed', 'System tray'],
      icon: '🪟',
    },
    {
      label: 'K10 DEVICE',
      items: ['ESP32-S3', '4" Display', 'Voice capable'],
      icon: '📱',
    },
    {
      label: 'IDENTITY',
      items: ['Cyan eyes', 'Black hoodie', 'W² chest mark'],
      icon: '👁️',
    },
    {
      label: 'INTERACTION',
      items: ['Click & drag', 'Voice control', 'Offline mode'],
      icon: '🎯',
    },
    {
      label: 'SETUP',
      items: ['Zero config', 'No account', 'Instant launch'],
      icon: '⚡',
    },
  ];

  return (
    <section className="bg-gradient-to-b from-transparent via-[#00D9FF]/5 to-[#050607] border-y border-[#00D9FF]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="flex flex-col items-center justify-center space-y-3 px-3 py-6 border border-[#00D9FF]/20 rounded-lg bg-[#00D9FF]/5 hover:bg-[#00D9FF]/10 hover:border-[#00D9FF]/40 transition"
            >
              <div className="text-2xl">{spec.icon}</div>
              <div className="text-center">
                <p className="text-xs font-black tracking-widest text-[#00D9FF] mb-2">{spec.label}</p>
                {spec.items.map((item) => (
                  <p key={item} className="text-xs text-gray-400 leading-tight">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
