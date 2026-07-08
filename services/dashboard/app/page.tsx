"use client";

import { HeroSection, HeroTitle, EmailCaptureForm, FeatureBox, GlobalStyles } from "@/components/design-system-components";
import { HUDCorner, TechLine, HUDStyles } from "@/components/hud-elements";

const features = [
  {
    title: "Discover Possibilities",
    description: "Find opportunities hidden in data. The idea engine that turns insights into action.",
    icon: "💡",
    variant: "blue" as const,
  },
  {
    title: "Build Systems",
    description: "Deploy infrastructure that actually scales. From concept to production in hours.",
    icon: "⚙️",
    variant: "red" as const,
  },
  {
    title: "Create Content",
    description: "Generate content at scale. AI-powered creation that matches your brand voice.",
    icon: "✨",
    variant: "blue" as const,
  },
  {
    title: "Automate Workflows",
    description: "Eliminate manual tasks. Orchestrate everything from idea to execution seamlessly.",
    icon: "🤖",
    variant: "red" as const,
  },
  {
    title: "Scale Empires",
    description: "Grow without limits. Infrastructure built for unicorns, priced for startups.",
    icon: "📈",
    variant: "blue" as const,
  },
  {
    title: "Impact Generations",
    description: "Build systems that matter. Create legacy products that define industries.",
    icon: "🌟",
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

      {/* HERO */}
      <HeroSection
        backgroundImage="/old-graphics/FLAGSHIP_HERO.png"
        backgroundAlt="WISE² Core: The Creator Operating System - Two founders in cyberpunk futuristic setting with neon blue accents"
      >
        <div className="max-w-2xl mx-auto px-6 sm:px-8 text-center mb-12 md:mb-0">
          <p className="text-[#00D9FF] text-xs font-bold uppercase tracking-[0.15em] mb-8 fade-in-up">
            ▸ Join the builders
          </p>

          <HeroTitle variant="dual" className="fade-in-up" style={{ animationDelay: "0.1s" }}>
            <span className="block">ONE SEES</span>
            <span className="block">THE POSSIBILITIES.</span>
            <span className="block mt-2">ONE BUILDS</span>
            <span className="block">THE REALITY.</span>
          </HeroTitle>

          <p className="text-lg sm:text-xl text-gray-300 mb-12 md:mb-16 leading-relaxed max-w-xl mx-auto fade-in-up" style={{ animationDelay: "0.2s" }}>
            Infrastructure that scales with your ambition, not your budget.
          </p>

          <div className="fade-in-up relative max-w-md mx-auto" style={{ animationDelay: "0.3s" }}>
            <HUDCorner position="top-left" variant="blue" size="sm" className="opacity-50" />
            <HUDCorner position="top-right" variant="blue" size="sm" className="opacity-50" />
            <EmailCaptureForm onSubmit={handleEmailSubmit} />
          </div>

          <p className="text-gray-500 text-xs sm:text-sm fade-in-up mt-8" style={{ animationDelay: "0.4s" }}>
            No credit card. No waiting. Early access.
          </p>
        </div>
      </HeroSection>

      {/* TECH GRID BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0" style={{
        backgroundImage: 'linear-gradient(0deg, rgba(0,217,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.1) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* FEATURES SECTION */}
      <section className="bg-black py-20 md:py-32 px-6 sm:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Subtle tech line separator */}
          <div className="mb-20 md:mb-24">
            <TechLine variant="blue" className="mx-auto w-24" animated />
          </div>

          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 fade-in-up" style={{ animationDelay: "0.1s" }}>
              Six core pillars.
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl mx-auto fade-in-up leading-relaxed" style={{ animationDelay: "0.2s" }}>
              One unified system. Everything you need to discover, build, create, automate, scale, and impact.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="fade-in-up"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <FeatureBox
                  icon={<span className="text-4xl">{feature.icon}</span>}
                  title={feature.title}
                  description={feature.description}
                  variant={feature.variant}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="tech-divider h-[2px]"></div>

      {/* CTA SECTION */}
      <section className="bg-black py-20 md:py-32 px-6 sm:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-6 fade-in-up">
            <span className="animate-glow">Ready to build?</span>
          </h2>
          <p className="text-lg text-gray-300 mb-12 fade-in-up" style={{ animationDelay: "0.1s" }}>
            Join founders and builders who are redefining what's possible. Get early access to WISE² Core.
          </p>
          <div className="fade-in-up" style={{ animationDelay: "0.2s" }}>
            <EmailCaptureForm
              onSubmit={handleEmailSubmit}
              buttonText="Get Early Access"
            />
          </div>
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
