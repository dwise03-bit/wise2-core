import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { WiseImpEventsService, WiseImpEventInput } from './wise-imp-events.service';

const MAX_EVENTS_PER_REQUEST = 50;

@Controller('v1/wise-imp-events')
export class WiseImpEventsController {
  constructor(private readonly service: WiseImpEventsService) {}

  /**
   * POST /v1/wise-imp-events
   * Anonymous, privacy-safe product analytics for the Wise Imp widget.
   * Called server-side from apps/website's /api/analytics route — never
   * directly from the browser. No auth: these are anonymous marketing-site
   * visitor events, not authenticated-user analytics (that's the guarded
   * /v1/analytics/events endpoint, which requires a logged-in dashboard user
   * and doesn't apply here).
   */
  @Post()
  async recordEvents(@Body() body: { events: unknown }) {
    const events = Array.isArray(body?.events) ? body.events : [];
    if (events.length === 0) {
      throw new BadRequestException('events must be a non-empty array');
    }
    if (events.length > MAX_EVENTS_PER_REQUEST) {
      throw new BadRequestException(`Too many events; max ${MAX_EVENTS_PER_REQUEST} per request`);
    }

    const validated: WiseImpEventInput[] = [];
    for (const raw of events) {
      const e = raw as Partial<WiseImpEventInput>;
      if (
        typeof e?.type === 'string' &&
        e.type.startsWith('wise_imp_') &&
        typeof e?.path === 'string' &&
        typeof e?.sessionId === 'string'
      ) {
        validated.push({
          type: e.type,
          path: e.path,
          sessionId: e.sessionId,
          data: typeof e.data === 'object' && e.data !== null ? (e.data as Record<string, unknown>) : undefined,
        });
      }
    }

    return this.service.recordEvents(validated);
  }
}
