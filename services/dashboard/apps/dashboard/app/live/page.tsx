'use client'

import { useState } from 'react'

export default function LiveCommandCenter() {
  const [isLive, setIsLive] = useState(false)
  const [viewerCount] = useState(1247)

  return (
    <div className="min-h-screen bg-black p-lg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-lg">LIVE Command Center</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Stream Player */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg border border-chrome/20 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-md">📹</div>
                  <p className="text-gray-400">
                    {isLive ? '🔴 LIVE' : 'Stream Preview'}
                  </p>
                </div>
              </div>

              <div className="bg-gray-950 p-md">
                <button
                  onClick={() => setIsLive(!isLive)}
                  className={`px-lg py-md font-semibold rounded-md ${
                    isLive
                      ? 'bg-red-500 hover:bg-red-400 text-black'
                      : 'bg-green-500 hover:bg-green-400 text-black'
                  }`}
                >
                  {isLive ? '⏹ Stop' : '🔴 Go Live'}
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-900 rounded-lg border border-chrome/20 p-md">
            <h3 className="font-bold mb-lg">Stats</h3>
            <div className="space-y-lg">
              <div>
                <p className="text-gray-400 text-sm">Viewers</p>
                <p className="text-4xl font-bold text-blue-500">{viewerCount}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Duration</p>
                <p className="text-4xl font-bold">23:45</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
