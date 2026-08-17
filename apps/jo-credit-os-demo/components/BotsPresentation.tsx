'use client';

import { useState } from 'react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  content: React.ReactNode;
  bgColor: string;
  accentColor: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'WISE² Bot Suite',
    subtitle: 'AI-Powered Integrations',
    bgColor: 'from-black via-[#050505] to-black',
    accentColor: '#39FF14',
    content: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-8xl mb-8">🤖</div>
          <h1 className="text-7xl font-black mb-6 bg-gradient-to-r from-[#39FF14] via-white to-[#00D9FF] bg-clip-text text-transparent">
            Bot Suite
          </h1>
          <p className="text-2xl text-[#aaa] max-w-2xl mx-auto">
            Discord OAuth • Graphics API • Analytics • Hermes Support
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'Discord OAuth',
    subtitle: 'Seamless Authentication',
    bgColor: 'from-[#5865F2]/10 via-black to-black',
    accentColor: '#5865F2',
    content: (
      <div className="grid grid-cols-2 gap-12 items-center min-h-screen">
        <div className="text-5xl">🔐</div>
        <div>
          <h2 className="text-4xl font-black mb-6 text-[#5865F2]">Discord OAuth</h2>
          <ul className="text-xl text-[#ccc] space-y-4">
            <li>✓ One-click Discord login</li>
            <li>✓ Profile synchronization</li>
            <li>✓ Server community integration</li>
            <li>✓ Token management & refresh</li>
          </ul>
          <div className="mt-8 text-sm font-mono text-[#666] bg-[#0a0a0a] p-4 rounded">
            POST /api/bots/discord-oauth
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'Graphics API',
    subtitle: 'AI Image Generation',
    bgColor: 'from-[#39FF14]/10 via-black to-black',
    accentColor: '#39FF14',
    content: (
      <div className="grid grid-cols-2 gap-12 items-center min-h-screen">
        <div className="text-5xl">🎨</div>
        <div>
          <h2 className="text-4xl font-black mb-6 text-[#39FF14]">Graphics API</h2>
          <ul className="text-xl text-[#ccc] space-y-4">
            <li>✓ Text-to-image generation</li>
            <li>✓ Style & quality control</li>
            <li>✓ Batch processing support</li>
            <li>✓ Image retrieval & management</li>
          </ul>
          <div className="mt-8 text-sm font-mono text-[#666] bg-[#0a0a0a] p-4 rounded">
            POST /api/bots/graphics
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: 'Analytics Bot',
    subtitle: 'Real-Time Insights',
    bgColor: 'from-[#00D9FF]/10 via-black to-black',
    accentColor: '#00D9FF',
    content: (
      <div className="grid grid-cols-2 gap-12 items-center min-h-screen">
        <div className="text-5xl">📊</div>
        <div>
          <h2 className="text-4xl font-black mb-6 text-[#00D9FF]">Analytics Bot</h2>
          <ul className="text-xl text-[#ccc] space-y-4">
            <li>✓ Event tracking & collection</li>
            <li>✓ Real-time metrics dashboard</li>
            <li>✓ User behavior insights</li>
            <li>✓ Discord webhook notifications</li>
          </ul>
          <div className="mt-8 text-sm font-mono text-[#666] bg-[#0a0a0a] p-4 rounded">
            POST /api/bots/analytics
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: 'Hermes Support',
    subtitle: 'AI Customer Service',
    bgColor: 'from-[#e0a83c]/10 via-black to-black',
    accentColor: '#e0a83c',
    content: (
      <div className="grid grid-cols-2 gap-12 items-center min-h-screen">
        <div className="text-5xl">💬</div>
        <div>
          <h2 className="text-4xl font-black mb-6 text-[#e0a83c]">Hermes Support</h2>
          <ul className="text-xl text-[#ccc] space-y-4">
            <li>✓ Conversational support</li>
            <li>✓ Knowledge base integration</li>
            <li>✓ Multi-turn conversations</li>
            <li>✓ Discord support channel integration</li>
          </ul>
          <div className="mt-8 text-sm font-mono text-[#666] bg-[#0a0a0a] p-4 rounded">
            POST /api/bots/hermes
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: 'Status Overview',
    subtitle: 'All Systems Operational',
    bgColor: 'from-[#39FF14]/5 via-black to-black',
    accentColor: '#39FF14',
    content: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl">
          <h2 className="text-4xl font-black mb-12 text-center text-[#39FF14]">System Status</h2>
          <div className="space-y-6">
            {[
              { name: 'Discord OAuth', status: 'ONLINE', color: '#5865F2' },
              { name: 'Graphics API', status: 'ONLINE', color: '#39FF14' },
              { name: 'Analytics Bot', status: 'ONLINE', color: '#00D9FF' },
              { name: 'Hermes Support', status: 'ONLINE', color: '#e0a83c' },
            ].map((bot, i) => (
              <div key={i} className="flex items-center justify-between bg-[#0a0a0a] border border-[#333] rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-4 h-4 rounded-full animate-pulse"
                    style={{ backgroundColor: bot.color }}
                  ></div>
                  <span className="text-xl font-bold text-white">{bot.name}</span>
                </div>
                <span
                  className="px-6 py-2 rounded-full font-black text-sm"
                  style={{
                    backgroundColor: bot.color + '20',
                    color: bot.color,
                    border: `1px solid ${bot.color}40`,
                  }}
                >
                  {bot.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center text-[#666]">
            <p>All bots operational and ready for integration</p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function BotsPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = slides[currentSlide];

  return (
    <div className={`bg-gradient-to-br ${slide.bgColor} text-white overflow-hidden`}>
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" style={{backgroundColor: slide.accentColor}}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s', backgroundColor: '#00D9FF'}}></div>
      </div>

      <div className="relative z-10">
        {/* Content */}
        <div className="px-8">
          {slide.content}
        </div>

        {/* Navigation */}
        <div className="fixed bottom-8 left-0 right-0 flex items-center justify-center gap-4 z-20">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-6 py-2 bg-[#333] hover:bg-[#444] disabled:opacity-50 rounded-lg font-bold transition"
          >
            ← Previous
          </button>

          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full transition ${
                  i === currentSlide ? 'bg-[#39FF14]' : 'bg-[#444]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-6 py-2 bg-[#39FF14] text-black hover:bg-[#4dff26] disabled:opacity-50 rounded-lg font-bold transition"
          >
            Next →
          </button>
        </div>

        {/* Slide counter */}
        <div className="fixed top-8 right-8 text-[#666] font-mono">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </div>
  );
}
