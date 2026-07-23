import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/common/prisma.service';
import Stripe from 'stripe';
import { addDays, startOfDay, endOfDay, parseISO, format, isBefore, isAfter } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

@Injectable()
export class ConsultingService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }

  /**
   * Get all consulting services with optional filtering
   */
  async getServices(filters?: { tags?: string[] }) {
    return this.prisma.consultingService.findMany({
      where: filters?.tags ? {
        tags: {
          hasSome: filters.tags,
        },
      } : undefined,
      include: {
        consultants: {
          include: {
            consultant: {
              select: {
                id: true,
                name: true,
                expertise: true,
                hourlyRate: true,
                isActive: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get a specific consulting service with available consultants
   */
  async getService(serviceId: string) {
    const service = await this.prisma.consultingService.findUnique({
      where: { id: serviceId },
      include: {
        consultants: {
          include: {
            consultant: {
              select: {
                id: true,
                name: true,
                bio: true,
                expertise: true,
                hourlyRate: true,
                isActive: true,
              },
            },
          },
          where: {
            consultant: { isActive: true },
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException('Consulting service not found');
    }

    return service;
  }

  /**
   * Get available time slots for a consultant and service
   * Returns next 7-14 days of available slots
   */
  async getAvailableSlots(
    serviceId: string,
    consultantId: string,
    durationMinutes: number = 60,
    daysAhead: number = 14,
  ) {
    const consultant = await this.prisma.consultant.findUnique({
      where: { id: consultantId },
      include: {
        availability: {
          where: {
            OR: [
              {
                isRecurring: true,
                validFrom: { lte: new Date() },
                validTo: { gte: new Date() },
              },
              {
                isRecurring: false,
              },
            ],
          },
        },
      },
    });

    if (!consultant) {
      throw new NotFoundException('Consultant not found');
    }

    // Get existing bookings for this consultant
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        consultantId,
        status: { in: ['scheduled', 'in_progress'] },
        startTime: {
          gte: startOfDay(new Date()),
          lte: endOfDay(addDays(new Date(), daysAhead)),
        },
      },
    });

    // Generate available slots
    const slots = [];
    const now = new Date();
    const endDate = addDays(now, daysAhead);

    for (let date = startOfDay(addDays(now, 1)); isBefore(date, endDate); date = addDays(date, 1)) {
      const dayOfWeek = date.getDay();

      // Find matching availability for this day
      const dayAvailability = consultant.availability.find(
        (avail) => avail.dayOfWeek === dayOfWeek && avail.isRecurring,
      );

      if (!dayAvailability) continue;

      // Parse availability times
      const [startHour, startMin] = dayAvailability.startTime.split(':').map(Number);
      const [endHour, endMin] = dayAvailability.endTime.split(':').map(Number);

      const tz = dayAvailability.timezone || 'UTC';
      const dayStart = zonedTimeToUtc(
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMin),
        tz,
      );
      const dayEnd = zonedTimeToUtc(
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMin),
        tz,
      );

      // Generate 1-hour slots throughout the day
      let slotStart = dayStart;
      while (isBefore(slotStart, dayEnd)) {
        const slotEnd = addDays(slotStart, 0);
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

        // Check if slot conflicts with existing bookings
        const hasConflict = existingBookings.some(
          (booking) =>
            (isBefore(slotStart, booking.endTime) && isAfter(slotEnd, booking.startTime)),
        );

        if (!hasConflict && isBefore(slotEnd, dayEnd)) {
          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            available: true,
          });
        }

        slotStart = new Date(slotStart.getTime() + 30 * 60000); // 30-min increments
      }
    }

    return slots;
  }

  /**
   * Create a booking and initiate Stripe payment
   */
  async createBooking(
    userId: string,
    serviceId: string,
    consultantId: string,
    startTime: string,
    durationHours: number,
    notes?: string,
  ) {
    // Validate service exists
    const service = await this.prisma.consultingService.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Validate consultant exists and is active
    const consultant = await this.prisma.consultant.findUnique({
      where: { id: consultantId },
    });

    if (!consultant || !consultant.isActive) {
      throw new NotFoundException('Consultant not found or not available');
    }

    // Validate duration
    if (durationHours < service.minHours || (service.maxHours && durationHours > service.maxHours)) {
      throw new BadRequestException(
        `Duration must be between ${service.minHours} and ${service.maxHours || 'unlimited'} hours`,
      );
    }

    // Calculate end time and price
    const start = parseISO(startTime);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
    const hourlyRate = service.hourlyRate; // Could override with consultant-specific rate
    const totalPrice = durationHours * hourlyRate;

    // Check for booking conflicts
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        consultantId,
        status: { in: ['scheduled', 'in_progress'] },
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException('Time slot is no longer available');
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Amount in cents
      currency: 'usd',
      description: `AI Consulting: ${service.name} - ${durationHours} hours`,
      metadata: {
        userId,
        serviceId,
        consultantId,
        durationHours: durationHours.toString(),
      },
    });

    // Create booking record (pending payment)
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        serviceId,
        consultantId,
        startTime: start,
        endTime: end,
        durationHours,
        totalPrice,
        notes,
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
        status: 'scheduled',
      },
      include: {
        service: true,
        consultant: true,
      },
    });

    return {
      booking,
      paymentIntent: {
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    };
  }

  /**
   * Confirm booking after successful payment
   */
  async confirmBooking(paymentIntentId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: {
        consultant: true,
        user: true,
        service: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Update booking payment status
    const updatedBooking = await this.prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'succeeded',
      },
      include: {
        consultant: true,
        user: true,
        service: true,
      },
    });

    // TODO: Create Google Calendar event
    // TODO: Send confirmation email to user and consultant

    return updatedBooking;
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        service: true,
        consultant: true,
        postCallSummary: {
          include: {
            actionItems: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        consultant: true,
        user: true,
        postCallSummary: {
          include: {
            actionItems: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(
    bookingId: string,
    userId: string,
    newStartTime: string,
    newDurationHours?: number,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'scheduled') {
      throw new BadRequestException('Can only reschedule scheduled bookings');
    }

    const newStart = parseISO(newStartTime);
    const duration = newDurationHours || booking.durationHours;
    const newEnd = new Date(newStart.getTime() + duration * 60 * 60 * 1000);

    // Check for conflicts
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        consultantId: booking.consultantId,
        id: { not: bookingId },
        status: { in: ['scheduled', 'in_progress'] },
        AND: [
          { startTime: { lt: newEnd } },
          { endTime: { gt: newStart } },
        ],
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException('New time slot is not available');
    }

    // Update booking
    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        startTime: newStart,
        endTime: newEnd,
        durationHours: duration,
      },
      include: {
        service: true,
        consultant: true,
      },
    });

    // TODO: Update Google Calendar event
    // TODO: Send rescheduling notification emails

    return updatedBooking;
  }

  /**
   * Cancel a booking (with optional refund)
   */
  async cancelBooking(bookingId: string, userId: string, reason?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.userId !== userId) {
      throw new NotFoundException('Booking not found');
    }

    if (!['scheduled', 'in_progress'].includes(booking.status)) {
      throw new BadRequestException('Cannot cancel this booking');
    }

    // Calculate refund (50% if within 24 hours, full otherwise)
    const hoursUntilCall = (booking.startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    const refundPercentage = hoursUntilCall < 24 ? 0.5 : 1.0;
    const refundAmount = Math.round(booking.totalPrice * refundPercentage * 100); // in cents

    // Process refund if payment succeeded
    if (booking.paymentStatus === 'succeeded' && refundAmount > 0) {
      if (booking.stripePaymentIntentId) {
        await this.stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId,
          amount: refundAmount,
        });
      }
    }

    // Update booking status
    const cancelledBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        paymentStatus: refundAmount > 0 ? 'refunded' : booking.paymentStatus,
      },
      include: {
        service: true,
        consultant: true,
      },
    });

    // TODO: Cancel Google Calendar event
    // TODO: Send cancellation email

    return cancelledBooking;
  }
}
