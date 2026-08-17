'use client';
import Link from 'next/link';
export default function SoundLabPage() {
  return (
    <div className="min-h-screen bg-black text-white"><nav className="fixed top-0 w-full z-50 border-b border-gray-800"><div className="max-w-7xl mx-auto px-6 py-4 flex justify-between"><Link href="/" className="flex items-center gap-2"><div className="text-2xl font-black">W2</div><div className="text-sm text-gray-400">SOUNDLAB</div></Link><Link href="/" className="text-sm text-gray-300">← Back</Link></div></nav><section className="pt-32 pb-24 px-6"><div className="max-w-6xl mx-auto text-center"><h1 className="text-5xl font-black mb-6">🎵 SOUNDLAB</h1><p className="text-3xl font-bold text-blue-400 mb-6">Professional Audio Branding</p><Link href="/auth/signup" className="inline-block px-8 py-4 bg-blue-600 text-white rounded font-bold">Start Now</Link></div></section></div>
  );
}
