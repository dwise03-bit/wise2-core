'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function CheckoutSuccessContent() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="mb-6 flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <CheckCircle2 className="w-20 h-20 text-[#2CD588]" />
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
        <p className="text-[#C5C5C5] mb-8 text-lg">
          Thank you for subscribing to WISE². Your account is now active and ready to use.
        </p>

        <div className="bg-[#0055FF]/10 border border-[#0055FF]/30 rounded-lg p-6 mb-8">
          <p className="text-sm text-[#C5C5C5] mb-4">
            Check your email for setup instructions and login details.
          </p>
          <p className="text-xs text-[#C5C5C5]">
            Account activation email sent to your registered email address.
          </p>
        </div>

        <Link
          href="/studio"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#0055FF] hover:bg-[#2A7AFF] text-white rounded-lg font-semibold transition-all duration-300"
        >
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
