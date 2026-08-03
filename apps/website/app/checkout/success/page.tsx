import Link from 'next/link';
import { Footer } from '@/components/wise';
import { DASHBOARD_URL } from '@/lib/urls';

export default function CheckoutSuccessPage() {
  return (
    <>
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="text-7xl mb-8 animate-bounce">
              ✓
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Payment <span className="text-[#0094FF]">Successful!</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8">
              Welcome to WISE². Your subscription is active. Let&apos;s get your business set up.
            </p>

            {/* Details Card */}
            <div className="bg-wise-bg-secondary border-2 border-[#0094FF]/30 rounded-3xl p-8 md:p-12 mb-8">
              <div className="space-y-6 text-left">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Subscription Status</p>
                  <p className="text-2xl font-bold text-[#0094FF]">Active ✓</p>
                </div>

                <div className="border-t border-[#0094FF]/20 pt-6">
                  <p className="text-gray-300 text-sm mb-4 font-semibold">Here&apos;s what happens next:</p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(0,148,255,0.2)', color: '#0094FF' }}>1</div>
                      <div>
                        <p className="text-white font-semibold">Complete your business setup</p>
                        <p className="text-gray-400 text-sm">Takes about 5 minutes — tells us how to configure WISE² for you</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(0,148,255,0.2)', color: '#0094FF' }}>2</div>
                      <div>
                        <p className="text-white font-semibold">A WISE² consultant will reach out</p>
                        <p className="text-gray-400 text-sm">We review your setup and schedule your implementation call</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: 'rgba(0,148,255,0.2)', color: '#0094FF' }}>3</div>
                      <div>
                        <p className="text-white font-semibold">Enter the WISE² Command Center</p>
                        <p className="text-gray-400 text-sm">Your AI operating system goes live</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4">
              <Link
                href="/onboarding"
                className="px-8 py-4 bg-[#0094FF] text-[#050505] rounded-lg font-bold text-lg hover:brightness-110 transition-all duration-300 inline-block"
                style={{ boxShadow: '0 0 24px rgba(0,148,255,0.4)' }}
              >
                SET UP MY BUSINESS →
              </Link>
              <a
                href={DASHBOARD_URL}
                className="px-8 py-4 bg-wise-bg-secondary border-2 border-[#0094FF]/40 text-[#0094FF] rounded-lg font-bold text-lg hover:border-[#0094FF]/60 transition-all duration-300 inline-block"
              >
                Go to Command Center
              </a>
            </div>

            {/* Support */}
            <div className="mt-12 pt-8 border-t border-[#0094FF]/20">
              <p className="text-gray-300 mb-4">
                Need help? Our support team is here for you.
              </p>
              <a
                href="mailto:support@wise2.net"
                className="text-[#0094FF] hover:brightness-110 font-semibold"
              >
                Contact Support →
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
