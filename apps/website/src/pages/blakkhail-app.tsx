import { useState } from 'react'

export default function BlakkhailAppPage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050607] to-[#0a0a0c] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D9FF] rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C4A369] rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-[#C4A369]/10 border border-[#C4A369]/50">
            <p className="text-[#C4A369] text-sm font-semibold tracking-widest">iOS APP</p>
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-6 text-[#C4A369] tracking-tight"
              style={{
                textShadow: '0 0 20px rgba(196, 163, 105, 0.4), 0 0 40px rgba(0, 217, 255, 0.2)'
              }}>
            BLAKKHAIL
          </h1>

          <p className="text-xl md:text-2xl text-[#00D9FF] mb-8 tracking-wide">
            Heritage Streetwear at Your Fingertips
          </p>

          <p className="text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Download the official BLAKKHAIL iOS app. Shop the collection, track your orders, and stay connected with the culture.
          </p>
        </div>
      </div>

      {/* Download Options */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* TestFlight */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#C4A369] to-[#00D9FF] rounded-lg opacity-0 group-hover:opacity-10 blur transition"></div>
            <div className="relative bg-gradient-to-br from-[#0f1419] to-[#1a1a2e] border border-[#C4A369]/30 rounded-lg p-8 hover:border-[#C4A369]/60 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#C4A369]/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-2xl font-black text-[#C4A369]">TestFlight Beta</h3>
              </div>

              <p className="text-gray-300 mb-6">
                Be the first to test new features. Join our TestFlight beta program.
              </p>

              <div className="space-y-3">
                <p className="text-sm text-gray-400">Bundle ID:</p>
                <div className="bg-[#000000]/50 border border-[#00D9FF]/30 rounded p-3 font-mono text-sm text-[#00D9FF] truncate">
                  com.sencere.blakkhail
                </div>
              </div>

              <button
                onClick={() => window.open('https://testflight.apple.com/join/YOUR_LINK_HERE', '_blank')}
                className="w-full mt-6 px-6 py-3 rounded-lg font-bold text-[#050607] bg-gradient-to-r from-[#C4A369] to-[#00D9FF] hover:shadow-lg hover:shadow-[#00D9FF]/50 transition transform hover:scale-105"
              >
                Join Beta
              </button>
            </div>
          </div>

          {/* Web PWA */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF] to-[#00FF7F] rounded-lg opacity-0 group-hover:opacity-10 blur transition"></div>
            <div className="relative bg-gradient-to-br from-[#0f1419] to-[#1a1a2e] border border-[#00D9FF]/30 rounded-lg p-8 hover:border-[#00D9FF]/60 transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#00D9FF]/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <h3 className="text-2xl font-black text-[#00D9FF]">Web App</h3>
              </div>

              <p className="text-gray-300 mb-6">
                Access BLAKKHAIL instantly in your browser. Works on all devices.
              </p>

              <div className="space-y-3">
                <p className="text-sm text-gray-400">Add to Home Screen:</p>
                <div className="bg-[#000000]/50 border border-[#00FF7F]/30 rounded p-3 text-sm text-gray-300">
                  Tap Share → Add to Home Screen
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/blakkhail-app.html'}
                className="w-full mt-6 px-6 py-3 rounded-lg font-bold text-[#050607] bg-gradient-to-r from-[#00D9FF] to-[#00FF7F] hover:shadow-lg hover:shadow-[#00FF7F]/50 transition transform hover:scale-105"
              >
                Open Web App
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-[#C4A369] mb-8 text-center">App Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🛍️', title: 'Shop', desc: 'Browse & buy collection' },
              { icon: '📦', title: 'Orders', desc: 'Track shipments' },
              { icon: '💬', title: 'Messages', desc: 'Customer support' },
              { icon: '⭐', title: 'Favorites', desc: 'Save your items' },
            ].map((feature, i) => (
              <div key={i} className="bg-[#0f1419]/80 border border-[#C4A369]/20 rounded-lg p-4 text-center hover:border-[#00D9FF]/50 transition">
                <div className="text-4xl mb-2">{feature.icon}</div>
                <h4 className="font-bold text-[#C4A369] mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-gradient-to-r from-[#C4A369]/5 to-[#00D9FF]/5 border border-[#C4A369]/20 rounded-lg p-8 mb-16">
          <h3 className="text-xl font-black text-[#C4A369] mb-4">Requirements</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-center gap-3">
              <span className="text-[#00FF7F]">✓</span> iOS 17.0 or later
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#00FF7F]">✓</span> iPhone 12 or newer recommended
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#00FF7F]">✓</span> Internet connection required
            </li>
            <li className="flex items-center gap-3">
              <span className="text-[#00FF7F]">✓</span> Works on iPhone 16, 15, 14, 13...
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-400 mb-6">Questions? Contact support at hello@blakkhail.com</p>
          <div className="inline-flex gap-4">
            <button
              onClick={() => window.open('https://instagram.com/blakkhail', '_blank')}
              className="px-6 py-2 rounded-lg border border-[#C4A369] text-[#C4A369] hover:bg-[#C4A369]/10 transition font-bold"
            >
              Instagram
            </button>
            <button
              onClick={() => window.open('https://twitter.com/blakkhail', '_blank')}
              className="px-6 py-2 rounded-lg border border-[#00D9FF] text-[#00D9FF] hover:bg-[#00D9FF]/10 transition font-bold"
            >
              Twitter
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[#C4A369]/20 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>© 2026 BLAKKHAIL. All rights reserved.</p>
          <p className="mt-2">Built with heritage. Powered by innovation.</p>
        </div>
      </div>
    </div>
  )
}
