'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MessageCircle,
  Calendar,
  ChevronDown,
  Award,
  Zap
} from 'lucide-react';

interface ConsultantCardProps {
  id: string;
  name: string;
  bio: string;
  expertise: string[];
  hourlyRate: number;
  rating?: number;
  reviewCount?: number;
  bookingsCompleted?: number;
  yearsExperience?: number;
  avatar?: string;
}

export const ConsultantCard: React.FC<ConsultantCardProps> = ({
  id,
  name,
  bio,
  expertise,
  hourlyRate,
  rating = 0,
  reviewCount = 0,
  bookingsCompleted = 0,
  yearsExperience = 0,
  avatar,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxBioLength = 150;
  const shouldShowReadMore = bio.length > maxBioLength;
  const displayedBio = isExpanded ? bio : bio.substring(0, maxBioLength) + (shouldShowReadMore ? '...' : '');

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <motion.div
        key={i}
        whileHover={{ scale: 1.1, rotate: 10 }}
        transition={{ duration: 0.2 }}
      >
        <Star
          size={16}
          className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
          key={i}
        />
      </motion.div>
    ));
  };

  // Get avatar initials if no image
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Link href={`/consulting/consultants/${id}`}>
      <motion.div
        className="h-full bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden cursor-pointer group relative border border-slate-700 hover:border-cyan-500/50 transition-colors flex flex-col"
        whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(34, 211, 238, 0.15)' }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Gradient background effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity"
          transition={{ duration: 0.3 }}
        />

        {/* Header section with avatar */}
        <div className="relative z-10 bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-6 border-b border-slate-700/50">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-cyan-500/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center ring-2 ring-cyan-500/30">
                  <span className="text-lg font-bold text-cyan-300">
                    {getInitials(name)}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Name and rating */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-cyan-300 transition-colors">
                {name}
              </h3>

              {/* Rating display */}
              {rating > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-1">
                    {renderStars(rating)}
                  </div>
                  <span className="text-sm text-slate-400">
                    {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              {/* Experience badge */}
              {yearsExperience > 0 && (
                <motion.div
                  className="flex items-center gap-1 text-xs text-cyan-400"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Award size={14} />
                  <span>{yearsExperience} {yearsExperience === 1 ? 'year' : 'years'} experience</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Main content section */}
        <div className="relative z-10 flex-1 p-6 flex flex-col">
          {/* Expertise tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {expertise.slice(0, 3).map((skill, index) => (
                <motion.span
                  key={skill}
                  className="text-xs px-3 py-1 bg-cyan-500/15 text-cyan-300 rounded-full border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  {skill}
                </motion.span>
              ))}
              {expertise.length > 3 && (
                <motion.span
                  className="text-xs px-3 py-1 bg-slate-700/50 text-slate-400 rounded-full hover:bg-slate-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  +{expertise.length - 3}
                </motion.span>
              )}
            </div>
          </div>

          {/* Bio section */}
          <div className="mb-4 flex-1">
            <p className="text-sm text-slate-300 leading-relaxed">
              {displayedBio}
            </p>

            {/* Read more toggle */}
            {shouldShowReadMore && (
              <motion.button
                onClick={(e) => {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 flex items-center gap-1 transition-colors"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <span>{isExpanded ? 'Read less' : 'Read more'}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={14} />
                </motion.div>
              </motion.button>
            )}
          </div>

          {/* Stats row */}
          {bookingsCompleted > 0 && (
            <motion.div
              className="grid grid-cols-1 gap-2 mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-700/50"
              whileHover={{ backgroundColor: 'rgba(51, 65, 85, 0.5)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 text-sm">
                <Zap size={16} className="text-cyan-400" />
                <span className="text-slate-300">
                  <span className="font-semibold text-white">{bookingsCompleted}</span> consultations completed
                </span>
              </div>
            </motion.div>
          )}

          {/* Hourly rate - prominent display */}
          <div className="py-3 border-y border-slate-700/50 mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-cyan-400">
                ${hourlyRate}
              </span>
              <span className="text-sm text-slate-500">/hour</span>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              // Navigate to booking page
              window.location.href = `/consulting/consultants/${id}/book`;
            }}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 group/btn transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Calendar size={18} />
            <span>Book Consultation</span>
            <motion.div
              className="opacity-0 group-hover/btn:opacity-100 transition-opacity"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="rotate-90" />
            </motion.div>
          </motion.button>

          {/* Contact info hint */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              // Could open contact modal or message flow
            }}
            className="mt-2 w-full py-2 px-4 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-300 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            whileHover={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
            transition={{ duration: 0.2 }}
          >
            <MessageCircle size={16} />
            <span>Message</span>
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
};
