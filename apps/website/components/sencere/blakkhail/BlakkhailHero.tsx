'use client';

import Image from 'next/image';
import { BLAKKHAIL_LEGACY } from '@/lib/sencere/blakkhail-legacy';
import { useEffect, useRef, useState } from 'react';

export function BlakkhailHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-black" ref={containerRef}>
      {/* Animated Lightning Background Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(0deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          animation: 'gridFlow 20s linear infinite'
        }} />
      </div>

      {/* SenCere Creative Composite Hero */}
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Lightning Bolts - Layer 1 - BALANCED */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ mixBlendMode: 'multiply', opacity: 0.6 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={`lightning-${i}`}
              className="absolute"
              style={{
                left: `${15 + i * 15}%`,
                top: `${5 + i * 12}%`,
                animation: `lightningBolt ${3 + i * 0.4}s cubic-bezier(0.34, 1.56, 0.64, 1) infinite`,
                animationDelay: `${i * 0.2}s`,
                filter: 'drop-shadow(0 0 20px rgba(0, 217, 255, 0.6)) drop-shadow(0 0 40px rgba(0, 200, 255, 0.3))',
                opacity: 0.8,
              }}
            >
              <svg width="140" height="240" viewBox="0 0 120 200" className="w-full h-full" style={{ opacity: 0.95 }}>
                <path
                  d={`M${60 + (i % 2 ? 10 : -10)} 0 L${50 + (i % 2 ? 15 : -15)} 60 L${70 + (i % 2 ? 5 : -5)} 80 L${40 + (i % 2 ? 20 : -20)} 140 L${60} 200`}
                  stroke={`hsl(${190 + i * 8}, 100%, 55%)`}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d={`M${60 + (i % 2 ? 10 : -10)} 0 L${50 + (i % 2 ? 15 : -15)} 60 L${70 + (i % 2 ? 5 : -5)} 80 L${40 + (i % 2 ? 20 : -20)} 140 L${60} 200`}
                  stroke={`hsl(${180}, 100%, 70%)`}
                  strokeWidth="1"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.8"
                  filter="url(#glow)"
                />
                <path
                  d={`M${60 + (i % 2 ? 10 : -10)} 0 L${50 + (i % 2 ? 15 : -15)} 60 L${70 + (i % 2 ? 5 : -5)} 80 L${40 + (i % 2 ? 20 : -20)} 140 L${60} 200`}
                  stroke={`hsl(${200}, 100%, 80%)`}
                  strokeWidth="0.3"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.5"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* Electrical Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `hsl(${180 + Math.random() * 40}, 100%, ${50 + Math.random() * 30}%)`,
                boxShadow: `0 0 ${10 + Math.random() * 20}px currentColor`,
                animation: `particleFloat ${5 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>


        {/* Full hero composite background with parallax */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <Image
            src="/sencere-assets/blakkhail/sencere-hero-composite.webp"
            alt="SenCere Creative 2026 - Take Control No Apologies"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center animate-[fadeIn_1.5s_ease-out] scale-105"
            style={{
              filter: 'contrast(1.1) brightness(1.05) saturate(1.1)',
            }}
            quality={100}
          />
        </div>

        {/* Cinematic light rays overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div style={{
            background: `radial-gradient(ellipse at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(0, 217, 255, 0.3), transparent 50%)`,
            transition: 'background 0.3s ease-out',
          }} className="absolute inset-0" />
        </div>

        {/* Overlay gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

        {/* Chromatic aberration effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
          <Image
            src="/sencere-assets/blakkhail/sencere-hero-composite.webp"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            style={{
              filter: 'hue-rotate(10deg)',
              mixBlendMode: 'screen',
            }}
            quality={100}
          />
        </div>

        {/* Text Overlay - Below models with enhanced effects */}
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center z-20 animate-[fadeInUp_1.6s_ease-out_0.3s_forwards]"
          style={{
            animation: 'fadeInUp 1.6s ease-out 0.3s forwards',
            filter: 'drop-shadow(0 20px 40px rgba(0, 217, 255, 0.2))',
          }}
        >
          <div className="space-y-6 max-w-2xl">
            {/* Tagline with enhanced glow */}
            <div className="space-y-3">
              <p
                className="text-xs sm:text-sm font-black uppercase tracking-[0.3em]"
                style={{
                  color: '#FF4444',
                  textShadow: '0 0 20px rgba(255, 68, 68, 0.8), 0 0 40px rgba(255, 68, 68, 0.4)',
                  animation: 'glow 3s ease-in-out infinite',
                }}
              >
                SenCere Creative
              </p>

              {/* Main heading with cinematic styling */}
              <h2
                className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase leading-tight tracking-tighter"
                style={{
                  color: '#C4A369',
                  textShadow: '0 0 30px rgba(196, 163, 105, 0.6), 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 2px 8px rgba(255, 255, 255, 0.1)',
                  letterSpacing: '0.08em',
                  animation: 'textPulse 4s ease-in-out infinite',
                }}
              >
                Take Control
              </h2>

              {/* Subheading with cyan glow */}
              <p
                className="text-sm sm:text-base font-black uppercase tracking-widest"
                style={{
                  color: '#00D9FF',
                  textShadow: '0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 217, 255, 0.4)',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              >
                No Apologies
              </p>
            </div>

            {/* Description */}
            <p
              className="text-sm sm:text-base font-light max-w-xl mx-auto"
              style={{
                color: '#D1D5DB',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              }}
            >
              Legacy apparel. Original designs. Built for the culture.
            </p>

            {/* CTA removed for pure cinematic aesthetic */}
          </div>
        </div>

        {/* Premium scroll indicator with enhanced effects */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <div className="animate-[bounce_3s_ease-in-out_infinite] text-center">
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{
                color: '#6B7280',
                textShadow: '0 0 10px rgba(0, 217, 255, 0.3)',
              }}
            >
              Scroll
            </p>
            <svg
              className="w-6 h-6 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              style={{
                color: '#4B5563',
                filter: 'drop-shadow(0 0 10px rgba(0, 217, 255, 0.2))',
                animation: 'glowPulse 2s ease-in-out infinite',
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes lightningBolt {
          0%, 10%, 90%, 100% {
            opacity: 0;
            transform: translateY(0) scaleX(0.8);
          }
          5%, 8% {
            opacity: 1;
            transform: translateY(20px) scaleX(1);
          }
          50% {
            opacity: 0.3;
            transform: translateY(10px) scaleX(0.9);
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx, 50px), var(--ty, -100px)) scale(0);
            opacity: 0;
          }
        }

        @keyframes gridFlow {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }

        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 20px rgba(255, 68, 68, 0.8), 0 0 40px rgba(255, 68, 68, 0.4);
          }
          50% {
            text-shadow: 0 0 30px rgba(255, 68, 68, 1), 0 0 60px rgba(255, 68, 68, 0.6);
          }
        }

        @keyframes textPulse {
          0%, 100% {
            text-shadow: 0 0 30px rgba(196, 163, 105, 0.6), 0 20px 60px rgba(0, 0, 0, 0.8);
            transform: scale(1);
          }
          50% {
            text-shadow: 0 0 50px rgba(196, 163, 105, 0.8), 0 20px 80px rgba(0, 0, 0, 0.9);
            transform: scale(1.02);
          }
        }

        @keyframes buttonFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes glowPulse {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(0, 217, 255, 0.2));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(0, 217, 255, 0.5));
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }


        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
          }
        }
      `}</style>

      <svg style={{ display: 'none' }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </section>
  );
}
