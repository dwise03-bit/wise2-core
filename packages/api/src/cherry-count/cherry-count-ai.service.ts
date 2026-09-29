import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type CherryAiInsightType =
  | 'inventory'
  | 'restock'
  | 'packing'
  | 'event_summary'
  | 'sales'
  | 'daily';

@Injectable()
export class CherryCountAiService {
  constructor(private readonly prisma: PrismaService) {}

  async getInsights(tenantId: string, type: CherryAiInsightType) {
    switch (type) {
      case 'inventory':
        return this.inventoryInsights(tenantId);
      case 'restock':
        return this.restockSuggestions(tenantId);
      case 'packing':
        return this.packingRecommendations(tenantId);
      case 'sales':
        return this.salesInsights(tenantId);
      case 'daily':
        return this.dailyBriefing(tenantId);
      default:
        return this.dailyBriefing(tenantId);
    }
  }

  private async inventoryInsights(tenantId: string) {
    const lowStock = await this.prisma.cherryCountProductVariant.findMany({
      where: { tenantId, quantity: { lte: 5 } },
      include: { product: true },
      take: 10,
    });

    return {
      type: 'inventory',
      poweredBy: 'WISE² Intelligence',
      insights: lowStock.map((v) => ({
        message: `${v.product.name} (${v.size ?? 'OS'}${v.color ? ` / ${v.color}` : ''}) has only ${v.quantity} left`,
        severity: v.quantity === 0 ? 'critical' : 'warning',
        action: 'Consider restocking before your next pop-up',
      })),
    };
  }

  private async restockSuggestions(tenantId: string) {
    const variants = await this.prisma.cherryCountProductVariant.findMany({
      where: { tenantId },
      include: { product: true },
    });

    const suggestions = variants
      .filter((v) => v.quantity <= v.reorderPoint)
      .map((v) => ({
        product: v.product.name,
        variant: [v.size, v.color].filter(Boolean).join(' / ') || 'Default',
        currentStock: v.quantity,
        suggestedOrder: Math.max(v.minimumStock * 2 - v.quantity, 5),
      }));

    return { type: 'restock', poweredBy: 'WISE² Intelligence', suggestions };
  }

  private async packingRecommendations(tenantId: string) {
    const event = await this.prisma.cherryCountPopupEvent.findFirst({
      where: { tenantId, status: { in: ['PLANNED', 'PACKING'] } },
      include: {
        inventory: { include: { variant: { include: { product: true } } } },
      },
      orderBy: { date: 'asc' },
    });

    if (!event) {
      return {
        type: 'packing',
        poweredBy: 'WISE² Intelligence',
        message: 'No upcoming events to pack for',
        checklist: [],
      };
    }

    const unpacked = event.inventory.filter((i) => i.packingStatus === 'NOT_PACKED');
    return {
      type: 'packing',
      poweredBy: 'WISE² Intelligence',
      event: event.name,
      checklist: unpacked.map((i) => ({
        item: `${i.variant.product.name} (${i.variant.size ?? 'OS'})`,
        quantity: i.quantityAssigned,
        status: i.packingStatus,
      })),
    };
  }

  private async salesInsights(tenantId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topSellers = await this.prisma.cherryCountSaleLineItem.groupBy({
      by: ['variantId'],
      where: { sale: { tenantId, createdAt: { gte: thirtyDaysAgo } } },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    return {
      type: 'sales',
      poweredBy: 'WISE² Intelligence',
      period: '30 days',
      topSellers: topSellers.map((t) => ({
        variantId: t.variantId,
        unitsSold: t._sum.quantity,
        revenue: t._sum.lineTotal,
      })),
    };
  }

  private async dailyBriefing(tenantId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const [todaySales, lowStockCount, nextEvent] = await Promise.all([
      this.prisma.cherryCountSale.aggregate({
        where: { tenantId, createdAt: { gte: start } },
        _sum: { total: true },
        _count: true,
      }),
      this.prisma.cherryCountProductVariant.count({
        where: { tenantId, quantity: { lte: 3 } },
      }),
      this.prisma.cherryCountPopupEvent.findFirst({
        where: { tenantId, status: { in: ['PLANNED', 'PACKING', 'LIVE'] } },
        orderBy: { date: 'asc' },
      }),
    ]);

    const tips: string[] = [];
    if (lowStockCount > 0) tips.push(`${lowStockCount} items are running low — check inventory`);
    if (nextEvent) tips.push(`Next pop-up: ${nextEvent.name} on ${nextEvent.date.toLocaleDateString()}`);
    if (Number(todaySales._sum.total ?? 0) > 0) {
      tips.push(`Great day! $${Number(todaySales._sum.total).toFixed(0)} in sales so far`);
    } else {
      tips.push('No sales recorded today yet — ready when you are!');
    }

    return {
      type: 'daily',
      poweredBy: 'WISE² Intelligence',
      greeting: 'Hey Boss 💋',
      todaySales: todaySales._sum.total ?? 0,
      salesCount: todaySales._count,
      tips,
    };
  }
}
