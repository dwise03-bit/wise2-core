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

export const metadata: Metadata = {
  title: {
    default: 'SenCere Creative LLC | Custom Apparel, Printing & Fabrication',
    template: '%s | SenCere Creative LLC',
  },
  description:
    'SenCere Creative LLC brings ideas into reality with custom apparel, printing, engraving, fabrication, prototyping and creative production solutions powered by WISE².',
};

export default function SenCereLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${oswald.variable} ${inter.variable} bg-[#050505] antialiased`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {children}
    </div>
  );
}
