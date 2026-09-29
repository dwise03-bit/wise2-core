import Link from 'next/link';

export default function LIVEPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">WISE² LIVE™</h1>
        <p className="text-xl text-gray-300 mb-16">Multi-tenant demo provisioning engine • 7 scenarios • Production-ready</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"><div className="text-3xl font-bold text-yellow-400 mb-2">7</div><div className="text-gray-300">Demo Scenarios</div></div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"><div className="text-3xl font-bold text-green-400 mb-2">100+</div><div className="text-gray-300">Concurrent Users</div></div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"><div className="text-3xl font-bold text-blue-400 mb-2">170+</div><div className="text-gray-300">Test Cases</div></div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"><div className="text-3xl font-bold text-purple-400 mb-2">8,396</div><div className="text-gray-300">Lines of Code</div></div>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8">7 Demo Scenarios</h3>
          <div className="space-y-4">
            {[
              { num: 1, name: 'Basic Commerce', desc: 'Simple e-commerce flow' },
              { num: 2, name: 'SaaS Subscription', desc: 'Subscription billing' },
              { num: 3, name: 'Marketplace', desc: 'Multi-vendor marketplace' },
              { num: 4, name: 'Field Service', desc: 'Job dispatch & scheduling' },
              { num: 5, name: 'Digital Twins', desc: 'IoT device simulation' },
              { num: 6, name: 'AI Automation', desc: 'Workflow automation' },
              { num: 7, name: 'Content Studio', desc: 'Media production' },
            ].map((s) => (
              <div key={s.num} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 flex gap-4">
                <div className="w-12 h-12 bg-yellow-500/20 text-yellow-400 rounded flex items-center justify-center font-bold">{s.num}</div>
                <div><h4 className="font-bold">{s.name}</h4><p className="text-gray-400 text-sm">{s.desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/systems" className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600">← Back</Link>
          <Link href="/systems/hardware" className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400">Next: Hardware →</Link>
        </div>
      </div>
    </div>
  );
}
