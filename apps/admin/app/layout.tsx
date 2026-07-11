import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WISE² Admin',
  description: 'Admin dashboard for WISE² Enterprise',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-black text-chrome font-sans">{children}</body>
    </html>
  )
}
