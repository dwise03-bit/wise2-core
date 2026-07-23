'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, DollarSign, MapPin, Phone, Video, ChevronRight, AlertCircle, Loader } from 'lucide-react';
import { Navigation, Footer } from '@/components/wise';

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  consultantId: string;
  consultantName: string;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  totalPrice: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  meetingType: 'video' | 'phone' | 'in-person';
  meetingLink?: string;
  notes?: string;
  createdAt: string;
}

type TabType = 'upcoming' | 'past';

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <motion.div
        key={i}
        className="h-32 bg-slate-800 rounded-xl animate-pulse border border-slate-700"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
    ))}
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { bg: string; text: string; icon: string }> = {
    scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-300', icon: '📅' },
    completed: { bg: 'bg-green-500/20', text: 'text-green-300', icon: '✓' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-300', icon: '✕' },
    'no-show': { bg: 'bg-orange-500/20', text: 'text-orange-300', icon: '!' },
  };

  const config = statusConfig[status] || statusConfig.scheduled;

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
      <span>{config.icon}</span>
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

const BookingCard: React.FC<{ booking: Booking; isUpcoming: boolean }> = ({ booking, isUpcoming }) => {

  const formattedDate = new Date(booking.startTime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(booking.startTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const meetingIcons: Record<string, React.ReactNode> = {
    video: <Video size={18} />,
    phone: <Phone size={18} />,
    'in-person': <MapPin size={18} />,
  };

  return (
    <motion.div
      className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 overflow-hidden"
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1)' }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      {/* Gradient overlay on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        transition={{ duration: 0.3 }}
      />

      <div className="relative z-10">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors mb-1">
              {booking.serviceName}
            </h3>
            <p className="text-sm text-slate-400">with {booking.consultantName}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Date & Time */}
          <motion.div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg group-hover:bg-slate-700 transition-colors" whileHover={{ scale: 1.02 }}>
            <Calendar size={18} className="text-blue-400" />
            <div>
              <p className="text-xs text-slate-500">Date</p>
              <p className="text-sm font-semibold text-white">{formattedDate}</p>
            </div>
          </motion.div>

          {/* Time */}
          <motion.div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg group-hover:bg-slate-700 transition-colors" whileHover={{ scale: 1.02 }}>
            <Clock size={18} className="text-purple-400" />
            <div>
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-sm font-semibold text-white">{formattedTime}</p>
            </div>
          </motion.div>

          {/* Duration */}
          <motion.div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg group-hover:bg-slate-700 transition-colors" whileHover={{ scale: 1.02 }}>
            <Clock size={18} className="text-green-400" />
            <div>
              <p className="text-xs text-slate-500">Duration</p>
              <p className="text-sm font-semibold text-white">{booking.duration} minutes</p>
            </div>
          </motion.div>

          {/* Price */}
          <motion.div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg group-hover:bg-slate-700 transition-colors" whileHover={{ scale: 1.02 }}>
            <DollarSign size={18} className="text-amber-400" />
            <div>
              <p className="text-xs text-slate-500">Total Price</p>
              <p className="text-sm font-semibold text-white">${booking.totalPrice.toFixed(2)}</p>
            </div>
          </motion.div>
        </div>

        {/* Meeting Type */}
        <div className="flex items-center gap-2 mb-6 pb-6 border-b border-slate-700">
          <span className="text-slate-400 text-sm">Meeting:</span>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/30 rounded-full">
            <span className="text-blue-400">{meetingIcons[booking.meetingType]}</span>
            <span className="text-sm font-medium text-slate-300 capitalize">
              {booking.meetingType === 'in-person' ? 'In-Person' : booking.meetingType === 'video' ? 'Video Call' : 'Phone Call'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/consulting/bookings/${booking.id}`} className="flex-1">
            <motion.button
              className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>View Details</span>
              <ChevronRight size={16} />
            </motion.button>
          </Link>

        </div>
      </div>
    </motion.div>
  );
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/consulting/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
      // Mock data for demo
      setBookings([
        {
          id: 'booking-1',
          serviceId: 'service-1',
          serviceName: 'AI Implementation Strategy',
          consultantId: 'consultant-1',
          consultantName: 'Sarah Chen',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          duration: 60,
          totalPrice: 150,
          status: 'scheduled',
          meetingType: 'video',
          meetingLink: 'https://zoom.us/j/123456789',
          notes: 'Discussing AI integration roadmap',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'booking-2',
          serviceId: 'service-2',
          serviceName: 'Architecture Review',
          consultantId: 'consultant-2',
          consultantName: 'Marcus Johnson',
          startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
          duration: 90,
          totalPrice: 225,
          status: 'scheduled',
          meetingType: 'phone',
          notes: 'System architecture assessment',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'booking-3',
          serviceId: 'service-1',
          serviceName: 'AI Implementation Strategy',
          consultantId: 'consultant-1',
          consultantName: 'Sarah Chen',
          startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          duration: 60,
          totalPrice: 150,
          status: 'completed',
          meetingType: 'video',
          meetingLink: 'https://zoom.us/j/123456780',
          notes: 'Initial consultation - very productive',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings by tab
  const now = new Date();
  const upcomingBookings = bookings
    .filter((b) => new Date(b.startTime) > now && b.status === 'scheduled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const pastBookings = bookings
    .filter((b) => new Date(b.startTime) <= now || b.status !== 'scheduled')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .reverse();

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Navigation />

      <main className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.section
            className="mb-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30 mb-4">
                <span className="text-sm font-semibold text-blue-300">Your Bookings</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Consulting Sessions
            </motion.h1>

            <motion.p
              className="text-xl text-slate-400 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              View and manage your scheduled and completed consulting sessions
            </motion.p>
          </motion.section>

          {/* Tabs */}
          <motion.div
            className="flex gap-2 mb-8 bg-slate-800/50 p-2 rounded-xl border border-slate-700 w-fit mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {(['upcoming', 'past'] as const).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab === 'upcoming' ? 'Upcoming' : 'Past'}
                <span className="ml-2 text-sm text-white/70">({(activeTab === 'upcoming' ? upcomingBookings : pastBookings).length})</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertCircle size={20} />
              <span>{error} - Showing demo data</span>
            </motion.div>
          )}

          {/* Bookings List */}
          {loading ? (
            <LoadingSkeleton />
          ) : displayBookings.length === 0 ? (
            <motion.div
              className="text-center py-16 px-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full">
                <Calendar size={32} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No {activeTab} bookings</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming sessions. Schedule one with our consultants today!"
                  : "You haven't completed any sessions yet. Book your first consulting session!"}
              </p>
              <motion.a
                href="/consulting"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Services
                <ChevronRight size={18} />
              </motion.a>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {displayBookings.map((booking) => (
                <motion.div key={booking.id} variants={itemVariants}>
                  <BookingCard booking={booking} isUpcoming={activeTab === 'upcoming'} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              className="flex items-center justify-center py-12"
              animate={{ opacity: [0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Loader size={24} className="text-blue-400 animate-spin" />
              <span className="ml-3 text-slate-400">Loading your bookings...</span>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
