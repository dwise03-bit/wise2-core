import Link from 'next/link';

export default function MobilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-4 text-pink-400">Mobile Apps</h1>
        <p className="text-xl text-gray-300 mb-16">Native iOS • Android VR • XR Command Center</p>

        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8">📱 iOS FieldTech Copilot</h3>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-pink-400 mb-4">Native Swift/SwiftUI</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>✓ 2900+ lines of native Swift</li>
                  <li>✓ MVVM architecture</li>
                  <li>✓ Deployed to real iPhone</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-pink-400 mb-4">Core Features</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>✓ GPS routing & navigation</li>
                  <li>✓ Photo & signature capture</li>
                  <li>✓ Offline-first sync</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8">🎮 Android VR for Meta Quest</h3>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-purple-400 mb-4">Immersive 3D</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>✓ 2,171 lines Java/Kotlin</li>
                  <li>✓ OpenXR framework</li>
                  <li>✓ 72fps rendering</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-purple-400 mb-4">VR Features</h4>
                <ul className="text-gray-300 space-y-2 text-sm">
                  <li>✓ 3D job site visualization</li>
                  <li>✓ Hand tracking gestures</li>
                  <li>✓ Real-time collaboration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h3 className="text-3xl font-bold mb-8">🥽 XR Command Center</h3>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <p className="text-gray-300">Spatial UI, hand gestures, real-time dashboards, and immersive control across all XR platforms</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Link href="/systems" className="px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600">← Back to Systems</Link>
          <Link href="/" className="px-6 py-3 bg-pink-500 text-black font-bold rounded-lg hover:bg-pink-400">Home</Link>
        </div>
      </div>
    </div>
  );
}
