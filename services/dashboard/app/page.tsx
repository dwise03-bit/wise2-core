"use client";

import { HeroTitle, EmailCaptureForm, FeatureBox, GlobalStyles } from "@/components/design-system-components";
import { HUDCorner, TechLine, HUDStyles } from "@/components/hud-elements";
import Image from "next/image";

const features = [
  {
    title: "Vision & Insight",
    description: "Discover hidden patterns in data. The Idea Hunter reveals what others miss.",
    icon: "💡",
    variant: "blue" as const,
  },
  {
    title: "Deploy Reality",
    description: "The System Builder turns visions into infrastructure. From idea to production.",
    icon: "⚙️",
    variant: "red" as const,
  },
  {
    title: "Automate Everything",
    description: "Remove friction. Let systems work while you dream bigger.",
    icon: "🤖",
    variant: "blue" as const,
  },
  {
    title: "Scale Without Limits",
    description: "Built for ambition. Priced for growth. No scaling tax.",
    icon: "📈",
    variant: "red" as const,
  },
];

export default function Home() {
  const handleEmailSubmit = async (email: string) => {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        throw new Error("This email is already on the waitlist.");
      }
      throw new Error(data.message || "Failed to add email. Please try again.");
    }
  };

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden relative">
      <GlobalStyles />
      <HUDStyles />

      {/* HERO - NEON TECH COMIC */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/wise2-neon-comic.png"
            alt="WISE² Neon Tech Comic - Darren Wise (The Idea Hunter) and Danny Wise (The System Builder)"
            fill
            className="object-cover object-center"
            priority
            quality={90}
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </div>

        {/* Hero Content - Overlay */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 sm:px-8 text-center">
          <div className="mb-16 fade-in-up">
            <p className="text-[#00D9FF] text-xs font-bold uppercase tracking-[0.15em] mb-6">
              ▸ NEON TECH UNIVERSE
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-bebas-neue leading-none mb-8"
                style={{
                  textShadow: "0 0 40px rgba(0, 217, 255, 0.6), 0 0 80px rgba(0, 217, 255, 0.3)",
                  letterSpacing: "-0.02em"
                }}>
              ONE SEES<br/>
              THE POSSIBILITIES.
            </h1>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-bebas-neue leading-none"
                style={{
                  color: "#FF4D4D",
                  textShadow: "0 0 40px rgba(255, 77, 77, 0.6), 0 0 80px rgba(255, 77, 77, 0.3)",
                  letterSpacing: "-0.02em"
                }}>
              ONE BUILDS<br/>
              THE REALITY.
            </h2>
          </div>

          <p className="text-lg sm:text-xl text-gray-200 mb-12 leading-relaxed max-w-2xl mx-auto fade-in-up" style={{ animationDelay: "0.15s" }}>
            Infrastructure that scales with your ambition, not your budget.<br/>
            <span className="text-[#00D9FF] font-semibold">TOGETHER, WE ARE WISE².</span>
          </p>

          <div className="fade-in-up relative max-w-md mx-auto" style={{ animationDelay: "0.3s" }}>
            <HUDCorner position="top-left" variant="blue" size="sm" className="opacity-60" />
            <HUDCorner position="top-right" variant="blue" size="sm" className="opacity-60" />
            <HUDCorner position="bottom-left" variant="blue" size="sm" className="opacity-60" />
            <HUDCorner position="bottom-right" variant="blue" size="sm" className="opacity-60" />
            <EmailCaptureForm onSubmit={handleEmailSubmit} />
          </div>

          <p className="text-gray-400 text-xs sm:text-sm fade-in-up mt-8" style={{ animationDelay: "0.45s" }}>
            No credit card. No waiting. Early access to the WISE² universe.
          </p>
        </div>
      </section>

      {/* TECH GRID BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0" style={{
        backgroundImage: 'linear-gradient(0deg, rgba(0,217,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* THE SYSTEM - CORE POWERS */}
      <section className="bg-black py-20 md:py-32 px-6 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Separator */}
          <div className="mb-20 md:mb-24">
            <TechLine variant="blue" className="mx-auto w-32" animated />
          </div>

          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-8 fade-in-up"
                style={{
                  textShadow: "0 0 30px rgba(0, 217, 255, 0.4)",
                  letterSpacing: "-0.02em"
                }}>
              THE WISE² SYSTEM
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto fade-in-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
              Powered by two forces working in perfect harmony.<br/>
              <span className="text-[#FF4D4D]">Vision meets execution.</span>
            </p>
          </div>

          {/* Core Powers Grid - 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="fade-in-up group relative"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="relative p-8 border-2 rounded-lg transition-all duration-300"
                     style={{
                       borderColor: feature.variant === "blue" ? "#00D9FF" : "#FF4D4D",
                       backgroundColor: feature.variant === "blue" ? "rgba(0, 217, 255, 0.05)" : "rgba(255, 77, 77, 0.05)",
                     }}>
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-2xl font-black mb-4"
                      style={{
                        color: feature.variant === "blue" ? "#00D9FF" : "#FF4D4D",
                        textShadow: `0 0 20px ${feature.variant === "blue" ? "rgba(0, 217, 255, 0.5)" : "rgba(255, 77, 77, 0.5)"}`
                      }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                       style={{
                         boxShadow: `0 0 30px ${feature.variant === "blue" ? "rgba(0, 217, 255, 0.3)" : "rgba(255, 77, 77, 0.3)"}`
                       }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRAND PHILOSOPHY */}
      <section className="bg-black py-20 md:py-32 px-6 sm:px-8 relative z-10 border-y border-[#00D9FF]/20">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-[#00D9FF] text-sm font-bold uppercase tracking-[0.2em] mb-6 fade-in-up">
            THE WISE² PHILOSOPHY
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-8 fade-in-up"
              style={{
                letterSpacing: "-0.02em"
              }}>
            <span className="animate-glow">ONE SEES THE POSSIBILITIES.</span><br/>
            <span style={{ color: "#FF4D4D", textShadow: "0 0 30px rgba(255, 77, 77, 0.4)" }}>ONE BUILDS THE REALITY.</span>
          </h2>
          <p className="text-xl text-gray-300 mb-4 fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="text-[#00D9FF] font-bold">TOGETHER, WE ARE WISE².</span>
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-black py-20 md:py-32 px-6 sm:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 fade-in-up">
            Ready to Join the Universe?
          </h2>
          <p className="text-lg text-gray-300 mb-12 fade-in-up" style={{ animationDelay: "0.1s" }}>
            Become part of the WISE² movement. Get early access to the operating system built for builders.
          </p>
          <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
            <EmailCaptureForm
              onSubmit={handleEmailSubmit}
              buttonText="Get Early Access"
            />
          </div>
          <p className="text-gray-500 text-xs mt-8 fade-in-up" style={{ animationDelay: "0.3s" }}>
            Be among the first to access the WISE² universe.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#00D9FF]/10 py-12 text-center text-gray-500 text-xs relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="mb-4">
            <span className="text-[#00D9FF] font-bold">WISE² CORE</span> — Infrastructure for builders who won't compromise.
          </p>
          <p className="text-gray-600 text-xs">
            © 2026 WISE² Inc. | <span className="text-[#00D9FF]">IDEA › SYSTEM › BRAND › FREEDOM</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
