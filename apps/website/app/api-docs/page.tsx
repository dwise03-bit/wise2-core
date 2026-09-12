import Link from 'next/link';

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-4 text-green-400">API Documentation</h1>
        <p className="text-xl text-gray-300 mb-16">Complete REST API reference for WISE² Genesis</p>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-16">
          <h3 className="font-semibold text-gray-300 mb-3">Base URL</h3>
          <code className="block bg-black/50 p-4 rounded text-green-400 font-mono">https://wise2.net/api</code>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Core Endpoints</h2>
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-400 font-bold text-sm">GET</span>
                <code className="font-mono text-gray-300">/api/health</code>
              </div>
              <p className="text-gray-400">System health check</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-400 font-bold text-sm">GET</span>
                <code className="font-mono text-gray-300">/api/status</code>
              </div>
              <p className="text-gray-400">Detailed system status</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-3">
                <span className="px-3 py-1 rounded bg-green-500/20 text-green-400 font-bold text-sm">POST</span>
                <code className="font-mono text-gray-300">/api/auth/login</code>
              </div>
              <p className="text-gray-400">Authenticate user</p>
            </div>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 mb-16">
          <h3 className="text-2xl font-bold mb-6 text-green-400">✓ Authentication</h3>
          <p className="text-gray-300 mb-4">Include JWT token in Authorization header:</p>
          <code className="block bg-black/50 p-4 rounded text-yellow-400 font-mono text-sm">Authorization: Bearer {'<your_jwt_token>'}</code>
        </div>

        <div className="flex gap-4">
          <Link href="/systems" className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600">← Back to Systems</Link>
          <Link href="/" className="px-6 py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400">Home</Link>
        </div>
      </div>
    </div>
  );
}
