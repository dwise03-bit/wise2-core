import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PrintProductsService {
  constructor(private prisma: PrismaService) {}

  async listProducts(filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    active?: boolean;
  }) {
    const where: any = {
      isActive: filters?.active ?? true,
    };

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.basePrice = {};
      if (filters?.minPrice) where.basePrice.gte = filters.minPrice;
      if (filters?.maxPrice) where.basePrice.lte = filters.maxPrice;
    }

    return await this.prisma.printProduct.findMany({
      where,
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProduct(productId: string) {
    const product = await this.prisma.printProduct.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    return product;
  }

  async createProduct(data: any) {
    try {
      const slug = (data.name || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      return await this.prisma.printProduct.create({
        data: {
          slug,
          name: data.name,
          description: data.description,
          categoryId: data.categoryId,
          productType: data.productType,
          basePrice: data.basePrice || 0,
          isActive: true,
        },
        include: {
          category: true,
          variants: true,
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to create product: ${msg}`);
    }
  }

  async updateProduct(productId: string, data: any) {
    const product = await this.getProduct(productId);

    return await this.prisma.printProduct.update({
      where: { id: productId },
      data: {
        name: data.name ?? product.name,
        description: data.description ?? product.description,
        categoryId: data.categoryId ?? product.categoryId,
        basePrice: data.basePrice ?? product.basePrice,
      },
      include: {
        category: true,
        variants: true,
      },
    });
  }

  async deleteProduct(productId: string) {
    await this.getProduct(productId);
    return await this.prisma.printProduct.delete({
      where: { id: productId },
    });
  }

  async listCategories() {
    return await this.prisma.printProductCategory.findMany({
      include: {
        products: {
          where: { isActive: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCategory(categoryId: string) {
    const category = await this.prisma.printProductCategory.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: { isActive: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category ${categoryId} not found`);
    }

    return category;
  }

  async createCategory(data: any) {
    try {
      const slug = (data.name || '')
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      return await this.prisma.printProductCategory.create({
        data: {
          slug,
          name: data.name,
          description: data.description,
        },
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to create category: ${msg}`);
    }
  }
}
