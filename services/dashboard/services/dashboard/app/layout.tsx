import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'W² Command Center™',
  description: 'Multiply What\'s Possible™',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
