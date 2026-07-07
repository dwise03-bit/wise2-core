"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Signup failed");

      setStatus("success");
      setMessage("Welcome! Check your email.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }

    setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3000);
  }

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#1A1F36] to-[#1A1F36]/95 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 sm:py-32">
          {/* Logo */}
          <div className="mb-12">
            <div className="text-2xl font-bold tracking-tight">
              WISE² <span className="text-[#FF6B35]">CORE</span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            Production infrastructure for ambitious founders.
            <br />
            <span className="text-[#FF6B35]">Without the enterprise price tag.</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            Deploy production-grade infrastructure in 10 minutes. Scale without hiring a DevOps team or doubling your budget.
          </p>

          {/* CTA Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <form onSubmit={handleSignup} className="flex gap-2 flex-1 max-w-md">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] focus:bg-white/5"
                required
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="px-6 py-3 bg-[#FF6B35] text-white font-semibold rounded hover:bg-[#FF5722] disabled:opacity-50 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {status === "loading" && "..."}
                {status === "success" && <Check className="w-5 h-5" />}
                {status === "idle" || status === "error" ? "Get Started" : ""}
              </button>
            </form>
            {message && (
              <p className={`text-sm ${status === "success" ? "text-green-400" : "text-red-400"}`}>
                {message}
              </p>
            )}
          </div>

          <p className="text-gray-400 text-sm mt-4">Free forever. No credit card required.</p>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="flex justify-center py-8 bg-gray-50">
        <ChevronDown className="w-6 h-6 text-gray-400 animate-bounce" />
      </div>

      {/* How It Works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold mb-16">Built by founders who ship.</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-l-4 border-[#FF6B35] pl-6">
            <h3 className="text-2xl font-bold mb-4">Deploy in 10 minutes</h3>
            <p className="text-gray-600">
              PostgreSQL, Redis, monitoring, backups—everything production-ready out of the box. No config needed.
            </p>
          </div>

          <div className="border-l-4 border-[#FF6B35] pl-6">
            <h3 className="text-2xl font-bold mb-4">Affordable at every scale</h3>
            <p className="text-gray-600">
              $5–20/month. 50–80% cheaper than Heroku. Pay for what you use, not for unused features.
            </p>
          </div>

          <div className="border-l-4 border-[#FF6B35] pl-6">
            <h3 className="text-2xl font-bold mb-4">You own it</h3>
            <p className="text-gray-600">
              Standard tech, zero lock-in. Runs anywhere: VPS, DigitalOcean, AWS, even Raspberry Pi.
            </p>
          </div>
        </div>
      </section>

      {/* Proof Points */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12">What's included</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-[#FF6B35] font-bold text-xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-2">5 core services pre-configured</h4>
                <p className="text-gray-600">API, dashboard, admin panel, Discord bot, background jobs.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#FF6B35] font-bold text-xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-2">30+ production-ready alerts</h4>
                <p className="text-gray-600">Catches problems before they crash your service.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#FF6B35] font-bold text-xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-2">Comprehensive monitoring</h4>
                <p className="text-gray-600">Prometheus + Grafana dashboards. Know what's happening, always.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#FF6B35] font-bold text-xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-2">Daily automated backups</h4>
                <p className="text-gray-600">Restore tested. Sleep better knowing your data is safe.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#FF6B35] font-bold text-xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-2">5,300+ lines of documentation</h4>
                <p className="text-gray-600">Every deployment scenario, every troubleshooting guide.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[#FF6B35] font-bold text-xl flex-shrink-0">✓</div>
              <div>
                <h4 className="font-semibold mb-2">99.9% uptime track record</h4>
                <p className="text-gray-600">Proven across 500+ early-stage deployments.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A1F36] text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Stop overpaying for infrastructure.</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join founders scaling their products affordably. No credit card, no lock-in.
          </p>

          <form onSubmit={handleSignup} className="flex gap-3 justify-center flex-wrap">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF6B35] w-full sm:w-auto"
              required
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-8 py-3 bg-[#FF6B35] text-white font-semibold rounded hover:bg-[#FF5722] disabled:opacity-50 transition-all"
            >
              {status === "loading" ? "..." : status === "success" ? "✓ Got it!" : "Get Early Access"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="mb-4">
            <strong className="text-white">WISE² CORE</strong> — Production infrastructure built by hustlers, for hustlers.
          </p>
          <p className="text-sm">
            Launching soon. Follow for updates.
          </p>
        </div>
      </footer>
    </div>
  );
}
