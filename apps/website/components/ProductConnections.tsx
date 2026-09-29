"use client";

import { motion } from "framer-motion";

export function ProductConnections() {
  return (
    <section className="w-full bg-gradient-to-b from-slate-900 to-slate-950 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-cyan-400 text-sm font-mono uppercase tracking-widest mb-4">
            Systems Architecture
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            How WISE² Products Connect
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Every product shares the same operating layer, so data flows seamlessly and decisions propagate instantly.
          </p>
        </div>

        {/* Diagram */}
        <div className="relative h-96 md:h-[500px] flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet">
            {/* Animated background circles */}
            <defs>
              <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" style={{ stopColor: "#06b6d4", stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: "#0ea5e9", stopOpacity: 0 }} />
              </radialGradient>
            </defs>

            {/* Core operating layer */}
            <motion.circle
              cx="600"
              cy="300"
              r="120"
              fill="url(#coreGradient)"
              stroke="#06b6d4"
              strokeWidth="2"
              initial={{ r: 100, opacity: 0.5 }}
              animate={{ r: 140, opacity: 0.3 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            />

            {/* Core label */}
            <text x="600" y="300" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#00d9ff" dy="0.3em">
              WISE² Operating Layer
            </text>

            {/* Products positioned in circle */}
            {[
              { label: "Command", emoji: "⚡", angle: 0 },
              { label: "AI Phone", emoji: "📱", angle: 40 },
              { label: "Field Tech", emoji: "🚀", angle: 80 },
              { label: "HVAC OS", emoji: "❄️", angle: 120 },
              { label: "Capture", emoji: "🧠", angle: 160 },
              { label: "Cloud", emoji: "☁️", angle: 200 },
              { label: "XR Command", emoji: "🥽", angle: 240 },
              { label: "Lil Lizzy", emoji: "🦎", angle: 280 },
              { label: "Audit", emoji: "📊", angle: 320 },
            ].map((product, idx) => {
              const angle = (product.angle * Math.PI) / 180;
              const radius = 280;
              const x = 600 + radius * Math.cos(angle);
              const y = 300 + radius * Math.sin(angle);

              return (
                <motion.g key={idx}>
                  {/* Connection line */}
                  <motion.line
                    x1="600"
                    y1="300"
                    x2={x}
                    y2={y}
                    stroke="#0ea5e9"
                    strokeWidth="1.5"
                    opacity="0.3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: idx * 0.05, duration: 0.8 }}
                  />

                  {/* Product circle */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r="35"
                    fill="#0f172a"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.08, duration: 0.5 }}
                    whileHover={{ scale: 1.2, stroke: "#00d9ff" }}
                  />

                  {/* Emoji */}
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize="20"
                    dy="0.3em"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {product.emoji}
                  </text>

                  {/* Label */}
                  <text
                    x={x}
                    y={y + 12}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#e2e8f0"
                    dy="0.3em"
                  >
                    {product.label}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="text-4xl mb-4">🔗</div>
            <h4 className="text-white font-bold text-lg mb-2">All Connected</h4>
            <p className="text-gray-400">Every product shares the same data layer, so a change in one system instantly reflects everywhere.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="text-white font-bold text-lg mb-2">Real-Time Sync</h4>
            <p className="text-gray-400">Events propagate instantly across all systems. A field update triggers automation in Command.</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h4 className="text-white font-bold text-lg mb-2">One Intelligence</h4>
            <p className="text-gray-400">AI sees the full picture. Every decision has context from every system and every team.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
