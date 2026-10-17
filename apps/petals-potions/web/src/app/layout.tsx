import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Petals & Potions - Luxury Wellness Blends',
  description: 'Discover premium botanical wellness blends crafted for your rituals. Organic, luxury, transformative.',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
