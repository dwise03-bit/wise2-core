import type { Metadata } from 'next';
import '../styles/globals.css';
import { StudioNav } from '../components/Navigation/StudioNav';

export const metadata: Metadata = {
  title: 'WISE Sound Labs | Professional Audio Studio',
  description: 'Create professional audio and music with AI assistance. Recording, mixing, mastering—all in one studio.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="bg-black text-white">
        <div className="min-h-screen flex">
          {/* Left Sidebar Navigation */}
          <StudioNav />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">WISE Sound Labs</h1>
              </div>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                  Export
                </button>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                  Share
                </button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
