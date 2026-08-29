'use client';

import Link from 'next/link';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import { useEffect, useState } from 'react';
import { blakkhailBrand } from './config';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';
import { company } from '@/lib/sencere/config';
import { isBlackhailHost } from '@/lib/site-domains';

function TwitterIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
      <div
        className={`border-y ${BLAKKHAIL_LAYOUT.sectionY}`}
        style={{ borderColor: BLAKKHAIL.darkGold, backgroundColor: BLAKKHAIL.gunmetal }}
      >
        <div
          className={`${BLAKKHAIL_LAYOUT.container} flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left`}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.35em] sm:text-sm" style={{ color: BLAKKHAIL.gold }}>
              Contact Us
            </p>
            <h2
              className="mt-2 text-2xl font-black uppercase tracking-[0.1em] sm:text-3xl lg:text-4xl"
              style={{ color: BLAKKHAIL.steel, fontFamily: 'var(--font-display)' }}
            >
              Get In Touch
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${blakkhailBrand.email}?subject=Blakk%20Hail%20Inquiry`}
              className="px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black sm:text-sm"
              style={{ backgroundColor: BLAKKHAIL.gold }}
            >
              Email Us
            </a>
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="border px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] sm:text-sm"
              style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
            >
              Follow @blakkhail
            </a>
          </div>
        </div>
      </div>

      <div className={`${BLAKKHAIL_LAYOUT.container} py-10 sm:py-12`}>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <h3 className="text-base font-black uppercase tracking-wider sm:text-lg" style={{ color: BLAKKHAIL.gold }}>
              {blakkhailBrand.name}
            </h3>
            <p className="mt-3 text-sm leading-relaxed sm:text-base" style={{ color: BLAKKHAIL.steel }}>
              Original fashion est. {blakkhailBrand.established} • {blakkhailBrand.location}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider sm:text-sm" style={{ color: BLAKKHAIL.gold }}>
              Email
            </p>
            <a
              href={`mailto:${blakkhailBrand.email}`}
              className="mt-2 block text-sm hover:opacity-80 sm:text-base"
              style={{ color: BLAKKHAIL.steel }}
            >
              {blakkhailBrand.email}
            </a>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider sm:text-sm" style={{ color: BLAKKHAIL.gold }}>
              Parent Company
            </p>
            <Link href={parentHref} className="mt-2 block text-sm hover:opacity-80 sm:text-base" style={{ color: BLAKKHAIL.steel }}>
              {blakkhailBrand.legalName}
            </Link>
            <a href={blakkhailBrand.parentSiteUrl} className="mt-1 block text-sm hover:opacity-80 sm:text-base" style={{ color: BLAKKHAIL.steel }}>
              {company.website}
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
          <a
            href={social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 rounded-sm border px-4 py-2 text-sm font-bold uppercase tracking-wide hover:opacity-90"
            style={{ borderColor: BLAKKHAIL.gold, color: BLAKKHAIL.gold }}
          >
            <Instagram size={20} aria-hidden />
            @blakkhail
          </a>
          <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80" style={{ color: BLAKKHAIL.steel }} aria-label="Facebook"><Facebook size={20} /></a>
          <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-80" style={{ color: BLAKKHAIL.steel }} aria-label="Twitter"><TwitterIcon /></a>
          <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="hover:opacity-80" style={{ color: BLAKKHAIL.steel }} aria-label="YouTube"><Youtube size={20} /></a>
        </div>

        <div
          className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 text-xs sm:flex-row sm:text-sm"
          style={{ borderColor: BLAKKHAIL.gunmetal, color: BLAKKHAIL.steel }}
        >
          <p>
            © {new Date().getFullYear()} {blakkhailBrand.legalName} • {blakkhailBrand.name}
          </p>
          <p>
            {blakkhailBrand.wise2.poweredByLabel} WISE²
          </p>
        </div>
      </div>
    </footer>
  );
}
