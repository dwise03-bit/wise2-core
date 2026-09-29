'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  Loader,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  booked: boolean;
}

interface AvailabilityCalendarProps {
  consultantId: string;
  serviceId: string;
  durationMinutes?: number;
  onSlotSelect: (slot: { startTime: string; endTime: string }) => void;
  disabled?: boolean;
}

type Timezone = 'UTC' | 'EST' | 'CST' | 'MST' | 'PST' | 'Local';

const TIMEZONE_OFFSETS: Record<Timezone, number> = {
  UTC: 0,
  EST: -5,
  CST: -6,
  MST: -7,
  PST: -8,
  Local: new Date().getTimezoneOffset() / -60,
};

const TIMEZONE_OPTIONS: Timezone[] = ['UTC', 'EST', 'CST', 'MST', 'PST', 'Local'];

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  consultantId,
  serviceId,
  durationMinutes = 60,
  onSlotSelect,
  disabled = false,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [timezone, setTimezone] = useState<Timezone>('Local');
  const [availability, setAvailability] = useState<Record<string, TimeSlot[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch availability data
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          consultantId,
          serviceId,
          durationMinutes: durationMinutes.toString(),
          startDate: currentDate.toISOString().split('T')[0],
        });

        const response = await fetch(
          `/api/consulting/availability?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch availability: ${response.statusText}`);
        }

        const data = await response.json();
        setAvailability(data.availability || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch availability');
        setAvailability({});
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [consultantId, serviceId, durationMinutes, currentDate]);

  // Generate next 14 days
  const dates = useMemo(() => {
    const days = [];
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentDate]);

  // Get slots for selected date
  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = selectedDate.toISOString().split('T')[0];
    return availability[dateStr] || [];
  }, [selectedDate, availability]);

  // Filter available slots for the duration
  const availableSlots = useMemo(() => {
    return selectedDateSlots.filter((slot) => {
      if (!slot.available || slot.booked) return false;

      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60);

      return duration >= durationMinutes;
    });
  }, [selectedDateSlots, durationMinutes]);

  const handlePrevWeek = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedSlot(null);
  }, [currentDate]);

  const handleNextWeek = useCallback(() => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
    setSelectedDate(null);
    setSelectedSlot(null);
  }, [currentDate]);

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  }, []);

  const handleSlotSelect = useCallback(
    (slot: TimeSlot) => {
      setSelectedSlot(slot);
      onSlotSelect({
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    },
    [onSlotSelect]
  );

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const offset = TIMEZONE_OFFSETS[timezone];

    // Adjust for timezone
    date.setHours(date.getHours() + offset);

    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isDateInPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDateAvailabilityCount = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];
    return (availability[dateStr] || []).filter(
      (slot) => slot.available && !slot.booked
    ).length;
  };

  if (error && !loading) {
    return (
      <motion.div
        className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AlertCircle className="text-red-400" size={20} />
        <div>
          <p className="text-sm font-medium text-red-400">Unable to load availability</p>
          <p className="text-xs text-red-300 mt-1">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with timezone selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="text-blue-400" size={20} />
          <h3 className="text-lg font-semibold text-white">Select a time slot</h3>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="timezone" className="text-xs text-slate-400">
            Timezone:
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value as Timezone)}
            disabled={disabled || loading}
            className="text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-1 hover:border-blue-500/50 focus:border-blue-500 focus:outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz}>
                {tz} (UTC{TIMEZONE_OFFSETS[tz] >= 0 ? '+' : ''}{TIMEZONE_OFFSETS[tz]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-4">
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <motion.button
            onClick={handlePrevWeek}
            disabled={disabled || loading}
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="text-slate-400" size={20} />
          </motion.button>

          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">
              {dates[0].toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {dates[0].toLocaleDateString('en-US', { day: 'numeric' })} -{' '}
              {dates[13].toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>

          <motion.button
            onClick={handleNextWeek}
            disabled={disabled || loading}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="text-slate-400" size={20} />
          </motion.button>
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7 gap-2">
          {loading ? (
            <motion.div
              className="col-span-7 flex items-center justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader className="text-blue-400 animate-spin" size={24} />
            </motion.div>
          ) : (
            dates.map((date, idx) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              const isPast = isDateInPast(date);
              const slotCount = getDateAvailabilityCount(date);

              return (
                <motion.button
                  key={idx}
                  onClick={() => !isPast && !disabled && handleDateClick(date)}
                  disabled={isPast || disabled || slotCount === 0}
                  whileHover={
                    !isPast && slotCount > 0 && !disabled
                      ? { y: -4, scale: 1.05 }
                      : {}
                  }
                  whileTap={
                    !isPast && slotCount > 0 && !disabled ? { scale: 0.98 } : {}
                  }
                  className={`relative p-3 rounded-lg transition-all border text-center ${
                    isSelected
                      ? 'bg-blue-500/20 border-blue-500 shadow-lg shadow-blue-500/20'
                      : isPast
                        ? 'bg-slate-900 border-slate-800 opacity-40 cursor-not-allowed'
                        : slotCount === 0
                          ? 'bg-slate-800/50 border-slate-700 opacity-60 cursor-not-allowed'
                          : 'bg-slate-800/30 border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50 cursor-pointer'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-300">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-lg font-bold text-white my-1">
                    {date.getDate()}
                  </div>
                  {!isPast && slotCount > 0 && (
                    <motion.div
                      className="text-xs text-blue-400 font-medium"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {slotCount} slot{slotCount !== 1 ? 's' : ''}
                    </motion.div>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>

      {/* Time slots for selected date */}
      <AnimatePresence mode="wait">
        {selectedDate && !loading && (
          <motion.div
            key="slots"
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Clock className="text-green-400" size={18} />
              <h4 className="font-medium text-white">
                Available times for {formatDate(selectedDate)}
              </h4>
            </div>

            {availableSlots.length === 0 ? (
              <motion.div
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Clock className="text-slate-500 mx-auto mb-2" size={24} />
                <p className="text-sm text-slate-400">No available time slots</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-2">
                {availableSlots.map((slot, idx) => {
                  const isSelectedSlot =
                    selectedSlot?.startTime === slot.startTime &&
                    selectedSlot?.endTime === slot.endTime;

                  return (
                    <motion.button
                      key={`${slot.startTime}-${slot.endTime}`}
                      onClick={() => !disabled && handleSlotSelect(slot)}
                      disabled={disabled}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={!disabled ? { y: -2 } : {}}
                      whileTap={!disabled ? { scale: 0.95 } : {}}
                      className={`relative p-3 rounded-lg border transition-all ${
                        isSelectedSlot
                          ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20 ring-2 ring-green-500/50'
                          : 'bg-slate-800/30 border-slate-700 hover:border-green-500/50 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-green-500/10 cursor-pointer'
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-white text-sm">
                          {formatTime(slot.startTime)}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {durationMinutes}m
                        </div>
                      </div>

                      {isSelectedSlot && (
                        <motion.div
                          className="absolute top-1 right-1"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                        >
                          <CheckCircle
                            className="text-green-400"
                            size={16}
                            fill="currentColor"
                          />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Selected slot summary */}
            <AnimatePresence>
              {selectedSlot && (
                <motion.div
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-medium text-green-400">Slot selected</p>
                    <p className="text-xs text-green-300 mt-1">
                      {formatDate(selectedDate)} at {formatTime(selectedSlot.startTime)} (
                      {durationMinutes} minutes)
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timezone notice */}
      <motion.div
        className="text-xs text-slate-500 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="w-1 h-1 bg-slate-600 rounded-full" />
        Times displayed in {timezone} timezone
      </motion.div>
    </motion.div>
  );
};
