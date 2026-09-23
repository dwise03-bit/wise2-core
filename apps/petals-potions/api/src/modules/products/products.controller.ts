import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common'
import { ProductsService } from './products.service'

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll() {
    return {
      status: 'success',
      data: [
        {
          id: 1,
          sku: 'PP-CALM-001',
          name: 'Calm & Restore',
          pillar: 'BODY',
          price: 24,
          stock_quantity: 100,
          active: true,
        },
        {
          id: 2,
          sku: 'PP-FOCUS-001',
          name: 'Focus & Clarity',
          pillar: 'MIND',
          price: 24,
          stock_quantity: 85,
          active: true,
        },
        {
          id: 3,
          sku: 'PP-LOVE-001',
          name: 'Love & Heart',
          pillar: 'HEART',
          price: 24,
          stock_quantity: 92,
          active: true,
        },
        {
          id: 4,
          sku: 'PP-SOUL-001',
          name: 'Soul Connect',
          pillar: 'SOUL',
          price: 24,
          stock_quantity: 78,
          active: true,
        },
      ],
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return {
      status: 'success',
      data: {
        id,
        sku: 'PP-CALM-001',
        name: 'Calm & Restore',
        pillar: 'BODY',
        price: 24,
        stock_quantity: 100,
        description: 'A soothing blend to help you let go, relax, and rest deeply.',
        ingredients: [
          'Chamomile',
          'Lavender',
          'Passionflower',
          'Lemon Balm',
          'Rose Petals',
        ],
        benefits: [
          'Promotes relaxation & inner peace',
          'Supports restful sleep',
          'Calms the mind & reduces stress',
          'Made with organic ingredients',
        ],
      },
    }
  }

  @Post()
  async create(@Body() createProductDto: any) {
    return {
      status: 'success',
      message: 'Product created successfully',
      data: createProductDto,
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: any) {
    return {
      status: 'success',
      message: 'Product updated successfully',
      data: { id, ...updateProductDto },
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return {
      status: 'success',
      message: 'Product deleted successfully',
    }
  }
}
