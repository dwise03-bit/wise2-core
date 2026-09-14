import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Fergie's Kitchen - Premium Culinary Experience",
  description: 'Discover exceptional catering and culinary services powered by WISE²',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-cream text-charcoal">{children}</body>
    </html>
  )
}
