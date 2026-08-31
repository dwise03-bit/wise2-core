'use client';

import Link from 'next/link';

const footerSections = [
  {
    title: 'Products',
    links: [
      { href: '/platform', label: 'WISE² Core' },
      { href: '/products/imp', label: 'WISE Imp' },
      { href: '/products/imps', label: 'IMPS BYTE MINI' },
      { href: '/fieldtech', label: 'WISE² HVAC' },
      { href: '/wise-defense', label: 'WISE Defense' },
      { href: '/soundlab', label: 'SoundLab' },
    ],
  },
  {
    title: 'Work',
    links: [
      { href: '/solutions', label: 'Solutions' },
      { href: '/work', label: 'Client Work' },
      { href: '/printshop', label: 'Print Shop' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#050607] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]">
              <span className="flex h-10 w-10 items-center justify-center bg-[#DCE7EF] text-sm font-black text-[#050607]">
                W
              </span>
              <span>
                <span className="block text-lg font-black tracking-[0.12em]">WISE²</span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8FA0AE]">
                  Field-built systems
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#AEB8C3]">
              WISE² builds software, AI workflows, edge systems, and client infrastructure for real-world businesses and field operations.
            </p>
            <p className="mt-6 text-xs text-[#6F7D89]">© {currentYear} WISE². All rights reserved.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-[#8EDBFF]">{section.title}</h2>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-[#AEB8C3] transition hover:text-white focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#6F7D89] sm:flex-row sm:items-center sm:justify-between">
          <p>No invented testimonials, client metrics, or partner claims.</p>
          <a href="mailto:contact@wise2.net" className="w-fit transition hover:text-white focus:outline-none focus:ring-2 focus:ring-[#8EDBFF]">
            contact@wise2.net
          </a>
        </div>
      </div>
    </footer>
  );
};
