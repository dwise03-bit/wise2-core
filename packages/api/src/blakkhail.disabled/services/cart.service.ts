import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BlakkhailCartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId: string, sessionId?: string) {
    let cart = await this.prisma.blakkhailCart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await this.prisma.blakkhailCart.create({
        data: {
          userId,
          sessionId,
        },
        include: { items: { include: { product: true } } },
      });
    }

    return cart;
  }

  async addToCart(
    userId: string,
    productId: string,
    quantity: number,
    options?: { size?: string; color?: string },
  ) {
    const cart = await this.getOrCreateCart(userId);
    const product = await this.prisma.blakkhailProduct.findUnique({
      where: { id: productId },
    });

    if (!product) throw new Error('Product not found');

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        size: options?.size,
        color: options?.color,
      },
    });

    if (existingItem) {
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        price: product.basePrice,
        size: options?.size,
        color: options?.color,
      },
    });
  }

  async removeFromCart(cartId: string, itemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async updateCartItem(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.prisma.cartItem.delete({ where: { id: itemId } });
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async calculateCartTotals(cartId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { cartId },
    });

    const subtotal = items.reduce(
      (sum, item) => sum.plus(item.price.mul(item.quantity)),
      new Decimal(0),
    );

    const tax = subtotal.mul(0.08); // 8% tax
    const total = subtotal.plus(tax);

    return this.prisma.blakkhailCart.update({
      where: { id: cartId },
      data: {
        subtotal,
        tax,
        total,
      },
      include: { items: { include: { product: true } } },
    });
  }

  async clearCart(cartId: string) {
    return this.prisma.blakkhailCart.update({
      where: { id: cartId },
      data: {
        items: { deleteMany: {} },
      },
    });
  }
}
