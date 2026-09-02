import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BlakkhailProductService {
  constructor(private prisma: PrismaService) {}

  async getAllProducts(filters?: { category?: string; status?: string }) {
    return this.prisma.blakkhailProduct.findMany({
      where: {
        ...(filters?.category && { category: filters.category }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductBySlug(slug: string) {
    return this.prisma.blakkhailProduct.findUnique({
      where: { slug },
    });
  }

  async getProductById(id: string) {
    return this.prisma.blakkhailProduct.findUnique({
      where: { id },
    });
  }

  async createProduct(data: {
    name: string;
    slug: string;
    description?: string;
    category: string;
    basePrice: number;
    image?: string;
    stock?: number;
  }) {
    return this.prisma.blakkhailProduct.create({
      data: {
        ...data,
        basePrice: new Decimal(data.basePrice),
      },
    });
  }

  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      basePrice: number;
      stock: number;
      status: string;
    }>,
  ) {
    return this.prisma.blakkhailProduct.update({
      where: { id },
      data: {
        ...data,
        ...(data.basePrice && { basePrice: new Decimal(data.basePrice) }),
      },
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.blakkhailProduct.delete({
      where: { id },
    });
  }

  async checkStock(productId: string, quantity: number) {
    const product = await this.prisma.blakkhailProduct.findUnique({
      where: { id: productId },
    });

    if (!product) throw new Error('Product not found');
    return product.stock >= quantity;
  }

  async decreaseStock(productId: string, quantity: number) {
    return this.prisma.blakkhailProduct.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });
  }
}
