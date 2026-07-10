import type { Metadata } from 'next'
import { MainLayout } from '@/components/layout/MainLayout'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'WISE TOUCH - Organized Chaos Command Center',
  description: 'Premium SaaS operating system for controlling your entire business',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#050505',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  )
}
