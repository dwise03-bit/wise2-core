import { SchedulerProvider, TimeSlot, SchedulingRequest, ScheduledBooking } from './types';
import { v4 as uuid } from 'uuid';

export class SchedulerMock implements SchedulerProvider {
  readonly name = 'Scheduler Mock';

  async getAvailability(
    serviceType: string,
    date: Date,
    duration: number = 90
  ): Promise<TimeSlot[]> {
    const slots: TimeSlot[] = [];

    // Generate 3 available time slots on the requested date
    for (let hour = 8; hour < 17; hour += 3) {
      const start = new Date(date);
      start.setHours(hour, 0, 0, 0);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + duration);

      slots.push({
        start,
        end,
        technician: `Available Technician ${Math.ceil(hour / 3)}`,
      });
    }

    return slots;
  }

  async createBooking(request: SchedulingRequest): Promise<ScheduledBooking> {
    return {
      id: uuid(),
      confirmedAt: new Date(),
      confirmationNumber: `CONF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  async cancelBooking(id: string): Promise<void> {
    // Mock cancellation
    console.log(`Booking ${id} cancelled`);
  }
}
