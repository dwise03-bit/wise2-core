import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import './styles/globals.css';

const ChatWidget = dynamic(() => import('@/components/ChatWidget'), {
  ssr: false,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'WISE² Enterprise | AI-Powered Brand Operating System',
  description: 'Create, manage, and grow your brand with AI-powered tools. Professional-grade audio, video, and design. One platform. Unlimited possibilities.',
  keywords: 'brand creation, audio branding, AI, music production, design, marketing',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    url: 'https://wise2.com',
    title: 'WISE² Enterprise',
    description: 'AI-powered brand operating system',
    images: [
      {
        url: 'https://wise2.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'WISE² Enterprise',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WISE² Enterprise',
    description: 'AI-powered brand operating system',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#050505" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-wise text-wise-primary">
        <ChatWidget />
        <div className="min-h-screen flex flex-col">
          {/* Navigation */}
          <nav className="sticky top-0 z-50 bg-wise/80 backdrop-blur-md border-b border-wise-subtle">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-6 py-4 flex items-center justify-between">
              <div className="text-2xl font-bold">
                WISE<sup className="text-lg">²</sup>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="#sound-labs" className="hover:text-wise-primary transition-colors">Sound Labs</a>
                <a href="#features" className="hover:text-wise-primary transition-colors">Features</a>
                <a href="#pricing" className="hover:text-wise-primary transition-colors">Pricing</a>
                <a href="/community" className="hover:text-wise-primary transition-colors">Community</a>
              </div>
              <button className="px-6 py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-md transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md">
                Get Started
              </button>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-wise-surface border-t border-wise-subtle py-12">
            <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div>
                  <h3 className="font-bold mb-4">WISE²</h3>
                  <p className="text-sm text-wise-muted">AI-powered brand operating system</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Product</h4>
                  <ul className="space-y-2 text-sm text-wise-muted">
                    <li><a href="#sound-labs" className="hover:text-wise-primary transition-colors">Sound Labs</a></li>
                    <li><a href="#" className="hover:text-wise-primary transition-colors">Pricing</a></li>
                    <li><a href="#" className="hover:text-wise-primary transition-colors">Roadmap</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Company</h4>
                  <ul className="space-y-2 text-sm text-wise-muted">
                    <li><a href="#" className="hover:text-wise-primary transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-wise-primary transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-wise-primary transition-colors">Careers</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Legal</h4>
                  <ul className="space-y-2 text-sm text-wise-muted">
                    <li><a href="#" className="hover:text-wise-primary transition-colors">Privacy</a></li>
                    <li><a href="#" className="hover:text-wise-primary transition-colors">Terms</a></li>
                    <li><a href="#" className="hover:text-wise-primary transition-colors">Security</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-wise-subtle pt-8 text-center text-sm text-wise-muted">
                <p>&copy; 2026 Wise Defense LLC. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
