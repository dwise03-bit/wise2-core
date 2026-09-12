'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserAuthToken } from '@/lib/auth-session';
import {
  Music,
  Mic,
  Sparkles,
  Glasses,
  Loader,
  AlertCircle,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function SoundLabsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getBrowserAuthToken();
    if (!token) {
      router.push('/auth/signin');
      return;
    }
    // Simulate load time, then show interface
    setTimeout(() => setLoading(false), 800);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading Sound Labs...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Music className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-5xl font-black text-white mb-1">Sound Labs</h1>
                  <p className="text-gray-400">Professional audio production workspace</p>
                </div>
              </div>
            </div>
            <Link
              href="/platform"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          </div>
        </div>
      </div>

      {/* Quest workspace */}
      <section className="max-w-7xl mx-auto px-6 pb-12">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.18),transparent_42%),#0a0f0d] p-8 md:p-10">
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-3 text-emerald-300">
                <Glasses className="h-6 w-6" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">Quest Sound Room</span>
              </div>
              <h2 className="text-3xl font-black text-white md:text-4xl">Produce inside the WISE² XR studio.</h2>
              <p className="mt-3 text-gray-300">Open the Sound Labs workspace in Meta Quest with spatial controls, shared sessions, and a direct handoff to your browser project.</p>
            </div>
            <Link
              href="/quest?surface=soundlabs"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 font-bold text-black transition hover:bg-emerald-300"
            >
              Open Quest Sound Room <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Feature 1 */}
          <div className="group border border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 rounded-xl p-8 transition-all cursor-pointer">
            <div className="p-3 bg-blue-500/10 w-fit rounded-lg mb-4 group-hover:bg-blue-500/20 transition-colors">
              <Music className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Audio Recording</h3>
            <p className="text-gray-400 text-sm mb-4">
              Professional multi-track recording with latency-free monitoring and real-time effects.
            </p>
            <div className="flex items-center text-blue-400 text-sm font-semibold group-hover:gap-2 transition-all">
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group border border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 rounded-xl p-8 transition-all cursor-pointer">
            <div className="p-3 bg-green-500/10 w-fit rounded-lg mb-4 group-hover:bg-green-500/20 transition-colors">
              <Mic className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Voice Enhancement</h3>
            <p className="text-gray-400 text-sm mb-4">
              Enhance vocal quality with AI-powered noise reduction and vocal processing.
            </p>
            <div className="flex items-center text-green-400 text-sm font-semibold group-hover:gap-2 transition-all">
              Explore <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group border border-gray-800 bg-gray-900/50 hover:bg-gray-900/80 rounded-xl p-8 transition-all cursor-pointer">
            <div className="p-3 bg-purple-500/10 w-fit rounded-lg mb-4 group-hover:bg-purple-500/20 transition-colors">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Effect Library</h3>
            <p className="text-gray-400 text-sm mb-4">
              50+ professional effects including reverb, delay, EQ, and compression plugins.
            </p>
            <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:gap-2 transition-all">
              Browse <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="border border-gray-800 bg-gray-900/50 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Projects</p>
            <p className="text-3xl font-bold text-blue-400">0</p>
          </div>
          <div className="border border-gray-800 bg-gray-900/50 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Recordings</p>
            <p className="text-3xl font-bold text-green-400">0</p>
          </div>
          <div className="border border-gray-800 bg-gray-900/50 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Storage Used</p>
            <p className="text-3xl font-bold text-purple-400">0 GB</p>
          </div>
          <div className="border border-gray-800 bg-gray-900/50 rounded-xl p-6">
            <p className="text-gray-400 text-sm mb-2">Plan</p>
            <p className="text-3xl font-bold text-yellow-400">PRO</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="border border-gray-800 bg-gradient-to-br from-gray-900 to-black rounded-xl p-12 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Create?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Start your first audio project and harness the power of professional music production tools.
          </p>
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Project
          </Link>
        </div>
      </div>
    </main>
  );
}
