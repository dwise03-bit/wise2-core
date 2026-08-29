import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CherryCountRequestTenant } from './cherry-count-tenant.guard';
import {
  AdjustInventoryInput,
  AssignEventInventoryInput,
  CreateContainerInput,
  CreateCustomerInput,
  CreateEventInput,
  CreateProductInput,
  CreateSaleInput,
  UpdatePackingInput,
} from './cherry-count.types';
import { randomBytes } from 'crypto';

@Injectable()
export class CherryCountService {
  constructor(private readonly prisma: PrismaService) {}

  private qrId(prefix: string) {
    return `cc-${prefix}-${randomBytes(6).toString('hex')}`;
  }

  private assertWrite(role: CherryCountRequestTenant['role']) {
    if (role === 'VIEWER') {
      throw new ForbiddenException('Read-only access');
    }
  }

  async bootstrap(tenantId: string) {
    const [productCount, variantAgg, lowStock, nextEvent, todaySales] =
      await Promise.all([
        this.prisma.cherryCountProduct.count({ where: { tenantId, status: 'ACTIVE' } }),
        this.prisma.cherryCountProductVariant.aggregate({
          where: { tenantId },
          _sum: { quantity: true },
        }),
        this.prisma.cherryCountProductVariant.count({
          where: {
            tenantId,
            quantity: { lte: 5 },
          },
        }),
        this.prisma.cherryCountPopupEvent.findFirst({
          where: { tenantId, status: { in: ['PLANNED', 'PACKING', 'LIVE'] } },
          orderBy: { date: 'asc' },
        }),
        this.getTodaySalesTotal(tenantId),
      ]);

    const bestSellers = await this.prisma.cherryCountSaleLineItem.groupBy({
      by: ['variantId'],
      where: { sale: { tenantId, createdAt: { gte: daysAgo(30) } } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    return {
      stats: {
        todaySales,
        inventoryItems: variantAgg._sum.quantity ?? 0,
        productCount,
        lowStock,
        bestSellerCount: bestSellers.length,
      },
      nextEvent,
    };
  }

  async listProducts(tenantId: string) {
    return this.prisma.cherryCountProduct.findMany({
      where: { tenantId },
      include: { variants: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getProduct(tenantId: string, id: string) {
    const product = await this.prisma.cherryCountProduct.findFirst({
      where: { tenantId, id },
      include: { variants: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createProduct(
    tenantId: string,
    role: CherryCountRequestTenant['role'],
    input: CreateProductInput,
  ) {
    this.assertWrite(role);
    const qrCode = this.qrId('prod');
    const product = await this.prisma.cherryCountProduct.create({
      data: {
        tenantId,
        name: input.name,
        description: input.description,
        sku: input.sku,
        barcode: input.barcode,
        qrCode,
        category: input.category,
        collection: input.collection,
        vendor: input.vendor,
        cost: input.cost,
        retailPrice: input.retailPrice,
        salePrice: input.salePrice,
        images: input.images ?? [],
        tags: input.tags ?? [],
        variants: {
          create: (input.variants ?? [{ quantity: 0 }]).map((v) => ({
            tenantId,
            size: v.size,
            color: v.color,
            material: v.material,
            edition: v.edition,
            quantity: v.quantity ?? 0,
            minimumStock: v.minimumStock ?? 0,
            reorderPoint: v.reorderPoint ?? 0,
            bin: v.bin,
            rack: v.rack,
            shelf: v.shelf,
            tote: v.tote,
            storageLocation: v.storageLocation,
            qrCode: this.qrId('var'),
          })),
        },
      },
      include: { variants: true },
    });
    return product;
  }

  async adjustInventory(
    tenantId: string,
    userId: string,
    role: CherryCountRequestTenant['role'],
    input: AdjustInventoryInput,
  ) {
    this.assertWrite(role);
    const variant = await this.prisma.cherryCountProductVariant.findFirst({
      where: { tenantId, id: input.variantId },
    });
    if (!variant) throw new NotFoundException('Variant not found');

    const quantityBefore = variant.quantity;
    const quantityAfter = quantityBefore + input.quantityDelta;
    if (quantityAfter < 0) {
      throw new BadRequestException('Insufficient stock');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.cherryCountProductVariant.update({
        where: { id: variant.id },
        data: { quantity: quantityAfter },
      }),
      this.prisma.cherryCountInventoryTransaction.create({
        data: {
          tenantId,
          variantId: variant.id,
          type: input.type,
          quantityDelta: input.quantityDelta,
          quantityBefore,
          quantityAfter,
          reason: input.reason,
          referenceId: input.referenceId,
          userId,
        },
      }),
    ]);

    return updated;
  }

  async listContainers(tenantId: string) {
    return this.prisma.cherryCountContainer.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  async createContainer(
    tenantId: string,
    role: CherryCountRequestTenant['role'],
    input: CreateContainerInput,
  ) {
    this.assertWrite(role);
    return this.prisma.cherryCountContainer.create({
      data: {
        tenantId,
        name: input.name,
        type: input.type ?? 'BIN',
        color: input.color,
        description: input.description,
        location: input.location,
        qrCode: this.qrId('bin'),
      },
    });
  }

  async listEvents(tenantId: string) {
    return this.prisma.cherryCountPopupEvent.findMany({
      where: { tenantId },
      include: { inventory: { include: { variant: { include: { product: true } } } } },
      orderBy: { date: 'desc' },
    });
  }

  async createEvent(
    tenantId: string,
    role: CherryCountRequestTenant['role'],
    input: CreateEventInput,
  ) {
    this.assertWrite(role);
    return this.prisma.cherryCountPopupEvent.create({
      data: {
        tenantId,
        name: input.name,
        date: new Date(input.date),
        venue: input.venue,
        address: input.address,
        arrivalTime: input.arrivalTime ? new Date(input.arrivalTime) : undefined,
        setupTime: input.setupTime ? new Date(input.setupTime) : undefined,
        notes: input.notes,
        expectedAttendance: input.expectedAttendance,
        revenueGoal: input.revenueGoal,
      },
    });
  }

  async assignEventInventory(
    tenantId: string,
    eventId: string,
    role: CherryCountRequestTenant['role'],
    items: AssignEventInventoryInput[],
  ) {
    this.assertWrite(role);
    const event = await this.prisma.cherryCountPopupEvent.findFirst({
      where: { tenantId, id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    const results = [];
    for (const item of items) {
      const result = await this.prisma.cherryCountEventInventory.upsert({
        where: { eventId_variantId: { eventId, variantId: item.variantId } },
        create: {
          tenantId,
          eventId,
          variantId: item.variantId,
          quantityAssigned: item.quantityAssigned,
        },
        update: { quantityAssigned: item.quantityAssigned },
      });
      results.push(result);
    }
    return results;
  }

  async updatePacking(
    tenantId: string,
    eventId: string,
    role: CherryCountRequestTenant['role'],
    updates: UpdatePackingInput[],
  ) {
    this.assertWrite(role);
    const results = [];
    for (const u of updates) {
      const result = await this.prisma.cherryCountEventInventory.update({
        where: { eventId_variantId: { eventId, variantId: u.variantId } },
        data: {
          ...(u.quantityPacked !== undefined ? { quantityPacked: u.quantityPacked } : {}),
          ...(u.packingStatus ? { packingStatus: u.packingStatus } : {}),
        },
      });
      results.push(result);
    }
    return results;
  }

  async closeEvent(tenantId: string, eventId: string, role: CherryCountRequestTenant['role']) {
    this.assertWrite(role);
    const event = await this.prisma.cherryCountPopupEvent.findFirst({
      where: { tenantId, id: eventId },
      include: { inventory: true },
    });
    if (!event) throw new NotFoundException('Event not found');

    for (const item of event.inventory) {
      const returned = item.quantityAssigned - item.quantitySold;
      if (returned > 0) {
        await this.adjustInventory(tenantId, 'system', role, {
          variantId: item.variantId,
          quantityDelta: returned,
          type: 'EVENT_RETURN',
          reason: `Return from event: ${event.name}`,
          referenceId: eventId,
        });
      }
      await this.prisma.cherryCountEventInventory.update({
        where: { id: item.id },
        data: { quantityReturned: returned, packingStatus: 'RETURNED' },
      });
    }

    return this.prisma.cherryCountPopupEvent.update({
      where: { id: eventId },
      data: { status: 'CLOSED' },
    });
  }

  async listSales(tenantId: string) {
    return this.prisma.cherryCountSale.findMany({
      where: { tenantId },
      include: { items: { include: { variant: { include: { product: true } } } }, customer: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async createSale(
    tenantId: string,
    userId: string,
    role: CherryCountRequestTenant['role'],
    input: CreateSaleInput,
  ) {
    this.assertWrite(role);
    if (!input.items.length) throw new BadRequestException('Sale must have items');

    const lineItems = [];
    let subtotal = 0;
    let costTotal = 0;

    for (const item of input.items) {
      const variant = await this.prisma.cherryCountProductVariant.findFirst({
        where: { tenantId, id: item.variantId },
        include: { product: true },
      });
      if (!variant) throw new NotFoundException(`Variant ${item.variantId} not found`);
      if (variant.quantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${variant.product.name}`);
      }

      const lineTotal = item.unitPrice * item.quantity;
      const unitCost = variant.product.cost ? Number(variant.product.cost) : 0;
      subtotal += lineTotal;
      costTotal += unitCost * item.quantity;
      lineItems.push({ variant, item, lineTotal, unitCost });
    }

    const tax = input.tax ?? 0;
    const total = subtotal + tax;
    const profit = subtotal - costTotal;

    const sale = await this.prisma.$transaction(async (tx) => {
      const created = await tx.cherryCountSale.create({
        data: {
          tenantId,
          eventId: input.eventId,
          customerId: input.customerId,
          paymentMethod: input.paymentMethod,
          subtotal,
          tax,
          total,
          costTotal,
          profit,
          notes: input.notes,
          items: {
            create: lineItems.map(({ variant, item, lineTotal, unitCost }) => ({
              variantId: variant.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unitCost,
              lineTotal,
            })),
          },
        },
        include: { items: true },
      });

      for (const { variant, item } of lineItems) {
        const quantityBefore = variant.quantity;
        const quantityAfter = quantityBefore - item.quantity;
        await tx.cherryCountProductVariant.update({
          where: { id: variant.id },
          data: { quantity: quantityAfter },
        });
        await tx.cherryCountInventoryTransaction.create({
          data: {
            tenantId,
            variantId: variant.id,
            type: 'SALE',
            quantityDelta: -item.quantity,
            quantityBefore,
            quantityAfter,
            referenceId: created.id,
            userId,
          },
        });
      }

      if (input.eventId) {
        for (const { variant, item } of lineItems) {
          await tx.cherryCountEventInventory.updateMany({
            where: { eventId: input.eventId, variantId: variant.id },
            data: { quantitySold: { increment: item.quantity } },
          });
        }
      }

      if (input.customerId) {
        await tx.cherryCountCustomer.update({
          where: { id: input.customerId },
          data: { lifetimeValue: { increment: total } },
        });
      }

      return created;
    });

    return sale;
  }

  async listCustomers(tenantId: string) {
    return this.prisma.cherryCountCustomer.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async createCustomer(
    tenantId: string,
    role: CherryCountRequestTenant['role'],
    input: CreateCustomerInput,
  ) {
    this.assertWrite(role);
    return this.prisma.cherryCountCustomer.create({
      data: {
        tenantId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        instagram: input.instagram,
        preferredSize: input.preferredSize,
        favoriteColors: input.favoriteColors ?? [],
        notes: input.notes,
      },
    });
  }

  async getAnalytics(tenantId: string) {
    const thirtyDaysAgo = daysAgo(30);
    const [salesTotal, salesCount, topProducts, categoryBreakdown] = await Promise.all([
      this.prisma.cherryCountSale.aggregate({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
        _sum: { total: true, profit: true },
      }),
      this.prisma.cherryCountSale.count({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.cherryCountSaleLineItem.groupBy({
        by: ['variantId'],
        where: { sale: { tenantId, createdAt: { gte: thirtyDaysAgo } } },
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
      }),
      this.prisma.cherryCountProduct.groupBy({
        by: ['category'],
        where: { tenantId, status: 'ACTIVE' },
        _count: true,
      }),
    ]);

    return {
      period: '30d',
      revenue: salesTotal._sum.total ?? 0,
      profit: salesTotal._sum.profit ?? 0,
      salesCount,
      topProducts,
      categoryBreakdown,
    };
  }

  private async getTodaySalesTotal(tenantId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const agg = await this.prisma.cherryCountSale.aggregate({
      where: { tenantId, createdAt: { gte: start } },
      _sum: { total: true },
    });
    return agg._sum.total ?? 0;
  }
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
