'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Check,
  ArrowRight,
  Calendar,
  Clock,
  DollarSign,
  Mail,
  Copy,
  Download,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { Footer } from '@/components/wise';

interface BookingConfirmation {
  id: string;
  serviceId: string;
  consultantId: string;
  consultantName: string;
  consultantEmail: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  timezone: string;
  totalPrice: number;
  meetingLink?: string;
}

export default function BookingSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const serviceId = params.serviceId as string;

  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Booking ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/consulting/bookings/${bookingId}`);
        if (!response.ok) throw new Error('Failed to fetch booking');
        const data = await response.json();
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load booking confirmation');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const copyConfirmationNumber = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadCalendarFile = () => {
    if (!booking) return;

    const dateObj = new Date(booking.date + 'T' + booking.time);
    const endTime = new Date(dateObj.getTime() + booking.duration * 60 * 60 * 1000);

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WISE²//Consultation Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${booking.id}@wise2.net
DTSTAMP:${new Date().toISOString().replace(/[:-]/g, '').split('.')[0]}Z
DTSTART:${booking.date.replace(/-/g, '')}T${booking.time.replace(/:/g, '')}00Z
DTEND:${endTime.toISOString().replace(/[:-]/g, '').split('.')[0]}Z
SUMMARY:Consultation with ${booking.consultantName}
DESCRIPTION:${booking.serviceName} consultation
LOCATION:${booking.meetingLink || 'Meeting link to be sent'}
ORGANIZER:${booking.consultantEmail}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/calendar;charset=utf-8,' + encodeURIComponent(icsContent));
    element.setAttribute('download', `consultation_${booking.id}.ics`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (loading) {
    return (
      <>
        <main className="bg-wise-bg-primary min-h-screen pt-20 pb-20">
          <div className="max-w-3xl mx-auto px-6 flex items-center justify-center h-96">
            <Loader className="animate-spin text-[#0094FF]" size={40} />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <main className="bg-wise-bg-primary min-h-screen pt-20 pb-20">
          <div className="max-w-3xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-wise-accent-red/30 bg-gradient-to-br from-red-900/10 to-red-800/5 p-6 flex gap-4"
            >
              <AlertCircle className="text-wise-accent-red flex-shrink-0" size={24} />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Error</h3>
                <p className="text-gray-400 mb-4">{error || 'Booking not found'}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(`/consulting/${serviceId}`)}
                  className="px-4 py-2 bg-[#0094FF] text-wise-bg-primary font-bold rounded-lg hover:bg-green-600"
                >
                  Back to Service
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const bookingDate = new Date(booking.date + 'T00:00:00');
  const formattedDate = bookingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <>
      <main className="bg-wise-bg-primary min-h-screen pt-12 pb-20">
        {/* Background Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-1/4 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className="flex justify-center mb-8"
          >
            <div className="w-20 h-20 rounded-full bg-[#0094FF]/20 border-2 border-[#0094FF] flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              >
                <Check className="text-[#0094FF]" size={48} />
              </motion.div>
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold text-white mb-4">
              Booking Confirmed!
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-gray-400 mb-2">
              Your consultation has been successfully scheduled
            </motion.p>
            <motion.p variants={itemVariants} className="text-gray-500">
              A confirmation email has been sent to {booking.consultantEmail}
            </motion.p>
          </motion.div>

          {/* Confirmation Number Card */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#0094FF]/10 border border-[#0094FF]/30 rounded-xl p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Confirmation Number</p>
                <p className="text-2xl md:text-3xl font-mono font-bold text-white">{booking.id}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={copyConfirmationNumber}
                className="px-4 py-2 bg-[#0094FF]/20 hover:bg-[#0094FF]/30 border border-[#0094FF]/50 rounded-lg text-[#0094FF] font-bold flex items-center gap-2 transition-all"
              >
                <Copy size={16} />
                {copied ? 'Copied!' : 'Copy'}
              </motion.button>
            </div>
          </motion.div>

          {/* Booking Details Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            {/* Service & Consultant */}
            <motion.div
              variants={itemVariants}
              className="bg-wise-bg-secondary border border-wise-surface-3 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Service & Consultant</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Service</p>
                  <p className="text-lg font-bold text-white">{booking.serviceName}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Consultant</p>
                  <p className="text-lg font-bold text-white">{booking.consultantName}</p>
                </div>
              </div>
            </motion.div>

            {/* Date & Time */}
            <motion.div
              variants={itemVariants}
              className="bg-wise-bg-secondary border border-wise-surface-3 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Scheduled Date & Time</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="text-[#0094FF]" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Date</p>
                    <p className="font-bold text-white">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-[#0094FF]" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Time</p>
                    <p className="font-bold text-white">
                      {booking.time} ({booking.timezone})
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Duration & Price */}
            <motion.div
              variants={itemVariants}
              className="bg-[#0094FF]/10 border border-[#0094FF]/30 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Duration & Price</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="text-[#0094FF]" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Duration</p>
                    <p className="font-bold text-white">{booking.duration} hour{booking.duration > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="text-[#0094FF]" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Total Amount</p>
                    <p className="font-bold text-[#0094FF] text-lg">${booking.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Consultant Contact */}
            <motion.div
              variants={itemVariants}
              className="bg-wise-bg-secondary border border-wise-surface-3 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Consultant Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="text-[#0094FF]" size={20} />
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="font-bold text-white break-all">{booking.consultantEmail}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Meeting Link (if available) */}
          {booking.meetingLink && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8"
            >
              <h3 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                Meeting Link
              </h3>
              <div className="flex items-center justify-between gap-4">
                <a
                  href={booking.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 break-all"
                >
                  {booking.meetingLink}
                </a>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open(booking.meetingLink, '_blank')}
                  className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 font-bold transition-all flex-shrink-0"
                >
                  Open Link
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col md:flex-row gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={downloadCalendarFile}
              className="flex-1 px-6 py-3 bg-wise-bg-secondary border border-wise-surface-3 hover:border-[#0094FF]/50 rounded-lg text-white font-bold transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Add to Calendar (.ics)
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/consulting')}
              className="flex-1 px-6 py-3 bg-[#0094FF] hover:bg-green-600 rounded-lg text-wise-bg-primary font-bold transition-all flex items-center justify-center gap-2"
            >
              Book Another Consultation
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>

          {/* Info Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-12 bg-wise-bg-secondary/50 border border-wise-surface-3 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">What Happens Next?</h3>
            <ol className="space-y-3 text-gray-400">
              <li className="flex gap-3">
                <span className="text-[#0094FF] font-bold flex-shrink-0">1.</span>
                <span>You'll receive a confirmation email with meeting details within the next 5 minutes</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0094FF] font-bold flex-shrink-0">2.</span>
                <span>Your consultant will send you a meeting link 24 hours before your scheduled consultation</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0094FF] font-bold flex-shrink-0">3.</span>
                <span>Join the meeting at the scheduled time using the provided link</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#0094FF] font-bold flex-shrink-0">4.</span>
                <span>You'll receive a summary and action items via email after the consultation</span>
              </li>
            </ol>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
