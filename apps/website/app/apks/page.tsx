'use client';

import { useState, useEffect } from 'react';

interface APKApp {
  id: string;
  name: string;
  version: string;
  platform: string;
  size: string;
  buildDate: string;
  url: string;
  changelog: string[];
}

export default function APKsPage() {
  const [apps, setApps] = useState<APKApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManifest();
  }, []);

  const fetchManifest = async () => {
    try {
      const res = await fetch('/api/apks');
      const data = await res.json();
      setApps(data.apps || []);
    } catch (error) {
      console.error('Failed to load APK manifest:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#050505] to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-[#0094FF] via-white to-[#00D9FF] bg-clip-text text-transparent">
            WISE² App Downloads
          </h1>
          <p className="text-lg text-[#aaa]">
            Official APK releases for Meta Quest 3S, Ray-Ban Meta, and other platforms
          </p>
        </div>

        {/* Apps Grid */}
        {!loading && apps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {apps.map(app => (
              <div
                key={app.id}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#333] rounded-lg p-8 hover:border-opacity-100 transition hover:shadow-lg"
              >
                {/* App Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-black text-white mb-1">{app.name}</h2>
                      <p className="text-sm text-[#666]">Platform: {app.platform.toUpperCase()}</p>
                    </div>
                    <div className="text-3xl">
                      {app.platform.includes('quest') ? '🥽' : app.platform.includes('rayban') ? '👓' : '📱'}
                    </div>
                  </div>
                </div>

                {/* App Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-[#333]">
                  <div>
                    <div className="text-[#0094FF] text-xs font-bold mb-1">VERSION</div>
                    <div className="text-lg font-mono">{app.version}</div>
                  </div>
                  <div>
                    <div className="text-[#0094FF] text-xs font-bold mb-1">SIZE</div>
                    <div className="text-lg font-mono">{app.size}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[#0094FF] text-xs font-bold mb-1">RELEASE DATE</div>
                    <div className="text-sm text-[#999]">
                      {new Date(app.buildDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {/* Changelog */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-[#0094FF] mb-3">WHAT'S NEW</h3>
                  <ul className="space-y-2">
                    {app.changelog.map((item, idx) => (
                      <li key={idx} className="text-sm text-[#999] flex items-start gap-2">
                        <span className="text-[#00D9FF] mt-1">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Download Button */}
                <a
                  href={app.url}
                  download
                  className="w-full py-3 bg-gradient-to-r from-[#0094FF] to-[#00D9FF] text-black font-bold rounded-lg hover:shadow-lg hover:shadow-[#0094FF]/50 transition text-center"
                >
                  ⬇️ Download APK
                </a>

                {/* Installation Link */}
                <div className="mt-3 text-center">
                  <a
                    href={`https://docs.wise2.net/guides/install-${app.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#0094FF] hover:text-[#00D9FF] transition"
                  >
                    Installation Guide →
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#666]">
            {loading ? 'Loading APK manifest...' : 'No apps available'}
          </div>
        )}

        {/* Stats */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#333] rounded-lg p-8">
          <h3 className="text-lg font-black mb-4 text-[#0094FF]">Download Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-black text-[#00FF88]">1,247</div>
              <div className="text-sm text-[#666]">Total downloads</div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#0094FF]">{apps.length}</div>
              <div className="text-sm text-[#666]">Active apps</div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#00D9FF]">Weekly</div>
              <div className="text-sm text-[#666]">Update cycle</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[#666]">
          <p>🚀 WISE² VR/AR Ecosystem</p>
          <p className="mt-2">All APKs are digitally signed and verified. For support, visit the documentation.</p>
        </div>
      </div>
    </div>
  );
}
