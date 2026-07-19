import Link from 'next/link';
import { branding, contact } from '@/data/wise2-content';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/worlds', label: 'Our Worlds' },
    { href: '/services', label: 'Services' },
    { href: '/about', label: 'About' },
    { href: '/process', label: 'Process' },
    { href: '/work', label: 'Work' },
  ];

  return (
    <footer className="bg-wise-bg-secondary border-t border-wise-accent-green-border text-wise-text-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-wise-accent-green font-display mb-2">W²</h3>
            <p className="text-sm">{branding.tagline}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-wise-text-primary mb-4">Navigate</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-wise-accent-green transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-wise-text-primary mb-4">Contact</h4>
            <p className="text-sm mb-2">{contact.email}</p>
            <p className="text-sm">{contact.phone}</p>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-wise-text-primary mb-4">Social</h4>
            <div className="flex gap-4">
              <a href={contact.social.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-wise-accent-green transition-colors">
                Twitter
              </a>
              <a href={contact.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-wise-accent-green transition-colors">
                Instagram
              </a>
              <a href={contact.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-wise-accent-green transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-wise-accent-green-border pt-8">
          <p className="text-center text-sm">
            © {currentYear} {branding.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
