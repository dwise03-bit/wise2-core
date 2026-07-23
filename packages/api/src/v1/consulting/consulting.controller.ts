import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/common/guards/jwt-auth.guard';
import { ConsultingService } from './consulting.service';

@Controller('v1/consulting')
export class ConsultingController {
  constructor(private consultingService: ConsultingService) {}

  /**
   * GET /v1/consulting/services
   * Get all available consulting services
   */
  @Get('services')
  async getServices(@Query('tags') tags?: string) {
    const tagArray = tags ? tags.split(',') : undefined;
    return this.consultingService.getServices({
      tags: tagArray,
    });
  }

  /**
   * GET /v1/consulting/services/:serviceId
   * Get a specific consulting service with available consultants
   */
  @Get('services/:serviceId')
  async getService(@Param('serviceId') serviceId: string) {
    return this.consultingService.getService(serviceId);
  }

  /**
   * GET /v1/consulting/services/:serviceId/availability
   * Get available time slots for a consultant
   * Query params: consultantId, durationMinutes (default 60), daysAhead (default 14)
   */
  @Get('services/:serviceId/availability')
  async getAvailability(
    @Param('serviceId') serviceId: string,
    @Query('consultantId') consultantId: string,
    @Query('durationMinutes') durationMinutes: string = '60',
    @Query('daysAhead') daysAhead: string = '14',
  ) {
    return this.consultingService.getAvailableSlots(
      serviceId,
      consultantId,
      parseInt(durationMinutes, 10),
      parseInt(daysAhead, 10),
    );
  }

  /**
   * POST /v1/consulting/bookings
   * Create a new booking (initiates Stripe payment)
   */
  @UseGuards(JwtAuthGuard)
  @Post('bookings')
  async createBooking(
    @Request() req,
    @Body()
    body: {
      serviceId: string;
      consultantId: string;
      startTime: string; // ISO 8601 datetime
      durationHours: number;
      notes?: string;
    },
  ) {
    const userId = req.user.id;
    return this.consultingService.createBooking(
      userId,
      body.serviceId,
      body.consultantId,
      body.startTime,
      body.durationHours,
      body.notes,
    );
  }

  /**
   * GET /v1/consulting/bookings
   * Get all bookings for the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get('bookings')
  async getUserBookings(@Request() req) {
    const userId = req.user.id;
    return this.consultingService.getUserBookings(userId);
  }

  /**
   * GET /v1/consulting/bookings/:bookingId
   * Get specific booking details
   */
  @UseGuards(JwtAuthGuard)
  @Get('bookings/:bookingId')
  async getBooking(@Param('bookingId') bookingId: string) {
    return this.consultingService.getBooking(bookingId);
  }

  /**
   * PUT /v1/consulting/bookings/:bookingId
   * Reschedule a booking
   */
  @UseGuards(JwtAuthGuard)
  @Put('bookings/:bookingId')
  async rescheduleBooking(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Body()
    body: {
      startTime: string;
      durationHours?: number;
    },
  ) {
    const userId = req.user.id;
    return this.consultingService.rescheduleBooking(
      bookingId,
      userId,
      body.startTime,
      body.durationHours,
    );
  }

  /**
   * DELETE /v1/consulting/bookings/:bookingId
   * Cancel a booking
   */
  @UseGuards(JwtAuthGuard)
  @Delete('bookings/:bookingId')
  async cancelBooking(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Body() body: { reason?: string },
  ) {
    const userId = req.user.id;
    return this.consultingService.cancelBooking(bookingId, userId, body?.reason);
  }

  /**
   * POST /v1/consulting/bookings/:bookingId/confirm
   * Confirm booking after successful Stripe payment
   * Called via webhook or client after payment succeeds
   */
  @Post('bookings/:bookingId/confirm')
  async confirmBooking(@Param('bookingId') bookingId: string) {
    // This endpoint could also accept a Stripe PaymentIntent ID to find the booking
    return this.consultingService.confirmBooking(bookingId);
  }
}
