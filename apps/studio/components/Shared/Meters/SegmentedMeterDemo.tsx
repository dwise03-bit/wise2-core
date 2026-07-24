'use client';

/**
 * SegmentedMeter Demo - Professional Audio Meter Showcase
 * Demonstrates the complete WISE² professional meter system:
 * - SegmentedMeter component (canvas-based, 60 FPS)
 * - useAudioMeter hook (Web Audio API + mock fallback)
 * - db-conversion utilities (all math functions)
 * - WISE² brand icons (professional SVG icons)
 */

import React, { useState, useEffect } from 'react';
import { SegmentedMeter } from './SegmentedMeter';
import { useAudioMeter } from '@/hooks/audio';
import { Icons } from '@/components/Icons';

export function SegmentedMeterDemo() {
  const { data, controls } = useAudioMeter({
    updateFrequency: 50, // Smooth 20 FPS updates
    onClipping: () => console.warn('🔴 Clipping detected!'),
  });

  const [showSettings, setShowSettings] = useState(false);

  if (!data) return <div className="p-4 text-gray-400">Loading audio meter...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-black mb-2">WISE² Professional Meters</h1>
            <p className="text-gray-400">Canvas-based audio metering at 60 FPS with real-time Web Audio API</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-lg hover:bg-gray-800 transition"
          >
            <Icons.Settings size={32} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex gap-4 p-4 rounded-lg bg-gray-900 border border-gray-800">
          <div className="flex items-center gap-2">
            {data.isClipping ? (
              <Icons.Error size={20} color="#FF5535" />
            ) : (
              <Icons.Check size={20} color="#2CD588" />
            )}
            <span className="text-sm">{data.isClipping ? 'CLIPPING' : 'HEALTHY'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Icons.Chart size={16} />
            Master: {data.master.toFixed(1)} dB
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>RMS: {data.rms.toFixed(1)} dB</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* MASTER METER (Horizontal Stereo) */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Icons.Activity size={24} color="#0094FF" />
            Master Stereo Meter
          </h2>
          <div className="grid grid-cols-2 gap-6 p-6 rounded-lg bg-gray-900 border border-gray-800">
            {/* Left Channel */}
            <div>
              <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-8">L</span>
                <SegmentedMeter
                  peakLevel={data.channels[0]?.peak || -20}
                  size="large"
                  showPeakHold={true}
                  peakHoldDuration={1500}
                />
                <span className="ml-4 font-mono">{(data.channels[0]?.peak || -20).toFixed(1)} dB</span>
              </div>
            </div>

            {/* Right Channel */}
            <div>
              <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                <span className="w-8">R</span>
                <SegmentedMeter
                  peakLevel={data.channels[1]?.peak || -18}
                  size="large"
                  showPeakHold={true}
                  peakHoldDuration={1500}
                />
                <span className="ml-4 font-mono">{(data.channels[1]?.peak || -18).toFixed(1)} dB</span>
              </div>
            </div>
          </div>
        </section>

        {/* CHANNEL STRIPS */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Icons.Mic size={24} color="#0094FF" />
            Channel Mixer (5 Strips)
          </h2>
          <div className="grid grid-cols-5 gap-4 p-6 rounded-lg bg-gray-900 border border-gray-800">
            {data.channels.map((channel, idx) => (
              <div key={channel.id} className="flex flex-col items-center">
                {/* Channel Meter */}
                <div className="mb-3">
                  <SegmentedMeter
                    peakLevel={channel.peak}
                    size="small"
                    showPeakHold={true}
                    label={channel.name}
                  />
                </div>

                {/* Channel Name */}
                <div className="text-xs font-semibold text-center mb-2 truncate w-full">
                  {channel.name}
                </div>

                {/* Peak dB */}
                <div className="font-mono text-xs text-gray-400 mb-3">
                  {channel.peak.toFixed(1)} dB
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => controls.toggleChannelMute(channel.id)}
                    className={`p-2 rounded text-xs transition ${
                      channel.isMuted
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Icons.Mute size={16} />
                  </button>
                  <button
                    onClick={() => controls.toggleChannelSolo(channel.id)}
                    className={`p-2 rounded text-xs transition ${
                      channel.isSolo
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    S
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PERFORMANCE METRICS */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Icons.TrendUp size={24} color="#2CD588" />
            System Performance
          </h2>
          <div className="grid grid-cols-4 gap-4 p-6 rounded-lg bg-gray-900 border border-gray-800">
            <div className="p-4 rounded bg-gray-800">
              <div className="text-xs text-gray-400 mb-2">Audio Context</div>
              <div className="text-lg font-bold text-blue-400">
                {data.audioContextAvailable ? '✓ Active' : '○ Fallback'}
              </div>
            </div>
            <div className="p-4 rounded bg-gray-800">
              <div className="text-xs text-gray-400 mb-2">Playing</div>
              <div className="text-lg font-bold text-green-400">
                {data.isPlaying ? '◉ Yes' : '○ No'}
              </div>
            </div>
            <div className="p-4 rounded bg-gray-800">
              <div className="text-xs text-gray-400 mb-2">Master Level</div>
              <div className="text-lg font-bold font-mono">{data.master.toFixed(1)} dB</div>
            </div>
            <div className="p-4 rounded bg-gray-800">
              <div className="text-xs text-gray-400 mb-2">Clipping</div>
              <div className={`text-lg font-bold ${data.isClipping ? 'text-red-500' : 'text-green-400'}`}>
                {data.isClipping ? '🔴 YES' : '✓ No'}
              </div>
            </div>
          </div>
        </section>

        {/* CONTROLS */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Icons.Settings size={24} color="#0094FF" />
            Demo Controls
          </h2>
          <div className="flex gap-3 p-6 rounded-lg bg-gray-900 border border-gray-800">
            <button
              onClick={() => controls.resetPeaks()}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Icons.Settings size={16} />
              Reset Peaks
            </button>
            <button
              onClick={() => {
                data.channels.forEach(ch => controls.setChannelVolume(ch.id, 0.5));
              }}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition flex items-center gap-2"
            >
              <Icons.Speaker size={16} />
              Normalize Levels
            </button>
            <button
              onClick={() => {
                data.channels.forEach((ch, i) => {
                  if (i !== 0) controls.toggleChannelMute(ch.id);
                });
              }}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition flex items-center gap-2"
            >
              <Icons.Mute size={16} />
              Isolate Ch. 1
            </button>
          </div>
        </section>

        {/* FEATURES */}
        <section>
          <h2 className="text-xl font-bold mb-6">Features Implemented</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Icons.TrendUp, text: 'Canvas-based rendering (60 FPS)' },
              { icon: Icons.Check, text: '12 LED segments per meter' },
              { icon: Icons.Activity, text: 'Real-time Web Audio API' },
              { icon: Icons.Mic, text: '5 pre-configured channels' },
              { icon: Icons.TrendDown, text: 'Peak hold with decay' },
              { icon: Icons.Error, text: 'Clipping detection' },
              { icon: Icons.Settings, text: 'Mute/Solo per channel' },
              { icon: Icons.Chart, text: 'dB conversion utilities' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3 p-3 rounded bg-gray-900 border border-gray-800">
                  <Icon size={20} color="#0094FF" />
                  <span className="text-sm">{item.text}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
