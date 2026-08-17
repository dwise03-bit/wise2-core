'use client';

export function ImpsSpecStrip() {
  const specs = [
    {
      label: 'MCU',
      items: ['ESP32-C5', 'Wi-Fi 6', 'BLE'],
      icon: '⚙️',
    },
    {
      label: 'DISPLAY',
      items: ['4.0" ST7796S', '320 × 480 native', 'Capacitive Touch'],
      icon: '📱',
    },
    {
      label: 'AUDIO',
      items: ['I²S Microphone', 'Speaker', 'MAX98357A Amp'],
      icon: '🎙️',
    },
    {
      label: 'BATTERY',
      items: ['3000mAh', 'Rechargeable', 'Long Lasting'],
      icon: '🔋',
    },
    {
      label: 'CASE',
      items: ['3D Printed', 'Snap-Fit', 'Serviceable'],
      icon: '📦',
    },
    {
      label: 'PRIVACY',
      items: ['Local AI capable', 'User-controlled', 'Your Data. Yours'],
      icon: '🔒',
    },
  ];

  return (
    <section className="bg-gradient-to-b from-transparent via-blue-950/5 to-black border-y border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {specs.map((spec) => (
            <div key={spec.label} className="flex flex-col items-center justify-center space-y-3 px-3 py-6 border border-blue-500/20 rounded-lg bg-blue-950/5 hover:bg-blue-950/10 hover:border-blue-400/40 transition">
              <div className="text-2xl">{spec.icon}</div>
              <div className="text-center">
                <p className="text-xs font-black tracking-widest text-blue-400 mb-2">{spec.label}</p>
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
