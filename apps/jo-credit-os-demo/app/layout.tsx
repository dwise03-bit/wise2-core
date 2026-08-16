import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JO CREDIT OS™ - Client Dashboard',
  description: 'We Don\'t Dispute Everything. We Audit Everything.™',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
