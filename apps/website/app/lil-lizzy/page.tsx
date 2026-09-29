"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Zap, Gamepad2, Radio, Smartphone, Heart } from "lucide-react";
import { useState } from "react";

export default function LilLizzyPage() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "specs", label: "Tech Specs" },
    { id: "gallery", label: "Gallery" },
    { id: "buy", label: "Pre-Order" },
  ];

  return (
    <main className="bg-gradient-to-br from-[#1a0033] via-[#2d0052] to-[#0a001a] min-h-screen text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#FF6B9D] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-[#00D9FF] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-[#FFD700] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#FF6B9D]/30 bg-[#0a001a]/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 hover:text-[#FF6B9D] transition-colors">
              <span>←</span>
              <span className="text-sm">Back to WISE²</span>
            </Link>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
              <span className="bg-gradient-to-r from-[#FF6B9D] via-[#00D9FF] to-[#FFD700] bg-clip-text text-transparent">
                Lil Lizzy
              </span>
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              A pocket-size world of games, trades, and Boom Stars. Connected. Playable. Yours.
            </p>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            {/* Left: Device Illustration */}
            <div className="relative flex items-center justify-center h-96">
              <svg viewBox="0 0 280 480" className="w-full max-w-xs drop-shadow-2xl">
                {/* Device shadow */}
                <ellipse cx="140" cy="450" rx="100" ry="20" fill="#000" opacity="0.2" />

                {/* Device body */}
                <rect x="40" y="20" width="200" height="380" rx="20" fill="#1a1a1a" stroke="#333" strokeWidth="2" />

                {/* Screen bezel */}
                <rect x="50" y="30" width="180" height="280" rx="16" fill="#0a0a0a" stroke="#444" strokeWidth="1" />

                {/* Screen display - showing game state */}
                <defs>
                  <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF6B9D" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00D9FF" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <rect x="52" y="32" width="176" height="276" fill="url(#screenGrad)" />

                {/* Game UI - Boom Star display */}
                <circle cx="140" cy="80" r="30" fill="#FFD700" opacity="0.9" />
                <text x="140" y="87" textAnchor="middle" fontSize="24" fill="#FFF" fontWeight="bold">★</text>

                {/* Score display */}
                <text x="140" y="140" textAnchor="middle" fontSize="16" fill="#FF6B9D" fontWeight="bold">Score: 2,450</text>

                {/* Game grid preview */}
                {[0, 1, 2].map((row) =>
                  [0, 1, 2].map((col) => (
                    <g key={`${row}-${col}`}>
                      <rect
                        x={75 + col * 40}
                        y={170 + row * 35}
                        width="35"
                        height="30"
                        rx="4"
                        fill="#00D9FF"
                        opacity={row === 1 && col === 1 ? 0.9 : 0.4}
                        stroke="#FF6B9D"
                        strokeWidth="1"
                      />
                      {row === 1 && col === 1 && (
                        <text x={92 + col * 40} y={190 + row * 35} textAnchor="middle" fontSize="16" fill="#000" fontWeight="bold">💫</text>
                      )}
                    </g>
                  ))
                )}

                {/* Bottom status bar */}
                <rect x="52" y="280" width="176" height="28" fill="#1a1a2e" />
                <text x="65" y="298" fontSize="11" fill="#00D9FF">🔋 85%</text>
                <text x="140" y="298" textAnchor="middle" fontSize="11" fill="#FF6B9D">WiFi ◉</text>
                <text x="210" y="298" textAnchor="end" fontSize="11" fill="#FFD700">↔ Trade</text>

                {/* Physical button 1 - Top */}
                <rect x="20" y="100" width="14" height="30" rx="7" fill="#FF6B9D" opacity="0.7" />

                {/* Physical button 2 - Middle */}
                <rect x="20" y="160" width="14" height="30" rx="7" fill="#00D9FF" opacity="0.7" />

                {/* Speaker grille */}
                <g opacity="0.3">
                  <line x1="240" y1="320" x2="260" y2="320" stroke="#666" strokeWidth="2" />
                  <line x1="240" y1="335" x2="260" y2="335" stroke="#666" strokeWidth="2" />
                  <line x1="240" y1="350" x2="260" y2="350" stroke="#666" strokeWidth="2" />
                </g>

                {/* USB-C port */}
                <rect x="115" y="415" width="50" height="8" rx="2" fill="#666" opacity="0.5" />

                {/* Brand text */}
                <text x="140" y="400" textAnchor="middle" fontSize="12" fill="#FF6B9D" fontWeight="bold" opacity="0.6">BOOM</text>
              </svg>

              {/* Animated glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FF6B9D]/20 to-[#00D9FF]/20 blur-3xl -z-10 animate-pulse" />
            </div>

            {/* Right: Features */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4">Play. Connect. Trade.</h2>
                <p className="text-white/60 text-lg leading-relaxed">
                  Lil Lizzy puts a full-color gaming device in your pocket. Tap-to-trade Boom Tags with friends. Earn Boom Stars. Unlock mini-games. Build your collection.
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  { icon: Gamepad2, title: "8+ Mini-Games", desc: "Snake, Boom Star Runner, Match-3" },
                  { icon: Radio, title: "Tap-to-Trade", desc: "NFC trades with other Boom Tags" },
                  { icon: Smartphone, title: "240x320 Display", desc: "Full color, perfect for hands" },
                  { icon: Zap, title: "All-Day Battery", desc: "1000mAh LiPo, USB-C charging" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#FF6B9D]/50 transition-colors"
                  >
                    <item.icon className="w-6 h-6 text-[#FF6B9D] flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <p className="text-sm text-white/60">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="w-full bg-gradient-to-r from-[#FF6B9D] to-[#FF1493] hover:from-[#FF1493] hover:to-[#FF6B9D] text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                <span>Pre-Order Lil Lizzy</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* Tabs Section */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex gap-2 mb-8 border-b border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-bold text-sm transition-all relative ${
                  activeTab === tab.id
                    ? "text-[#FF6B9D]"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B9D] to-[#00D9FF]"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-96">
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="text-2xl font-bold">About Lil Lizzy</h3>
                <p className="text-white/70 leading-relaxed">
                  Lil Lizzy is part of the BoomPopsters universe—a connected playground where kids (8-14) play games, trade digital collectibles with friends via NFC, and grow their Boom Star collection.
                </p>
                <p className="text-white/70 leading-relaxed">
                  Each Boom Tag is a handheld gaming device with wireless connectivity, allowing real-time trades, social features, and a growing library of mini-games that unlock as you play.
                </p>
              </motion.div>
            )}

            {activeTab === "specs" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="text-2xl font-bold mb-6">Technical Specifications</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { label: "Brain", value: "ESP32-S3 Dual-Core" },
                    { label: "Memory", value: "16MB PSRAM, 4MB FLASH" },
                    { label: "Display", value: "2.8\" ILI9341, 240x320px, Full Color" },
                    { label: "Connectivity", value: "WiFi 6, Bluetooth 5.4, NFC" },
                    { label: "Battery", value: "1000mAh LiPo, 8+ hours" },
                    { label: "Charging", value: "USB-C, Fast Charge" },
                    { label: "Durability", value: "IP54 Water Resistant" },
                    { label: "Weight", value: "85g" },
                  ].map((spec, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-sm text-white/60 mb-1">{spec.label}</p>
                      <p className="font-bold text-[#FF6B9D]">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "gallery" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="text-2xl font-bold mb-6">Gallery</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Hero View */}
                  <div className="aspect-square bg-gradient-to-br from-[#FF6B9D] via-[#1a0033] to-[#00D9FF] rounded-lg border border-[#FF6B9D]/50 flex items-center justify-center overflow-hidden relative">
                    <svg viewBox="0 0 200 200" className="w-32 h-32">
                      <circle cx="100" cy="100" r="50" fill="#FFD700" opacity="0.8" />
                      <text x="100" y="115" textAnchor="middle" fontSize="40" fill="#FFF">★</text>
                    </svg>
                    <p className="absolute bottom-3 text-xs text-white/80 font-bold">Hero View</p>
                  </div>

                  {/* Top Down */}
                  <div className="aspect-square bg-gradient-to-br from-[#0a0a0a] to-[#1a1a2e] rounded-lg border border-[#00D9FF]/30 flex items-center justify-center overflow-hidden relative">
                    <svg viewBox="0 0 200 200" className="w-28 h-28">
                      <rect x="45" y="20" width="110" height="160" rx="12" fill="#333" stroke="#00D9FF" strokeWidth="2" />
                      <rect x="55" y="30" width="90" height="120" fill="#1a1a1a" stroke="#666" strokeWidth="1" />
                      <circle cx="100" cy="80" r="15" fill="#FF6B9D" opacity="0.6" />
                    </svg>
                    <p className="absolute bottom-3 text-xs text-white/80 font-bold">Top Down</p>
                  </div>

                  {/* UI Preview */}
                  <div className="aspect-square bg-gradient-to-br from-[#1a0033] to-[#2d0052] rounded-lg border border-[#FF6B9D]/30 flex items-center justify-center overflow-hidden relative">
                    <svg viewBox="0 0 200 200" className="w-24 h-24">
                      <rect x="50" y="25" width="100" height="150" rx="8" fill="#0a0a0a" stroke="#FF6B9D" strokeWidth="2" />
                      {[0, 1, 2].map((i) => (
                        <rect key={i} x={55 + i * 30} y={45 + i * 20} width="25" height="25" fill="#00D9FF" opacity={0.6 - i * 0.1} />
                      ))}
                      <text x="100" y="145" textAnchor="middle" fontSize="10" fill="#FFD700">Score: 1K</text>
                    </svg>
                    <p className="absolute bottom-3 text-xs text-white/80 font-bold">UI Preview</p>
                  </div>

                  {/* In Hand */}
                  <div className="aspect-square bg-gradient-to-br from-[#2d0052] to-[#0a001a] rounded-lg border border-[#00D9FF]/50 flex items-center justify-center overflow-hidden relative">
                    <svg viewBox="0 0 200 200" className="w-32 h-32">
                      <ellipse cx="60" cy="140" rx="40" ry="30" fill="#8B4513" opacity="0.4" />
                      <path d="M 40 120 Q 35 100 40 80 Q 45 60 60 50 Q 80 40 100 45 Q 120 50 130 70 Q 135 90 130 120" fill="#8B4513" opacity="0.3" />
                      <rect x="60" y="50" width="60" height="90" rx="8" fill="#1a1a1a" stroke="#FF6B9D" strokeWidth="2" />
                    </svg>
                    <p className="absolute bottom-3 text-xs text-white/80 font-bold">In Hand</p>
                  </div>

                  {/* Boom Stars */}
                  <div className="aspect-square bg-gradient-to-br from-[#FFD700]/20 to-[#FF6B9D]/20 rounded-lg border border-[#FFD700]/50 flex items-center justify-center overflow-hidden relative">
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                      {['★', '✨', '🌟', '💫'].map((star, i) => (
                        <span key={i} className="text-3xl animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>{star}</span>
                      ))}
                    </div>
                    <p className="absolute bottom-3 text-xs text-white/80 font-bold">Boom Stars</p>
                  </div>

                  {/* Trading Screen */}
                  <div className="aspect-square bg-gradient-to-br from-[#00D9FF]/20 to-[#FF6B9D]/20 rounded-lg border border-[#00D9FF]/50 flex items-center justify-center overflow-hidden relative">
                    <svg viewBox="0 0 200 200" className="w-28 h-28">
                      <rect x="40" y="30" width="60" height="90" rx="6" fill="#0a0a0a" stroke="#FF6B9D" strokeWidth="1.5" />
                      <text x="70" y="55" textAnchor="middle" fontSize="20" fill="#FF6B9D">→</text>
                      <text x="70" y="85" textAnchor="middle" fontSize="10" fill="#FF6B9D" fontWeight="bold">NFC</text>
                      <rect x="100" y="30" width="60" height="90" rx="6" fill="#0a0a0a" stroke="#00D9FF" strokeWidth="1.5" />
                      <text x="130" y="75" textAnchor="middle" fontSize="14" fill="#00D9FF">↔</text>
                    </svg>
                    <p className="absolute bottom-3 text-xs text-white/80 font-bold">Trading Screen</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "buy" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h3 className="text-2xl font-bold mb-6">Pre-Order Now</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gradient-to-br from-[#FF6B9D]/10 to-transparent rounded-lg border border-[#FF6B9D]/50">
                    <h4 className="text-xl font-bold mb-4">Lil Lizzy Solo</h4>
                    <p className="text-3xl font-black text-[#FF6B9D] mb-4">$69.99</p>
                    <ul className="space-y-2 mb-6 text-sm text-white/70">
                      <li>✓ Boom Tag device</li>
                      <li>✓ USB-C cable</li>
                      <li>✓ Starter pack (25 Boom Stars)</li>
                    </ul>
                    <button className="w-full bg-[#FF6B9D] hover:bg-[#FF1493] text-white font-bold py-3 rounded-lg transition-all">
                      Pre-Order
                    </button>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-[#00D9FF]/10 to-transparent rounded-lg border border-[#00D9FF]/50">
                    <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-[#FFD700]" />
                      Twin Pack
                    </h4>
                    <p className="text-3xl font-black text-[#00D9FF] mb-4">$129.99</p>
                    <ul className="space-y-2 mb-6 text-sm text-white/70">
                      <li>✓ 2x Boom Tag devices</li>
                      <li>✓ 2x USB-C cables</li>
                      <li>✓ Dual pack (50 Boom Stars)</li>
                      <li>✓ Trade starter pack</li>
                    </ul>
                    <button className="w-full bg-[#00D9FF] hover:bg-[#00BFFF] text-black font-bold py-3 rounded-lg transition-all">
                      Pre-Order Pair
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Footer Call-to-Action */}
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold">Ready to play?</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Join the BoomPopsters universe. Trade with friends. Unlock games. Collect Boom Stars.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-[#FF6B9D] to-[#FF1493] hover:from-[#FF1493] hover:to-[#FF6B9D] text-white font-bold rounded-lg transition-all transform hover:scale-105">
                Pre-Order Now
              </button>
              <Link
                href="/lil-lizzy/led-tag"
                className="px-8 py-4 border-2 border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10 font-bold rounded-lg transition-all"
              >
                View Dev Kit
              </Link>
            </div>
          </motion.div>
        </section>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}
