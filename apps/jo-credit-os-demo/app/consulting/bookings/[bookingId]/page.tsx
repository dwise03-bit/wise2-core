'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Video,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  Loader,
  X,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  CheckCircle,
  FileText,
  User,
  Users,
  ArrowRight,
  Download,
} from 'lucide-react';
import { Footer } from '@/components/wise';

// ============ TYPES ============
interface BookingDetail {
  id: string;
  serviceId: string;
  serviceName: string;
  consultantId: string;
  consultantName: string;
  consultantEmail?: string;
  consultantAvatar?: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  totalPrice: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  meetingType: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  // For completed bookings
  summary?: string;
  actionItems?: ActionItem[];
  recordingLink?: string;
}

interface ActionItem {
  id: string;
  description: string;
  owner: string;
  dueDate: string;
  completed: boolean;
}

interface ModalState {
  type: 'reschedule' | 'cancel' | 'followup' | 'contact' | null;
  isOpen: boolean;
}

// ============ STATUS BADGE ============
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-300', icon: '📅' },
    completed: { bg: 'bg-green-500/20', text: 'text-green-300', icon: '✓' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-300', icon: '✕' },
    'no-show': { bg: 'bg-orange-500/20', text: 'text-orange-300', icon: '!' },
  };

  const config = statusConfig[status] || statusConfig.scheduled;

  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      <span>{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

// ============ RESCHEDULE MODAL ============
const RescheduleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  consultantName: string;
}> = ({ isOpen, onClose, bookingId, consultantName }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // API call would go here
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full p-8 relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-400" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Reschedule Booking</h2>
              <p className="text-slate-400">Select a new date and time for your session with {consultantName}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">New Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">New Time</label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Rescheduling...
                    </>
                  ) : (
                    'Reschedule Session'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============ CANCEL CONFIRMATION MODAL ============
const CancelModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bookingId: string;
}> = ({ isOpen, onClose, onConfirm, bookingId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // API call would go here
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-md w-full p-8 relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-400" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-500/20 rounded-full">
                <AlertCircle size={32} className="text-red-400" />
              </div>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">Cancel Booking?</h2>
            <p className="text-slate-400 text-center mb-8">
              Are you sure you want to cancel this booking? This action cannot be undone. You may be eligible for a refund based on our cancellation policy.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Keep Booking
              </motion.button>
              <motion.button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Booking'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============ FOLLOW-UP MODAL ============
const FollowUpModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  consultantName: string;
}> = ({ isOpen, onClose, consultantName }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // API call would go here
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full p-8 relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-400" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Schedule Follow-up</h2>
              <p className="text-slate-400">Book another session with {consultantName}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Preferred Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Topics to Discuss</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What would you like to cover in the follow-up session?"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none h-24"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Schedule Follow-up'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============ CONTACT MODAL ============
const ContactModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  consultantName: string;
  consultantEmail?: string;
}> = ({ isOpen, onClose, consultantName, consultantEmail }) => {
  const [messageType, setMessageType] = useState<'email' | 'message'>('email');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // API call would go here
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage('');
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full p-8 relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={24} className="text-slate-400" />
            </button>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Contact {consultantName}</h2>
              <p className="text-slate-400">Send a message or email to your consultant</p>
            </div>

            {/* Message Type Tabs */}
            <div className="flex gap-2 mb-6 bg-slate-700/50 p-2 rounded-lg">
              {(['email', 'message'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMessageType(type)}
                  className={`flex-1 px-4 py-2 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                    messageType === type
                      ? 'bg-blue-500 text-white'
                      : 'bg-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {type === 'email' ? <Mail size={18} /> : <MessageSquare size={18} />}
                  {type === 'email' ? 'Email' : 'Message'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Your Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-none h-32"
                  required
                />
              </div>

              {/* Contact Info Display */}
              {messageType === 'email' && consultantEmail && (
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-sm text-slate-400 mb-1">Email will be sent to:</p>
                  <p className="text-white font-semibold">{consultantEmail}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send {messageType === 'email' ? 'Email' : 'Message'}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============ ACTION ITEMS SECTION ============
const ActionItemsSection: React.FC<{ items: ActionItem[] }> = ({ items }) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleCompletion = (id: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedItems(newCompleted);
  };

  const completionRate = Math.round((completedItems.size / items.length) * 100);

  return (
    <motion.div
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
          <FileText size={24} className="text-blue-400" />
          Action Items
        </h3>
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-300">{completionRate}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <motion.div
            key={item.id}
            className="p-4 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            onClick={() => toggleCompletion(item.id)}
          >
            <div className="flex items-start gap-4">
              <div className="pt-1 flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                    completedItems.has(item.id)
                      ? 'bg-green-500 border-green-500'
                      : 'border-slate-600 group-hover:border-slate-500'
                  }`}
                >
                  {completedItems.has(item.id) && <Check size={16} className="text-white" />}
                </div>
              </div>
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    completedItems.has(item.id)
                      ? 'text-slate-400 line-through'
                      : 'text-white'
                  }`}
                >
                  {item.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {item.owner}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============ MAIN PAGE ============
export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: null, isOpen: false });

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/consulting/bookings/${bookingId}`);

      if (!response.ok) throw new Error('Failed to fetch booking details');

      const data = await response.json();
      setBooking(data);
    } catch (err) {
      console.error('Error fetching booking:', err);
      setError(err instanceof Error ? err.message : 'Failed to load booking details');
      // Mock data for demo
      setBooking({
        id: bookingId,
        serviceId: 'service-1',
        serviceName: 'AI Implementation Strategy',
        consultantId: 'consultant-1',
        consultantName: 'Sarah Chen',
        consultantEmail: 'sarah.chen@wise2.net',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        duration: 60,
        totalPrice: 150,
        status: 'scheduled',
        meetingType: 'video',
        meetingLink: 'https://zoom.us/j/123456789',
        notes: 'Discussing AI integration roadmap and implementation strategy',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isUpcoming = booking && new Date(booking.startTime) > new Date() && booking.status === 'scheduled';
  const isCompleted = booking && booking.status === 'completed';

  const meetingIcons: Record<string, React.ReactNode> = {
    video: <Video size={20} />,
    phone: <Phone size={20} />,
    'in-person': <MapPin size={20} />,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <main className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-center py-32">
            <div className="text-center">
              <Loader size={48} className="text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading booking details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <main className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.button
              onClick={() => router.back()}
              className="mb-8 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              whileHover={{ x: -4 }}
            >
              <ChevronLeft size={20} />
              Back
            </motion.button>

            <motion.div
              className="text-center py-16 px-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Booking Not Found</h2>
              <p className="text-slate-400 mb-6">We couldn't load the details for this booking.</p>
              <motion.a
                href="/consulting/bookings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Bookings
                <ChevronRight size={18} />
              </motion.a>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">

      <main className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <motion.button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            whileHover={{ x: -4 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ChevronLeft size={20} />
            Back to Bookings
          </motion.button>

          {/* Header Section */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start justify-between gap-6 mb-6 flex-col sm:flex-row">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  {booking.serviceName}
                </h1>
                <p className="text-lg text-slate-400">with {booking.consultantName}</p>
              </div>
              <StatusBadge status={booking.status} />
            </div>
          </motion.section>

          {/* Main Details Card */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date & Time Card */}
              <motion.div
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8"
                whileHover={{ y: -4 }}
              >
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar size={24} className="text-blue-400" />
                  Schedule
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Date</p>
                    <p className="text-lg font-semibold text-white">
                      {formatDate(booking.startTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Time</p>
                    <p className="text-lg font-semibold text-white">
                      {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Duration</p>
                    <p className="text-lg font-semibold text-white">{booking.duration} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-2">Meeting Type</p>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">{meetingIcons[booking.meetingType]}</span>
                      <span className="text-lg font-semibold text-white capitalize">
                        {booking.meetingType === 'in-person'
                          ? 'In-Person'
                          : booking.meetingType === 'video'
                            ? 'Video Call'
                            : 'Phone Call'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Meeting Link */}
                {booking.meetingLink && (
                  <div className="mt-6 pt-6 border-t border-slate-700">
                    <p className="text-sm text-slate-500 mb-3">Meeting Link</p>
                    <motion.a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LinkIcon size={18} />
                      Join Meeting
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  </div>
                )}
              </motion.div>

              {/* Notes Card */}
              {booking.notes && (
                <motion.div
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ y: -4 }}
                >
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare size={24} className="text-purple-400" />
                    Session Notes
                  </h2>
                  <p className="text-slate-300 leading-relaxed">{booking.notes}</p>
                </motion.div>
              )}

              {/* Summary Section - Completed Only */}
              {isCompleted && booking.summary && (
                <motion.div
                  className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ y: -4 }}
                >
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText size={24} className="text-green-400" />
                    Post-Call Summary
                  </h2>
                  <p className="text-slate-300 leading-relaxed mb-6">{booking.summary}</p>

                  {booking.recordingLink && (
                    <motion.a
                      href={booking.recordingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download size={18} />
                      Download Recording
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </motion.a>
                  )}
                </motion.div>
              )}

              {/* Action Items - Completed Only */}
              {isCompleted && booking.actionItems && booking.actionItems.length > 0 && (
                <ActionItemsSection items={booking.actionItems} />
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Price Card */}
              <motion.div
                className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-2xl border border-blue-500/50 p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -4 }}
              >
                <p className="text-sm text-blue-200 mb-2">Total Price</p>
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign size={28} className="text-blue-200" />
                  <span className="text-4xl font-bold text-white">
                    {booking.totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-blue-200">for {booking.duration} minutes</p>
              </motion.div>

              {/* Consultant Card */}
              <motion.div
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <User size={20} className="text-slate-400" />
                  Consultant
                </h3>
                <p className="text-white font-semibold mb-4">{booking.consultantName}</p>
                {booking.consultantEmail && (
                  <p className="text-sm text-slate-400 mb-6 break-all">{booking.consultantEmail}</p>
                )}

                <motion.button
                  onClick={() => setModal({ type: 'contact', isOpen: true })}
                  className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <MessageSquare size={18} />
                  Contact Consultant
                </motion.button>
              </motion.div>

              {/* Action Buttons - Upcoming */}
              {isUpcoming && (
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={() => setModal({ type: 'reschedule', isOpen: true })}
                    className="w-full px-4 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calendar size={18} />
                    Reschedule
                  </motion.button>

                  <motion.button
                    onClick={() => setModal({ type: 'cancel', isOpen: true })}
                    className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X size={18} />
                    Cancel Booking
                  </motion.button>
                </motion.div>
              )}

              {/* Follow-up Button - Completed */}
              {isCompleted && (
                <motion.button
                  onClick={() => setModal({ type: 'followup', isOpen: true })}
                  className="w-full px-4 py-3 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CheckCircle size={18} />
                  Schedule Follow-up
                </motion.button>
              )}

              {/* Booking Info */}
              <motion.div
                className="bg-slate-800/50 rounded-xl border border-slate-700 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs text-slate-500 mb-3">Booking ID</p>
                <p className="text-sm font-mono text-slate-300 mb-4 break-all">{booking.id}</p>

                <p className="text-xs text-slate-500 mb-2">Booked On</p>
                <p className="text-sm text-slate-300">{formatDate(booking.createdAt)}</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <RescheduleModal
        isOpen={modal.type === 'reschedule' && modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
        bookingId={booking.id}
        consultantName={booking.consultantName}
      />

      <CancelModal
        isOpen={modal.type === 'cancel' && modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
        onConfirm={() => {
          setModal({ type: null, isOpen: false });
          router.push('/consulting/bookings');
        }}
        bookingId={booking.id}
      />

      <FollowUpModal
        isOpen={modal.type === 'followup' && modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
        consultantName={booking.consultantName}
      />

      <ContactModal
        isOpen={modal.type === 'contact' && modal.isOpen}
        onClose={() => setModal({ type: null, isOpen: false })}
        consultantName={booking.consultantName}
        consultantEmail={booking.consultantEmail}
      />
    </div>
  );
}
