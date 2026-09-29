import type { Metadata, Viewport } from 'next'
import { MainLayout } from '@/components/layout/MainLayout'
import { SkipLink } from '@/components/common/SkipLink'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'WISE TOUCH - Organized Chaos Command Center',
  description: 'Premium SaaS operating system for controlling your entire business',
  keywords: ['business', 'saas', 'dashboard', 'operations'],
  authors: [{ name: 'WISE²' }],
  creator: 'WISE²',
  other: {
    'cache-control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'pragma': 'no-cache',
    'expires': '0',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
  colorScheme: 'dark',
  maximumScale: 1,
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>
        <SkipLink />
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
