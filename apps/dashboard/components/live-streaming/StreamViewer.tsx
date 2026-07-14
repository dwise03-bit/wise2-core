'use client';

import React from 'react';

interface StreamViewerProps {
  isLive: boolean;
  streamTitle?: string;
}

/**
 * StreamViewer Component
 * Displays the main streaming video/visualization area with 3D placeholder
 */
export function StreamViewer({ isLive, streamTitle = 'Premium Audio Stream' }: StreamViewerProps) {
  return (
    <div className="flex flex-col gap-md">
      {/* Video Container */}
      <div className="relative rounded-xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-gray-900 to-black">
        {/* Aspect Ratio Container */}
        <div className="relative aspect-video bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-black">
          {/* Live Indicator Badge */}
          {isLive && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500/90 px-3 py-2 rounded-full z-10">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-bold text-white">LIVE</span>
            </div>
          )}

          {/* Stream Visualization */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 450"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Animated background waveform */}
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#B300FF" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#1A1A1A" stopOpacity="0.1" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Animated waveforms */}
              <g opacity="0.6">
                <path
                  d="M 0 225 Q 50 150, 100 225 T 200 225 T 300 225 T 400 225 T 500 225 T 600 225 T 700 225 T 800 225"
                  fill="none"
                  stroke="#00D9FF"
                  strokeWidth="2"
                  opacity="0.7"
                  filter="url(#glow)"
                />
                <path
                  d="M 0 225 Q 50 280, 100 225 T 200 225 T 300 225 T 400 225 T 500 225 T 600 225 T 700 225 T 800 225"
                  fill="none"
                  stroke="#B300FF"
                  strokeWidth="2"
                  opacity="0.5"
                  filter="url(#glow)"
                />
              </g>

              {/* Frequency bars */}
              {Array.from({ length: 32 }).map((_, i) => (
                <rect
                  key={i}
                  x={i * 25}
                  y={225 - Math.random() * 80}
                  width="18"
                  height={Math.random() * 80}
                  fill="url(#waveGradient)"
                  opacity="0.7"
                  rx="2"
                />
              ))}

              {/* Center text */}
              <text
                x="400"
                y="200"
                textAnchor="middle"
                className="fill-blue-400 font-bold"
                fontSize="24"
                opacity="0.8"
              >
                {streamTitle}
              </text>
              <text
                x="400"
                y="230"
                textAnchor="middle"
                className="fill-gray-400"
                fontSize="14"
              >
                Professional Audio Streaming
              </text>
            </svg>
          </div>

          {/* Corner info overlay */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-2 rounded-lg border border-gray-700/50">
            <div className="text-xs font-mono text-gray-300">
              {isLive ? 'ENCODER ACTIVE' : 'STANDBY'}
            </div>
          </div>
        </div>
      </div>

      {/* Title and Duration */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">{streamTitle}</h2>
          <p className="text-sm text-gray-400">Streaming to multiple platforms</p>
        </div>
        {isLive && (
          <div className="text-right">
            <div className="text-2xl font-mono font-bold text-blue-400">
              {/* Duration will be managed by parent */}
              00:23:45
            </div>
            <p className="text-xs text-gray-400">Stream duration</p>
          </div>
        )}
      </div>
    </div>
  );
}
