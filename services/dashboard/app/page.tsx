"use client";

import { EmailCaptureForm, GlobalStyles } from "@/components/design-system-components";
import { HUDCorner, TechLine, HUDStyles } from "@/components/hud-elements";
import Image from "next/image";

const features = [
  {
    title: "Vision & Insight",
    description: "Discover hidden patterns. Reveal what others miss.",
    icon: "💡",
    variant: "blue" as const,
  },
  {
    title: "Deploy Reality",
    description: "Transform visions into production infrastructure.",
    icon: "⚙️",
    variant: "red" as const,
  },
  {
    title: "Automate Everything",
    description: "Remove friction. Let systems work while you dream.",
    icon: "🤖",
    variant: "blue" as const,
  },
  {
    title: "Scale Without Limits",
    description: "Built for ambition. Priced for growth.",
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
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      <GlobalStyles />
      <HUDStyles />

      {/* ===== HERO SECTION ===== */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/wise2-neon-comic.png"
            alt="WISE² - The Idea Hunter and The System Builder"
            fill
            className="object-cover object-center"
            priority
            quality={75}
            sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px"
          />
          {/* Strong gradient overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center space-y-8">
            {/* Eyebrow */}
            <p className="text-[#00D9FF] text-sm font-bold uppercase tracking-[0.2em] fade-in-up">
              ▸ The Creator Operating System
            </p>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-[1.1] fade-in-up"
                  style={{
                    color: "#FFFFFF",
                    textShadow: "0 0 60px rgba(0, 217, 255, 0.5), 0 0 100px rgba(0, 217, 255, 0.2)",
                    letterSpacing: "-0.03em",
                    fontFamily: "'Bebas Neue', serif"
                  }}>
                ONE SEES<br/>
                THE POSSIBILITIES.
              </h1>

              <h2 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] fade-in-up"
                  style={{
                    color: "#FF4D4D",
                    textShadow: "0 0 60px rgba(255, 77, 77, 0.5), 0 0 100px rgba(255, 77, 77, 0.2)",
                    letterSpacing: "-0.03em",
                    fontFamily: "'Bebas Neue', serif",
                    animationDelay: "0.1s"
                  }}>
                ONE BUILDS<br/>
                THE REALITY.
              </h2>
            </div>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed fade-in-up"
               style={{ animationDelay: "0.2s" }}>
              Infrastructure that scales with your ambition, not your budget.
            </p>

            {/* CTA Section */}
            <div className="pt-8 space-y-6 fade-in-up" style={{ animationDelay: "0.3s" }}>
              <div className="relative max-w-sm mx-auto">
                <HUDCorner position="top-left" variant="blue" size="sm" className="opacity-70" />
                <HUDCorner position="top-right" variant="blue" size="sm" className="opacity-70" />
                <HUDCorner position="bottom-left" variant="blue" size="sm" className="opacity-70" />
                <HUDCorner position="bottom-right" variant="blue" size="sm" className="opacity-70" />
                <EmailCaptureForm onSubmit={handleEmailSubmit} />
              </div>
              <p className="text-gray-300 text-sm">
                <span className="text-[#00D9FF] font-bold">TOGETHER, WE ARE WISE².</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEPARATOR ===== */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#00D9FF]/30 to-transparent" />

      {/* ===== THE SYSTEM SECTION ===== */}
      <section className="bg-black py-32 px-6 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-24 space-y-6">
            <TechLine variant="blue" className="mx-auto w-40" animated />

            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight fade-in-up"
                style={{
                  textShadow: "0 0 40px rgba(0, 217, 255, 0.3)",
                  letterSpacing: "-0.02em",
                  fontFamily: "'Bebas Neue', serif"
                }}>
              THE WISE² SYSTEM
            </h2>

            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed fade-in-up"
               style={{ animationDelay: "0.1s" }}>
              Powered by two forces working in harmony.<br/>
              <span className="text-[#FF4D4D] font-bold">Vision meets execution.</span>
            </p>
          </div>

          {/* Feature Grid - 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="fade-in-up group relative"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="h-full p-8 sm:p-10 border-2 rounded-xl transition-all duration-300 hover:scale-105"
                     style={{
                       borderColor: feature.variant === "blue" ? "#00D9FF" : "#FF4D4D",
                       backgroundColor: feature.variant === "blue" ? "rgba(0, 217, 255, 0.08)" : "rgba(255, 77, 77, 0.08)",
                     }}>
                  {/* Icon */}
                  <div className="text-7xl mb-8 transform group-hover:scale-125 transition-transform duration-300">
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl sm:text-4xl font-black mb-6 leading-tight"
                      style={{
                        color: feature.variant === "blue" ? "#00D9FF" : "#FF4D4D",
                        textShadow: `0 0 30px ${feature.variant === "blue" ? "rgba(0, 217, 255, 0.4)" : "rgba(255, 77, 77, 0.4)"}`,
                        fontFamily: "'Bebas Neue', serif",
                        letterSpacing: "-0.01em"
                      }}>
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-100 text-lg leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                       style={{
                         boxShadow: `inset 0 0 40px ${feature.variant === "blue" ? "rgba(0, 217, 255, 0.2)" : "rgba(255, 77, 77, 0.2)"}`
                       }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY SECTION ===== */}
      <section className="bg-black py-24 px-6 sm:px-8 lg:px-12 border-y border-[#00D9FF]/20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="text-[#00D9FF] text-sm font-bold uppercase tracking-[0.2em] fade-in-up">
            The Philosophy
          </p>

          <div className="space-y-4 fade-in-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight"
                style={{
                  letterSpacing: "-0.02em",
                  fontFamily: "'Bebas Neue', serif"
                }}>
              <span className="block" style={{
                textShadow: "0 0 40px rgba(0, 217, 255, 0.4)",
                color: "#00D9FF"
              }}>
                ONE SEES<br/>THE POSSIBILITIES.
              </span>
              <span className="block mt-4" style={{
                textShadow: "0 0 40px rgba(255, 77, 77, 0.4)",
                color: "#FF4D4D"
              }}>
                ONE BUILDS<br/>THE REALITY.
              </span>
            </h2>
          </div>

          <p className="text-2xl font-bold text-gray-100 fade-in-up" style={{ animationDelay: "0.2s" }}>
            <span className="text-[#00D9FF]">TOGETHER, WE ARE WISE².</span>
          </p>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="bg-black py-32 px-6 sm:px-8 lg:px-12">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight fade-in-up"
              style={{
                letterSpacing: "-0.02em",
                fontFamily: "'Bebas Neue', serif"
              }}>
            Ready to Build?
          </h2>

          <p className="text-xl text-gray-100 leading-relaxed fade-in-up" style={{ animationDelay: "0.1s" }}>
            Join the movement. Get early access to the operating system built for builders and dreamers.
          </p>

          <div className="pt-4 fade-in-up" style={{ animationDelay: "0.2s" }}>
            <EmailCaptureForm
              onSubmit={handleEmailSubmit}
              buttonText="Get Early Access"
            />
          </div>

          <p className="text-gray-400 text-sm fade-in-up" style={{ animationDelay: "0.3s" }}>
            Be among the first to access the WISE² universe.
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#00D9FF]/20 py-16 px-6 sm:px-8 text-center text-gray-400 text-sm">
        <div className="max-w-6xl mx-auto space-y-4">
          <p>
            <span className="text-[#00D9FF] font-bold">WISE² CORE</span> — Infrastructure for builders who won't compromise.
          </p>
          <p className="text-xs text-gray-600">
            © 2026 WISE² Inc. | <span className="text-[#00D9FF]">IDEA › SYSTEM › BRAND › FREEDOM</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
