'use client';

import { Check, Mic, Headphones, Crown } from 'lucide-react';
import { useSoundLabModals } from './SoundLabModals';

const TIERS = [
  {
    id: 'starter',
    name: 'STARTER',
    tagline: 'THE PERFECT START',
    icon: Mic,
    price: '$149',
    period: null,
    featured: false,
    features: [
      'One custom jingle (30–60 sec)',
      'Professional mix',
      'Commercial license',
      'Fast delivery',
      '1 revision',
    ],
    cta: 'GET STARTED',
  },
  {
    id: 'pro',
    name: 'PRO',
    tagline: 'LEVEL UP YOUR SOUND',
    icon: Headphones,
    price: '$349',
    period: null,
    featured: true,
    badge: 'MOST POPULAR',
    features: [
      '3 custom concepts',
      'Professional vocals',
      'Full mix & master',
      'Social media edits',
      'Voice options',
      'Priority delivery',
      'Unlimited revisions',
    ],
    cta: 'GET STARTED',
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    tagline: 'COMPLETE SOUND BRANDING',
    icon: Crown,
    price: 'CUSTOM',
    period: null,
    featured: false,
    gold: true,
    features: [
      'Complete sonic branding',
      'Theme song',
      'Sonic logo',
      'Podcast package',
      'Commercial package',
      'Music library',
      'Brand voice system',
      'Dedicated producer',
    ],
    cta: 'CONTACT US',
  },
];

export function Pricing() {
  const { openIntake } = useSoundLabModals();

  return (
    <section id="packages" className="bg-black py-20 px-5 md:px-8 scroll-mt-16">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-black tracking-widest mb-12">
          PACKAGES
        </h2>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-7 flex flex-col ${
                  tier.featured
                    ? 'border-2 border-[#9AFF00] bg-[#0d1a05] shadow-[0_0_50px_rgba(154,255,0,0.25)] md:-translate-y-3'
                    : tier.gold
                    ? 'border border-amber-500/40 bg-[#120f05]'
                    : 'border border-white/10 bg-[#0a0a0a]'
                }`}
              >
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#9AFF00] text-black text-[10px] font-black tracking-wide">
                    {tier.badge}
                  </span>
                )}

                <Icon
                  size={28}
                  className={`mb-3 ${tier.gold ? 'text-amber-400' : 'text-[#9AFF00]'}`}
                />
                <h3 className="text-base font-black tracking-wide">{tier.name}</h3>
                <p className="text-[11px] text-gray-500 tracking-wide mb-4">{tier.tagline}</p>

                <p
                  className={`text-3xl font-black mb-5 ${
                    tier.gold ? 'text-amber-400' : tier.featured ? 'text-[#9AFF00]' : 'text-white'
                  }`}
                >
                  {tier.price}
                </p>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                      <Check
                        size={14}
                        className={`mt-0.5 shrink-0 ${tier.gold ? 'text-amber-400' : 'text-[#9AFF00]'}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => openIntake(tier.name)}
                  className={`w-full py-3 rounded text-xs font-black tracking-wide transition-all cursor-pointer ${
                    tier.featured
                      ? 'bg-[#9AFF00] text-black hover:shadow-[0_0_24px_rgba(154,255,0,0.6)]'
                      : tier.gold
                      ? 'border border-amber-500/60 text-amber-400 hover:bg-amber-500/10'
                      : 'border border-[#9AFF00] text-[#9AFF00] hover:bg-[#9AFF00]/10'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
