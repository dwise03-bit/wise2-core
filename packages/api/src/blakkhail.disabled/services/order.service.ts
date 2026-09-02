import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BlakkhailOrderService {
  constructor(private prisma: PrismaService) {}

  async createOrderFromCart(
    userId: string,
    cartId: string,
    customerData: {
      email: string;
      firstName: string;
      lastName: string;
      phone?: string;
      shippingAddress: string;
      shippingCity: string;
      shippingState: string;
      shippingZip: string;
      shippingCountry?: string;
    },
  ) {
    const cart = await this.prisma.blakkhailCart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const orderNumber = `BH-${Date.now()}`;

    const order = await this.prisma.blakkhailOrder.create({
      data: {
        orderNumber,
        customerId: userId,
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        shippingAddress: customerData.shippingAddress,
        shippingCity: customerData.shippingCity,
        shippingState: customerData.shippingState,
        shippingZip: customerData.shippingZip,
        shippingCountry: customerData.shippingCountry || 'US',
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        items: {
          createMany: {
            data: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              size: item.size,
              color: item.color,
            })),
          },
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Decrease stock
    for (const item of cart.items) {
      await this.prisma.blakkhailProduct.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return order;
  }

  async getOrder(orderId: string) {
    return this.prisma.blakkhailOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });
  }

  async getOrderByNumber(orderNumber: string) {
    return this.prisma.blakkhailOrder.findUnique({
      where: { orderNumber },
      include: { items: { include: { product: true } } },
    });
  }

  async getCustomerOrders(email: string) {
    return this.prisma.blakkhailOrder.findMany({
      where: { email },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.prisma.blakkhailOrder.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async updatePaymentStatus(orderId: string, status: string, stripeId?: string) {
    return this.prisma.blakkhailOrder.update({
      where: { id: orderId },
      data: {
        paymentStatus: status,
        stripePaymentId: stripeId,
      },
    });
  }

  async updateShippingInfo(
    orderId: string,
    trackingNumber: string,
    carrier: string,
  ) {
    return this.prisma.blakkhailOrder.update({
      where: { id: orderId },
      data: {
        shippingTrackingNumber: trackingNumber,
        shippingCarrier: carrier,
        shippedAt: new Date(),
        status: 'SHIPPED',
      },
    });
  }

  async getAllOrders(filters?: { status?: string; paymentStatus?: string }) {
    return this.prisma.blakkhailOrder.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.paymentStatus && { paymentStatus: filters.paymentStatus }),
      },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTotalRevenue() {
    const result = await this.prisma.blakkhailOrder.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true },
    });
    return result._sum.total || 0;
  }
}
