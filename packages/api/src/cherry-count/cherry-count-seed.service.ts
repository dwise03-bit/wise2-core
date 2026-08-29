import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CherryCountRequestTenant } from './cherry-count-tenant.guard';

@Injectable()
export class CherryCountSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seedDemo(tenantId: string) {
    const existing = await this.prisma.cherryCountProduct.count({ where: { tenantId } });
    if (existing > 0) {
      return { status: 'already_seeded', productCount: existing };
    }

    await this.prisma.cherryCountContainer.createMany({
      data: [
        { tenantId, name: 'Pink Bin #1', type: 'BIN', color: 'Hot Pink', description: 'Accessories', qrCode: 'cc-bin-a1b2c3' },
        { tenantId, name: 'Pink Bin #2', type: 'BIN', color: 'Hot Pink', description: 'Hoodies', qrCode: 'cc-bin-d4e5f6' },
        { tenantId, name: 'Purple Crate', type: 'TOTE', color: 'Royal Plum', description: 'Limited Drops', qrCode: 'cc-tote-g7h8i9' },
        { tenantId, name: 'Rack A', type: 'RACK', color: 'Chrome', description: 'Tops', qrCode: 'cc-rack-j0k1l2' },
      ],
    });

    const hoodie = await this.prisma.cherryCountProduct.create({
      data: {
        tenantId, name: 'Cherry Bomb Hoodie', sku: 'CB-HOOD-001', category: 'Hoodies', collection: 'Fall Drop',
        cost: 28, retailPrice: 70, qrCode: 'cc-prod-hoodie',
        variants: {
          create: [
            { tenantId, size: 'S', color: 'Hot Pink', quantity: 4, minimumStock: 3, bin: 'Pink Bin #2' },
            { tenantId, size: 'M', color: 'Hot Pink', quantity: 8, minimumStock: 3, bin: 'Pink Bin #2' },
            { tenantId, size: 'L', color: 'Hot Pink', quantity: 2, minimumStock: 3, bin: 'Pink Bin #2' },
          ],
        },
      },
      include: { variants: true },
    });

    await this.prisma.cherryCountProduct.create({
      data: {
        tenantId, name: 'Lavender Crop Top', sku: 'LV-CROP-002', category: 'Tops', collection: 'Summer Drop',
        cost: 14, retailPrice: 40,
        variants: {
          create: [
            { tenantId, size: 'S', color: 'Lavender', quantity: 6, minimumStock: 2, bin: 'Rack A' },
            { tenantId, size: 'M', color: 'Lavender', quantity: 3, minimumStock: 2, bin: 'Rack A' },
          ],
        },
      },
    });

    await this.prisma.cherryCountProduct.create({
      data: {
        tenantId, name: 'Pink Statement Earrings', sku: 'PK-EAR-003', category: 'Accessories',
        cost: 8, retailPrice: 30,
        variants: { create: [{ tenantId, size: 'OS', color: 'Pink', quantity: 15, minimumStock: 5, bin: 'Pink Bin #1' }] },
      },
    });

    const brianna = await this.prisma.cherryCountCustomer.create({
      data: {
        tenantId, name: 'Brianna R.', phone: '(404) 555-0182', instagram: '@brianna_styles',
        preferredSize: 'M', favoriteColors: ['Lavender', 'Hot Pink'], vipStatus: true, lifetimeValue: 1240,
      },
    });

    await this.prisma.cherryCountCustomer.create({
      data: {
        tenantId, name: 'Jasmine K.', instagram: '@jazzyk_fashion', preferredSize: 'S', lifetimeValue: 380,
      },
    });

    const event = await this.prisma.cherryCountPopupEvent.create({
      data: {
        tenantId, name: 'Downtown Night Market', date: new Date('2026-09-06T17:00:00.000Z'),
        venue: 'City Center Plaza', address: '123 Main St, Atlanta, GA', status: 'PACKING', revenueGoal: 3000,
      },
    });

    const hoodM = hoodie.variants.find((v) => v.size === 'M')!;
    await this.prisma.cherryCountEventInventory.create({
      data: { tenantId, eventId: event.id, variantId: hoodM.id, quantityAssigned: 6, quantityPacked: 6, packingStatus: 'PACKED' },
    });

    const today = new Date();
    await this.prisma.cherryCountSale.create({
      data: {
        tenantId, customerId: brianna.id, paymentMethod: 'CASH', subtotal: 1287, total: 1287, profit: 600,
        createdAt: today,
        items: { create: [{ variantId: hoodM.id, quantity: 18, unitPrice: 70, unitCost: 28, lineTotal: 1260 }] },
      },
    });

    return { status: 'seeded', productCount: 3, eventId: event.id };
  }

  assertOwner(role: CherryCountRequestTenant['role']) {
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new ForbiddenException('Only owners and admins can seed demo data');
    }
  }
}
