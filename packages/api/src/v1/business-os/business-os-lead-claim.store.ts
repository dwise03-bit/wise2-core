import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type LeadClaimRecord = {
  leadId: string;
  claimedBy: string;
  claimedAt: Date;
};

/**
 * Durable lead claim store backed by Prisma when available.
 * Falls back to a process-local in-memory Map for environments without a DB
 * (local dev without DATABASE_URL, unit tests, etc.).
 *
 * Atomicity guarantee:
 * - Prisma path: unique constraint on `leadId` + catch P2002 ensures exactly-one winner.
 * - In-memory path: synchronous Map.set/get is atomic in the Node.js event loop.
 */
@Injectable()
export class BusinessOsLeadClaimStore {
  private readonly fallback = new Map<string, LeadClaimRecord>();

  constructor(@Optional() private readonly prisma?: PrismaService) {}

  async tryClaim(leadId: string, userId: string): Promise<LeadClaimRecord | null> {
    if (this.prisma) {
      return this.tryClaimPrisma(leadId, userId);
    }
    return this.tryClaimMemory(leadId, userId);
  }

  async get(leadId: string): Promise<LeadClaimRecord | undefined> {
    if (this.prisma) {
      const row = await this.prisma.businessOsLeadClaim
        .findUnique({ where: { leadId } })
        .catch(() => undefined);
      if (!row) return undefined;
      return { leadId: row.leadId, claimedBy: row.claimedBy, claimedAt: row.claimedAt };
    }
    return this.fallback.get(leadId);
  }

  clear(): void {
    this.fallback.clear();
  }

  private async tryClaimPrisma(leadId: string, userId: string): Promise<LeadClaimRecord | null> {
    try {
      const row = await this.prisma!.businessOsLeadClaim.create({
        data: { leadId, claimedBy: userId },
      });
      return { leadId: row.leadId, claimedBy: row.claimedBy, claimedAt: row.claimedAt };
    } catch (error: any) {
      if (error?.code === 'P2002') {
        // Unique constraint violation — lead is already claimed.
        const existing = await this.prisma!.businessOsLeadClaim
          .findUnique({ where: { leadId } })
          .catch(() => null);
        if (existing?.claimedBy === userId) {
          return { leadId: existing.leadId, claimedBy: existing.claimedBy, claimedAt: existing.claimedAt };
        }
        return null;
      }
      throw error;
    }
  }

  private tryClaimMemory(leadId: string, userId: string): LeadClaimRecord | null {
    const existing = this.fallback.get(leadId);
    if (existing) {
      return existing.claimedBy === userId ? existing : null;
    }
    const record: LeadClaimRecord = { leadId, claimedBy: userId, claimedAt: new Date() };
    this.fallback.set(leadId, record);
    return record;
  }
}
