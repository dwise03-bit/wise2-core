'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WearablesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">👓</div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                Wearables
              </h1>
              <p className="text-xl text-slate-300 mt-2">AR/VR Integration • Multi-Modal Input/Output</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-lg p-4">
            <p className="text-slate-300">
              Ray-Ban Meta AR glasses and Meta Quest VR headsets integrated for seamless AR/VR AI experiences.
            </p>
          </div>
        </div>

        {/* Devices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Ray-Ban Meta */}
          <Card className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">📱</span> Ray-Ban Meta
              </CardTitle>
              <CardDescription>Augmented Reality Glasses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-orange-300 mb-2">Capabilities:</h4>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>✓ Live video capture (camera feed)</li>
                  <li>✓ Audio input (microphone)</li>
                  <li>✓ Gesture recognition (tap, swipe)</li>
                  <li>✓ AR visual overlays</li>
                  <li>✓ Location awareness</li>
                  <li>✓ Object detection</li>
                </ul>
              </div>
              <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                <p className="text-xs text-slate-400">
                  <strong>Latency:</strong> 50-100ms frame processing<br/>
                  <strong>Bandwidth:</strong> 2-5 Mbps (H.264 video)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Meta Quest */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">🎮</span> Meta Quest 3S
              </CardTitle>
              <CardDescription>Virtual Reality Headset</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-blue-300 mb-2">Capabilities:</h4>
                <ul className="text-slate-300 space-y-1 text-sm">
                  <li>✓ Hand tracking (6DOF)</li>
                  <li>✓ Gesture recognition</li>
                  <li>✓ Gaze tracking</li>
                  <li>✓ Spatial audio (3D)</li>
                  <li>✓ Spatial mapping (SLAM)</li>
                  <li>✓ Immersive environments</li>
                </ul>
              </div>
              <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                <p className="text-xs text-slate-400">
                  <strong>Latency:</strong> 100-150ms processing<br/>
                  <strong>Bandwidth:</strong> 100-200 Kbps hand tracking
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Use Cases */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">🔍 AR Assistant</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm space-y-2">
                <p>Point your Ray-Ban glasses at any object and get instant AI-powered identification, analysis, and information overlay.</p>
                <p className="text-xs text-slate-400 mt-3">Real-time visual recognition • Environmental awareness • Immediate feedback</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">🎯 VR Meeting</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm space-y-2">
                <p>Step into immersive VR spaces where AI presents data, presentations, and spatial information in 3D.</p>
                <p className="text-xs text-slate-400 mt-3">Hand gestures • Spatial audio • Collaborative environments</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">🗣️ Voice Commands</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm space-y-2">
                <p>Natural language voice input from either device with spatial audio responses positioned in 3D space.</p>
                <p className="text-xs text-slate-400 mt-3">Natural language processing • Gesture-aware responses • Contextual answers</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">📊 Data Visualization</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm space-y-2">
                <p>Complex data visualized in AR overlays or immersive VR dashboards with AI-powered insights.</p>
                <p className="text-xs text-slate-400 mt-3">Real-time dashboards • 3D charts • Interactive analysis</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Integration Flow */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Request Flow</h2>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="space-y-4 font-mono text-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 border border-blue-500 rounded px-3 py-2">Device</div>
                  <div className="text-slate-400">→</div>
                  <div className="bg-purple-500/20 border border-purple-500 rounded px-3 py-2">Router</div>
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <div className="text-slate-400">↓</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 border border-purple-500 rounded px-3 py-2">Route</div>
                  <div className="text-slate-400">→</div>
                  <div className="bg-cyan-500/20 border border-cyan-500 rounded px-3 py-2">Inference</div>
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <div className="text-slate-400">↓</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-cyan-500/20 border border-cyan-500 rounded px-3 py-2">Generate</div>
                  <div className="text-slate-400">→</div>
                  <div className="bg-green-500/20 border border-green-500 rounded px-3 py-2">Response</div>
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <div className="text-slate-400">↓</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 border border-green-500 rounded px-3 py-2">Broadcast</div>
                  <div className="text-slate-400">→</div>
                  <div className="bg-pink-500/20 border border-pink-500 rounded px-3 py-2">Devices</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Request Format */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Request Format</h2>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6 font-mono text-xs overflow-x-auto">
              <div className="bg-slate-900/50 p-4 rounded border border-slate-700">
                {`curl -X POST https://wise2.net/api/generate \\
  -H 'X-API-Key: sk-test' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "project_id": "wearables",
    "agent_id": "ar-assistant",
    "user_id": "user-123",
    "task_type": "ar-query",
    "devices": [
      {"type": "rayban-meta", "id": "device-001"},
      {"type": "quest-meta", "id": "device-002"}
    ],
    "messages": [{
      "role": "user",
      "content": "What can you see?"
    }],
    "route_mode": "AUTO",
    "priority": "normal"
  }'`}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ray-Ban processing:</span>
                  <span className="text-orange-400 font-semibold">50-100ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quest processing:</span>
                  <span className="text-blue-400 font-semibold">100-150ms</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                  <span className="text-slate-400">End-to-end:</span>
                  <span className="text-green-400 font-semibold">500-1000ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Throughput</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ray-Ban video:</span>
                  <span className="text-orange-400 font-semibold">2-5 Mbps</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quest tracking:</span>
                  <span className="text-blue-400 font-semibold">100-200 Kbps</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                  <span className="text-slate-400">Total bandwidth:</span>
                  <span className="text-green-400 font-semibold">~3 Mbps</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg">Capacity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Concurrent devices:</span>
                  <span className="text-purple-400 font-semibold">Up to 10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Requests/second:</span>
                  <span className="text-purple-400 font-semibold">100+</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
                  <span className="text-slate-400">Uptime:</span>
                  <span className="text-green-400 font-semibold">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status */}
        <div>
          <h2 className="text-3xl font-bold mb-6">System Status</h2>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Ray-Ban Meta Support</span>
                  <span className="text-green-400 font-semibold">● Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Meta Quest Support</span>
                  <span className="text-green-400 font-semibold">● Ready</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Multi-Device Sync</span>
                  <span className="text-green-400 font-semibold">● Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Spatial Audio</span>
                  <span className="text-green-400 font-semibold">● Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
