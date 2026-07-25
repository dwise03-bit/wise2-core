'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, Users, Award, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Navigation, Footer } from '@/components/wise';

// ============ TYPES ============
interface Consultant {
  id: string;
  name: string;
  bio: string;
  expertise: string[];
  hourlyRate: number;
  rating: number;
  yearsExperience: number;
  bookingsCompleted: number;
  avgReview: string;
  avatar?: string;
}

interface ServiceDetail {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  tags: string[];
  consultants: Consultant[];
}

// ============ STAR RATING COMPONENT ============
const StarRating = ({ rating, className = '' }: { rating: number; className?: string }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-400">{rating.toFixed(1)}</span>
    </div>
  );
};

// ============ CONSULTANT CARD ============
const ConsultantCard = ({ consultant, index }: { consultant: Consultant; index: number }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
    }),
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -8, boxShadow: '0 24px 48px rgba(34, 197, 94, 0.15)' }}
      className="rounded-2xl border border-wise-surface-3 bg-gradient-to-br from-wise-card via-wise-bg-secondary to-wise-bg-primary overflow-hidden transition-all duration-300 hover:border-[#0094FF]"
      style={{
        background: 'linear-gradient(135deg, rgba(16, 21, 29, 0.8) 0%, rgba(13, 17, 23, 0.6) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Header with Avatar */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar Placeholder */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0094FF]/30 to-blue-500/30 flex items-center justify-center flex-shrink-0 border border-[#0094FF]/50"
          >
            <span className="text-2xl font-bold text-[#0094FF]">{consultant.name.charAt(0)}</span>
          </motion.div>

          {/* Name & Title */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{consultant.name}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">{consultant.bio}</p>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-4">
          <StarRating rating={consultant.rating} />
        </div>

        {/* Expertise Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {consultant.expertise.slice(0, 3).map((skill, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1 rounded-full bg-[#0094FF]/10 text-[#0094FF] border border-[#0094FF]/30 font-medium"
            >
              {skill}
            </span>
          ))}
          {consultant.expertise.length > 3 && (
            <span className="text-xs px-3 py-1 rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/30 font-medium">
              +{consultant.expertise.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 py-4 border-t border-wise-surface-3 bg-wise-bg-secondary/50">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Years Experience */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={14} className="text-[#0094FF]" />
            </div>
            <div className="text-lg font-bold text-white">{consultant.yearsExperience}</div>
            <div className="text-xs text-gray-500">Years Exp.</div>
          </div>

          {/* Bookings Completed */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users size={14} className="text-[#0094FF]" />
            </div>
            <div className="text-lg font-bold text-white">{consultant.bookingsCompleted}</div>
            <div className="text-xs text-gray-500">Bookings</div>
          </div>

          {/* Hourly Rate */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award size={14} className="text-[#0094FF]" />
            </div>
            <div className="text-lg font-bold text-[#0094FF]">${consultant.hourlyRate}</div>
            <div className="text-xs text-gray-500">/hour</div>
          </div>
        </div>

        {/* Average Review */}
        <div className="bg-wise-bg-primary/50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-300 italic">"{consultant.avgReview}"</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-6 py-4 border-t border-wise-surface-3">
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-[#0094FF] hover:bg-green-600 text-wise-bg-primary font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
        >
          Book Consultation <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============ LOADING SKELETON ============
const LoadingSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {/* Hero Skeleton */}
    <div className="h-64 bg-wise-surface-3 rounded-2xl" />

    {/* Consultants Grid Skeleton */}
    <div className="grid md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-96 bg-wise-surface-3 rounded-2xl" />
      ))}
    </div>
  </div>
);

// ============ MAIN PAGE COMPONENT ============
export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedConsultant, setExpandedConsultant] = useState<string | null>(null);

  // Fetch service details
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from the API
        const response = await fetch(
          `/api/consulting/services/${serviceId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch service: ${response.statusText}`);
        }

        const data = await response.json();
        setService(data);
      } catch (err) {
        console.error('Error fetching service:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load service details. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceDetails();
    }
  }, [serviceId]);

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="bg-wise-bg-primary min-h-screen pt-20 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <LoadingSkeleton />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !service) {
    return (
      <>
        <Navigation />
        <main className="bg-wise-bg-primary min-h-screen pt-20 pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-wise-accent-red/30 bg-gradient-to-br from-red-900/10 to-red-800/5 p-6 flex gap-4"
            >
              <AlertCircle className="text-wise-accent-red flex-shrink-0" size={24} />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Unable to Load Service</h3>
                <p className="text-gray-400 mb-4">
                  {error || 'Service not found. Please check the URL and try again.'}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/consulting')}
                  className="px-4 py-2 bg-[#0094FF] text-wise-bg-primary font-bold rounded-lg hover:bg-green-600 transition-all"
                >
                  Back to Services
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Animation variants
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
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-12 pb-20">
        {/* Background Gradient Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-0 right-1/4 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <motion.div
            animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0, 85, 255, 0.06) 0%, transparent 70%)',
              filter: 'blur(50px)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-[#0094FF] transition-colors font-medium text-sm"
          >
            <span>←</span> Back to Services
          </motion.button>

          {/* Hero Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-16"
          >
            {/* Service Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div>
                  <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                    {service.name}
                  </h1>
                  <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 px-6 py-3 bg-[#0094FF] text-wise-bg-primary font-bold rounded-xl text-center"
                >
                  <div className="text-sm text-wise-bg-primary/80 mb-1">Starting at</div>
                  <div className="text-3xl font-black">${service.hourlyRate}</div>
                  <div className="text-xs text-wise-bg-primary/80 mt-1">per hour</div>
                </motion.div>
              </div>

              {/* Tags */}
              <motion.div className="flex flex-wrap gap-2">
                {service.tags.map((tag, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="px-4 py-2 rounded-full bg-[#0094FF]/10 text-[#0094FF] border border-[#0094FF]/30 font-medium text-sm"
                  >
                    {tag}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            {/* Info Cards */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4 mb-12">
              {[
                { icon: '👥', label: 'Expert Consultants', value: `${service.consultants.length} available` },
                { icon: '⭐', label: 'Avg. Rating', value: (service.consultants.reduce((sum, c) => sum + c.rating, 0) / service.consultants.length).toFixed(1) },
                { icon: '📅', label: 'Book Now', value: 'Flexible scheduling' },
              ].map((info, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="rounded-xl p-4 bg-gradient-to-br from-wise-card to-wise-bg-secondary border border-wise-surface-3 hover:border-[#0094FF]/50 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 21, 29, 0.6) 0%, rgba(13, 17, 23, 0.4) 100%)',
                  }}
                >
                  <div className="text-3xl mb-2">{info.icon}</div>
                  <div className="text-sm text-gray-400 mb-1">{info.label}</div>
                  <div className="text-lg font-bold text-white">{info.value}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Consultants Section */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">Available Consultants</h2>
              <p className="text-gray-400">
                Choose from our team of {service.consultants.length} experienced professionals
              </p>
            </motion.div>

            {/* Consultants Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {service.consultants.map((consultant, idx) => (
                <ConsultantCard
                  key={consultant.id}
                  consultant={consultant}
                  index={idx}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="mt-20 rounded-2xl bg-gradient-to-r from-[#0094FF]/20 to-blue-500/10 border border-[#0094FF]/30 p-12 text-center"
          >
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Book a consultation with our experts today and transform your business with professional guidance.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 24px 48px rgba(34, 197, 94, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push(`/consulting/book?serviceId=${serviceId}`)}
              className="px-8 py-4 bg-[#0094FF] hover:bg-green-600 text-wise-bg-primary font-bold rounded-xl transition-all inline-flex items-center gap-2 text-lg"
            >
              Book a Consultation <ArrowRight size={20} />
            </motion.button>
          </motion.div>

          {/* FAQ Section */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mt-20">
            <motion.h3 variants={itemVariants} className="text-3xl font-bold text-white mb-8">
              Frequently Asked Questions
            </motion.h3>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
              {[
                {
                  q: 'How do I schedule a consultation?',
                  a: 'Click "Book a Consultation" to view available time slots with our consultants. You can select a time that works best for you.',
                },
                {
                  q: 'What if I need to reschedule?',
                  a: 'You can reschedule your consultation up to 24 hours before your scheduled time through your dashboard.',
                },
                {
                  q: 'Do you offer package rates?',
                  a: 'Yes! Contact our sales team for bulk consultation packages and custom pricing for your organization.',
                },
              ].map((faq, i) => (
                <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ============ FAQ ITEM COMPONENT ============
const FAQItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  return (
    <motion.div
      custom={index}
      variants={variants}
      initial="hidden"
      animate="visible"
      className="rounded-xl border border-wise-surface-3 overflow-hidden bg-gradient-to-r from-wise-card/50 to-wise-bg-secondary/30"
      style={{
        background: 'linear-gradient(135deg, rgba(16, 21, 29, 0.3) 0%, rgba(13, 17, 23, 0.2) 100%)',
      }}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-wise-surface-3/50 transition-colors"
      >
        <span className="text-lg font-bold text-white text-left">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="text-[#0094FF]" size={20} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-wise-surface-3 px-6 py-4 bg-wise-bg-secondary/50"
          >
            <p className="text-gray-300">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
