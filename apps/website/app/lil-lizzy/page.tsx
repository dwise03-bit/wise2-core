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
      {/* Animated background with hero image */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <img
          src="/lil-lizzy/lizzy-hero.jpg"
          alt="Lil Lizzy Background"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a001a]/50 to-[#0a001a]/80"></div>
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
            {/* Left: Product Image */}
            <div className="relative">
              <img
                src="/lil-lizzy/boom-tag.jpg"
                alt="Lil Lizzy Boom Tag"
                className="w-full h-auto rounded-2xl border-2 border-[#FF6B9D]/50 shadow-2xl"
              />
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
                <div className="space-y-6">
                  {[
                    { img: "lizzy-hero.jpg", title: "Hero View" },
                    { img: "boom-tag.jpg", title: "Boom Tag Device" },
                    { img: "style-board.jpg", title: "Style Board" },
                    { img: "lookbook-strip.jpg", title: "Lookbook" },
                    { img: "spec-board.jpg", title: "Technical Specs" },
                    { img: "lizzy-sheet.jpg", title: "Character Sheet" },
                  ].map((item, i) => (
                    <div key={i} className="overflow-hidden rounded-lg border border-[#00D9FF]/30">
                      <img
                        src={`/lil-lizzy/${item.img}`}
                        alt={item.title}
                        className="w-full h-auto hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
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
