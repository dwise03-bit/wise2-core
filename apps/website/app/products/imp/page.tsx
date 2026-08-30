import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'WISE Imp | Desktop companion product | WISE²',
  description:
    'WISE Imp is the WISE² desktop companion. Try the live Imp on wise2.net, then install the Windows pet on operator and client machines.',
  keywords: 'WISE Imp, desktop pet, WISE² companion, Windows desktop overlay, always on top',
  openGraph: {
    type: 'website',
    url: 'https://wise2.net/products/imp',
    title: 'WISE Imp | Desktop companion product | WISE²',
    description: 'Live browser companion and Windows desktop pet. No account. Local settings.',
    siteName: 'WISE²',
    images: [
      {
        url: '/products/wise-imp.png',
        width: 512,
        height: 512,
        alt: 'WISE Imp glossy black cyan desktop companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WISE Imp | WISE²',
    description: 'Desktop companion for WISE² operators and client machines.',
  },
  alternates: {
    canonical: 'https://wise2.net/products/imp',
  },
};

const features = [
  {
    title: 'Live service',
    text: 'The Imp on wise2.net/imp is the same companion runtime. No account. Settings stay in the browser.',
  },
  {
    title: 'Windows pet',
    text: 'Transparent, always-on-top, no taskbar button, tray Show/Hide/Quit, local save/restore. Current-user NSIS, no admin.',
  },
  {
    title: 'Locked identity',
    text: 'Horns, cyan eyes, black hoodie, W² chest mark, spade tail. Pose art is the product, not a placeholder.',
  },
];

export default function WiseImpProductPage() {
  return (
    <main className="min-h-screen bg-[#050607] text-white">
      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">
              Product · Alpha 0.1
            </p>
            <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">WISE Imp</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#B7C0CB]">
              A desktop companion that stays with the work. Offered by WISE² for operators and client machines.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/imp/"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#DCE7EF] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
              >
                Launch live Imp
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-[#8EDBFF]/70 hover:bg-[#8EDBFF]/10 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
              >
                All products
              </Link>
            </div>
          </div>
          <div className="flex justify-center border border-white/10 bg-[#090C10] p-6">
            <Image
              src="/products/wise-imp.png"
              alt="WISE Imp, glossy black companion with cyan eyes and W² chest mark"
              width={420}
              height={420}
              priority
              className="h-auto w-full max-w-sm object-contain"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="min-h-52 bg-[#090C10] p-6">
              <h2 className="text-xl font-black text-white">{feature.title}</h2>
              <p className="mt-4 text-sm leading-7 text-[#B7C0CB]">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 border border-white/10 bg-[#DCE7EF] p-8 text-[#050607] lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <h2 className="text-3xl font-black">Put the Imp on a desk.</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#26313A]">
              The live service is running now. The Windows installer publishes to /imp/downloads/ after a Windows build.
              Hardware companions live next door as IMPS BYTE MINI.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href="/imp/downloads/"
              className="inline-flex min-h-12 items-center justify-center bg-[#050607] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#111A22] focus:outline-none focus:ring-2 focus:ring-[#050607]"
            >
              Downloads
            </a>
            <Link
              href="/products/imps"
              className="inline-flex min-h-12 items-center justify-center border border-[#050607]/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#050607]"
            >
              BYTE MINI hardware
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
