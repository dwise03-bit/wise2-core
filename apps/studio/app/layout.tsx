import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'WISE² Studio - Creative Suite',
  description: 'Create, stream, and collaborate with WISE² Studio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
