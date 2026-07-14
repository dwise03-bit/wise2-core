'use client';

import React from 'react';
import { Button } from '@wise2/design-system/components';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-black to-cyan-950/40 opacity-50" />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <div>
          <div className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/50 rounded-full text-xs font-semibold text-cyan-400 mb-6">
            ✨ WELCOME TO WISE²
          </div>

          <h1 className="text-6xl lg:text-7xl font-black mb-6 leading-tight text-white">
            ORGANIZED
            <br />
            CHAOS
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              COMMAND CENTER
            </span>
          </h1>

          <p className="text-lg text-gray-300 mb-8 max-w-xl leading-relaxed">
            The all-in-one AI operating system for businesses, creators, and entrepreneurs ready to dominate.
          </p>

          {/* Features Row */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              'AI POWERED AUTOMATION',
              'REAL-TIME ANALYTICS',
              'BUILT FOR SCALE',
              'SECURE BY DESIGN',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-cyan-400">✦</span>
                <span className="text-sm font-semibold text-white">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button variant="primary" className="px-8 py-4">
              START FREE TODAY →
            </Button>
            <Button variant="ghost" className="px-8 py-4 border-2 border-cyan-500/50">
              ▶ WATCH DEMO
            </Button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            <div className="border-l border-gray-600 pl-4">
              <p className="text-sm font-semibold text-gray-300">Trusted by 10,000+ businesses worldwide</p>
            </div>
          </div>
        </div>

        {/* Right Side - Command Center Dashboard */}
        <div className="relative hidden lg:block">
          <div className="aspect-square bg-gradient-to-br from-blue-950/50 to-cyan-950/50 rounded-2xl border border-cyan-500/30 p-6 backdrop-blur-xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-cyan-500 rounded-full" />
                <span className="text-xs font-bold text-cyan-400">W2 COMMAND CENTER</span>
              </div>
              <div className="flex gap-2">
                <button className="w-4 h-4 bg-cyan-500/20 rounded hover:bg-cyan-500/40 transition" />
                <button className="w-4 h-4 bg-cyan-500/20 rounded hover:bg-cyan-500/40 transition" />
                <button className="w-4 h-4 bg-cyan-500/20 rounded hover:bg-cyan-500/40 transition" />
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="space-y-4">
              {/* Revenue Card */}
              <div className="bg-black/50 border border-cyan-500/20 rounded p-4 backdrop-blur">
                <p className="text-xs text-gray-400 mb-1">REVENUE TODAY</p>
                <p className="text-3xl font-bold text-cyan-400">$24,583.00</p>
                <p className="text-xs text-green-400 mt-1">↑ 24.5% from yesterday</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/50 border border-cyan-500/20 rounded p-3 backdrop-blur">
                  <p className="text-xs text-gray-400">ACTIVE AUTOMATIONS</p>
                  <p className="text-xl font-bold text-cyan-400">127</p>
                </div>
                <div className="bg-black/50 border border-cyan-500/20 rounded p-3 backdrop-blur">
                  <p className="text-xs text-gray-400">AI TASKS COMPLETED</p>
                  <p className="text-xl font-bold text-cyan-400">3,245</p>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-black/50 border border-cyan-500/20 rounded p-4 backdrop-blur">
                <p className="text-xs text-gray-400 mb-2">SYSTEM STATUS</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">● All Systems Operational</span>
                    <span className="text-cyan-400">99.99% UPTIME</span>
                  </div>
                  <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-green-500 to-cyan-500" />
                  </div>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-cyan-500/20 pt-3">
                <div>
                  <p className="text-gray-400">TOTAL USERS</p>
                  <p className="font-bold text-cyan-400">3,240 +24 today</p>
                </div>
                <div>
                  <p className="text-gray-400">SERVER LOAD</p>
                  <p className="font-bold text-cyan-400">32%</p>
                </div>
              </div>
            </div>

            {/* AI Assistant Card */}
            <div className="absolute -right-8 -bottom-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg p-4 w-48 shadow-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
                  🤖
                </div>
                <div className="text-sm font-semibold text-white">AI ASSISTANT</div>
              </div>
              <p className="text-xs text-blue-100">Good morning, Daniel! All systems ready. What would you like to automate today?</p>
              <button className="mt-3 w-full py-2 bg-blue-900/30 hover:bg-blue-900/50 rounded text-xs font-semibold transition text-white">
                OPEN AI COMMAND
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
