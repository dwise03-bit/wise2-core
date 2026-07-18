import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WISE² Dashboard',
  description: 'WISE² Creator Dashboard - Command Center for Content Creators',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#050505" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className="font-sans"
        style={{
          backgroundColor: 'var(--wise-bg, #050505)',
          color: 'var(--wise-text-primary, #FFFFFF)',
        }}
      >
        {children}
      </body>
    </html>
  );
}
