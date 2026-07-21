'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DanielAvatar, DarrenAvatar } from '@/components/Characters';

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    project: '',
    timeline: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      window.location.href = '/auth/signup';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#050505] to-black text-white overflow-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#39FF14]/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00D9FF]/20 rounded-full blur-3xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 border-b border-[#333]">
          <Link href="/" className="flex items-baseline gap-1">
            <span className="font-black text-2xl bg-gradient-to-b from-white to-[#777] bg-clip-text text-transparent">WISE</span>
            <span className="font-black text-sm text-[#39FF14]">2</span>
          </Link>
          <Link href="/auth/login" className="px-6 py-2 bg-[#39FF14] text-black font-bold rounded hover:shadow-lg hover:shadow-[#39FF14]/50 transition">
            Sign In
          </Link>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-20 animate-fade-in">
            <h1 className="text-8xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-[#39FF14] via-white to-[#00D9FF] bg-clip-text text-transparent">
                Transform Your Creative Vision
              </span>
            </h1>
            <p className="text-2xl text-[#aaa] mb-8">
              AI-powered studio. Human-guided expertise. Professional-grade results.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Intake Form */}
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#39FF14]/40 rounded-3xl p-12 shadow-2xl shadow-[#39FF14]/10 hover:shadow-[#39FF14]/20 transition">
              <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-[#39FF14] to-[#00D9FF] bg-clip-text text-transparent">
                Begin Your Journey
              </h2>
              <p className="text-[#999] mb-10 text-lg">Tell us about your creative vision</p>

              {submitted ? (
                <div className="text-center py-16">
                  <div className="text-7xl mb-6">✨</div>
                  <h3 className="text-3xl font-bold mb-3">Welcome aboard!</h3>
                  <p className="text-[#999] text-lg">Redirecting to studio setup...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-[#39FF14] mb-3 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#39FF14]/40 rounded-lg px-4 py-3 text-white focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 outline-none transition"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#39FF14] mb-3 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#39FF14]/40 rounded-lg px-4 py-3 text-white focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 outline-none transition"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#39FF14] mb-3 uppercase tracking-wider">Project Type</label>
                    <select
                      value={formData.project}
                      onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#39FF14]/40 rounded-lg px-4 py-3 text-white focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 outline-none transition"
                      required
                    >
                      <option value="">Select a project</option>
                      <option value="music">Music Production</option>
                      <option value="podcast">Podcast</option>
                      <option value="video">Video Content</option>
                      <option value="branding">Audio Branding</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#39FF14] mb-3 uppercase tracking-wider">Timeline</label>
                    <select
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      className="w-full bg-[#0a0a0a] border border-[#39FF14]/40 rounded-lg px-4 py-3 text-white focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 outline-none transition"
                      required
                    >
                      <option value="">Select timeline</option>
                      <option value="urgent">This week</option>
                      <option value="soon">Next 2 weeks</option>
                      <option value="flexible">1-2 months</option>
                      <option value="planning">Just exploring</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#39FF14] to-[#00D9FF] text-black font-black text-lg rounded-lg hover:shadow-lg hover:shadow-[#39FF14]/50 transition uppercase tracking-wider"
                  >
                    Begin Studio Setup
                  </button>
                </form>
              )}
            </div>

            {/* Characters Section */}
            <div className="space-y-16">
              <div>
                <h2 className="text-4xl font-black mb-3 bg-gradient-to-r from-white to-[#999] bg-clip-text text-transparent">Your Guides</h2>
                <p className="text-[#666] text-lg">Meet Daniel & Darren — your personal creative directors</p>
              </div>

              {/* Daniel */}
              <div className="group bg-gradient-to-br from-[#39FF14]/20 to-transparent border-2 border-[#39FF14]/50 rounded-3xl p-8 hover:border-[#39FF14] hover:shadow-xl hover:shadow-[#39FF14]/20 transition">
                <div className="flex items-start gap-6">
                  <div className="w-28 h-28 flex-shrink-0 bg-[#39FF14]/10 rounded-full border-2 border-[#39FF14]/50 flex items-center justify-center group-hover:bg-[#39FF14]/20 transition">
                    <div className="w-20 h-20">
                      <DanielAvatar />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-[#39FF14] mb-2">Daniel</h3>
                    <p className="text-[#39FF14] font-bold text-lg mb-4">Audio Architect</p>
                    <p className="text-[#ccc] text-base leading-relaxed">
                      Master of sonic branding. Creates audio signatures that define your creative identity. Expert in sound design, mixing, and mastering.
                    </p>
                  </div>
                </div>
              </div>

              {/* Darren */}
              <div className="group bg-gradient-to-br from-[#00D9FF]/20 to-transparent border-2 border-[#00D9FF]/50 rounded-3xl p-8 hover:border-[#00D9FF] hover:shadow-xl hover:shadow-[#00D9FF]/20 transition">
                <div className="flex items-start gap-6">
                  <div className="w-28 h-28 flex-shrink-0 bg-[#00D9FF]/10 rounded-full border-2 border-[#00D9FF]/50 flex items-center justify-center group-hover:bg-[#00D9FF]/20 transition">
                    <div className="w-20 h-20">
                      <DarrenAvatar />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-[#00D9FF] mb-2">Darren</h3>
                    <p className="text-[#00D9FF] font-bold text-lg mb-4">Creative Director</p>
                    <p className="text-[#ccc] text-base leading-relaxed">
                      Visionary storyteller. Crafts compelling narratives and lyrics that resonate with audiences. Expert in creative direction and content strategy.
                    </p>
                  </div>
                </div>
              </div>

              {/* Journey */}
              <div className="bg-gradient-to-r from-[#39FF14]/15 to-[#00D9FF]/15 border-2 border-[#39FF14]/40 rounded-2xl p-8">
                <div className="text-center">
                  <p className="text-[#ccc] mb-6 text-lg font-semibold">
                    5-Step Journey to Creative Mastery
                  </p>
                  <div className="flex justify-center items-center gap-3 text-sm flex-wrap">
                    <span className="px-4 py-2 bg-[#39FF14]/20 text-[#39FF14] rounded-full font-bold">Beginning</span>
                    <span className="text-[#39FF14]">→</span>
                    <span className="px-4 py-2 bg-[#39FF14]/20 text-[#39FF14] rounded-full font-bold">Composition</span>
                    <span className="text-[#39FF14]">→</span>
                    <span className="px-4 py-2 bg-[#39FF14]/20 text-[#39FF14] rounded-full font-bold">Mastery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}

