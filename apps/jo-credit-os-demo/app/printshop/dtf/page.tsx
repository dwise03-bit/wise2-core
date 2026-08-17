'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Printer, CheckCircle2, Upload } from 'lucide-react';

const gangSheetSizes = [
  { size: '12" × 16"', price: '$18', bestFor: 'Small logos, sleeve prints' },
  { size: '22" × 16"', price: '$28', bestFor: 'Multiple chest-size transfers' },
  { size: '22" × 32"', price: '$48', bestFor: 'Full front + back designs' },
  { size: '22" × 48"', price: '$65', bestFor: 'Bulk production runs' },
];

const transferTypes = [
  { name: 'Individual Transfers', desc: 'Single-design transfers cut to size. Perfect for one-offs and small batches.', startingAt: '$3' },
  { name: 'Gang Sheets', desc: 'Multiple designs packed on one sheet for maximum value. Our builder optimizes layout automatically.', startingAt: '$18' },
  { name: 'Apparel Production', desc: 'We handle everything — transfers printed and pressed onto garments, ready to sell.', startingAt: '$28' },
  { name: 'Business Branding Packs', desc: 'Logo transfers in multiple sizes for uniforms, promotional items, and merchandise.', startingAt: '$45' },
];

const artworkRequirements = [
  'PNG with transparent background (preferred)',
  'Minimum 150 DPI (300 DPI recommended)',
  'RGB or RGBA color mode',
  'SVG or PDF for vector artwork',
  'No white background — we print white ink as an underbase',
  'Artwork should be the final print size at 300 DPI',
];

const process = [
  { step: '1', title: 'Upload Artwork', desc: 'Upload your design file. We accept PNG, SVG, PDF, and more.' },
  { step: '2', title: 'Preflight Check', desc: 'Automated validation checks DPI, transparency, color mode, and dimensions.' },
  { step: '3', title: 'Proof & Approve', desc: 'Preview your transfer on a garment mockup. Approve or request revisions.' },
  { step: '4', title: 'Print & Ship', desc: 'Transfers are printed, powdered, cured, and shipped — or ready for pickup.' },
];

export default function DtfPage() {
  return (
    <div className="min-h-screen bg-[#030504] text-white">
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/printshop" className="text-[#8D98A5] hover:text-white text-sm mb-4 inline-block">&larr; Back to Print Shop</Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-[#72FF3B]">DTF</span> Transfers
            </h1>
            <p className="text-lg text-[#BFC4C9] max-w-2xl mb-8">
              Direct-to-film heat transfers for any fabric. Vibrant, durable, and ready to press. Individual transfers or optimized gang sheets.
            </p>
            <Link
              href="/printshop/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#72FF3B] text-black font-semibold rounded-lg hover:bg-[#8AFF52] transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Artwork
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#070B09]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Transfer Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transferTypes.map(t => (
              <div key={t.name} className="p-5 rounded-xl bg-[#111815] border border-[#BFC4C9]/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  <span className="text-[#72FF3B] font-mono text-sm">from {t.startingAt}</span>
                </div>
                <p className="text-sm text-[#BFC4C9]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Gang Sheet Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gangSheetSizes.map(gs => (
              <div key={gs.size} className="p-5 rounded-xl bg-[#111815] border border-[#BFC4C9]/10 text-center">
                <p className="text-2xl font-bold text-[#72FF3B] mb-1">{gs.price}</p>
                <p className="text-lg font-semibold mb-2">{gs.size}</p>
                <p className="text-xs text-[#8D98A5]">{gs.bestFor}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#8D98A5]/60 mt-4 text-center">
            Prices are per sheet. Pack as many designs as you can fit. Custom sizes quoted on request.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#070B09]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">Artwork Requirements</h2>
            <ul className="space-y-2">
              {artworkRequirements.map(req => (
                <li key={req} className="flex items-start gap-2 text-sm text-[#BFC4C9]">
                  <CheckCircle2 className="w-4 h-4 text-[#72FF3B] shrink-0 mt-0.5" /> {req}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">The Process</h2>
            <div className="space-y-4">
              {process.map(p => (
                <div key={p.step} className="flex gap-3">
                  <span className="text-lg font-bold text-[#72FF3B]/30 font-mono w-6 shrink-0">{p.step}</span>
                  <div>
                    <h4 className="font-semibold">{p.title}</h4>
                    <p className="text-sm text-[#8D98A5]">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Start Your Transfer Order</h2>
        <p className="text-[#8D98A5] mb-6">Upload artwork and get a quote in minutes.</p>
        <Link
          href="/printshop/upload"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#72FF3B] text-black font-semibold rounded-lg hover:bg-[#8AFF52] transition-colors"
        >
          Upload Artwork <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
