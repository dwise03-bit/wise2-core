import type { ReactNode } from 'react';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#020506',
  colorScheme: 'dark',
};

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
