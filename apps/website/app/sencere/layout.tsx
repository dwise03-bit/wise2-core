import type { Metadata } from 'next';
import { Oswald, Inter } from 'next/font/google';

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'SenCere Creative LLC | Custom Apparel, Printing & Fabrication',
    template: '%s | SenCere Creative LLC',
  },
  description:
    'SenCere Creative LLC brings ideas into reality with custom apparel, printing, engraving, fabrication, prototyping and creative production solutions powered by WISE².',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SenCereLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${oswald.variable} ${inter.variable} bg-[#050505] antialiased`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      <style>{`
        .blakkhail-admin-header {
          position: fixed;
          top: 0;
          right: 0;
          z-index: 9999;
          padding: 1rem 2rem;
          background: rgba(0, 0, 0, 0.9);
          border-left: 2px solid #e8c56b;
          border-bottom: 2px solid #e8c56b;
          border-radius: 0 0 0 8px;
        }
        .blakkhail-admin-btn {
          padding: 0.75rem 1.5rem;
          background: #e8c56b;
          color: #000;
          border: none;
          border-radius: 4px;
          font-size: 0.875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }
        .blakkhail-admin-btn:hover {
          background: #f5d98d;
          transform: translateY(-2px);
        }
      `}</style>
      <div className="blakkhail-admin-header">
        <a href="/blakkhail-admin-tv-login.html" className="blakkhail-admin-btn">
          🔐 Admin Login
        </a>
      </div>
      {children}
    </div>
  );
}
