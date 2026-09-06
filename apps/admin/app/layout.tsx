import type { Metadata } from 'next';
import './globals.css';
import { AdminProviders } from '@/lib/admin-providers';
import { auth } from '@wise2/auth';

export const metadata: Metadata = {
  title: 'WISE² Admin',
  description: 'Admin dashboard for WISE² Enterprise',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-black text-chrome font-sans">
        <AdminProviders session={session}>{children}</AdminProviders>
      </body>
    </html>
  );
}
