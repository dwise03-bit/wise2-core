'use client';

import { useState, useCallback, useEffect } from 'react';
import { consultingClient, ApiClientError } from '@/lib/consulting-client';
import { TimeSlot, AvailabilityParams } from '@/types/consulting';

interface UseConsultingAvailabilityState {
  slots: TimeSlot[];
  loading: boolean;
  error: string | null;
  consultantId: string | null;
}

/**
 * Hook for fetching consultant availability
 */
export function useConsultingAvailability(token?: string) {
  const [state, setState] = useState<UseConsultingAvailabilityState>({
    slots: [],
    loading: false,
    error: null,
    consultantId: null,
  });

  // Set token when provided
  useEffect(() => {
    if (token) {
      consultingClient.setToken(token);
    }
  }, [token]);

  // Fetch availability
  const fetchAvailability = useCallback(
    async (params: AvailabilityParams): Promise<TimeSlot[]> => {
      setState({ slots: [], loading: true, error: null, consultantId: params.consultantId });
      try {
        const slots = await consultingClient.getAvailability(params);
        setState({
          slots,
          loading: false,
          error: null,
          consultantId: params.consultantId,
        });
        return slots;
      } catch (err) {
        const error =
          err instanceof ApiClientError
            ? err.message
            : 'Failed to fetch availability';
        setState((s) => ({ ...s, loading: false, error }));
        throw err;
      }
    },
    []
  );

  // Clear availability
  const clearAvailability = useCallback(() => {
    setState({ slots: [], loading: false, error: null, consultantId: null });
  }, []);

  // Get available slots for a specific date
  const getAvailableSlots = useCallback(
    (date: string): TimeSlot[] => {
      return state.slots.filter((slot) => slot.date === date && slot.available);
    },
    [state.slots]
  );

  // Get grouped slots by date
  const getSlotsByDate = useCallback((): Record<string, TimeSlot[]> => {
    const grouped: Record<string, TimeSlot[]> = {};
    state.slots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  }, [state.slots]);

  return {
    ...state,
    fetchAvailability,
    clearAvailability,
    getAvailableSlots,
    getSlotsByDate,
  };
}
