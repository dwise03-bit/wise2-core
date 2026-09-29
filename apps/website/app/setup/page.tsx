'use client';

import { useState } from 'react';
import { Copy, Download, Terminal, Server, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PixelSlateSetupPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const Command = ({ label, text, id }: { label: string; text: string; id: string }) => (
    <div className="mb-4 bg-slate-950 border border-cyan-500/20 rounded-lg p-4">
      <p className="text-sm text-slate-400 mb-2">{label}</p>
      <div className="flex items-start gap-3">
        <code className="flex-1 text-cyan-400 font-mono text-sm break-all whitespace-pre-wrap">
          {text}
        </code>
        <button
          onClick={() => copyToClipboard(text, id)}
          className="flex-shrink-0 p-2 hover:bg-cyan-500/20 rounded transition-colors"
          title="Copy to clipboard"
        >
          <Copy className={`w-4 h-4 ${copied === id ? 'text-green-400' : 'text-cyan-400'}`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-16 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-8 h-8 text-neon-green" />
            <h1 className="text-4xl lg:text-5xl font-bold">Pixel Slate Dev Station</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl">
            Set up your Pixel Slate as a full WISE² development backup station in 5 minutes.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <a
            href="/setup/QUICKSTART.md"
            className="p-6 bg-gradient-to-br from-cyan-500/20 to-neon-green/20 border border-cyan-500/50 rounded-lg hover:border-neon-green/70 transition-all hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">Quick Start Guide</h3>
                <p className="text-sm text-slate-300">5-minute setup walkthrough</p>
              </div>
              <ArrowRight className="w-5 h-5 text-neon-green" />
            </div>
          </a>
          <a
            href="/setup/pixel-slate-setup.sh"
            className="p-6 bg-gradient-to-br from-gold/20 to-cyan-500/20 border border-gold/50 rounded-lg hover:border-gold/70 transition-all hover:shadow-lg hover:shadow-gold/20"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg mb-2">Setup Script</h3>
                <p className="text-sm text-slate-300">Automated installation</p>
              </div>
              <Download className="w-5 h-5 text-gold" />
            </div>
          </a>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-12">
          {/* Step 1 */}
          <div className="border-l-4 border-neon-green pl-8 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-neon-green text-slate-950 font-bold flex items-center justify-center">
                1
              </div>
              <h2 className="text-2xl font-bold">Pixel Slate Setup</h2>
            </div>
            <p className="text-slate-300 mb-4">
              Run the automated setup on your Pixel Slate Crostini terminal.
            </p>
            <Command
              label="Download and run setup script"
              text={`cd ~\ncurl -fsSL https://wise2.net/setup/pixel-slate-setup.sh -o setup.sh\nchmod +x setup.sh\nbash setup.sh`}
              id="step1"
            />
            <div className="bg-slate-900/50 border border-amber-500/30 rounded p-4 text-sm">
              <p className="text-amber-300 mb-2">⚠ Save your public key!</p>
              <p className="text-slate-400">
                At the end of setup, you'll see your SSH public key. Copy and save it for the next step.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-cyan-400 pl-8 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center justify-center">
                2
              </div>
              <h2 className="text-2xl font-bold">VPS Setup</h2>
            </div>
            <p className="text-slate-300 mb-4">
              Run setup on your VPS to prepare for Pixel Slate access.
            </p>
            <Command
              label="SSH to VPS and run setup"
              text={`ssh dwise@173.208.147.165\ncurl -fsSL https://wise2.net/setup/vps-setup.sh -o setup.sh\nbash setup.sh`}
              id="step2"
            />
            <div className="bg-slate-900/50 border border-cyan-500/30 rounded p-4 text-sm">
              <p className="text-cyan-300 mb-2">💾 Save your VPS Tailscale IP!</p>
              <p className="text-slate-400">
                The setup will print your VPS Tailscale IP (e.g., 100.x.x.y). You'll need this in the next step.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-gold pl-8 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gold text-slate-950 font-bold flex items-center justify-center">
                3
              </div>
              <h2 className="text-2xl font-bold">Add SSH Key</h2>
            </div>
            <p className="text-slate-300 mb-4">
              Add your Pixel Slate public key to the VPS authorized_keys.
            </p>
            <Command
              label="On VPS: Edit authorized_keys"
              text={`nano ~/.ssh/authorized_keys\n# Paste your public key from Step 1\n# Press Ctrl+O, Enter, Ctrl+X to save`}
              id="step3"
            />
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-emerald-400 pl-8 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-400 text-slate-950 font-bold flex items-center justify-center">
                4
              </div>
              <h2 className="text-2xl font-bold">Update SSH Config</h2>
            </div>
            <p className="text-slate-300 mb-4">
              Update your Pixel Slate SSH config with the VPS Tailscale IP.
            </p>
            <Command
              label="On Pixel Slate: Edit SSH config"
              text={`nano ~/.ssh/config\n# Find: HostName <VPS_TAILSCALE_IP>\n# Replace with your IP from Step 2\n# Press Ctrl+O, Enter, Ctrl+X to save`}
              id="step4"
            />
          </div>

          {/* Step 5 */}
          <div className="border-l-4 border-lime-400 pl-8 pb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-lime-400 text-slate-950 font-bold flex items-center justify-center">
                5
              </div>
              <h2 className="text-2xl font-bold">Test Connection</h2>
            </div>
            <p className="text-slate-300 mb-4">
              Verify everything works by connecting to your VPS.
            </p>
            <Command
              label="On Pixel Slate: Test SSH connection"
              text={`vps\n# Should connect without prompting for password`}
              id="step5"
            />
            <div className="bg-slate-900/50 border border-lime-500/30 rounded p-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-lime-400 flex-shrink-0 mt-0.5" />
                <p className="text-slate-300">
                  If connection succeeds, you're all set! Run <code className="text-cyan-400">wise2-health</code> to verify everything.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Commands Reference */}
        <div className="rounded-lg border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 p-8 backdrop-blur-sm mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            Available Commands
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { cmd: 'vps', desc: 'SSH to VPS' },
              { cmd: 'wise2-health', desc: 'System health check' },
              { cmd: 'wise2-backup', desc: 'Backup database & code' },
              { cmd: 'wise2-logs', desc: 'Stream live API logs' },
              { cmd: 'wise2-status', desc: 'Check API status' },
              { cmd: 'wise2-deploy', desc: 'Deploy latest code' },
              { cmd: 'wise2-tunnel-api', desc: 'Tunnel to API (3000)' },
              { cmd: 'wise2-tunnel-dashboard', desc: 'Tunnel to dashboard (3005)' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded border border-slate-700/50">
                <code className="text-neon-green font-mono flex-shrink-0">{item.cmd}</code>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-6">Troubleshooting</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-amber-300 mb-2">SSH Connection Fails</h3>
              <p className="text-slate-300 text-sm mb-3">Verify VPS Tailscale IP:</p>
              <Command
                label=""
                text={`ssh dwise@173.208.147.165 'tailscale ip -4'`}
                id="ts-verify"
              />
            </div>
            <div>
              <h3 className="font-bold text-amber-300 mb-2">Tailscale Disconnected</h3>
              <p className="text-slate-300 text-sm mb-3">Reconnect on both devices:</p>
              <Command
                label=""
                text={`# Pixel Slate\nsudo tailscale up\n\n# VPS\nsudo tailscale up`}
                id="ts-reconnect"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-700 text-center">
          <p className="text-slate-400 mb-4">
            Full documentation and troubleshooting guide available in{' '}
            <Link href="/setup/QUICKSTART.md" className="text-cyan-400 hover:text-cyan-300">
              QUICKSTART.md
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            Questions? Check logs with <code className="text-cyan-400">wise2-logs</code> or verify with{' '}
            <code className="text-cyan-400">wise2-health</code>
          </p>
        </div>
      </div>
    </div>
  );
}
