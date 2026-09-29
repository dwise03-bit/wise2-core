import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { PrintProductsService } from './services/print-products.service';
import { PrintOrdersService } from './services/print-orders.service';
import { PrintQuotesService } from './services/print-quotes.service';
import { CreateProductDto, UpdateProductDto } from './dto/print-product.dto';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/print-order.dto';
import { CreateQuoteDto } from './dto/print-quote.dto';
import { CreateCategoryDto } from './dto/print-category.dto';

@Controller('v1/print-shop')
export class PrintShopController {
  constructor(
    private productsService: PrintProductsService,
    private ordersService: PrintOrdersService,
    private quotesService: PrintQuotesService,
  ) {}

  // ========== PRODUCTS ==========

  @Get('products')
  async listProducts(
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.productsService.listProducts({
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
  }

  @Get('products/:id')
  async getProduct(@Param('id') productId: string) {
    return this.productsService.getProduct(productId);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() body: CreateProductDto) {
    return this.productsService.createProduct(body);
  }

  @Patch('products/:id')
  @UseGuards(JwtAuthGuard)
  async updateProduct(@Param('id') productId: string, @Body() body: UpdateProductDto) {
    return this.productsService.updateProduct(productId, body);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard)
  async deleteProduct(@Param('id') productId: string) {
    return this.productsService.deleteProduct(productId);
  }

  // ========== CATEGORIES ==========

  @Get('categories')
  async listCategories() {
    return this.productsService.listCategories();
  }

  @Get('categories/:id')
  async getCategory(@Param('id') categoryId: string) {
    return this.productsService.getCategory(categoryId);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() body: CreateCategoryDto) {
    return this.productsService.createCategory(body);
  }

  // ========== ORDERS ==========

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  async listOrders(
    @Req() req: Request & { user: any },
    @Query('status') status?: string,
    @Query('userId') userId?: string,
  ) {
    const requestingUserId = req.user?.id;
    if (!requestingUserId) {
      throw new BadRequestException('Authentication required');
    }

    // Users can only see their own orders unless they're admin
    const filterUserId = req.user?.role === 'ADMIN' ? userId : requestingUserId;

    return this.ordersService.listOrders({ status, userId: filterUserId });
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  async getOrder(@Param('id') orderId: string, @Req() req: Request & { user: any }) {
    const order = await this.ordersService.getOrder(orderId);

    // Verify user owns this order or is admin
    if (order.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      throw new BadRequestException('Access denied');
    }

    return order;
  }

  @Get('orders/:id/timeline')
  @UseGuards(JwtAuthGuard)
  async getOrderTimeline(@Param('id') orderId: string, @Req() req: Request & { user: any }) {
    const order = await this.ordersService.getOrder(orderId);

    if (order.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      throw new BadRequestException('Access denied');
    }

    return this.ordersService.getOrderTimeline(orderId);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() body: CreateOrderDto, @Req() req: Request & { user: any }) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('Authentication required');
    }

    return this.ordersService.createOrder(userId, body);
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard)
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() body: UpdateOrderStatusDto,
    @Req() req: Request & { user: any },
  ) {
    // Only admins can update order status
    if (req.user?.role !== 'ADMIN') {
      throw new BadRequestException('Admin access required');
    }

    return this.ordersService.updateOrderStatus(orderId, body);
  }

  @Delete('orders/:id')
  @UseGuards(JwtAuthGuard)
  async cancelOrder(@Param('id') orderId: string, @Req() req: Request & { user: any }) {
    const order = await this.ordersService.getOrder(orderId);

    if (order.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      throw new BadRequestException('Access denied');
    }

    return this.ordersService.cancelOrder(orderId);
  }

  // ========== QUOTES ==========

  @Get('quotes')
  @UseGuards(JwtAuthGuard)
  async listQuotes(
    @Req() req: Request & { user: any },
    @Query('status') status?: string,
    @Query('customerEmail') customerEmail?: string,
  ) {
    const requestingUser = req.user;
    if (!requestingUser) {
      throw new BadRequestException('Authentication required');
    }

    return this.quotesService.listQuotes({
      status,
      customerEmail: requestingUser.role === 'ADMIN' ? customerEmail : requestingUser.email
    });
  }

  @Get('quotes/:id')
  @UseGuards(JwtAuthGuard)
  async getQuote(@Param('id') quoteId: string) {
    return this.quotesService.getQuote(quoteId);
  }

  @Post('quotes')
  @HttpCode(HttpStatus.CREATED)
  async createQuote(@Body() body: any) {
    // Allow creating quotes without auth (customers can request quotes)
    return this.quotesService.createQuote(body);
  }

  @Patch('quotes/:id/accept')
  async acceptQuote(@Param('id') quoteId: string) {
    return this.quotesService.acceptQuote(quoteId);
  }

  @Patch('quotes/:id/decline')
  async declineQuote(@Param('id') quoteId: string) {
    return this.quotesService.declineQuote(quoteId);
  }

  @Post('quotes/:id/convert-to-order')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async convertQuoteToOrder(@Param('id') quoteId: string) {
    return this.quotesService.convertToOrder(quoteId);
  }
}
