'use client';

import Link from 'next/link';
import { Footer } from '@/components/wise';

export default function LiveBuildPage() {
  return (
    <>
      <main className="min-h-screen bg-[#050505] text-white">
        <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
          <Link
            href="/consulting"
            className="text-sm font-bold mb-8 inline-block"
            style={{ color: '#39FF14' }}
          >
            ← Back to Services
          </Link>

          <div
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
            style={{ background: 'rgba(57, 255, 20, 0.12)', border: '1px solid rgba(57, 255, 20, 0.35)', color: '#39FF14' }}
          >
            MOST POPULAR
          </div>

          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'Orbitron' }}>
            WISE² Live Build Session
          </h1>

          <div className="mb-12">
            <div className="text-4xl mb-4" style={{ color: '#39FF14' }}>
              $497
            </div>
            <p className="text-xl" style={{ color: '#8D98A5' }}>
              60 minutes of hands-on building. You choose the project, we build it LIVE with you.
            </p>
          </div>

          <div className="prose prose-invert max-w-none mb-12">
            <h2 className="text-2xl font-bold mb-4">What You Get</h2>
            <ul className="space-y-3 mb-8">
              <li className="flex gap-3">
                <span style={{ color: '#39FF14' }}>✓</span>
                <span>Custom implementation built in real-time during your session</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: '#39FF14' }}>✓</span>
                <span>Working code/system you can use immediately</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: '#39FF14' }}>✓</span>
                <span>Full documentation and setup guides</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: '#39FF14' }}>✓</span>
                <span>Integration with your existing systems</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: '#39FF14' }}>✓</span>
                <span>30-day follow-up support included</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Possible Build Projects</h2>
            <p>
              Website page • Landing page • AI assistant • Lead capture system • CRM automation • Scheduled email workflows
              • AI content generation • Customer intake system • Booking workflow • Internal dashboard • Business automation
              • Knowledge base • Existing system improvement
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">How It Works</h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li>Tell us what you want to build in the intake form</li>
              <li>We review and confirm scope for 60 minutes</li>
              <li>You join a video call with our team</li>
              <li>We build your project live, explaining each step</li>
              <li>You leave with working implementation + documentation</li>
            </ol>
          </div>

          <Link
            href="/intake"
            className="inline-block px-10 py-5 rounded-xl font-black text-lg transition-all duration-200"
            style={{
              background: '#39FF14',
              color: '#050505',
              boxShadow: '0 0 25px rgba(57, 255, 20, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 35px rgba(57, 255, 20, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 25px rgba(57, 255, 20, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Book Your Live Build →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
