import { Injectable } from '@nestjs/common';
import { loadJsonFile, saveJsonFile } from './cloud-persistence';

type StripeEventIndex = Record<string, { type: string; processedAt: string }>;

@Injectable()
export class CloudStripeEventStore {
  private events: StripeEventIndex;

  constructor() {
    this.events = loadJsonFile<StripeEventIndex>('stripe-events.json', {});
  }

  hasProcessed(eventId: string): boolean {
    return Boolean(this.events[eventId]);
  }

  markProcessed(eventId: string, type: string): void {
    this.events[eventId] = {
      type,
      processedAt: new Date().toISOString(),
    };
    saveJsonFile('stripe-events.json', this.events);
  }

  clear(): void {
    this.events = {};
    saveJsonFile('stripe-events.json', this.events);
  }
}
