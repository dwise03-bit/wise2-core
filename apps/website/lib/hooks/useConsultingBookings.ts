'use client';

import { useState, useCallback, useEffect } from 'react';
import { consultingClient, ApiClientError } from '@/lib/consulting-client';
import {
  BookingListResponse,
  BookingDetail,
  CreateBookingRequest,
  RescheduleBookingRequest,
} from '@/types/consulting';

interface UseConsultingBookingsState {
  bookings: BookingListResponse | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing consulting bookings
 */
export function useConsultingBookings(token?: string) {
  const [state, setState] = useState<UseConsultingBookingsState>({
    bookings: null,
    loading: false,
    error: null,
  });

  // Set token when provided
  useEffect(() => {
    if (token) {
      consultingClient.setToken(token);
    }
  }, [token]);

  // Fetch bookings
  const fetchBookings = useCallback(
    async (params?: { status?: string; limit?: number; offset?: number }) => {
      setState({ bookings: null, loading: true, error: null });
      try {
        const data = await consultingClient.listBookings(params);
        setState({ bookings: data, loading: false, error: null });
        return data;
      } catch (err) {
        const error =
          err instanceof ApiClientError ? err.message : 'Failed to fetch bookings';
        setState({ bookings: null, loading: false, error });
        throw err;
      }
    },
    []
  );

  // Create booking
  const createBooking = useCallback(
    async (booking: CreateBookingRequest): Promise<BookingDetail> => {
      try {
        const result = await consultingClient.createBooking(booking);
        // Refresh bookings list after creation
        await fetchBookings();
        return result;
      } catch (err) {
        const error =
          err instanceof ApiClientError
            ? err.message
            : 'Failed to create booking';
        setState((s) => ({ ...s, error }));
        throw err;
      }
    },
    [fetchBookings]
  );

  // Get booking details
  const getBooking = useCallback(
    async (bookingId: string): Promise<BookingDetail> => {
      try {
        return await consultingClient.getBooking(bookingId);
      } catch (err) {
        const error =
          err instanceof ApiClientError
            ? err.message
            : 'Failed to fetch booking';
        setState((s) => ({ ...s, error }));
        throw err;
      }
    },
    []
  );

  // Reschedule booking
  const rescheduleBooking = useCallback(
    async (
      bookingId: string,
      reschedule: RescheduleBookingRequest
    ): Promise<BookingDetail> => {
      try {
        const result = await consultingClient.rescheduleBooking(
          bookingId,
          reschedule
        );
        // Refresh bookings list after reschedule
        await fetchBookings();
        return result;
      } catch (err) {
        const error =
          err instanceof ApiClientError
            ? err.message
            : 'Failed to reschedule booking';
        setState((s) => ({ ...s, error }));
        throw err;
      }
    },
    [fetchBookings]
  );

  // Cancel booking
  const cancelBooking = useCallback(
    async (bookingId: string, reason?: string): Promise<void> => {
      try {
        await consultingClient.cancelBooking(bookingId, reason);
        // Refresh bookings list after cancellation
        await fetchBookings();
      } catch (err) {
        const error =
          err instanceof ApiClientError
            ? err.message
            : 'Failed to cancel booking';
        setState((s) => ({ ...s, error }));
        throw err;
      }
    },
    [fetchBookings]
  );

  return {
    ...state,
    fetchBookings,
    createBooking,
    getBooking,
    rescheduleBooking,
    cancelBooking,
  };
}
