import Link from 'next/link';
import { Footer } from '@/components/wise';

export default function PrivacyPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: July 26, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p>When you use WISE², we collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Name, email address, and business information when you create an account or contact us</li>
                <li>Payment information processed securely through Stripe</li>
                <li>Business data you input into the WISE² platform</li>
                <li>Usage data and analytics about how you interact with our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Personalize your experience with WISE²</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties except as described in this policy. We may share your information with trusted third parties who assist us in operating our platform (such as Stripe for payment processing), provided those parties agree to keep this information confidential.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All payment information is processed by Stripe and is never stored on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@wise2.net" style={{ color: '#0094FF' }}>privacy@wise2.net</a>{' '}
                or through our <Link href="/contact" style={{ color: '#0094FF' }}>contact page</Link>.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-white/10 flex gap-6">
            <Link href="/terms" className="text-sm" style={{ color: '#0094FF' }}>Terms of Service →</Link>
            <Link href="/contact" className="text-sm" style={{ color: '#0094FF' }}>Contact Us →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
