import type { Metadata, Viewport } from 'next';
import './styles/globals.css';

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
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="stylesheet" href="/tailwind.css" />
      </head>
      <body className="bg-black text-chrome">
        <div className="min-h-screen flex flex-col">
          {/* Navigation */}
          <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-chrome/20">
            <div className="max-w-6xl mx-auto px-md sm:px-lg lg:px-xl py-md flex items-center justify-between">
              <div className="text-2xl font-bold">
                WISE<sup className="text-lg">²</sup>
              </div>
              <div className="hidden md:flex items-center gap-lg">
                <a href="#sound-labs" className="hover:text-blue-500 transition-colors">Sound Labs</a>
                <a href="#features" className="hover:text-blue-500 transition-colors">Features</a>
                <a href="#pricing" className="hover:text-blue-500 transition-colors">Pricing</a>
                <a href="/community" className="hover:text-blue-500 transition-colors">Community</a>
              </div>
              <button className="px-lg py-sm bg-blue-500 hover:bg-blue-400 text-black font-semibold rounded-md transition-colors">
                Get Started
              </button>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 border-t border-chrome/20 py-3xl">
            <div className="max-w-6xl mx-auto px-md sm:px-lg lg:px-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2xl mb-2xl">
                <div>
                  <h3 className="font-bold mb-lg">WISE²</h3>
                  <p className="text-sm text-gray-500">AI-powered brand operating system</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-lg text-sm">Product</h4>
                  <ul className="space-y-sm text-sm text-gray-500">
                    <li><a href="#sound-labs" className="hover:text-chrome transition-colors">Sound Labs</a></li>
                    <li><a href="#" className="hover:text-chrome transition-colors">Pricing</a></li>
                    <li><a href="#" className="hover:text-chrome transition-colors">Roadmap</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-lg text-sm">Company</h4>
                  <ul className="space-y-sm text-sm text-gray-500">
                    <li><a href="#" className="hover:text-chrome transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-chrome transition-colors">Blog</a></li>
                    <li><a href="#" className="hover:text-chrome transition-colors">Careers</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-lg text-sm">Legal</h4>
                  <ul className="space-y-sm text-sm text-gray-500">
                    <li><a href="#" className="hover:text-chrome transition-colors">Privacy</a></li>
                    <li><a href="#" className="hover:text-chrome transition-colors">Terms</a></li>
                    <li><a href="#" className="hover:text-chrome transition-colors">Security</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-chrome/20 pt-2xl text-center text-sm text-gray-500">
                <p>&copy; 2026 Wise Defense LLC. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
