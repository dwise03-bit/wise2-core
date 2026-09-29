'use client';

import Link from 'next/link';
import { Footer } from '@/components/wise';

export default function AuditPage() {
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

          <h1 className="text-5xl font-bold mb-6" style={{ fontFamily: 'Orbitron' }}>
            AI Business Audit
          </h1>

          <div className="mb-12">
            <div className="text-4xl mb-4" style={{ color: '#39FF14' }}>
              $149
            </div>
            <p className="text-xl" style={{ color: '#8D98A5' }}>
              60 minutes of deep-dive business analysis and AI opportunity discovery
            </p>
          </div>

          <div className="prose prose-invert max-w-none mb-12">
            <h2 className="text-2xl font-bold mb-4">What You Get</h2>
            <ul className="space-y-3 mb-8">
              <li className="flex gap-3">
                <span style={{ color: '#39FF14' }}>✓</span>
                <span>Complete AI Readiness Score (0-100) for your business</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: '#39FF14' }}>✓</span>
                <span>Detailed opportunity report identifying automation potential</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: '#39FF14' }}>✓</span>
                <span>Quick-win recommendations you can implement immediately</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: '#39FF14' }}>✓</span>
                <span>90-day priority roadmap for your next steps</span>
              </li>
              <li className="flex gap-3">
                <span style={{ color: '#39FF14' }}>✓</span>
                <span>Recommendation for which WISE² service fits your needs</span>
              </li>
            </ul>

            <h2 className="text-2xl font-bold mb-4">Who Should Book This</h2>
            <p>
              Perfect for businesses wanting to understand their AI potential without committing to a larger engagement. This is
              our recommended starting point for most organizations.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">How It Works</h2>
            <ol className="space-y-3 list-decimal list-inside">
              <li>Answer our intake form (5 minutes)</li>
              <li>We review your business and systems</li>
              <li>60-minute live audit call</li>
              <li>Receive full report and recommendations</li>
              <li>Optional follow-up consultation</li>
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
            Start Your Audit →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
