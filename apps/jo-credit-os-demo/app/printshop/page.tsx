'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Printer, Box, Palette, Upload, Zap, Shield, Clock, Users, CheckCircle2 } from 'lucide-react';

const services = [
  {
    icon: Box,
    title: '3D Printing',
    desc: 'Custom parts, prototypes, and accessories. FDM printing with PLA, PETG, ABS, and TPU.',
    href: '/printshop/3d-printing',
    color: 'text-[#27C7FF]',
    bgColor: 'bg-[#27C7FF]/10',
    borderColor: 'hover:border-[#27C7FF]/30',
  },
  {
    icon: Printer,
    title: 'DTF Transfers',
    desc: 'Direct-to-film heat transfers for apparel. Individual transfers and gang sheets.',
    href: '/printshop/dtf',
    color: 'text-[#72FF3B]',
    bgColor: 'bg-[#72FF3B]/10',
    borderColor: 'hover:border-[#72FF3B]/30',
  },
  {
    icon: Palette,
    title: 'Design Services',
    desc: 'CAD design, artwork cleanup, and parametric modeling. We bring your ideas to reality.',
    href: '/printshop/quote',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'hover:border-purple-400/30',
  },
];

const features = [
  { icon: Upload, title: 'Upload & Quote', desc: 'Upload your files, get an instant quote. STL, 3MF, OBJ, STEP, SCAD, PNG, SVG supported.' },
  { icon: Zap, title: 'Automated Preflight', desc: 'AI-powered file validation checks dimensions, manifold integrity, DPI, and printability.' },
  { icon: Shield, title: 'Proof Approval', desc: 'Review and approve digital proofs before production begins. No surprises.' },
  { icon: Clock, title: 'Fast Turnaround', desc: '2–5 day standard turnaround. Rush service available for time-sensitive projects.' },
  { icon: Users, title: 'Business Accounts', desc: 'Bulk pricing, repeat orders, and dedicated support for businesses.' },
  { icon: CheckCircle2, title: 'Quality Guarantee', desc: 'Every part inspected before shipping. If it does not meet spec, we reprint it.' },
];

const capabilities3d = [
  'Packout accessories & organizers',
  'Monitor stands & mounts',
  'Router & device mounts',
  'Raspberry Pi enclosures',
  'Cable management',
  'Custom brackets & adapters',
  'Replacement parts',
  'Prototype runs',
];

const capabilitiesDtf = [
  'Individual logo transfers',
  'Full-front & back prints',
  'Sleeve transfers',
  'Gang sheets (12×16" to 22×48")',
  'Business branding packs',
  'Names & numbers',
  'Artwork cleanup',
  'Rush transfers',
];

export default function PrintShopPage() {
  return (
    <div className="min-h-screen bg-[#030504] text-white">
      {/* Hero */}
      <section className="relative py-20 md:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#72FF3B]/5 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#72FF3B] text-sm font-semibold tracking-widest uppercase mb-4">
              WISE² Print Shop
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Design. Print.{' '}
              <span className="bg-gradient-to-r from-[#72FF3B] to-[#27C7FF] bg-clip-text text-transparent">
                Build.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[#BFC4C9] max-w-2xl mx-auto mb-8">
              From file to finished product. Custom 3D printing and DTF transfer production,
              powered by the WISE² Business OS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/printshop/upload"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#72FF3B] text-black font-semibold rounded-lg hover:bg-[#8AFF52] transition-colors"
              >
                Upload & Get Quote <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/printshop/products"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-[#BFC4C9]/25 text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((svc, i) => (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link href={svc.href}>
                  <div className={`p-6 rounded-xl border border-[#BFC4C9]/10 bg-[#111815] ${svc.borderColor} transition-all group hover:bg-[#16211B]`}>
                    <div className={`w-12 h-12 rounded-lg ${svc.bgColor} flex items-center justify-center mb-4`}>
                      <svc.icon className={`w-6 h-6 ${svc.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-[#72FF3B] transition-colors">{svc.title}</h3>
                    <p className="text-sm text-[#8D98A5]">{svc.desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-sm text-[#27C7FF] opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 px-4 bg-[#070B09]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">What We Print</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-[#27C7FF] mb-4 flex items-center gap-2">
                <Box className="w-5 h-5" /> 3D Printing
              </h3>
              <ul className="space-y-2">
                {capabilities3d.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#BFC4C9]">
                    <CheckCircle2 className="w-4 h-4 text-[#27C7FF] shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#72FF3B] mb-4 flex items-center gap-2">
                <Printer className="w-5 h-5" /> DTF Transfers
              </h3>
              <ul className="space-y-2">
                {capabilitiesDtf.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#BFC4C9]">
                    <CheckCircle2 className="w-4 h-4 text-[#72FF3B] shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-[#8D98A5] text-center mb-12 max-w-xl mx-auto">
            Upload your file, approve the proof, and we handle the rest. Simple.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="p-5 rounded-xl border border-[#BFC4C9]/10 bg-[#111815]"
              >
                <feat.icon className="w-5 h-5 text-[#72FF3B] mb-3" />
                <h4 className="font-semibold mb-1">{feat.title}</h4>
                <p className="text-sm text-[#8D98A5]">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-16 px-4 bg-[#070B09]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">From File to Finished</h2>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Upload', desc: 'Upload your 3D model or artwork. We accept STL, 3MF, OBJ, STEP, SCAD, PNG, SVG, and more.' },
              { step: '02', title: 'Automated Preflight', desc: 'Our system validates your file for printability — dimensions, manifold integrity, DPI, and color mode.' },
              { step: '03', title: 'Quote & Approval', desc: 'Receive an itemized quote. Review and approve the digital proof before production starts.' },
              { step: '04', title: 'Production', desc: 'Your order enters the production queue. Track status in real time from your dashboard.' },
              { step: '05', title: 'Quality Check & Ship', desc: 'Every part is inspected. Shipped or ready for local pickup — your choice.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-4 items-start"
              >
                <span className="text-2xl font-bold text-[#72FF3B]/30 font-mono w-10 shrink-0">{item.step}</span>
                <div>
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <p className="text-sm text-[#8D98A5] mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Print?</h2>
          <p className="text-[#8D98A5] mb-8">
            Upload your files and get a quote in minutes. No account required for quotes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/printshop/upload"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#72FF3B] text-black font-semibold rounded-lg hover:bg-[#8AFF52] transition-colors"
            >
              Start Your Order <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/printshop/help"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-[#BFC4C9]/25 text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              Need Help?
            </Link>
          </div>
          <p className="text-xs text-[#8D98A5]/60 mt-8">
            Powered by <span className="text-[#72FF3B]">WISE²</span> Business OS
          </p>
        </div>
      </section>
    </div>
  );
}
