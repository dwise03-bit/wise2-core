'use client'

import { useState } from 'react'

export default function BlakkhailAppPage() {
  const [copied, setCopied] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050607] to-[#0a0a0c] text-white">
      {/* Hero */}
      <div className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00D9FF] rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C4A369] rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-6xl md:text-7xl font-black mb-6 text-[#C4A369]">BLAKKHAIL</h1>
          <p className="text-xl md:text-2xl text-[#00D9FF] mb-8">Heritage Streetwear at Your Fingertips</p>
        </div>
      </div>

      {/* Download Options */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gradient-to-br from-[#0f1419] to-[#1a1a2e] border border-[#C4A369]/30 rounded-lg p-8">
            <h3 className="text-2xl font-black text-[#C4A369] mb-4">📱 Native iOS App</h3>
            <p className="text-gray-300 mb-6">Join TestFlight beta or install directly.</p>
            <button
              onClick={() => window.open('https://testflight.apple.com/', '_blank')}
              className="w-full px-6 py-3 rounded-lg font-bold text-[#050607] bg-gradient-to-r from-[#C4A369] to-[#00D9FF]"
            >
              Join TestFlight
            </button>
          </div>

          <div className="bg-gradient-to-br from-[#0f1419] to-[#1a1a2e] border border-[#00D9FF]/30 rounded-lg p-8">
            <h3 className="text-2xl font-black text-[#00D9FF] mb-4">🌐 Web App</h3>
            <p className="text-gray-300 mb-6">Access instantly. Add to Home Screen.</p>
            <button
              onClick={() => window.location.href = '/blakkhail-app.html'}
              className="w-full px-6 py-3 rounded-lg font-bold text-[#050607] bg-gradient-to-r from-[#00D9FF] to-[#00FF7F]"
            >
              Open Web App
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
