import { Navigation, Footer } from '@/components/wise';
import Link from 'next/link';

export default function LivePage() {
  return (
    <>
      <Navigation />
      <main className="bg-black min-h-screen pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-6xl font-black mb-6 text-lime-400" style={{ fontFamily: '"Beyond The Mountains", sans-serif' }}>
            Live
          </h1>
          <p className="text-xl text-gray-300 mb-12 font-mono">
            Real-time broadcast and streaming for maximum impact.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-8 border border-gray-800 rounded-lg bg-gray-900/30">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-white font-bold mb-2">Stream</h3>
              <p className="text-gray-400 text-sm">Broadcast to millions with zero latency.</p>
            </div>
            <div className="p-8 border border-gray-800 rounded-lg bg-gray-900/30">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-white font-bold mb-2">Engage</h3>
              <p className="text-gray-400 text-sm">Connect directly with your audience.</p>
            </div>
            <div className="p-8 border border-gray-800 rounded-lg bg-gray-900/30">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-white font-bold mb-2">Analyze</h3>
              <p className="text-gray-400 text-sm">Real-time analytics and insights.</p>
            </div>
          </div>

          <Link href="/" className="px-8 py-3 rounded bg-lime-400 text-black font-bold hover:bg-lime-300 transition inline-block">
            ← Back to Intake
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
