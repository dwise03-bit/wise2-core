'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/js';
import Button from '@/components/ui/Button';
import { AlertCircle, Check, Clock, DollarSign, User } from 'lucide-react';

interface PaymentFormProps {
  bookingId: string;
  amount: number; // in dollars
  consultantName: string;
  serviceName?: string;
  date?: string;
  time?: string;
  duration?: number; // in minutes
  onSuccess: () => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

// Inner form component that uses Stripe hooks
const PaymentFormContent: React.FC<PaymentFormProps> = ({
  bookingId,
  amount,
  consultantName,
  serviceName,
  date,
  time,
  duration,
  onSuccess,
  onError,
  disabled = false,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [cardholderName, setCardholderName] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system not initialized. Please refresh and try again.');
      onError('Stripe not initialized');
      return;
    }

    if (!cardholderName.trim()) {
      setError('Please enter the cardholder name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment method
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          name: cardholderName,
        },
      });

      if (pmError) {
        setError(pmError.message || 'Failed to create payment method');
        onError(pmError.message || 'Payment method error');
        setLoading(false);
        return;
      }

      // Call backend to create PaymentIntent
      const intentResponse = await fetch('/api/consulting/bookings/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          amount: Math.round(amount * 100), // Convert to cents
          paymentMethodId: paymentMethod.id,
          cardholderName,
        }),
      });

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await intentResponse.json();

      // Confirm payment
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        onError(confirmError.message || 'Payment confirmation error');
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // Call confirm endpoint
        const confirmResponse = await fetch(
          `/api/consulting/bookings/${bookingId}/confirm`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              amount,
            }),
          }
        );

        if (!confirmResponse.ok) {
          const errorData = await confirmResponse.json();
          throw new Error(
            errorData.error || 'Failed to confirm booking'
          );
        }

        setSuccess(true);
        setError(null);
        onSuccess();

        // Reset form after delay
        setTimeout(() => {
          if (formRef.current) {
            elements.getElement(CardElement)?.clear();
            setCardholderName('');
          }
        }, 2000);
      } else {
        setError('Payment was not completed successfully');
        onError('Payment incomplete');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Booking Summary */}
      <motion.div
        className="mb-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-lg font-bold text-white mb-6">Booking Summary</h3>

        <div className="space-y-4">
          {/* Consultant */}
          <motion.div
            className="flex items-center gap-3 pb-4 border-b border-slate-700"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User size={20} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400">Consultant</p>
              <p className="text-sm font-semibold text-white">{consultantName}</p>
            </div>
          </motion.div>

          {/* Service */}
          {serviceName && (
            <motion.div
              className="flex items-start gap-3 pb-4 border-b border-slate-700"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mt-0.5">
                <span className="text-purple-400">📋</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Service</p>
                <p className="text-sm font-semibold text-white">{serviceName}</p>
              </div>
            </motion.div>
          )}

          {/* Date & Time */}
          {(date || time) && (
            <motion.div
              className="flex items-start gap-3 pb-4 border-b border-slate-700"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mt-0.5">
                <Clock size={20} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400">Scheduled For</p>
                <p className="text-sm font-semibold text-white">
                  {date && <span>{date}</span>}
                  {date && time && <span className="text-slate-400 mx-2">•</span>}
                  {time && <span>{time}</span>}
                </p>
                {duration && (
                  <p className="text-xs text-slate-500 mt-1">
                    Duration: {duration} minutes
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Price */}
          <motion.div
            className="flex items-center justify-between pt-4"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign size={20} className="text-green-400" />
              </div>
              <span className="text-sm text-slate-400">Total Amount</span>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-400">
                ${amount.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500">USD</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Payment Form */}
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl p-8 border border-green-500/30 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Check size={32} className="text-green-400" />
            </motion.div>
            <h4 className="text-xl font-bold text-white mb-2">Payment Successful!</h4>
            <p className="text-sm text-slate-400 mb-4">
              Your booking has been confirmed. A confirmation email will be sent shortly.
            </p>
            <p className="text-xs text-slate-500">Booking ID: {bookingId}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="John Doe"
                disabled={loading || disabled}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Card Element */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Card Details
              </label>
              <motion.div
                className="p-4 bg-slate-800/50 border border-slate-600 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#e2e8f0',
                        '::placeholder': {
                          color: '#64748b',
                        },
                      },
                      invalid: {
                        color: '#ef4444',
                      },
                    },
                    disabled: loading || disabled,
                  }}
                />
              </motion.div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-500/30 rounded-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle
                    size={20}
                    className="text-red-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-red-300">
                      Payment Failed
                    </p>
                    <p className="text-xs text-red-200 mt-1">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Security Notice */}
            <motion.p
              className="text-xs text-slate-500 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              🔒 Your payment information is secure and encrypted by Stripe
            </motion.p>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!stripe || !elements || loading || disabled}
              isLoading={loading}
              className="w-full mt-6"
            >
              {loading ? 'Processing Payment...' : `Pay $${amount.toFixed(2)}`}
            </Button>

            {/* Secondary Action */}
            <p className="text-xs text-slate-500 text-center">
              Need help?{' '}
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 transition-colors"
                onClick={() =>
                  onError('User clicked help - contact support needed')
                }
              >
                Contact support
              </button>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * PaymentForm Component
 *
 * Stripe-integrated payment form for consulting bookings
 *
 * Usage:
 * ```tsx
 * import { PaymentForm } from '@/components/consulting/PaymentForm';
 *
 * <PaymentForm
 *   bookingId="booking-123"
 *   amount={299.99}
 *   consultantName="Jane Doe"
 *   serviceName="Strategy Consultation"
 *   date="2024-08-15"
 *   time="2:00 PM"
 *   duration={60}
 *   onSuccess={() => router.push('/success')}
 *   onError={(error) => console.error(error)}
 * />
 * ```
 *
 * @requires @stripe/react-stripe-js
 * @requires @stripe/js
 * @requires Stripe publishable key in NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY env var
 */
export const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    console.error('Stripe publishable key not configured');
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
        Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        environment variable.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm;
