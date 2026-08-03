'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  DollarSign,
  Check,
  AlertCircle,
  Loader,
  MapPin,
  MessageSquare,
  X,
} from 'lucide-react';
import { Footer } from '@/components/wise';

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
  avatar?: string;
  timezone?: string;
}

interface ServiceDetail {
  id: string;
  name: string;
  description: string;
  hourlyRate: number;
  minDuration: number; // in minutes
  maxDuration: number; // in minutes
  tags: string[];
  consultants: Consultant[];
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

interface BookingData {
  consultant: Consultant | null;
  selectedDate: string;
  selectedTime: string;
  duration: number; // in hours
  timezone: string;
  notes: string;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  cardholderName: string;
}

// ============ STEP INDICATOR ============
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[...Array(totalSteps)].map((_, i) => (
        <React.Fragment key={i}>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{
              scale: i === currentStep - 1 ? 1.1 : 1,
              backgroundColor: i < currentStep ? '#22C55E' : i === currentStep - 1 ? '#22C55E' : '#1A2332',
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white border-2 border-wise-surface-3"
          >
            {i < currentStep ? <Check size={20} /> : i + 1}
          </motion.div>
          {i < totalSteps - 1 && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: i < currentStep ? 1 : 0 }}
              className="w-8 h-1 bg-[#0094FF] rounded-full"
              style={{ transformOrigin: 'left' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ============ STEP 1: CONSULTANT SELECTION ============
const ConsultantSelectionStep = ({
  service,
  selectedConsultant,
  onSelect,
  loading,
}: {
  service: ServiceDetail;
  selectedConsultant: Consultant | null;
  onSelect: (consultant: Consultant) => void;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-[#0094FF]" size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Select Your Consultant</h2>
        <p className="text-gray-400">Choose from our expert team to get started with {service.name}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {service.consultants.map((consultant, idx) => (
          <motion.button
            key={consultant.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(consultant)}
            className={`relative p-6 rounded-xl border-2 transition-all text-left ${
              selectedConsultant?.id === consultant.id
                ? 'border-[#0094FF] bg-[#0094FF]/10'
                : 'border-wise-surface-3 hover:border-[#0094FF]/50 bg-wise-bg-secondary'
            }`}
          >
            {/* Selected Checkmark */}
            {selectedConsultant?.id === consultant.id && (
              <motion.div
                layoutId="consultantCheck"
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#0094FF] flex items-center justify-center"
              >
                <Check size={16} className="text-wise-bg-primary" />
              </motion.div>
            )}

            {/* Consultant Info */}
            <div className="flex gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0094FF]/30 to-blue-500/30 flex items-center justify-center flex-shrink-0 border border-[#0094FF]/50">
                <span className="text-xl font-bold text-[#0094FF]">
                  {consultant.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white">{consultant.name}</h3>
                <p className="text-sm text-gray-400">{consultant.bio}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
              <div className="bg-wise-bg-primary/50 rounded p-2">
                <div className="text-gray-400 text-xs mb-1">Rating</div>
                <div className="font-bold text-white">{consultant.rating.toFixed(1)}</div>
              </div>
              <div className="bg-wise-bg-primary/50 rounded p-2">
                <div className="text-gray-400 text-xs mb-1">Experience</div>
                <div className="font-bold text-white">{consultant.yearsExperience}y</div>
              </div>
              <div className="bg-wise-bg-primary/50 rounded p-2">
                <div className="text-gray-400 text-xs mb-1">Rate</div>
                <div className="font-bold text-[#0094FF]">${consultant.hourlyRate}/hr</div>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-1">
              {consultant.expertise.slice(0, 2).map((skill, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full bg-[#0094FF]/10 text-[#0094FF] border border-[#0094FF]/30"
                >
                  {skill}
                </span>
              ))}
              {consultant.expertise.length > 2 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-500/10 text-gray-400">
                  +{consultant.expertise.length - 2}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// ============ STEP 2: CALENDAR & TIME SELECTION ============
const CalendarStep = ({
  selectedDate,
  selectedTime,
  timeSlots,
  onDateSelect,
  onTimeSelect,
  loading,
  timezone,
  onTimezoneChange,
}: {
  selectedDate: string;
  selectedTime: string;
  timeSlots: TimeSlot[];
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  loading: boolean;
  timezone: string;
  onTimezoneChange: (tz: string) => void;
}) => {
  // Generate next 14 days
  const today = new Date();
  const dates = [...Array(14)].map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    return date;
  });

  const availableTimeslots = timeSlots.filter(
    (slot) => slot.date === selectedDate && slot.available
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-[#0094FF]" size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Select Date & Time</h2>
        <p className="text-gray-400">Choose your preferred meeting time</p>
      </div>

      {/* Timezone Selector */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-300 mb-3 block">Your Timezone</label>
        <select
          value={timezone}
          onChange={(e) => onTimezoneChange(e.target.value)}
          className="w-full md:w-64 px-4 py-2 rounded-lg bg-wise-bg-secondary border border-wise-surface-3 text-white focus:outline-none focus:border-[#0094FF] transition-colors"
        >
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">GMT/UTC</option>
          <option value="Europe/Paris">Central European Time (CET)</option>
          <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
          <option value="Australia/Sydney">Australian Eastern Time (AEST)</option>
        </select>
      </div>

      {/* Date Selection */}
      <div>
        <label className="text-sm font-semibold text-gray-300 mb-4 block">Select a Date</label>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          {dates.map((date, idx) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = date.getDate();

            const hasAvailability = timeSlots.some(
              (slot) => slot.date === dateStr && slot.available
            );

            return (
              <motion.button
                key={dateStr}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => hasAvailability && onDateSelect(dateStr)}
                disabled={!hasAvailability}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-[#0094FF] bg-[#0094FF]/10'
                    : 'border-wise-surface-3 hover:border-[#0094FF]/50'
                } ${!hasAvailability ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="text-xs font-medium text-gray-400 mb-1">{dayName}</div>
                <div className="text-lg font-bold text-white">{dayNum}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <label className="text-sm font-semibold text-gray-300 mb-4 block">
            Select a Time (30-min increments)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableTimeslots.length > 0 ? (
              availableTimeslots.map((slot) => (
                <motion.button
                  key={`${slot.date}-${slot.time}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => onTimeSelect(slot.time)}
                  className={`p-3 rounded-lg border-2 transition-all font-medium ${
                    selectedTime === slot.time
                      ? 'border-[#0094FF] bg-[#0094FF]/10 text-white'
                      : 'border-wise-surface-3 text-gray-400 hover:border-[#0094FF]/50 hover:text-white'
                  }`}
                >
                  <Clock size={16} className="inline mr-1" />
                  {slot.time}
                </motion.button>
              ))
            ) : (
              <div className="col-span-full py-8 text-center">
                <AlertCircle className="text-wise-accent-red mx-auto mb-2" />
                <p className="text-gray-400">No available time slots for this date</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// ============ STEP 3: DURATION SELECTION ============
const DurationStep = ({
  service,
  selectedConsultant,
  duration,
  onDurationChange,
  minDuration,
  maxDuration,
}: {
  service: ServiceDetail;
  selectedConsultant: Consultant | null;
  duration: number;
  onDurationChange: (hours: number) => void;
  minDuration: number;
  maxDuration: number;
}) => {
  const durationMinutes = duration * 60;
  const hourlyRate = selectedConsultant?.hourlyRate || service.hourlyRate;
  const totalPrice = duration * hourlyRate;

  const suggestedDurations = [0.5, 1, 1.5, 2];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Select Duration</h2>
        <p className="text-gray-400">How long do you need for your consultation?</p>
      </div>

      {/* Quick Select Buttons */}
      <div>
        <label className="text-sm font-semibold text-gray-300 mb-4 block">Quick Select</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {suggestedDurations.map((d) => {
            const isValid = d >= minDuration / 60 && d <= maxDuration / 60;
            return (
              <motion.button
                key={d}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => isValid && onDurationChange(d)}
                disabled={!isValid}
                className={`p-4 rounded-lg border-2 transition-all ${
                  duration === d
                    ? 'border-[#0094FF] bg-[#0094FF]/10'
                    : 'border-wise-surface-3 hover:border-[#0094FF]/50'
                } ${!isValid ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="text-lg font-bold text-white mb-1">{d}h</div>
                <div className="text-sm text-gray-400">${(d * hourlyRate).toFixed(2)}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Duration Input */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-gray-300 block">Custom Duration</label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="range"
              min={minDuration}
              max={maxDuration}
              step={30}
              value={durationMinutes}
              onChange={(e) => onDurationChange(Math.round(parseInt(e.target.value) / 30) * 0.5)}
              className="w-full h-2 bg-wise-surface-3 rounded-lg appearance-none cursor-pointer accent-[#0094FF]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{minDuration} min</span>
              <span>{maxDuration} min</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{duration}h</div>
            <div className="text-sm text-gray-400">{durationMinutes} minutes</div>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-[#0094FF]/10 border border-[#0094FF]/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="text-[#0094FF]" size={20} />
            <span className="text-gray-400">Hourly Rate</span>
          </div>
          <div className="text-xl font-bold text-white">${hourlyRate}/hour</div>
        </div>
        <div className="h-px bg-wise-surface-3 mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-[#0094FF]" size={20} />
            <span className="text-gray-400">Total Duration</span>
          </div>
          <div className="text-xl font-bold text-white">{duration} hours</div>
        </div>
        <div className="h-px bg-wise-surface-3 my-4" />
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-white">Total Price</span>
          <motion.div
            key={totalPrice}
            initial={{ scale: 1.1, color: '#22C55E' }}
            animate={{ scale: 1, color: '#22C55E' }}
            className="text-3xl font-black"
          >
            ${totalPrice.toFixed(2)}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// ============ STEP 4: BOOKING SUMMARY ============
const SummaryStep = ({
  service,
  consultant,
  selectedDate,
  selectedTime,
  duration,
  timezone,
  notes,
  onNotesChange,
}: {
  service: ServiceDetail;
  consultant: Consultant | null;
  selectedDate: string;
  selectedTime: string;
  duration: number;
  timezone: string;
  notes: string;
  onNotesChange: (notes: string) => void;
}) => {
  const totalPrice = (consultant?.hourlyRate || service.hourlyRate) * duration;
  const dateObj = new Date(selectedDate + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Booking Summary</h2>
        <p className="text-gray-400">Review your consultation details</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Service Card */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-wise-bg-secondary border border-wise-surface-3 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="text-[#0094FF]" size={20} />
            <h3 className="font-bold text-white">Service</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">{service.name}</p>
          <p className="text-gray-400 text-sm">{service.description}</p>
        </motion.div>

        {/* Consultant Card */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-wise-bg-secondary border border-wise-surface-3 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-[#0094FF]" size={20} />
            <h3 className="font-bold text-white">Consultant</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">{consultant?.name}</p>
          <div className="flex gap-2">
            {consultant?.expertise.slice(0, 2).map((skill, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full bg-[#0094FF]/10 text-[#0094FF]"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Date & Time Card */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-wise-bg-secondary border border-wise-surface-3 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-[#0094FF]" size={20} />
            <h3 className="font-bold text-white">Date & Time</h3>
          </div>
          <p className="text-lg font-bold text-white mb-1">{formattedDate}</p>
          <p className="text-2xl font-bold text-[#0094FF] mb-2">{selectedTime}</p>
          <p className="text-sm text-gray-400">{timezone}</p>
        </motion.div>

        {/* Duration & Price Card */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#0094FF]/10 border border-[#0094FF]/30 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-[#0094FF]" size={20} />
            <h3 className="font-bold text-white">Duration & Price</h3>
          </div>
          <p className="text-sm text-gray-400 mb-2">{duration} hours consultation</p>
          <p className="text-3xl font-black text-[#0094FF]">${totalPrice.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="text-sm font-semibold text-gray-300 mb-3 block">
          Additional Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Tell your consultant about your goals or any specific topics you'd like to discuss..."
          className="w-full px-4 py-3 rounded-lg bg-wise-bg-secondary border border-wise-surface-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#0094FF] transition-colors resize-none"
          rows={4}
        />
      </div>
    </motion.div>
  );
};

// ============ STEP 5: PAYMENT ============
const PaymentStep = ({
  totalPrice,
  consultantName,
  onPaymentSubmit,
  loading,
}: {
  totalPrice: number;
  consultantName: string;
  onPaymentSubmit: (data: PaymentData) => Promise<void>;
  loading: boolean;
}) => {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvc || !paymentData.cardholderName) {
      setError('Please fill in all payment details');
      return;
    }

    try {
      await onPaymentSubmit(paymentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setPaymentData({ ...paymentData, cardNumber: formattedValue });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    setPaymentData({ ...paymentData, expiryDate: value });
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPaymentData({ ...paymentData, cvc: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Complete Payment</h2>
        <p className="text-gray-400">Secure payment to confirm your consultation</p>
      </div>

      {/* Price Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0094FF]/10 border border-[#0094FF]/30 rounded-xl p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm">Consultation with</p>
            <p className="text-2xl font-bold text-white">{consultantName}</p>
          </div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-right"
          >
            <p className="text-gray-400 text-sm mb-1">Total Amount</p>
            <p className="text-4xl font-black text-[#0094FF]">
              ${totalPrice.toFixed(2)}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cardholder Name */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">Cardholder Name</label>
          <input
            type="text"
            value={paymentData.cardholderName}
            onChange={(e) => setPaymentData({ ...paymentData, cardholderName: e.target.value })}
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-lg bg-wise-bg-secondary border border-wise-surface-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#0094FF] transition-colors"
          />
        </motion.div>

        {/* Card Number */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <label className="text-sm font-semibold text-gray-300 mb-2 block">Card Number</label>
          <input
            type="text"
            value={paymentData.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            maxLength="19"
            className="w-full px-4 py-3 rounded-lg bg-wise-bg-secondary border border-wise-surface-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#0094FF] transition-colors font-mono"
          />
        </motion.div>

        {/* Expiry & CVC */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">Expiry Date</label>
            <input
              type="text"
              value={paymentData.expiryDate}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              maxLength="5"
              className="w-full px-4 py-3 rounded-lg bg-wise-bg-secondary border border-wise-surface-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#0094FF] transition-colors font-mono"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <label className="text-sm font-semibold text-gray-300 mb-2 block">CVC</label>
            <input
              type="text"
              value={paymentData.cvc}
              onChange={handleCvcChange}
              placeholder="123"
              maxLength="4"
              className="w-full px-4 py-3 rounded-lg bg-wise-bg-secondary border border-wise-surface-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#0094FF] transition-colors font-mono"
            />
          </motion.div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-wise-accent-red/10 border border-wise-accent-red/30 rounded-lg p-4 flex items-start gap-3"
            >
              <AlertCircle className="text-wise-accent-red flex-shrink-0 mt-0.5" size={20} />
              <p className="text-white text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full bg-[#0094FF] hover:bg-green-600 disabled:bg-gray-600 text-wise-bg-primary font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <Check size={20} />
              Complete Payment - ${totalPrice.toFixed(2)}
            </>
          )}
        </motion.button>

        {/* Security Note */}
        <p className="text-center text-gray-500 text-xs">
          Your payment information is secure and encrypted. We accept all major credit cards.
        </p>
      </form>
    </motion.div>
  );
};

// ============ MAIN BOOKING PAGE ============
export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [bookingData, setBookingData] = useState<BookingData>({
    consultant: null,
    selectedDate: '',
    selectedTime: '',
    duration: 1,
    timezone: 'America/New_York',
    notes: '',
  });

  // Fetch service details
  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/consulting/services/${serviceId}`);
        if (!response.ok) throw new Error('Failed to fetch service');
        const data = await response.json();
        setService(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load service');
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  // Fetch time slots when consultant is selected
  useEffect(() => {
    if (bookingData.consultant) {
      const fetchTimeSlots = async () => {
        try {
          const response = await fetch(
            `/api/consulting/availability?consultantId=${bookingData.consultant?.id}`
          );
          if (!response.ok) throw new Error('Failed to fetch availability');
          const data = await response.json();
          setTimeSlots(data);
        } catch (err) {
          console.error('Error fetching time slots:', err);
          setTimeSlots([]);
        }
      };

      fetchTimeSlots();
    }
  }, [bookingData.consultant]);

  const handlePaymentSubmit = async (paymentData: PaymentData) => {
    if (!service || !bookingData.consultant) return;

    try {
      const response = await fetch('/api/consulting/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          consultantId: bookingData.consultant.id,
          date: bookingData.selectedDate,
          time: bookingData.selectedTime,
          duration: bookingData.duration,
          timezone: bookingData.timezone,
          notes: bookingData.notes,
          payment: paymentData,
        }),
      });

      if (!response.ok) throw new Error('Booking failed');
      const result = await response.json();

      // Redirect to success page
      router.push(`/consulting/${serviceId}/booking/success?bookingId=${result.id}`);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Payment failed');
    }
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

  if (error || !service) {
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
                <p className="text-gray-400 mb-4">{error || 'Service not found'}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.back()}
                  className="px-4 py-2 bg-[#0094FF] text-wise-bg-primary font-bold rounded-lg hover:bg-green-600"
                >
                  Go Back
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const totalPrice = bookingData.duration * (bookingData.consultant?.hourlyRate || service.hourlyRate);
  const canProceed = {
    1: !!bookingData.consultant,
    2: !!bookingData.selectedDate && !!bookingData.selectedTime,
    3: bookingData.duration > 0,
    4: true,
    5: true,
  }[currentStep];

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
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => {
                if (currentStep > 1) {
                  setCurrentStep(currentStep - 1);
                } else {
                  router.back();
                }
              }}
              className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#0094FF] transition-colors font-medium text-sm"
            >
              <ChevronLeft size={16} />
              {currentStep > 1 ? 'Previous' : 'Back'}
            </motion.button>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Book a Consultation</h1>
            <p className="text-gray-400">{service.name}</p>
          </motion.div>

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={5} />

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-wise-card to-wise-bg-secondary border border-wise-surface-3 rounded-2xl p-8 md:p-12 mb-8"
          >
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <ConsultantSelectionStep
                  service={service}
                  selectedConsultant={bookingData.consultant}
                  onSelect={(consultant) => setBookingData({ ...bookingData, consultant })}
                  loading={false}
                />
              )}

              {currentStep === 2 && (
                <CalendarStep
                  selectedDate={bookingData.selectedDate}
                  selectedTime={bookingData.selectedTime}
                  timeSlots={timeSlots}
                  onDateSelect={(date) => setBookingData({ ...bookingData, selectedDate: date })}
                  onTimeSelect={(time) => setBookingData({ ...bookingData, selectedTime: time })}
                  loading={false}
                  timezone={bookingData.timezone}
                  onTimezoneChange={(tz) => setBookingData({ ...bookingData, timezone: tz })}
                />
              )}

              {currentStep === 3 && (
                <DurationStep
                  service={service}
                  selectedConsultant={bookingData.consultant}
                  duration={bookingData.duration}
                  onDurationChange={(duration) => setBookingData({ ...bookingData, duration })}
                  minDuration={service.minDuration}
                  maxDuration={service.maxDuration}
                />
              )}

              {currentStep === 4 && (
                <SummaryStep
                  service={service}
                  consultant={bookingData.consultant}
                  selectedDate={bookingData.selectedDate}
                  selectedTime={bookingData.selectedTime}
                  duration={bookingData.duration}
                  timezone={bookingData.timezone}
                  notes={bookingData.notes}
                  onNotesChange={(notes) => setBookingData({ ...bookingData, notes })}
                />
              )}

              {currentStep === 5 && (
                <PaymentStep
                  totalPrice={totalPrice}
                  consultantName={bookingData.consultant?.name || 'Consultant'}
                  onPaymentSubmit={handlePaymentSubmit}
                  loading={false}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-4"
          >
            <motion.button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 rounded-lg border border-wise-surface-3 text-white font-bold hover:border-[#0094FF]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Previous
            </motion.button>

            {currentStep < 5 && (
              <motion.button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-lg bg-[#0094FF] hover:bg-green-600 disabled:bg-gray-600 text-wise-bg-primary font-bold transition-all flex items-center gap-2 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={18} />
              </motion.button>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
