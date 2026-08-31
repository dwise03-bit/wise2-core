'use client';

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null;

  return (
    <div className="bg-cc-purple text-white border-b border-cc-lavender/30 px-4 py-2 text-center text-xs md:text-sm">
      <span className="font-semibold">Demo mode</span>
      <span className="text-cc-lilac"> — sample products, checkout, and contact flow. No payment or database required.</span>
    </div>
  );
}
