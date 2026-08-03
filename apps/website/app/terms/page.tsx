import Link from 'next/link';
import { Footer } from '@/components/wise';

export default function TermsPage() {
  return (
    <>
      <main className="min-h-screen bg-[#050505] text-white">
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20">
          <div className="mb-12">
            <div
              className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest mb-6"
              style={{ background: 'rgba(0,148,255,0.1)', border: '1px solid rgba(0,148,255,0.3)', color: '#0094FF' }}
            >
              LEGAL
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-gray-400">Last updated: July 26, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using WISE² (&quot;the Service&quot;), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
              <p>
                WISE² is an AI-native business operating system that provides tools for business automation, analytics, consulting, and operations management. The Service is provided on a subscription basis with plans as described on our pricing page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
              <p>
                To access certain features of the Service, you must register for an account. You agree to provide accurate information and to keep this information updated. You are responsible for all activity under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Subscription and Billing</h2>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Subscriptions begin with a 14-day free trial for eligible plans</li>
                <li>Billing is processed monthly or annually depending on your selected plan</li>
                <li>You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period</li>
                <li>Refunds are handled on a case-by-case basis; contact support@wise2.net</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Use the Service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Transmit any harmful, offensive, or disruptive content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by WISE² and are protected by international copyright, trademark, and other intellectual property laws. Your business data remains your property.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
              <p>
                WISE² shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Our total liability to you for any claims under these terms shall not exceed the amount you paid us in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify you of significant changes via email or a prominent notice on the Service. Continued use of the Service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Contact</h2>
              <p>
                Questions about these Terms should be directed to{' '}
                <a href="mailto:legal@wise2.net" style={{ color: '#0094FF' }}>legal@wise2.net</a>{' '}
                or through our <Link href="/contact" style={{ color: '#0094FF' }}>contact page</Link>.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex gap-6">
            <Link href="/privacy" className="text-sm" style={{ color: '#0094FF' }}>Privacy Policy →</Link>
            <Link href="/contact" className="text-sm" style={{ color: '#0094FF' }}>Contact Us →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
