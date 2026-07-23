/**
 * Consulting API Client
 * Utilities for making authenticated requests to consulting API routes
 */

import {
  Booking,
  BookingDetail,
  BookingListResponse,
  CreateBookingRequest,
  RescheduleBookingRequest,
  AvailabilityParams,
  TimeSlot,
  ApiErrorResponse,
} from '@/types/consulting';

class ConsultingClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '/api/consulting') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token for subsequent requests
   */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * Get authentication token from local storage or cookies
   */
  private async getToken(): Promise<string | null> {
    if (this.token) {
      return this.token;
    }
    // Attempt to retrieve from localStorage or sessionStorage
    try {
      return (
        localStorage.getItem('consulting_token') ||
        sessionStorage.getItem('consulting_token')
      );
    } catch {
      return null;
    }
  }

  /**
   * Make authenticated request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw new ApiClientError(
        errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json();
  }

  /**
   * List user's bookings
   */
  async listBookings(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<BookingListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    const endpoint = query ? `/bookings?${query}` : '/bookings';

    return this.request<BookingListResponse>(endpoint);
  }

  /**
   * Create a new booking
   */
  async createBooking(booking: CreateBookingRequest): Promise<BookingDetail> {
    return this.request<BookingDetail>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string): Promise<BookingDetail> {
    return this.request<BookingDetail>(`/bookings/${bookingId}`);
  }

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(
    bookingId: string,
    reschedule: RescheduleBookingRequest
  ): Promise<BookingDetail> {
    return this.request<BookingDetail>(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(reschedule),
    });
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<{ success: true; message: string }> {
    const endpoint = reason
      ? `/bookings/${bookingId}?reason=${encodeURIComponent(reason)}`
      : `/bookings/${bookingId}`;

    return this.request<{ success: true; message: string }>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Get available time slots for a consultant
   */
  async getAvailability(params: AvailabilityParams): Promise<TimeSlot[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('consultantId', params.consultantId);
    if (params.timezone) queryParams.append('timezone', params.timezone);
    if (params.days) queryParams.append('days', params.days.toString());

    return this.request<TimeSlot[]>(
      `/availability?${queryParams.toString()}`
    );
  }
}

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isConflict(): boolean {
    return this.status === 409;
  }

  isValidationError(): boolean {
    return this.status === 400;
  }
}

// Export singleton instance
export const consultingClient = new ConsultingClient();

// Export class for testing/custom instances
export default ConsultingClient;
