'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Box, CheckCircle2, Upload } from 'lucide-react';

const specs = [
  { label: 'Printer', value: 'Anycubic Kobra X' },
  { label: 'Technology', value: 'FDM (Fused Deposition Modeling)' },
  { label: 'Build Volume', value: '260 × 260 × 260mm' },
  { label: 'Nozzle Diameter', value: '0.4mm standard' },
  { label: 'Layer Heights', value: '0.12mm (detail) / 0.20mm (standard) / 0.28mm (draft)' },
  { label: 'Minimum Wall', value: '2.4mm for functional parts' },
];

const materials = [
  { name: 'PLA', desc: 'General purpose. Rigid, easy to print. Best for prototypes and display models.', strength: 'Medium', heatResist: 'Low (60°C)', cost: '$' },
  { name: 'PETG', desc: 'Impact resistant. Good chemical resistance. Great for functional parts.', strength: 'High', heatResist: 'Medium (80°C)', cost: '$$' },
  { name: 'ABS', desc: 'Strong and durable. Heat resistant. Requires post-processing for best finish.', strength: 'High', heatResist: 'High (100°C)', cost: '$$' },
  { name: 'TPU', desc: 'Flexible and elastic. Perfect for gaskets, bumpers, and phone cases.', strength: 'Medium', heatResist: 'Medium', cost: '$$$' },
];

const products = [
  'Packout accessories & organizers',
  'Monitor stands & mounts',
  'Router & device mounts',
  'Raspberry Pi enclosures & mounts',
  'Camera mounts',
  'Phone docks & stands',
  'Cable management clips & channels',
  'Controller mounts',
  'Custom brackets & adapters',
  'Replacement parts & components',
  'Prototype runs (1–50 units)',
  'CAD design from scratch',
];

const fileTypes = ['STL', '3MF', 'OBJ', 'STEP / STP', 'SCAD (OpenSCAD)', 'ZIP', 'PDF (reference)', 'PNG/JPG (reference)', 'SVG / DXF (reference)'];

export default function ThreeDPrintingPage() {
  return (
    <div className="min-h-screen bg-[#030504] text-white">
      <section className="py-20 md:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/printshop" className="text-[#8D98A5] hover:text-white text-sm mb-4 inline-block">&larr; Back to Print Shop</Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-[#27C7FF]">3D</span> Printing Service
            </h1>
            <p className="text-lg text-[#BFC4C9] max-w-2xl mb-8">
              Custom FDM printing for functional parts, prototypes, mounts, and accessories. Upload your files and we handle the rest.
            </p>
            <Link
              href="/printshop/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#27C7FF] text-black font-semibold rounded-lg hover:bg-[#3DD4FF] transition-colors"
            >
              <Upload className="w-4 h-4" /> Upload Files & Get Quote
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#070B09]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Printer Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {specs.map(s => (
              <div key={s.label} className="flex justify-between p-3 rounded-lg bg-[#111815] border border-[#BFC4C9]/10">
                <span className="text-sm text-[#8D98A5]">{s.label}</span>
                <span className="text-sm text-white font-medium">{s.value}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#8D98A5]/60 mt-4">
            Tolerance values are WISE² starting baselines. Exact tolerances require calibration coupons for your specific geometry.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Available Materials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map(m => (
              <div key={m.name} className="p-5 rounded-xl bg-[#111815] border border-[#BFC4C9]/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-[#27C7FF]">{m.name}</h3>
                  <span className="text-xs text-[#8D98A5] font-mono">{m.cost}</span>
                </div>
                <p className="text-sm text-[#BFC4C9] mb-3">{m.desc}</p>
                <div className="flex gap-4 text-xs text-[#8D98A5]">
                  <span>Strength: <span className="text-white">{m.strength}</span></span>
                  <span>Heat: <span className="text-white">{m.heatResist}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-[#070B09]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">What We Print</h2>
            <ul className="space-y-2">
              {products.map(p => (
                <li key={p} className="flex items-center gap-2 text-sm text-[#BFC4C9]">
                  <CheckCircle2 className="w-4 h-4 text-[#27C7FF] shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Accepted File Types</h2>
            <ul className="space-y-2">
              {fileTypes.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-[#BFC4C9]">
                  <Box className="w-4 h-4 text-[#27C7FF] shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <p className="text-xs text-[#8D98A5] mt-4">
              Upload geometry files directly. Reference images (PNG/JPG/PDF) can supplement but cannot replace CAD files.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Print?</h2>
        <p className="text-[#8D98A5] mb-6">Upload your model and get an instant quote.</p>
        <Link
          href="/printshop/upload"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#27C7FF] text-black font-semibold rounded-lg hover:bg-[#3DD4FF] transition-colors"
        >
          Upload & Quote <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
