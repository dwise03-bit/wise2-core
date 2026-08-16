import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WISE² Podcast Music',
  description: 'AI-powered podcast music generation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
