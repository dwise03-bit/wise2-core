import Link from 'next/link';
import { Navigation, Footer } from '@/components/wise';
import { DASHBOARD_URL } from '@/lib/urls';

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Success Icon */}
            <div className="text-7xl mb-8 animate-bounce">
              ✓
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Payment <span className="text-wise-accent-green">Successful!</span>
            </h1>

            <p className="text-xl text-wise-text-secondary mb-8">
              Welcome to WISE². Your subscription is now active and ready to use.
            </p>

            {/* Details Card */}
            <div className="bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl p-8 md:p-12 mb-8">
              <div className="space-y-6 text-left">
                <div>
                  <p className="text-wise-text-secondary text-sm mb-1">Subscription Status</p>
                  <p className="text-2xl font-bold text-wise-accent-green">Active</p>
                </div>

                <div className="border-t border-wise-accent-green/20 pt-6">
                  <p className="text-wise-text-secondary text-sm mb-2">What's Next:</p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-wise-accent-green font-bold">1.</span>
                      <span className="text-white">Check your email for a confirmation and receipt</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-wise-accent-green font-bold">2.</span>
                      <span className="text-white">Log in to your dashboard to access all features</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-wise-accent-green font-bold">3.</span>
                      <span className="text-white">Start building with your new plan</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href={DASHBOARD_URL}
                className="px-8 py-4 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold text-lg hover:brightness-110 transition-all duration-300 inline-block"
              >
                Go to Dashboard
              </a>
              <Link
                href="/"
                className="px-8 py-4 bg-wise-bg-secondary border-2 border-wise-accent-green/40 text-wise-accent-green rounded-lg font-bold text-lg hover:border-wise-accent-green/60 transition-all duration-300 inline-block"
              >
                Back to Home
              </Link>
            </div>

            {/* Support */}
            <div className="mt-12 pt-8 border-t border-wise-accent-green/20">
              <p className="text-wise-text-secondary mb-4">
                Need help? Our support team is here for you.
              </p>
              <a
                href="mailto:support@wise2.net"
                className="text-wise-accent-green hover:brightness-110 font-semibold"
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
