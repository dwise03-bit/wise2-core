'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import SpectrumMonitor from '@/components/spectrum-monitor/SpectrumMonitor';

export default function SpectrumDashboardPage() {
  return (
    <div className="min-h-screen bg-wise-bg-base text-white">
      {/* Header */}
      <div className="border-b border-wise-primary-border bg-wise-bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div>
            <h1 className="text-4xl font-black mb-2">RTL-SDR Spectrum Monitor</h1>
            <p className="text-gray-400">
              Real-time radio frequency spectrum analysis from RTL-SDR receiver on Big Byte Pi.
              Monitoring 88 MHz - 1200 MHz range with 10-second updates.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <SpectrumMonitor />
      </div>

      {/* Footer Info */}
      <div className="border-t border-wise-primary-border bg-wise-bg-card/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3">How It Works</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• RTL-SDR receiver scans 88-1200 MHz every 10 seconds</li>
                <li>• Data processor (sdr_processor.py) captures spectrum snapshots</li>
                <li>• API stores signals in SQLite database with power levels</li>
                <li>• Website fetches latest data every 10 seconds</li>
                <li>• Anomaly detection alerts on signal power spikes</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Signal Types</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• <span className="text-blue-400">FM Radio</span>: 88-108 MHz</li>
                <li>• <span className="text-green-400">NOAA Weather</span>: 162.4-162.55 MHz</li>
                <li>• <span className="text-yellow-400">GMRS/FRS</span>: 462-467 MHz</li>
                <li>• <span className="text-red-400">Public Safety</span>: 700-800 MHz</li>
                <li>• <span className="text-purple-400">Cellular</span>: 824-1990 MHz</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
