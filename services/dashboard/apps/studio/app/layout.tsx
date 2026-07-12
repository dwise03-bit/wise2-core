import type { Metadata } from 'next';
import '../styles/globals.css';

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
      <body className="bg-black text-chrome">
        <div className="min-h-screen flex flex-col">
          {/* Studio Header */}
          <header className="bg-gray-900 border-b border-chrome/20 px-md sm:px-lg py-md flex items-center justify-between">
            <h1 className="text-2xl font-bold">WISE Sound Labs</h1>
            <div className="flex gap-md">
              <button className="px-lg py-sm bg-blue-500 hover:bg-blue-400 text-black font-semibold rounded-md">
                Export
              </button>
              <button className="px-lg py-sm bg-purple-500 hover:bg-purple-400 text-black font-semibold rounded-md">
                Share
              </button>
            </div>
          </header>

          {/* Main Studio */}
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
