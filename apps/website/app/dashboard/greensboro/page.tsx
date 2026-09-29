'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Zap, AlertTriangle, Radio, Shield } from 'lucide-react';
import CrimeRadarMap from '@/components/maps/CrimeRadarMap';

export default function GreensbloroCrimeRadarPage() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-screen bg-wise-bg-base text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-wise-primary-border bg-wise-bg-card/50 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-wise-primary" />
                <h1 className="text-4xl font-black">Knight Wing Crime Radar</h1>
              </div>
              <p className="text-gray-400">
                Live Greensboro incident mapping & RTL-SDR signal visualization
              </p>
              <div className="flex gap-6 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-wise-primary" />
                  <span>Real-time updates every 5-10 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-wise-primary" />
                  <span>6 watch zones monitored</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-wise-primary" />
                  <span>88-1200 MHz spectrum coverage</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="px-4 py-2 bg-wise-primary/20 hover:bg-wise-primary/30 border border-wise-primary rounded transition-colors text-sm"
            >
              {showInfo ? 'Hide' : 'Show'} Info
            </button>
          </div>
        </div>
      </div>

      {/* Map Container - Full Height */}
      <div className="flex-1 relative">
        <CrimeRadarMap autoUpdate={true} />

        {/* Info Panel (Overlay) */}
        {showInfo && (
          <div className="absolute bottom-6 left-6 w-96 bg-wise-bg-card border border-wise-primary-border rounded-lg p-6 shadow-2xl max-h-96 overflow-y-auto z-20">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-wise-primary" />
              System Information
            </h3>

            <div className="space-y-4">
              {/* Watch Zones */}
              <div>
                <h4 className="font-semibold text-sm text-wise-primary mb-2">Watch Zones</h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <div>• Zone 1: Downtown (High Priority)</div>
                  <div>• Zone 2: Residential North (Medium)</div>
                  <div>• Zone 3: Residential South (Medium)</div>
                  <div>• Zone 4: I-40 Corridor (Low)</div>
                  <div>• Zone 5: UNCG Campus (Elevated)</div>
                  <div>• Zone 6: Commercial (Standard)</div>
                </div>
              </div>

              {/* Signal Classification */}
              <div>
                <h4 className="font-semibold text-sm text-wise-primary mb-2">Signal Types</h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Police: 461.1625 MHz (Critical)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>Fire/EMS: 463.5 MHz (High)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>Public Safety: 410-480 MHz</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    <span>Cellular: 824-1990 MHz</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-semibold text-sm text-wise-primary mb-2">Features</h4>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>✓ Real-time incident mapping</li>
                  <li>✓ RTL-SDR spectrum overlay</li>
                  <li>✓ Frequency-based filtering</li>
                  <li>✓ Time range analysis (1h, 6h, 24h)</li>
                  <li>✓ Threat level filtering</li>
                  <li>✓ Heat map visualization</li>
                  <li>✓ Traffic layer integration</li>
                  <li>✓ GeoJSON export</li>
                </ul>
              </div>

              {/* Data Source */}
              <div className="pt-4 border-t border-wise-primary-border">
                <h4 className="font-semibold text-sm text-wise-primary mb-2">Data Source</h4>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>API: WISE Defense Edge</div>
                  <div>Receiver: RTL-SDR on Big Byte Pi</div>
                  <div>Update: Every 5-10 seconds</div>
                  <div>Coverage: 88 MHz - 1200 MHz</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-wise-primary-border bg-wise-bg-card/50 p-4 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <span>Greensboro, NC (36.0726°N, -79.7920°W)</span>
            <span>Map Style: Dark Mode</span>
            <span>Status: Live</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">
              API Docs
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Feedback
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Settings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
