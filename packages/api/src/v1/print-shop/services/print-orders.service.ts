import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto/print-order.dto';
import { PrintOrderStatus, PrintOrderType } from '@prisma/client';

@Injectable()
export class PrintOrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(userId: string, data: CreateOrderDto) {
    try {
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      let subtotal = 0;
      const itemsData: Array<{
        name: string;
        description?: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        material?: string;
        color?: string;
      }> = [];

      for (const item of data.items) {
        const itemTotal = (item.unitPrice || 0) * item.quantity;
        subtotal += itemTotal;

        itemsData.push({
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0,
          totalPrice: itemTotal,
          material: item.material,
          color: item.color,
        });
      }

      const order = await this.prisma.printOrder.create({
        data: {
          orderNumber,
          userId,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          orderType: (data.orderType as PrintOrderType) || PrintOrderType.THREE_D_PRINT,
          status: PrintOrderStatus.DRAFT,
          subtotal,
          totalPrice: subtotal,
        },
        include: {
          items: true,
        },
      });

      // Create order items separately
      for (const item of itemsData) {
        await this.prisma.printOrderItem.create({
          data: {
            orderId: order.id,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            material: item.material,
            color: item.color,
          },
        });
      }

      return this.getOrder(order.id);

      return order;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to create order: ${msg}`);
    }
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.printOrder.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    return order;
  }

  async listOrders(filters?: { status?: string; userId?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    return await this.prisma.printOrder.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(orderId: string, data: UpdateOrderStatusDto) {
    const order = await this.getOrder(orderId);

    const validTransitions: Record<string, PrintOrderStatus[]> = {
      [PrintOrderStatus.DRAFT]: [PrintOrderStatus.PENDING_REVIEW],
      [PrintOrderStatus.PENDING_REVIEW]: [PrintOrderStatus.QUOTED],
      [PrintOrderStatus.QUOTED]: [PrintOrderStatus.AWAITING_PAYMENT],
      [PrintOrderStatus.AWAITING_PAYMENT]: [PrintOrderStatus.PAID],
      [PrintOrderStatus.PAID]: [PrintOrderStatus.IN_PRODUCTION],
      [PrintOrderStatus.IN_PRODUCTION]: [PrintOrderStatus.QUALITY_CHECK],
      [PrintOrderStatus.QUALITY_CHECK]: [PrintOrderStatus.READY_FOR_PICKUP],
      [PrintOrderStatus.READY_FOR_PICKUP]: [PrintOrderStatus.SHIPPED],
      [PrintOrderStatus.SHIPPED]: [PrintOrderStatus.DELIVERED],
      [PrintOrderStatus.DELIVERED]: [],
      [PrintOrderStatus.CANCELLED]: [],
    };

    const newStatus = data.status as PrintOrderStatus;
    if (!validTransitions[order.status]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${data.status}`,
      );
    }

    return await this.prisma.printOrder.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: {
        items: true,
      },
    });
  }

  async cancelOrder(orderId: string) {
    return await this.prisma.printOrder.update({
      where: { id: orderId },
      data: {
        status: PrintOrderStatus.CANCELLED,
      },
      include: {
        items: true,
      },
    });
  }

  async getOrderTimeline(orderId: string) {
    const order = await this.getOrder(orderId);

    return [
      {
        status: order.status,
        timestamp: order.createdAt,
        message: `Order ${order.status.toLowerCase()}`,
      },
    ];
  }
}
