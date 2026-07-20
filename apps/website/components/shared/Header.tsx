'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/landing', label: 'Landing' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/studio', label: 'Studio' },
    { href: '/apps', label: 'Apps' },
    { href: '/webstore', label: 'Webstore' },
    { href: '/shop', label: 'Shop' },
    { href: '/maintenance', label: 'Maintenance' },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        padding: '0 20px',
        background: 'linear-gradient(180deg, #111, #0a0a0a)',
        borderBottom: '1px solid #262626',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
          marginRight: '24px',
          textDecoration: 'none',
        }}
      >
        <span
          style={{
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 900,
            fontSize: '18px',
            background: 'linear-gradient(180deg, #fff 20%, #777 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          WISE
        </span>
        <span
          style={{
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 900,
            fontSize: '11px',
            color: '#39FF14',
            textShadow: '0 0 8px rgba(57,255,20,.6)',
          }}
        >
          2
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav
        style={{
          display: 'none',
          gap: '24px',
          flex: 1,
          '@media (min-width: 768px)': {
            display: 'flex',
          },
        } as any}
      >
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: isActive(link.href) ? '#39FF14' : '#e6e6e6',
              fontSize: '13px',
              textDecoration: 'none',
              fontWeight: isActive(link.href) ? 600 : 400,
              borderBottom: isActive(link.href) ? '2px solid #39FF14' : 'none',
              paddingBottom: isActive(link.href) ? '4px' : '0',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.color = '#39FF14';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              if (!isActive(link.href)) {
                el.style.color = '#e6e6e6';
              }
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1, display: 'none', '@media (min-width: 768px)': { display: 'block' } } as any} />

      {/* Search Bar (Desktop) */}
      <div
        style={{
          display: 'none',
          alignItems: 'center',
          gap: '8px',
          marginRight: '16px',
          '@media (min-width: 768px)': {
            display: 'flex',
          },
        } as any}
      >
        {searchOpen ? (
          <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: '160px',
                padding: '6px 10px',
                background: '#0d0d0d',
                border: '1px solid #262626',
                borderRadius: '4px',
                color: '#e6e6e6',
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                marginLeft: '8px',
              }}
            >
              <X size={18} />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            <Search size={18} />
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: 'flex',
          background: 'none',
          border: 'none',
          color: '#e6e6e6',
          cursor: 'pointer',
          padding: '4px 8px',
        }}
        className="md:hidden"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <nav
          style={{
            position: 'absolute',
            top: '56px',
            left: 0,
            right: 0,
            background: '#0a0a0a',
            border: '1px solid #262626',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            padding: '8px 0',
          }}
        >
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: isActive(link.href) ? '#39FF14' : '#e6e6e6',
                fontSize: '13px',
                textDecoration: 'none',
                fontWeight: isActive(link.href) ? 600 : 400,
                padding: '12px 20px',
                borderLeft: isActive(link.href) ? '3px solid #39FF14' : '3px solid transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
