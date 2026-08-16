import Link from 'next/link';
import { PublicFooter } from '@/components/navigation';

export default function CheckoutCancelPage() {
  return (
    <>
      <main className="bg-[#050505] min-h-screen pt-32 pb-20 flex items-center justify-center text-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Canceled Icon */}
            <div className="text-7xl mb-8">
              ⏸️
            </div>

            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-[0.08em] text-white mb-4">
              Checkout <span className="text-[#C7FF2E]">Paused</span>
            </h1>

            <p className="text-xl text-[#B7BDC8] mb-8">
              No problem. Nothing was charged, and you can jump back in anytime.
            </p>

            {/* Details Card */}
            <div className="bg-white/[0.04] border-2 border-[#C7FF2E]/30 rounded-3xl p-8 md:p-12 mb-8">
              <div className="space-y-6 text-left">
                <div>
                  <p className="text-gray-300 text-sm mb-1">What Happened</p>
                  <p className="text-white">You left the checkout page before completing your purchase.</p>
                </div>

                <div className="border-t border-[#C7FF2E]/20 pt-6">
                  <p className="text-gray-300 text-sm mb-2">Why cancel?</p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Need more time to decide? No rush!</li>
                    <li>• Questions about the plan? Contact our team</li>
                    <li>• Want to explore more features? Check out the pricing page</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/pricing"
                className="px-8 py-4 bg-[#C7FF2E] text-black rounded-lg font-bold text-lg hover:brightness-110 transition-all duration-300 inline-block"
              >
                Back to Pricing
              </Link>
              <Link
                href="/"
                className="px-8 py-4 bg-white/[0.04] border-2 border-[#C7FF2E]/40 text-[#C7FF2E] rounded-lg font-bold text-lg hover:border-[#C7FF2E]/60 transition-all duration-300 inline-block"
              >
                Back to Home
              </Link>
            </div>

            {/* Support */}
            <div className="mt-12 pt-8 border-t border-[#C7FF2E]/20">
              <p className="text-gray-300 mb-4">
                Have questions? We're here to help!
              </p>
              <a
                href="mailto:sales@wise2.net"
                className="text-[#C7FF2E] hover:brightness-110 font-semibold"
              >
                Contact Our Sales Team →
              </a>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
