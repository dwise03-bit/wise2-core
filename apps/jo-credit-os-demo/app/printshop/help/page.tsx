'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Clock, MapPin, FileText, HelpCircle } from 'lucide-react';

const faqs = [
  { q: 'What file types do you accept for 3D printing?', a: 'STL, 3MF, OBJ, STEP/STP, and SCAD (OpenSCAD). You can also include reference images (PNG, JPG, PDF) but these cannot replace a CAD file.' },
  { q: 'What file types do you accept for DTF transfers?', a: 'PNG with transparent background (preferred), SVG, PDF. Minimum 150 DPI, but 300 DPI is recommended for best quality.' },
  { q: 'How long does an order take?', a: 'Standard turnaround is 2–5 business days depending on complexity. Rush orders (50% surcharge) are typically 1–2 business days.' },
  { q: 'What materials are available for 3D printing?', a: 'PLA (general purpose), PETG (impact resistant), ABS (heat resistant), and TPU (flexible). Material choice depends on your part requirements.' },
  { q: 'Do I need to remove the background from my DTF artwork?', a: 'Yes — DTF transfers require a transparent background. If your artwork has a solid background, we can remove it for a $10 fee.' },
  { q: 'What is a gang sheet?', a: 'A gang sheet is a layout that packs multiple designs onto a single sheet to maximize material usage. Available in sizes from 12×16" to 22×48".' },
  { q: 'What if my 3D model fails preflight?', a: 'Our automated preflight system checks for manifold issues, dimensions, and printability. If your file fails, we will notify you with specific issues and can offer design assistance to fix them.' },
  { q: 'Do you offer local pickup?', a: 'Yes. Local pickup is available and free. You can select this option when placing your order.' },
  { q: 'What is the build volume for 3D printing?', a: 'Our Anycubic Kobra X has a build volume of 260 × 260 × 260mm. Parts exceeding this size can be printed in sections and assembled.' },
  { q: 'Do you offer bulk pricing?', a: 'Yes. Quantity discounts are available for orders of 10+ units. Contact us for a custom quote.' },
  { q: 'Are the tolerances guaranteed?', a: 'Our published tolerance values are starting baselines. Exact tolerances for functional fits require calibration coupons for your specific geometry. We will advise during the quoting process.' },
  { q: 'How do proof approvals work?', a: 'After quoting, we send a digital proof (image or PDF) for your review. You can approve, request revisions, or reject. Production only begins after approval.' },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#030504] text-white">
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/printshop" className="text-[#8D98A5] hover:text-white text-sm mb-4 inline-block">&larr; Back to Print Shop</Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Help & FAQ</h1>
            <p className="text-[#BFC4C9] mb-8">Everything you need to know about ordering from the WISE² Print Shop.</p>
          </motion.div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <div className="p-4 rounded-xl bg-[#111815] border border-[#BFC4C9]/10 text-center">
              <Mail className="w-5 h-5 text-[#72FF3B] mx-auto mb-2" />
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-[#8D98A5]">print@wise2.net</p>
            </div>
            <div className="p-4 rounded-xl bg-[#111815] border border-[#BFC4C9]/10 text-center">
              <Clock className="w-5 h-5 text-[#27C7FF] mx-auto mb-2" />
              <p className="text-sm font-medium">Response Time</p>
              <p className="text-xs text-[#8D98A5]">Within 24 hours</p>
            </div>
            <div className="p-4 rounded-xl bg-[#111815] border border-[#BFC4C9]/10 text-center">
              <MapPin className="w-5 h-5 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Pickup</p>
              <p className="text-xs text-[#8D98A5]">Local pickup available</p>
            </div>
          </div>

          {/* FAQ */}
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#72FF3B]" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className="p-4 rounded-xl bg-[#111815] border border-[#BFC4C9]/10"
              >
                <h4 className="text-sm font-semibold mb-1">{faq.q}</h4>
                <p className="text-sm text-[#8D98A5]">{faq.a}</p>
              </motion.div>
            ))}
          </div>

          {/* Supported Files */}
          <div className="mt-12 p-6 rounded-xl bg-[#070B09] border border-[#BFC4C9]/10">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#27C7FF]" /> Supported File Types
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-[#27C7FF] mb-1">3D Printing</p>
                <p className="text-[#8D98A5]">STL, 3MF, OBJ, STEP/STP, SCAD, ZIP</p>
              </div>
              <div>
                <p className="font-medium text-[#72FF3B] mb-1">DTF Transfers</p>
                <p className="text-[#8D98A5]">PNG, SVG, PDF, JPG/JPEG, DXF</p>
              </div>
              <div>
                <p className="font-medium text-[#BFC4C9] mb-1">Reference Files</p>
                <p className="text-[#8D98A5]">PDF, PNG, JPG (for context only)</p>
              </div>
              <div>
                <p className="font-medium text-[#BFC4C9] mb-1">Max File Size</p>
                <p className="text-[#8D98A5]">100MB per file</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
