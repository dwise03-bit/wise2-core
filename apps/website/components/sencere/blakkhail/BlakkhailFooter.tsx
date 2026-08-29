'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube, Phone, Mail, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { blakkhailBrand } from './config';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';
import { company } from '@/lib/sencere/config';
import { isBlackhailHost } from '@/lib/site-domains';

function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z" />
    </svg>
  );
}

export function BlakkhailFooter() {
  const { social } = blakkhailBrand;
  const [parentHref, setParentHref] = useState(blakkhailBrand.parentPath);

  useEffect(() => {
    const onBlackhailDomain = isBlackhailHost(window.location.hostname);
    setParentHref(
      onBlackhailDomain
        ? `${blakkhailBrand.parentSiteUrl}${blakkhailBrand.parentPath}`
        : blakkhailBrand.parentPath
    );
  }, []);

  return (
    <footer id="contact" className={BLAKKHAIL_LAYOUT.section} style={{ backgroundColor: BLAKKHAIL.jetBlack }}>

      {/* ── LEGENDARY CTA STRIP ─────────────────────────── */}
      <div
        className="border-y"
        style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.gunmetal }}
      >
        <div
          className={`${BLAKKHAIL_LAYOUT.container} grid gap-6 py-10 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10`}
        >
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.35em] sm:text-xs"
              style={{ color: BLAKKHAIL.steel }}
            >
              Ready to work?
            </p>
            <h2
              className="mt-2 text-2xl font-black uppercase tracking-[0.06em] sm:text-3xl lg:text-4xl"
              style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
            >
              Let&apos;s Build Something Legendary
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${blakkhailBrand.email}?subject=Quote%20Request`}
              className="min-h-12 px-7 py-3 text-sm font-black uppercase tracking-[0.18em] text-black sm:text-base"
              style={{ backgroundColor: BLAKKHAIL.gold }}
            >
              Get a Quote
            </a>
            <a
              href={`tel:${company.phone.replace(/\D/g, '')}`}
              className="min-h-12 border px-7 py-3 text-sm font-black uppercase tracking-[0.18em] sm:text-base"
              style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
            >
              Book a Call
            </a>
          </div>
        </div>
      </div>

      {/* ── FOOTER BODY ──────────────────────────────────── */}
      <div className={`${BLAKKHAIL_LAYOUT.container} py-10 sm:py-12`}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3
              className="text-base font-black uppercase tracking-wider sm:text-lg"
              style={{ color: BLAKKHAIL.gold }}
            >
              {blakkhailBrand.name}
            </h3>
            <p
              className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] sm:text-xs"
              style={{ color: BLAKKHAIL.steel }}
            >
              {blakkhailBrand.legalName}
            </p>
            <p
              className="mt-3 text-sm leading-relaxed sm:text-base"
              style={{ color: BLAKKHAIL.steel }}
            >
              Original fashion est. {blakkhailBrand.established}
            </p>
          </div>

          {/* Contact column */}
          <div>
            <p
              className="text-xs uppercase tracking-wider sm:text-sm"
              style={{ color: BLAKKHAIL.gold }}
            >
              Contact
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              <li className="flex items-center gap-2 text-sm sm:text-base" style={{ color: BLAKKHAIL.steel }}>
                <Phone size={14} style={{ color: BLAKKHAIL.darkGold }} aria-hidden />
                <a href={`tel:${company.phone.replace(/\D/g, '')}`} className="hover:opacity-80">
                  {company.phone}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base" style={{ color: BLAKKHAIL.steel }}>
                <Mail size={14} style={{ color: BLAKKHAIL.darkGold }} aria-hidden />
                <a href={`mailto:${blakkhailBrand.email}`} className="hover:opacity-80 break-all">
                  {blakkhailBrand.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base" style={{ color: BLAKKHAIL.steel }}>
                <Globe size={14} style={{ color: BLAKKHAIL.darkGold }} aria-hidden />
                <a
                  href={blakkhailBrand.parentSiteUrl}
                  className="hover:opacity-80"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {company.website}
                </a>
              </li>
            </ul>
          </div>

          {/* Location column */}
          <div>
            <p
              className="text-xs uppercase tracking-wider sm:text-sm"
              style={{ color: BLAKKHAIL.gold }}
            >
              Location
            </p>
            <p className="mt-3 text-sm leading-relaxed sm:text-base" style={{ color: BLAKKHAIL.steel }}>
              {company.location}
            </p>
            <Link
              href={parentHref}
              className="mt-3 block text-sm hover:opacity-80 sm:text-base"
              style={{ color: BLAKKHAIL.steel }}
            >
              {blakkhailBrand.legalName}
            </Link>
          </div>

          {/* POWERED BY WISE² column */}
          <div className="flex flex-col gap-3">
            <p
              className="text-xs uppercase tracking-wider sm:text-sm"
              style={{ color: BLAKKHAIL.gold }}
            >
              {blakkhailBrand.wise2.poweredByLabel}
            </p>
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-sm font-black"
                style={{ backgroundColor: BLAKKHAIL.gold, color: BLAKKHAIL.jetBlack }}
              >
                W
              </div>
              <span
                className="text-xl font-black tracking-[0.06em]"
                style={{ color: BLAKKHAIL.gold }}
              >
                WISE²
              </span>
            </div>
            <p
              className="text-[10px] font-bold uppercase leading-5 tracking-[0.18em] sm:text-xs"
              style={{ color: BLAKKHAIL.steel }}
            >
              Smart Systems.
              <br />
              Stronger Businesses.
              <br />
              Scalable Growth.
            </p>
          </div>
        </div>

        {/* Social icons */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 rounded-sm border px-4 py-2 text-sm font-bold uppercase tracking-wide hover:opacity-90"
            style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
          >
            <Instagram size={18} aria-hidden />
            @blakkhail
          </a>
          <a
            href={social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center rounded-sm border p-2.5 hover:opacity-90"
            style={{ borderColor: BLAKKHAIL.gunmetal, color: BLAKKHAIL.steel }}
            aria-label="Facebook"
          >
            <Facebook size={20} />
          </a>
          <a
            href={social.twitter ?? '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center rounded-sm border p-2.5 hover:opacity-90"
            style={{ borderColor: BLAKKHAIL.gunmetal, color: BLAKKHAIL.steel }}
            aria-label="TikTok"
          >
            <TikTokIcon size={20} />
          </a>
          <a
            href={social.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center rounded-sm border p-2.5 hover:opacity-90"
            style={{ borderColor: BLAKKHAIL.gunmetal, color: BLAKKHAIL.steel }}
            aria-label="YouTube"
          >
            <Youtube size={20} />
          </a>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row sm:text-sm"
          style={{ borderColor: BLAKKHAIL.gunmetal, color: BLAKKHAIL.steel }}
        >
          <p>
            © {new Date().getFullYear()} {blakkhailBrand.legalName} •{' '}
            {blakkhailBrand.name} • {company.location}
          </p>
          <p style={{ color: BLAKKHAIL.darkGold }}>
            {blakkhailBrand.wise2.poweredByLabel} WISE²
          </p>
        </div>
      </div>
    </footer>
  );
}
