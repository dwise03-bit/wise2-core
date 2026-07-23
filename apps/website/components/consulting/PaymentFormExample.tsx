'use client';

/**
 * PaymentFormExample Component
 *
 * Complete example showing how to integrate PaymentForm into a booking page.
 * This demonstrates the full workflow from booking details to payment to confirmation.
 *
 * Usage:
 * ```tsx
 * import PaymentFormExample from '@/components/consulting/PaymentFormExample';
 *
 * // In a page or route
 * export default function BookingPage() {
 *   return <PaymentFormExample bookingId="booking-123" />;
 * }
 * ```
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentForm } from './PaymentForm';
import Button from '@/components/ui/Button';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface BookingDetails {
  id: string;
  consultantName: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  hourlyRate: number;
  totalPrice: number;
  timezone: string;
}

interface PaymentFormExampleProps {
  bookingId: string;
  onClose?: () => void;
}

const mockBookingDetails: Record<string, BookingDetails> = {
  'booking-123': {
    id: 'booking-123',
    consultantName: 'Sarah Chen',
    serviceName: 'Brand Strategy Consultation',
    date: 'August 15, 2024',
    time: '2:00 PM EDT',
    duration: 60,
    hourlyRate: 299.99,
    totalPrice: 299.99,
    timezone: 'America/New_York',
  },
  'booking-456': {
    id: 'booking-456',
    consultantName: 'Marcus Rodriguez',
    serviceName: 'AI Implementation Workshop',
    date: 'August 20, 2024',
    time: '10:00 AM PST',
    duration: 90,
    hourlyRate: 199.99,
    totalPrice: 299.99,
    timezone: 'America/Los_Angeles',
  },
};

export default function PaymentFormExample({
  bookingId,
  onClose,
}: PaymentFormExampleProps) {
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Simulate fetching booking details
  useEffect(() => {
    const timer = setTimeout(() => {
      const details = mockBookingDetails[bookingId];
      if (details) {
        setBooking(details);
        setError(null);
      } else {
        setError(`Booking ${bookingId} not found`);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [bookingId]);

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <motion.div
            className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-slate-400">Loading booking details...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !booking) {
    return (
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Booking Not Found</h3>
          <p className="text-sm text-slate-400 mb-6">
            {error || 'Unable to load booking details. Please try again.'}
          </p>
          <Button variant="primary" onClick={onClose}>
            Go Back
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-6">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-3xl font-bold text-white">Complete Your Booking</h1>
          </div>
          <p className="text-slate-400">
            Review your consultation details and complete payment to confirm your booking.
          </p>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {paymentComplete ? (
            // Success state
            <motion.div
              key="success"
              className="space-y-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-12 text-center border border-green-500/30">
                <motion.div
                  className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <CheckCircle size={48} className="text-green-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Booking Confirmed!
                </h2>
                <p className="text-slate-400 mb-8">
                  Your consultation with {booking.consultantName} has been confirmed.
                </p>

                <div className="bg-slate-800/50 rounded-lg p-6 mb-8 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Consultant
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {booking.consultantName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Service
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {booking.serviceName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Date & Time
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {booking.date}
                        <br />
                        {booking.time}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        Duration
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {booking.duration} minutes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6 mb-8">
                  <p className="text-sm text-blue-300 mb-2 font-semibold">
                    Next Steps:
                  </p>
                  <ul className="text-sm text-blue-200 space-y-2">
                    <li>• You will receive a confirmation email with meeting details</li>
                    <li>• A calendar invite will be sent to your registered email</li>
                    <li>• The meeting link will be provided 24 hours before</li>
                    <li>• Check your spam folder if you don't see the email</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => (window.location.href = '/')}
                    className="flex-1"
                  >
                    Back to Home
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => (window.location.href = '/consulting')}
                    className="flex-1"
                  >
                    View More Services
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Payment form
            <motion.div
              key="form"
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Left: Booking Details Summary */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
                  <h2 className="text-2xl font-bold text-white mb-8">
                    Consultation Details
                  </h2>

                  <div className="space-y-8">
                    {/* Consultant Card */}
                    <motion.div
                      className="flex gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600 hover:border-blue-500/50 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">👤</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">
                          Consultant
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {booking.consultantName}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Expert consultant with 10+ years of experience
                        </p>
                      </div>
                    </motion.div>

                    {/* Service Card */}
                    <motion.div
                      className="flex gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600 hover:border-purple-500/50 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">📋</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">
                          Service
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {booking.serviceName}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Custom consultation tailored to your needs
                        </p>
                      </div>
                    </motion.div>

                    {/* Date & Time Card */}
                    <motion.div
                      className="flex gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600 hover:border-orange-500/50 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">📅</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">
                          Scheduled For
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {booking.date}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {booking.time} ({booking.timezone})
                        </p>
                      </div>
                    </motion.div>

                    {/* Duration Card */}
                    <motion.div
                      className="flex gap-4 p-4 rounded-xl bg-slate-700/30 border border-slate-600 hover:border-green-500/50 transition-colors"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">⏱️</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 uppercase tracking-wide">
                          Duration
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {booking.duration} minutes
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Virtual consultation via video call
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Pricing Summary */}
                  <motion.div
                    className="mt-8 pt-8 border-t border-slate-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-slate-400">
                        ${booking.hourlyRate}/hour
                      </span>
                      <span className="text-slate-300">×</span>
                      <span className="text-slate-400">
                        {booking.duration / 60} hour(s)
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-2xl font-bold">
                      <span className="text-white">Total:</span>
                      <span className="text-green-400">
                        ${booking.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Right: Payment Form */}
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  {paymentError && (
                    <motion.div
                      className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <p className="text-sm text-red-300">{paymentError}</p>
                    </motion.div>
                  )}

                  <PaymentForm
                    bookingId={booking.id}
                    amount={booking.totalPrice}
                    consultantName={booking.consultantName}
                    serviceName={booking.serviceName}
                    date={booking.date}
                    time={booking.time}
                    duration={booking.duration}
                    onSuccess={() => {
                      setPaymentComplete(true);
                      setPaymentError(null);
                    }}
                    onError={(error) => {
                      setPaymentError(error);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Example page integration:
 *
 * pages/booking/[bookingId]/payment.tsx
 * ```tsx
 * import PaymentFormExample from '@/components/consulting/PaymentFormExample';
 * import { useRouter } from 'next/navigation';
 *
 * export default function BookingPaymentPage({
 *   params,
 * }: {
 *   params: { bookingId: string };
 * }) {
 *   const router = useRouter();
 *
 *   return (
 *     <PaymentFormExample
 *       bookingId={params.bookingId}
 *       onClose={() => router.back()}
 *     />
 *   );
 * }
 * ```
 */
