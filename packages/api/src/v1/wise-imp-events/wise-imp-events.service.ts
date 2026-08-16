import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface WiseImpEventInput {
  type: string;
  path: string;
  sessionId: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class WiseImpEventsService {
  constructor(private prisma: PrismaService) {}

  async recordEvents(events: WiseImpEventInput[]) {
    if (!events.length) return { count: 0 };
    const result = await this.prisma.wiseImpEvent.createMany({
      data: events.map((e) => ({
        type: e.type,
        path: e.path,
        sessionId: e.sessionId,
        data: (e.data ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      })),
    });
    return { count: result.count };
  }
}
