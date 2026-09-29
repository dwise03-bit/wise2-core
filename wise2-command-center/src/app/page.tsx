'use client';

import Link from "next/link";
import { useEffect } from "react";

const IconBuild = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5A2.25 2.25 0 008.25 22.5h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25h-2.25m-7.5 11.25h7.5M10.5 7.5h3" />
  </svg>
);

const IconAutomate = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const IconScale = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13h6V3H3v10zm8 0h6V5h-6v8zm8-8v8h6V5h-6z" />
  </svg>
);

const IconNetwork = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12a3 3 0 100-6 3 3 0 000 6zm0 0c4.97 0 9 2.686 9 6v1H0v-1c0-3.314 4.03-6 9-6zm9-12a3 3 0 100-6 3 3 0 000 6zm-15 0a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

export default function Home() {
  useEffect(() => {
    // Dynamic import for GSAP to avoid SSR issues
    import("gsap").then(({ default: gsap }) => {
      import("gsap/ScrollTrigger").then(({ default: ScrollTrigger }) => {
        gsap.registerPlugin(ScrollTrigger);

        // Initialize reveal animations
        gsap.utils.toArray("[data-reveal]").forEach((element: any) => {
          gsap.fromTo(
            element,
            { y: 40, opacity: 0, filter: "blur(10px)" },
            {
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
              duration: 1,
              ease: "power4.out",
              scrollTrigger: {
                trigger: element,
                start: "top 85%",
                once: true,
              },
            }
          );
        });

        // Hero text animation
        const heroTitle = document.querySelector("[data-hero-title]");
        if (heroTitle) {
          gsap.fromTo(
            heroTitle,
            { opacity: 0, y: 60 },
            { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", delay: 0.2 }
          );
        }

        // Glow effect on green accent
        gsap.utils.toArray("[data-glow]").forEach((element: any) => {
          gsap.to(element, {
            textShadow: "0 0 20px rgba(0, 255, 127, 0.6)",
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });
      });
    });
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 text-[#D1D5DB] sm:px-6 lg:px-10">
      {/* Animated background grid */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0, 217, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 217, 255, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Cyan glow accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D9FF] opacity-5 blur-3xl rounded-full -z-10" />

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col justify-center py-12 lg:py-20">
        {/* Header */}
        <div className="mb-16 flex items-center justify-between border-b border-[#00D9FF]/20 pb-6 lg:mb-24" data-reveal>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#00D9FF]/40 to-[#00D9FF]/0 blur-lg animate-pulse" />
              <span className="relative grid h-10 w-10 place-items-center rounded-xl border border-[#00D9FF]/40 bg-[#00D9FF]/10 text-lg font-bold text-[#00D9FF] backdrop-blur-sm">
                W²
              </span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-wider text-[#D1D5DB] uppercase">WISE²</p>
              <p className="text-xs tracking-widest text-[#00D9FF]">Command Center</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-xs text-[#00D9FF] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#00FF7F] animate-pulse" />
            <span>Systems online</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid items-end gap-12 lg:gap-16 lg:grid-cols-[1.3fr_0.7fr] mb-20">
          <section className="space-y-8">
            <div>
              <p className="text-xs font-bold tracking-widest text-[#00D9FF] uppercase mb-4" data-reveal>
                Building empires. changing culture. together.
              </p>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-[#D1D5DB]"
                data-hero-title
                data-reveal
              >
                Move the whole
                <span className="block text-[#00FF7F] mt-2" data-glow>
                  business as one.
                </span>
              </h1>
            </div>
            <p className="max-w-xl text-base leading-8 text-gray-400" data-reveal>
              WISE² syncs brand, CRM, automation, content, and intelligence into one command surface. Ship faster. Scale further. Build different.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4" data-reveal>
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-[#00D9FF] px-8 py-3 text-sm font-bold text-[#050607] transition-all duration-300 hover:shadow-lg hover:shadow-[#00D9FF]/40 hover:scale-105 hover:bg-cyan-400"
              >
                Enter the command center
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/demo"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#00D9FF]/40 bg-[#00D9FF]/5 px-8 py-3 text-sm font-bold text-[#00D9FF] backdrop-blur-sm transition-all duration-300 hover:bg-[#00D9FF]/15 hover:border-[#00D9FF]/60"
              >
                Explore demo
                <span className="text-[#00FF7F]">→</span>
              </Link>
              <Link
                href="/demo/admin"
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-[#00FF7F]/40 bg-[#00FF7F]/5 px-8 py-3 text-sm font-bold text-[#00FF7F] backdrop-blur-sm transition-all duration-300 hover:bg-[#00FF7F]/15 hover:border-[#00FF7F]/60"
              >
                Admin demo
                <span className="text-[#00FF7F]">→</span>
              </Link>
            </div>
          </section>

          {/* Side Cards */}
          <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {/* Live Network Card */}
            <div
              className="group relative rounded-2xl border border-[#00D9FF]/20 bg-gradient-to-br from-[#00D9FF]/10 to-[#00D9FF]/0 p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#00D9FF]/40 hover:bg-gradient-to-br hover:from-[#00D9FF]/15 hover:to-[#00D9FF]/5"
              data-reveal
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00D9FF]/0 via-[#00D9FF]/0 to-[#00D9FF]/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-widest text-[#00D9FF] uppercase">
                    Live Network
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#00FF7F]/20 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00FF7F] animate-pulse" />
                    <span className="text-xs font-bold text-[#00FF7F]">ONLINE</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#D1D5DB]">One source of truth.</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    Your Mac, GPU, VPS, and AI unified. Observable. Real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Start Anywhere Card */}
            <div
              className="group relative rounded-2xl border border-[#00FF7F]/20 bg-gradient-to-br from-[#00FF7F]/10 to-[#00FF7F]/0 p-6 backdrop-blur-xl transition-all duration-300 hover:border-[#00FF7F]/40 hover:bg-gradient-to-br hover:from-[#00FF7F]/15 hover:to-[#00FF7F]/5"
              data-reveal
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00FF7F]/0 via-[#00FF7F]/0 to-[#00FF7F]/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
              <div className="relative space-y-4">
                <p className="text-xs font-bold tracking-widest text-[#00FF7F] uppercase">
                  Start Anywhere
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    aria-label="Build"
                    className="group/btn relative rounded-lg border border-[#00D9FF]/20 bg-[#00D9FF]/5 px-3 py-4 text-xs font-bold text-[#00D9FF] transition-all duration-300 hover:bg-[#00D9FF]/15 hover:border-[#00D9FF]/40 flex items-center justify-center gap-2"
                  >
                    <IconBuild />
                    Build
                  </button>
                  <button
                    type="button"
                    aria-label="Automate"
                    className="group/btn relative rounded-lg border border-[#00D9FF]/20 bg-[#00D9FF]/5 px-3 py-4 text-xs font-bold text-[#00D9FF] transition-all duration-300 hover:bg-[#00D9FF]/15 hover:border-[#00D9FF]/40 flex items-center justify-center gap-2"
                  >
                    <IconAutomate />
                    Automate
                  </button>
                  <button
                    type="button"
                    aria-label="Scale"
                    className="group/btn relative rounded-lg border border-[#00FF7F]/20 bg-[#00FF7F]/5 px-3 py-4 text-xs font-bold text-[#00FF7F] transition-all duration-300 hover:bg-[#00FF7F]/15 hover:border-[#00FF7F]/40 flex items-center justify-center gap-2"
                  >
                    <IconScale />
                    Scale
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Capabilities */}
        <div className="space-y-4 border-t border-[#00D9FF]/20 pt-12 lg:pt-16" data-reveal>
          <p className="text-xs font-bold tracking-widest text-[#00D9FF] uppercase">Integrated Capabilities</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: IconNetwork, label: "Brand systems", color: "cyan" },
              { icon: IconAutomate, label: "Customer intelligence", color: "green" },
              { icon: IconBuild, label: "Agent workflows", color: "cyan" },
              { icon: IconScale, label: "GPU infrastructure", color: "green" },
            ].map((item, idx) => (
              <div
                key={idx}
                className={`group relative rounded-lg border transition-all duration-300 p-4 backdrop-blur-sm cursor-pointer ${
                  item.color === "cyan"
                    ? "border-[#00D9FF]/20 bg-[#00D9FF]/5 hover:bg-[#00D9FF]/15 hover:border-[#00D9FF]/40"
                    : "border-[#00FF7F]/20 bg-[#00FF7F]/5 hover:bg-[#00FF7F]/15 hover:border-[#00FF7F]/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex-shrink-0 ${
                      item.color === "cyan" ? "text-[#00D9FF]" : "text-[#00FF7F]"
                    }`}
                  >
                    <item.icon />
                  </div>
                  <span className="text-sm font-medium text-gray-400 group-hover:text-[#D1D5DB] transition-colors">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
