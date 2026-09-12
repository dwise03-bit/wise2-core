import Link from 'next/link';

export default function HardwarePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-4 text-cyan-400">K10 Hardware</h1>
        <p className="text-xl text-gray-300 mb-16">Enterprise Raspberry Pi Edge Device • WISE² IMP Firmware</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h4 className="font-bold text-cyan-400 mb-4">Hardware Specs</h4>
            <ul className="text-gray-300 space-y-3 text-sm">
              <li><span className="font-semibold">CPU:</span> ESP32-S3 Dual-Core 240MHz</li>
              <li><span className="font-semibold">RAM:</span> 512 KB SRAM</li>
              <li><span className="font-semibold">Display:</span> 2.8" ILI9341 TFT 240x320</li>
              <li><span className="font-semibold">Connectivity:</span> WiFi 802.11 b/g/n + BLE 5.0</li>
            </ul>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <h4 className="font-bold text-cyan-400 mb-4">Firmware v2.0</h4>
            <ul className="text-gray-300 space-y-3 text-sm">
              <li>✓ 8 animated character faces</li>
              <li>✓ Voice interaction (ASR/TTS)</li>
              <li>✓ Dashboard integration</li>
              <li>✓ Offline demo mode</li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8">Perfect For</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['🏪 Retail Kiosks', '🏭 Manufacturing', '📦 Logistics', '🏥 Healthcare', '🎓 Education', '🚀 Startups'].map((use) => (
              <div key={use} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
                <span className="text-gray-300">{use}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/systems" className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600">← Back</Link>
          <Link href="/systems/mobile" className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400">Next: Mobile →</Link>
        </div>
      </div>
    </div>
  );
}
