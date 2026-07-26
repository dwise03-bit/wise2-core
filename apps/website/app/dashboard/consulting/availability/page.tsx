'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Footer } from '@/components/wise';

interface Consultant {
  id: string;
  name: string;
  email: string;
}

interface AvailabilitySlot {
  id: string;
  consultantId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
  isRecurring: boolean;
  validFrom?: string; // ISO date for one-time slots
  validTo?: string; // ISO date for one-time slots
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isRecurring: boolean;
  validFrom: string;
  validTo: string;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const generateTimeOptions = () => {
  const options = [];
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, '0');
    options.push(`${hour}:00`);
    options.push(`${hour}:30`);
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export default function AvailabilityPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>('');
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    timezone: 'UTC',
    isRecurring: true,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '',
  });

  // Fetch consultants
  const fetchConsultants = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/consultants');
      if (!response.ok) throw new Error('Failed to fetch consultants');
      const data = await response.json();
      const consultantList = data.consultants || [];
      setConsultants(consultantList);
      if (consultantList.length > 0 && !selectedConsultantId) {
        setSelectedConsultantId(consultantList[0].id);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch consultants');
    } finally {
      setLoading(false);
    }
  }, [selectedConsultantId]);

  // Fetch availability slots
  const fetchAvailabilitySlots = useCallback(async (consultantId: string) => {
    if (!consultantId) {
      setAvailabilitySlots([]);
      return;
    }
    try {
      const response = await fetch(
        `/api/admin/consultants/${consultantId}/availability`
      );
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      setAvailabilitySlots(data.slots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    }
  }, []);

  useEffect(() => {
    fetchConsultants();
  }, []);

  useEffect(() => {
    fetchAvailabilitySlots(selectedConsultantId);
  }, [selectedConsultantId, fetchAvailabilitySlots]);

  // Validate time range
  const validateTimeRange = (startTime: string, endTime: string): boolean => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;
    return startTotalMin < endTotalMin;
  };

  // Validate date range
  const validateDateRange = (validFrom: string, validTo: string): boolean => {
    if (!validFrom) return true;
    if (!validTo) return true;
    return new Date(validFrom) <= new Date(validTo);
  };

  const handleOpenModal = (slot?: AvailabilitySlot) => {
    if (slot) {
      setEditingSlot(slot);
      setFormData({
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        timezone: slot.timezone,
        isRecurring: slot.isRecurring,
        validFrom: slot.validFrom || '',
        validTo: slot.validTo || '',
      });
    } else {
      setEditingSlot(null);
      setFormData({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'UTC',
        isRecurring: true,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '',
      });
    }
    setValidationError(null);
    setShowModal(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate
    if (!validateTimeRange(formData.startTime, formData.endTime)) {
      setValidationError('End time must be after start time');
      return;
    }

    if (
      !formData.isRecurring &&
      !validateDateRange(formData.validFrom, formData.validTo)
    ) {
      setValidationError('Valid To date must be after Valid From date');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        timezone: formData.timezone,
        isRecurring: formData.isRecurring,
        validFrom: formData.isRecurring ? null : formData.validFrom,
        validTo: formData.isRecurring ? null : formData.validTo,
      };

      if (editingSlot) {
        const response = await fetch(
          `/api/admin/consultants/${selectedConsultantId}/availability/${editingSlot.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        if (!response.ok) throw new Error('Failed to update availability');
      } else {
        const response = await fetch(
          `/api/admin/consultants/${selectedConsultantId}/availability`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        if (!response.ok) throw new Error('Failed to add availability');
      }

      await fetchAvailabilitySlots(selectedConsultantId);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save availability');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/admin/consultants/${selectedConsultantId}/availability/${slotId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error('Failed to delete availability');
      await fetchAvailabilitySlots(selectedConsultantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete availability');
    } finally {
      setSubmitting(false);
    }
  };

  // Sort availability by day and time
  const sortedSlots = useMemo(() => {
    return [...availabilitySlots].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) {
        return a.dayOfWeek - b.dayOfWeek;
      }
      return a.startTime.localeCompare(b.startTime);
    });
  }, [availabilitySlots]);

  // Group slots by day for calendar view
  const slotsByDay = useMemo(() => {
    const grouped: Record<number, AvailabilitySlot[]> = {};
    DAYS_OF_WEEK.forEach((_, i) => {
      grouped[i] = [];
    });
    sortedSlots.forEach((slot) => {
      grouped[slot.dayOfWeek].push(slot);
    });
    return grouped;
  }, [sortedSlots]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <div className="pt-32 pb-20 px-6 flex items-center justify-center">
          <div className="text-gray-400">Loading availability...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl font-bold">Availability Management</h1>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 transition"
            >
              Add Slot
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Consultant Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Select Consultant
            </label>
            <select
              value={selectedConsultantId}
              onChange={(e) => setSelectedConsultantId(e.target.value)}
              className="w-full max-w-md px-4 py-3 bg-[#101010] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Select a consultant --</option>
              {consultants.map((consultant) => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats */}
          {selectedConsultantId && sortedSlots.length > 0 && (
            <div className="mb-8 grid md:grid-cols-3 gap-6">
              <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="text-gray-400 text-sm mb-2">Total Slots</div>
                <div className="text-3xl font-bold">{sortedSlots.length}</div>
              </div>
              <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="text-gray-400 text-sm mb-2">Recurring Slots</div>
                <div className="text-3xl font-bold text-emerald-400">
                  {sortedSlots.filter((s) => s.isRecurring).length}
                </div>
              </div>
              <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-6">
                <div className="text-gray-400 text-sm mb-2">One-Time Slots</div>
                <div className="text-3xl font-bold text-blue-400">
                  {sortedSlots.filter((s) => !s.isRecurring).length}
                </div>
              </div>
            </div>
          )}

          {/* Calendar View */}
          {selectedConsultantId && (
            <div className="mb-8 bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Weekly Availability</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {DAYS_OF_WEEK.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-4"
                  >
                    <h3 className="font-semibold text-emerald-400 mb-3 text-center">
                      {day}
                    </h3>
                    <div className="space-y-2">
                      {slotsByDay[dayIndex].length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-2">
                          No availability
                        </p>
                      ) : (
                        slotsByDay[dayIndex].map((slot) => (
                          <div
                            key={slot.id}
                            className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2 text-xs"
                          >
                            <div className="font-semibold text-emerald-400">
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              {slot.timezone}
                            </div>
                            {!slot.isRecurring && (
                              <div className="text-gray-500 text-xs mt-1">
                                {slot.validFrom}
                              </div>
                            )}
                            <div className="text-gray-500 text-xs mt-1">
                              {slot.isRecurring ? 'Recurring' : 'One-time'}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Availability Table */}
          <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#1a1a1a]">
              <h2 className="text-2xl font-bold">Availability Schedule</h2>
            </div>

            {!selectedConsultantId ? (
              <div className="p-8 text-center text-gray-400">
                Please select a consultant to view availability
              </div>
            ) : sortedSlots.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No availability slots configured. Add one to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1a1a1a] bg-[#0a0a0a]">
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        Day
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        Start Time
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        End Time
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        Timezone
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        Type
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-400">
                        Valid Dates
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSlots.map((slot, idx) => (
                      <tr
                        key={slot.id}
                        className={`border-b border-[#0f0f0f] hover:bg-[#0a0a0a] transition ${
                          idx % 2 === 0 ? 'bg-[#050505]' : 'bg-[#101010]'
                        }`}
                      >
                        <td className="py-4 px-6 font-semibold">
                          {DAYS_OF_WEEK[slot.dayOfWeek]}
                        </td>
                        <td className="py-4 px-6">{slot.startTime}</td>
                        <td className="py-4 px-6">{slot.endTime}</td>
                        <td className="py-4 px-6 text-gray-400">{slot.timezone}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              slot.isRecurring
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {slot.isRecurring ? 'Recurring' : 'One-time'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-400">
                          {slot.isRecurring ? (
                            <span>Ongoing</span>
                          ) : (
                            <span>
                              {slot.validFrom} to {slot.validTo || 'TBD'}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenModal(slot)}
                              disabled={submitting}
                              className="px-3 py-1 text-sm bg-[#161616] hover:bg-[#1a1a1a] rounded transition disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              disabled={submitting}
                              className="px-3 py-1 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded transition disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingSlot ? 'Edit Availability Slot' : 'Add Availability Slot'}
            </h3>

            {validationError && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {validationError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Day of Week */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Day of Week
                </label>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Start Time
                </label>
                <select
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  End Time
                </label>
                <select
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recurring */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded bg-[#050505] border border-[#1a1a1a] text-emerald-500 focus:outline-none"
                />
                <label htmlFor="isRecurring" className="text-gray-300 cursor-pointer">
                  Recurring every {DAYS_OF_WEEK[formData.dayOfWeek]}
                </label>
              </div>

              {/* Valid From/To Dates (for one-time slots) */}
              {!formData.isRecurring && (
                <div className="space-y-6 p-6 bg-[#050505] border border-[#1a1a1a] rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Valid From
                    </label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 bg-[#101010] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      required={!formData.isRecurring}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Valid To
                    </label>
                    <input
                      type="date"
                      name="validTo"
                      value={formData.validTo}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 bg-[#101010] border border-[#1a1a1a] rounded-lg text-white focus:outline-none focus:border-emerald-500"
                      required={!formData.isRecurring}
                    />
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-6 py-3 bg-[#161616] rounded-lg font-semibold hover:bg-[#1a1a1a] transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedConsultantId}
                  className="px-6 py-3 bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingSlot ? 'Update Slot' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
