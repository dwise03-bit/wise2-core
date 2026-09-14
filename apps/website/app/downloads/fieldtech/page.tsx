'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Smartphone, AlertCircle } from 'lucide-react';

export default function FieldTechDownloadPage() {
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdateInfo = async () => {
      try {
        const res = await fetch('/api/ota/check/fieldtech');
        if (res.ok) {
          const data = await res.json();
          setUpdateInfo(data);
        }
      } catch (error) {
        console.log('Update check:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpdateInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-8 py-20">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold">WISE² FieldTech</h1>
          </div>
          <p className="text-xl text-slate-300">Motorola Razr OTA Update & Download</p>
        </div>

        {/* Download Card */}
        <div className="rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 p-8 backdrop-blur-sm mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Current Release</h2>
            {updateInfo && (
              <>
                <p className="text-slate-300 mb-4">
                  <span className="text-cyan-400 font-mono">v{updateInfo.version}</span>
                  {' '}• Build {updateInfo.buildCode}
                </p>
                <p className="text-sm text-slate-400">{updateInfo.releaseDate}</p>
              </>
            )}
          </div>

          {updateInfo && (
            <div className="mb-6 p-4 rounded bg-slate-900/50 border border-slate-700">
              <h3 className="font-semibold mb-2">What's New:</h3>
              <p className="text-slate-300 text-sm">{updateInfo.changelog}</p>
            </div>
          )}

          <a
            href="/downloads/fieldtech/wise2-fieldtech-razr-latest.apk"
            download
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 font-semibold transition-all"
          >
            <Download className="w-5 h-5" />
            Download APK
            {updateInfo && <span className="text-xs opacity-80">({Math.round(updateInfo.fileSize / 1048576)}MB)</span>}
          </a>
        </div>

        {/* Installation Instructions */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-4">📱 Installation</h3>
            <ol className="space-y-3 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="text-cyan-400 font-bold">1</span>
                <span>Download the APK file above</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-bold">2</span>
                <span>Enable "Install from unknown sources" in Settings</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-bold">3</span>
                <span>Open the APK file to install</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-bold">4</span>
                <span>App will auto-check for OTA updates</span>
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold mb-4">🔄 OTA Updates</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <p>
                ✅ <span className="text-emerald-400">Auto-updates enabled</span>
              </p>
              <p>
                The app checks for new versions every 24 hours and downloads updates automatically when connected to WiFi.
              </p>
              <p className="text-slate-400">
                No manual installation needed for future updates.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 rounded-lg border border-slate-700 bg-slate-900/40 p-8 backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-6">FieldTech Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <span className="text-emerald-400 text-xl">✓</span>
              <span>Motorola Razr Bluetooth 5.2 integration</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-400 text-xl">✓</span>
              <span>Real-time GPS tracking & routing</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-400 text-xl">✓</span>
              <span>Photo/video capture & documentation</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-400 text-xl">✓</span>
              <span>Offline-first with cloud sync</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-400 text-xl">✓</span>
              <span>Voice commands & hands-free operation</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-400 text-xl">✓</span>
              <span>Work order management & dispatch</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mt-12 p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-emerald-300">Ready for Field Deployment</h4>
            <p className="text-sm text-slate-300 mt-1">OTA update system is active. New updates deploy automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
