import Link from 'next/link';

export default function IMPPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">WISE² IMP</h1>
        <p className="text-xl text-gray-300 mb-16">Intent Management Platform for iMessage Control</p>

        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4">Turn your iPhone into a Command Center</h2>
          <p className="text-gray-300">WISE² IMP is the intelligent routing engine that turns iMessage requests into coordinated actions across the entire WISE² ecosystem. Natural language → Intent classification → Risk assessment → Confirmation → Execution.</p>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h4 className="font-bold text-blue-400 mb-3">Intent Classification</h4>
              <p className="text-gray-300 text-sm">Natural language understanding without slash commands</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h4 className="font-bold text-blue-400 mb-3">Risk-Based Access</h4>
              <p className="text-gray-300 text-sm">4 risk levels with appropriate security confirmations</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h4 className="font-bold text-blue-400 mb-3">Multi-Node Dispatch</h4>
              <p className="text-gray-300 text-sm">Routes to Mac, VPS, GPU, or Raspberry Pi</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h4 className="font-bold text-blue-400 mb-3">Audit Logging</h4>
              <p className="text-gray-300 text-sm">Complete security audit trail of all commands</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/systems" className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600">← Back</Link>
          <Link href="/api-docs" className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-400">Next: API Docs →</Link>
        </div>
      </div>
    </div>
  );
}
