'use client';

import { useState, type FormEvent } from 'react';
import { Upload, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { QuoteRequest } from '@/lib/sencere/lead-provider';
import { capabilities } from '@/lib/sencere/capabilities';

const customizationOptions = [
  'Print',
  'Sublimation',
  'Vinyl',
  'Engraving',
  'Sewing',
  '3D',
  'CNC',
  'Design',
  'Other',
];

const fieldClass =
  'w-full rounded-md border border-[#8C6518]/40 bg-[#0d0d0d] px-4 py-2.5 text-sm text-[#F7F7F7] placeholder:text-[#555] outline-none transition focus:border-[#D6A331] focus:ring-1 focus:ring-[#D6A331]';
const labelClass = 'mb-1.5 block text-xs font-semibold tracking-wide text-[#C8C8C8]';

export function QuoteForm() {
  const [customization, setCustomization] = useState<string[]>([]);
  const [artworkFiles, setArtworkFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  function toggleCustomization(option: string) {
    setCustomization((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    const form = new FormData(e.currentTarget);
    const payload: QuoteRequest = {
      customer: {
        name: String(form.get('name') || ''),
        business: String(form.get('business') || ''),
        email: String(form.get('email') || ''),
        phone: String(form.get('phone') || ''),
      },
      project: {
        service: String(form.get('service') || ''),
        product: String(form.get('product') || ''),
        quantity: String(form.get('quantity') || ''),
        description: String(form.get('description') || ''),
      },
      customization,
      deadline: String(form.get('deadline') || ''),
      notes: String(form.get('notes') || ''),
      artworkFileNames: artworkFiles.map((f) => f.name),
    };

    try {
      const res = await fetch('/api/sencere/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Request failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-lg border border-[#8C6518]/30 bg-[#101010] p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-[#D6A331]" aria-hidden="true" />
        <h2 className="text-xl font-bold text-[#F7F7F7]" style={{ fontFamily: 'var(--font-display)' }}>
          Project Received
        </h2>
        <p className="text-sm text-[#888]">
          Thanks — we&apos;ve got your project details. A member of the SenCere team will follow up
          shortly to confirm the scope and timeline.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-10">
      <fieldset>
        <legend
          className="mb-4 text-sm font-bold uppercase tracking-wide text-[#D6A331]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Customer
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClass}>Name *</label>
            <input id="name" name="name" required className={fieldClass} />
          </div>
          <div>
            <label htmlFor="business" className={labelClass}>Business</label>
            <input id="business" name="business" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>Email *</label>
            <input id="email" name="email" type="email" required className={fieldClass} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>Phone</label>
            <input id="phone" name="phone" type="tel" className={fieldClass} />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend
          className="mb-4 text-sm font-bold uppercase tracking-wide text-[#D6A331]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Project
        </legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="service" className={labelClass}>Service</label>
            <select id="service" name="service" className={fieldClass}>
              <option value="">Select a service</option>
              {capabilities.map((c) => (
                <option key={c.slug} value={c.title}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="product" className={labelClass}>Product</label>
            <input id="product" name="product" placeholder="e.g. Hoodies, mugs, wood sign" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="quantity" className={labelClass}>Quantity</label>
            <input id="quantity" name="quantity" placeholder="e.g. 50" className={fieldClass} />
          </div>
          <div>
            <label htmlFor="deadline" className={labelClass}>Requested Completion Date</label>
            <input id="deadline" name="deadline" type="date" className={fieldClass} />
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="description" className={labelClass}>Project Description</label>
          <textarea id="description" name="description" rows={4} className={fieldClass} />
        </div>
      </fieldset>

      <fieldset>
        <legend
          className="mb-4 text-sm font-bold uppercase tracking-wide text-[#D6A331]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Customization
        </legend>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Customization options">
          {customizationOptions.map((option) => {
            const active = customization.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleCustomization(option)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'border-[#D6A331] bg-[#D6A331]/15 text-[#F1C65A]'
                    : 'border-[#8C6518]/40 text-[#C8C8C8] hover:border-[#D6A331]/60'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend
          className="mb-4 text-sm font-bold uppercase tracking-wide text-[#D6A331]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Artwork
        </legend>
        <label
          htmlFor="artwork"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-[#8C6518]/50 bg-[#0d0d0d] px-6 py-8 text-center transition hover:border-[#D6A331]"
        >
          <Upload className="h-6 w-6 text-[#D6A331]" aria-hidden="true" />
          <span className="text-sm text-[#C8C8C8]">
            {artworkFiles.length > 0
              ? `${artworkFiles.length} file(s) selected`
              : 'Click to upload logo or reference artwork'}
          </span>
          <input
            id="artwork"
            name="artwork"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => setArtworkFiles(Array.from(e.target.files || []))}
          />
        </label>
      </fieldset>

      <fieldset>
        <label htmlFor="notes" className={labelClass}>Additional Notes</label>
        <textarea id="notes" name="notes" rows={3} className={fieldClass} />
      </fieldset>

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-400">
          Something went wrong submitting your project. Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-[#F1C65A] to-[#D6A331] px-7 py-4 text-sm font-bold tracking-wide text-[#0a0a0a] transition hover:brightness-110 disabled:opacity-60 sm:w-auto"
      >
        {status === 'submitting' ? 'SUBMITTING…' : 'START MY PROJECT'}
        {status !== 'submitting' && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
      </button>
    </form>
  );
}
