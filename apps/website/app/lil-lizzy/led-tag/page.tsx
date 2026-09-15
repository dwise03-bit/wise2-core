"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Zap, Package, AlertCircle, CheckCircle, Lightbulb, Code2, Cpu } from "lucide-react";

export default function LedTagDevKitPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <main className="bg-gradient-to-br from-[#1a0033] via-[#2d0052] to-[#0a001a] min-h-screen text-white overflow-hidden">
      {/* Premium animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <img
          src="/lil-lizzy/boom-tag.jpg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover opacity-5"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a001a]/40 to-[#0a001a]/90"></div>

        {/* Animated gradient blobs */}
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#FF6B9D] rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob"></div>
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#00D9FF] rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-[#FFD700] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#FF6B9D]/30 bg-gradient-to-b from-[#0a001a]/80 to-[#0a001a]/40 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/lil-lizzy" className="inline-flex items-center gap-2 mb-6 hover:text-[#FF6B9D] transition-colors group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">Back to Lil Lizzy</span>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-4">
                <span className="bg-gradient-to-r from-[#FF6B9D] via-[#FFD700] to-[#00D9FF] bg-clip-text text-transparent">
                  Dev Kit
                </span>
              </h1>
              <p className="text-lg text-white/70 max-w-2xl">
                Everything you need to build, test, and customize your own Lil Lizzy
              </p>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-16 mb-24"
          >
            {/* What's Included */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div>
                <h2 className="text-4xl font-black mb-4 flex items-center gap-3">
                  <Package className="w-10 h-10 text-[#FF6B9D]" />
                  <span className="bg-gradient-to-r from-[#FF6B9D] to-[#00D9FF] bg-clip-text text-transparent">
                    What's Inside
                  </span>
                </h2>
                <p className="text-white/60 text-lg leading-relaxed">
                  The complete developer kit includes all hardware, tools, and documentation needed to assemble, program, and test your own Lil Lizzy device.
                </p>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {[
                  { icon: Cpu, title: "ESP32-S3 N16R8 DevKit", desc: "Dual-core processor, 16MB PSRAM" },
                  { icon: Lightbulb, title: "2.8\" ILI9341 Display", desc: "240x320 color TFT screen" },
                  { icon: Radio, title: "PN532 NFC Module", desc: "Tag-to-tag trade communication" },
                  { icon: Zap, title: "HC-05 Bluetooth", desc: "Wireless connectivity" },
                  { icon: Package, title: "1000mAh LiPo Battery", desc: "All-day runtime power" },
                  { icon: Code2, title: "USB-C Charger & Wires", desc: "Complete prototyping kit" },
                  { icon: CheckCircle, title: "Breadboard & Components", desc: "Resistors, capacitors, essentials" },
                  { icon: Zap, title: "Documentation Pack", desc: "Schematics, firmware, API guides" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FF6B9D]/10 to-[#00D9FF]/10 border border-[#00D9FF]/30 hover:border-[#FF6B9D]/50 transition-all hover:shadow-lg hover:shadow-[#FF6B9D]/20 group cursor-default"
                  >
                    <item.icon className="w-6 h-6 text-[#FF6B9D] flex-shrink-0 group-hover:text-[#00D9FF] transition-colors" />
                    <div>
                      <h3 className="font-bold text-white group-hover:text-[#FF6B9D] transition-colors">{item.title}</h3>
                      <p className="text-sm text-white/60">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Getting Started */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div>
                <h2 className="text-4xl font-black mb-4 flex items-center gap-3">
                  <Zap className="w-10 h-10 text-[#00D9FF]" />
                  <span className="bg-gradient-to-r from-[#00D9FF] to-[#FFD700] bg-clip-text text-transparent">
                    4-Step Guide
                  </span>
                </h2>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {[
                  { step: "01", title: "Assemble", icon: "⚙️", desc: "Connect all components to your ESP32 using the wiring diagram" },
                  { step: "02", title: "Flash Firmware", icon: "💾", desc: "Upload latest Lil Lizzy firmware via Arduino IDE" },
                  { step: "03", title: "Calibrate", icon: "🔧", desc: "Run display & NFC calibration sequences" },
                  { step: "04", title: "Play!", icon: "🎮", desc: "Test games, WiFi, and trading features" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-xl border border-[#FF6B9D]/30 p-6 bg-gradient-to-br from-[#FF6B9D]/5 to-[#00D9FF]/5 hover:border-[#FF6B9D]/60 transition-all group"
                  >
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#FF6B9D]/10 rounded-full group-hover:bg-[#FF6B9D]/20 transition-colors"></div>
                    <div className="relative flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-r from-[#FF6B9D] to-[#00D9FF]">
                          <span className="text-2xl font-black text-white">{item.step}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1 text-white group-hover:text-[#FF6B9D] transition-colors">{item.title}</h3>
                        <p className="text-white/60 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="p-5 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/40 flex gap-3 mt-8"
              >
                <AlertCircle className="w-5 h-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold mb-1 text-white">Requires Basic Skills</p>
                  <p className="text-white/70">Soldering, electronics, and Arduino IDE experience recommended</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Documentation Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-24 pt-20 border-t border-white/10"
          >
            <h2 className="text-4xl font-black mb-12 text-center">
              <span className="bg-gradient-to-r from-[#FF6B9D] via-[#00D9FF] to-[#FFD700] bg-clip-text text-transparent">
                Documentation
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Wiring Diagram", icon: "📐", desc: "Complete pin-by-pin ESP32 connections with schematics" },
                { title: "Firmware Guide", icon: "💻", desc: "Setup, flashing, and bootloader instructions" },
                { title: "API Reference", icon: "⚡", desc: "Game SDK, WiFi API, and trading protocol" },
              ].map((doc, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                  className="group p-6 rounded-xl bg-gradient-to-br from-[#FF6B9D]/10 to-[#00D9FF]/10 border border-[#00D9FF]/30 hover:border-[#FF6B9D]/60 transition-all hover:shadow-lg hover:shadow-[#FF6B9D]/20 cursor-pointer"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{doc.icon}</div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-[#FF6B9D] transition-colors">{doc.title}</h3>
                  <p className="text-white/60 text-sm">{doc.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-24 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              Ready to build <span className="bg-gradient-to-r from-[#FF6B9D] to-[#00D9FF] bg-clip-text text-transparent">Lil Lizzy</span>?
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
              Join other developers building games, features, and trading systems for the Lil Lizzy ecosystem
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-10 py-4 bg-gradient-to-r from-[#FF6B9D] to-[#FF1493] hover:from-[#FF1493] hover:to-[#FF6B9D] text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-[#FF6B9D]/30">
                Get Started Now
              </button>
              <Link
                href="/lil-lizzy"
                className="px-10 py-4 border-2 border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10 font-bold rounded-lg transition-all"
              >
                Back to Product
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
