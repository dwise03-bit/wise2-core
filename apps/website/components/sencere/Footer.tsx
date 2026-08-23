import Link from 'next/link';
import { MapPin, Phone, Mail, Globe, Facebook, Instagram, Youtube } from 'lucide-react';
import { company } from '@/lib/sencere/config';
import { TikTokIcon } from './icons';

const socialLinks = [
  { key: 'facebook', href: company.social.facebook, Icon: Facebook, label: 'Facebook' },
  { key: 'instagram', href: company.social.instagram, Icon: Instagram, label: 'Instagram' },
  { key: 'tiktok', href: company.social.tiktok, Icon: TikTokIcon, label: 'TikTok' },
  { key: 'youtube', href: company.social.youtube, Icon: Youtube, label: 'YouTube' },
];

export function Footer() {
  return (
    <footer className="border-t border-[#D4842F]/20 bg-[#0f0f0f]">
      <div className="mx-auto flex max-w-[1536px] flex-col items-center justify-between gap-5 px-6 py-6 text-xs text-[#D4D4D4] sm:flex-row sm:px-10">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#E8A23A]" aria-hidden="true" />
            {company.location}
          </span>
          <a href={`tel:${company.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2 transition hover:text-[#E8A23A]">
            <Phone className="h-3.5 w-3.5 text-[#E8A23A]" aria-hidden="true" />
            {company.phone}
          </a>
          <a href={`mailto:${company.email}`} className="flex items-center gap-2 transition hover:text-[#E8A23A]">
            <Mail className="h-3.5 w-3.5 text-[#E8A23A]" aria-hidden="true" />
            {company.email}
          </a>
          <span className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-[#E8A23A]" aria-hidden="true" />
            {company.website}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#999]">FOLLOW US</span>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ key, href, Icon, label }) =>
              href ? (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4842F]/30 text-[#D4D4D4] transition hover:border-[#E8A23A] hover:text-[#E8A23A]"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span
                  key={key}
                  aria-hidden="true"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#D4842F]/15 text-[#444]"
                  title={`${label} link not yet configured`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
              ),
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-[#D4842F]/15 py-3 text-center text-[10px] text-[#666]">
        © {new Date().getFullYear()} {company.name}. Powered by{' '}
        <Link href="https://wise2.net" className="text-[#E8A23A] transition hover:underline">
          WISE²
        </Link>
        .
      </div>
    </footer>
  );
}
