'use client';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
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
          <AlertCircle className="w-20 h-20 text-[#FF5535]" />
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-4">Payment Cancelled</h1>
        <p className="text-[#C5C5C5] mb-8 text-lg">
          Your payment was cancelled. No charges have been made to your account.
        </p>

        <div className="bg-[#FF5535]/10 border border-[#FF5535]/30 rounded-lg p-6 mb-8">
          <p className="text-sm text-[#C5C5C5]">
            If you'd like to try again or have questions, our support team is here to help.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#0055FF] hover:bg-[#2A7AFF] text-white rounded-lg font-semibold transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Pricing
          </Link>
          <Link
            href="/"
            className="text-[#C5C5C5] hover:text-white transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
