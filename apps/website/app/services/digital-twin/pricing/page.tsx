import Link from 'next/link';
import { digitalTwinPackages } from '@/lib/digital-twin';

export default function DigitalTwinPricingPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-6 pb-20 pt-28 text-[#F4EBDD]">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#39FF14]">Pricing</p>
            <h1 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">Choose the clone package.</h1>
            <p className="mt-6 text-lg leading-8 text-[#d6ccbc]">
              Every package anchors the Digital Twin to a tenant/workspace, keeps approval boundaries explicit, and prepares the system for Revenue OS integrations without exposing provider secrets to the browser.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-4">
            {digitalTwinPackages.map((pkg) => (
              <article
                key={pkg.id}
                className={`rounded-[2rem] border p-7 ${
                  pkg.id === 'GROWTH'
                    ? 'border-[#39FF14] bg-[linear-gradient(180deg,rgba(57,255,20,0.12),rgba(255,255,255,0.04))] shadow-[0_24px_70px_rgba(57,255,20,0.15)]'
                    : 'border-[#F4EBDD]/10 bg-white/[0.03]'
                }`}
              >
                <div className="mb-6 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-[#39FF14]/12 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#39FF14]">
                    {pkg.badge}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#b6ac9d]">{pkg.cadence}</span>
                </div>
                <h2 className="text-3xl font-black uppercase">{pkg.name}</h2>
                <p className="mt-4 text-sm leading-7 text-[#d2c8b8]">{pkg.description}</p>
                <div className="mt-6 text-4xl font-black uppercase text-[#39FF14]">
                  {pkg.price ? `$${pkg.price.toLocaleString()}` : 'Custom'}
                </div>
                <ul className="mt-6 space-y-3 text-sm leading-7 text-[#ddd3c2]">
                  {pkg.includes.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href={pkg.price ? `/checkout?product=digital-twin&plan=${pkg.id}` : '/contact'}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-[#39FF14] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#050505]"
                  >
                    {pkg.price ? 'Build My Twin' : 'Request Custom Scope'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
    </main>
  );
}
