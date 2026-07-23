'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ServiceCard } from '@/components/consulting/ServiceCard';
import { Loader2 } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  icon?: string;
  tags?: string[];
  consultants?: Array<{
    consultant: {
      id: string;
      name: string;
      expertise: string[];
      hourlyRate: number;
      isActive: boolean;
    };
  }>;
}

export default function ConsultingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [selectedTag]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const url = selectedTag
        ? `/api/consulting/services?tags=${selectedTag}`
        : '/api/consulting/services';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const allTags = Array.from(
    new Set(services.flatMap((s) => s.tags || []))
  ) as string[];

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
      {/* Hero Section */}
      <motion.section
        className="pt-20 pb-16 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full border border-blue-500/30 mb-4">
              <span className="text-sm font-semibold text-blue-300">Expert AI Consulting</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Transform Your Business with <span className="text-blue-400">AI Consulting</span>
          </motion.h1>

          <motion.p
            className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Book expert AI consultants for strategy, implementation, training, and custom solutions.
            Get answers in hours, not weeks.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Schedule a Consultation
            </button>
            <button className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors">
              Learn More
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Tag Filter */}
      {allTags.length > 0 && (
        <motion.section
          className="px-4 sm:px-6 lg:px-8 mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-6xl mx-auto">
            <p className="text-sm text-slate-400 mb-4">Filter by service type:</p>
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setSelectedTag(null)}
                className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium ${
                  selectedTag === null
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-600 text-slate-300 hover:border-slate-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                All Services
              </motion.button>
              {allTags.map((tag) => (
                <motion.button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-full border transition-colors text-sm font-medium capitalize ${
                    selectedTag === tag
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Services Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <motion.div
              className="flex items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </motion.div>
          ) : services.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {services.map((service) => (
                <motion.div key={service.id} variants={itemVariants}>
                  <ServiceCard
                    id={service.id}
                    name={service.name}
                    description={service.description}
                    hourlyRate={service.hourlyRate}
                    icon={service.icon}
                    tags={service.tags}
                    consultantCount={service.consultants?.length || 0}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-slate-400 text-lg">No services found. Please try different filters.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-t border-slate-700"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-slate-300 mb-8">
            Select a service above and book your first consulting session today.
          </p>
          <motion.button
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Browse Services
          </motion.button>
        </div>
      </motion.section>
    </div>
  );
}
