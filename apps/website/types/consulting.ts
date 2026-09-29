/**
 * Consulting API Types
 * Shared types for consulting-related requests and responses
 */

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show',
}

export interface TimeSlot {
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  available: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  consultantId: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  duration: number; // Minutes
  timezone: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingDetail extends Booking {
  consultantName: string;
  consultantEmail: string;
  serviceName: string;
  totalPrice: number;
  meetingLink?: string;
}

export interface BookingResponse {
  success: boolean;
  data?: BookingDetail;
  error?: string;
}

export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  limit: number;
  offset: number;
}

export interface CreateBookingRequest {
  serviceId: string;
  consultantId: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  duration: number; // Minutes
  timezone: string;
  notes?: string;
}

export interface RescheduleBookingRequest {
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  timezone?: string;
}

export interface CancelBookingRequest {
  reason?: string;
}

export interface AvailabilityParams {
  consultantId: string;
  timezone?: string; // Default: America/New_York
  days?: number; // Default: 14, max: 90
}

export interface AvailabilityResponse {
  consultantId: string;
  timezone: string;
  slots: TimeSlot[];
  generatedAt: string;
}

export interface ApiErrorResponse {
  error: string;
  message?: string;
  status?: number;
  details?: Record<string, any>;
}

/**
 * Query parameters for listing bookings
 */
export interface ListBookingsParams {
  status?: BookingStatus;
  limit?: number;
  offset?: number;
  consultantId?: string;
  dateFrom?: string;
  dateTo?: string;
}
