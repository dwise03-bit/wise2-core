import type { Metadata } from 'next'

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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
