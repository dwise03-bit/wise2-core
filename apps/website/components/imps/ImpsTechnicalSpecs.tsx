'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function ImpsTechnicalSpecs() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const specs = [
    {
      id: 'mcu',
      title: 'Microcontroller Unit',
      items: [
        { label: 'Processor', value: 'Waveshare ESP32-C5-WROOM-1' },
        { label: 'CPU', value: 'Dual-core 32-bit at 160 MHz' },
        { label: 'RAM', value: '512 KB' },
        { label: 'Flash', value: '2 MB' },
        { label: 'Wireless', value: 'Wi-Fi 6 (802.11ax), Bluetooth 5.3' },
      ],
    },
    {
      id: 'display',
      title: 'Display & Touch',
      items: [
        { label: 'Panel', value: 'Hosyond 4.0" Capacitive Touchscreen' },
        { label: 'Controller', value: 'ST7796S' },
        { label: 'Native Resolution', value: '320 × 480 pixels' },
        { label: 'Orientation', value: '480 × 320 landscape' },
        { label: 'Physical Size', value: '82.9 × 50.3 × 1.06 mm' },
        { label: 'Touch Type', value: 'Capacitive (10-point multi-touch)' },
      ],
    },
    {
      id: 'audio',
      title: 'Audio System',
      items: [
        { label: 'Microphone', value: 'MEMS I²S microphone with noise cancellation' },
        { label: 'Audio Codec', value: 'MAX98357A Class-D amplifier' },
        { label: 'Output', value: '3W @ 4Ω speaker' },
        { label: 'Speaker Size', value: 'Approximately 40mm' },
        { label: 'I²S Bus', value: 'Digital audio interface over I²S protocol' },
      ],
    },
    {
      id: 'power',
      title: 'Power & Battery',
      items: [
        { label: 'Battery', value: '3000mAh rechargeable Li-Po' },
        { label: 'Charging', value: 'USB-C connector' },
        { label: 'Charging Time', value: 'Approximately 2-3 hours' },
        { label: 'Runtime', value: 'Estimated 8-12 hours (varies by usage)' },
      ],
    },
    {
      id: 'enclosure',
      title: 'Enclosure & Design',
      items: [
        { label: 'Material', value: '3D-printed PLA/PETG' },
        { label: 'Design', value: 'Superhero character with rabbit-ear silhouette' },
        { label: 'Finish', value: 'Black/dark graphite with blue accent lighting' },
        { label: 'Assembly', value: 'Snap-fit, serviceable design' },
        { label: 'Components', value: 'Screen mount, battery compartment, speaker grille, microphone opening' },
      ],
    },
    {
      id: 'connectivity',
      title: 'Connectivity & Integration',
      items: [
        { label: 'Wi-Fi Standard', value: '802.11ax (Wi-Fi 6)' },
        { label: 'Bluetooth', value: '5.3 with BLE support' },
        { label: 'USB', value: 'USB-C for power and data' },
        { label: 'Data Formats', value: 'JSON, MQTT, REST API support' },
      ],
    },
  ];

  return (
    <section id="specs" className="py-20 sm:py-32 bg-black border-t border-blue-500/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-sm font-bold tracking-widest text-blue-400">DEEP DIVE</p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white">
            TECHNICAL
            <br />
            <span className="text-blue-400">SPECIFICATIONS</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Complete hardware and software specification for BYTE MINI 4.0
          </p>
        </div>

        {/* Expandable Specs */}
        <div className="space-y-3">
          {specs.map((spec) => (
            <div
              key={spec.id}
              className="border border-blue-500/20 rounded-lg overflow-hidden bg-blue-950/10 hover:bg-blue-950/20 transition"
            >
              <button
                onClick={() => setExpanded(expanded === spec.id ? null : spec.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-950/20 to-transparent hover:from-blue-950/40"
              >
                <h3 className="text-lg font-bold text-white text-left">{spec.title}</h3>
                <ChevronDown
                  size={24}
                  className={`text-blue-400 transition-transform ${expanded === spec.id ? 'rotate-180' : ''}`}
                />
              </button>

              {expanded === spec.id && (
                <div className="px-6 py-6 border-t border-blue-500/20 space-y-4 bg-black">
                  {spec.items.map((item) => (
                    <div key={item.label} className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <span className="font-medium text-blue-400">{item.label}</span>
                      <span className="text-gray-400">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-12 p-6 bg-blue-950/20 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-gray-400">
            <span className="font-bold text-blue-400">Note:</span> Specifications are subject to minor revisions during development. For the most up-to-date hardware documentation, visit the developer documentation or contact support.
          </p>
        </div>
      </div>
    </section>
  );
}
