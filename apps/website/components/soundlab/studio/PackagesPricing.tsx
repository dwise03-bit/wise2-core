'use client';

import { Check, Wallet, ArrowRight } from 'lucide-react';
import { useSoundLabModals } from '../SoundLabModals';

const TIERS = [
  {
    name: 'Creator',
    tagline: 'Perfect for singles & demos',
    price: '$49',
    features: ['1 Song', 'AI Vocals', 'Basic Mix & Master'],
    featured: false,
  },
  {
    name: 'Pro',
    tagline: 'For serious creators',
    price: '$149',
    features: ['Up to 5 Songs', 'Premium Vocals', 'Professional Mix & Master', 'Stems Included'],
    featured: true,
  },
  {
    name: 'Label',
    tagline: 'For brands & businesses',
    price: '$499',
    features: ['Up to 20 Songs', 'Custom Production', 'Full Rights & Licensing', 'Priority Support'],
    featured: false,
  },
];

export function PackagesPricing() {
  const { openIntake } = useSoundLabModals();

  return (
    <section id="packages" className="relative bg-[#02050A] px-4 md:px-6 py-4 pb-16 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto rounded-2xl border border-[#24C8FF]/12 bg-[#040B18]/60 p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Wallet size={20} className="text-[#24C8FF]" />
            <div>
              <h2 className="text-lg font-black text-[#F7FBFF]">PACKAGES &amp; PRICING</h2>
              <p className="text-[11px] text-[#8D9BAC]">Choose the perfect package for your project.</p>
            </div>
          </div>
          <button className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#24C8FF] hover:text-[#8BE8FF] transition-colors cursor-pointer">
            VIEW ALL PACKAGES <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-xl p-5 transition-all ${
                tier.featured
                  ? 'bg-gradient-to-b from-[#071f38] to-[#040B18] border border-[#24C8FF]/45 shadow-[0_0_34px_rgba(0,140,255,0.22)]'
                  : 'bg-[#071321]/70 border border-[#24C8FF]/12 hover:border-[#24C8FF]/30'
              }`}
            >
              {tier.featured && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-widest text-[#02050A] bg-gradient-to-r from-[#008CFF] to-[#24C8FF] px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              <h3 className="text-base font-black text-[#F7FBFF]">{tier.name}</h3>
              <p className="text-[11px] text-[#8D9BAC] mb-3">{tier.tagline}</p>
              <p className={`text-4xl font-black mb-4 ${tier.featured ? 'text-[#24C8FF]' : 'text-[#F7FBFF]'}`}>
                {tier.price}
              </p>
              <ul className="space-y-2 mb-5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[12px] text-[#8D9BAC]">
                    <Check size={14} className="text-[#24C8FF] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => openIntake()}
                className={`w-full h-10 rounded-lg text-[12px] font-black tracking-wide transition-all cursor-pointer ${
                  tier.featured
                    ? 'bg-gradient-to-r from-[#008CFF] to-[#24C8FF] text-[#02050A] hover:shadow-[0_0_24px_rgba(36,200,255,0.45)]'
                    : 'bg-[#02050A]/60 border border-[#24C8FF]/25 text-[#F7FBFF] hover:border-[#24C8FF]/60'
                }`}
              >
                GET STARTED
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
