import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateQuoteDto } from '../dto/print-quote.dto';
import { QuoteStatus, PrintOrderType } from '@prisma/client';

@Injectable()
export class PrintQuotesService {
  constructor(private prisma: PrismaService) {}

  async createQuote(data: CreateQuoteDto) {
    try {
      const quoteNumber = `QT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const lineItems = data.lineItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
      }));

      const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const shippingCost = data.shippingCost || 0;
      const taxAmount = (subtotal + shippingCost) * (data.taxRate || 0);
      const totalPrice = subtotal + shippingCost + taxAmount;

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      const quote = await this.prisma.printQuote.create({
        data: {
          quoteNumber,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          status: QuoteStatus.DRAFT,
          lineItems: lineItems as any,
          subtotal,
          shippingCost,
          taxAmount,
          totalPrice,
          validUntil,
          materialCost: 0,
          laborCost: 0,
          machineCost: 0,
          setupFee: 0,
          designFee: 0,
          rushFee: 0,
        },
      });

      return quote;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new BadRequestException(`Failed to create quote: ${msg}`);
    }
  }

  async getQuote(quoteId: string) {
    const quote = await this.prisma.printQuote.findUnique({
      where: { id: quoteId },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException(`Quote ${quoteId} not found`);
    }

    return quote;
  }

  async listQuotes(filters?: { status?: string; customerEmail?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.customerEmail) {
      where.customerEmail = filters.customerEmail;
    }

    return await this.prisma.printQuote.findMany({
      where,
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptQuote(quoteId: string) {
    const quote = await this.getQuote(quoteId);

    if (quote.status !== QuoteStatus.DRAFT && quote.status !== QuoteStatus.SENT) {
      throw new BadRequestException(`Cannot accept quote with status ${quote.status}`);
    }

    if (quote.validUntil && quote.validUntil < new Date()) {
      throw new BadRequestException('Quote has expired');
    }

    return await this.prisma.printQuote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async declineQuote(quoteId: string) {
    const quote = await this.getQuote(quoteId);

    if (quote.status !== QuoteStatus.DRAFT && quote.status !== QuoteStatus.SENT) {
      throw new BadRequestException(`Cannot decline quote with status ${quote.status}`);
    }

    return await this.prisma.printQuote.update({
      where: { id: quoteId },
      data: {
        status: QuoteStatus.DECLINED,
        declinedAt: new Date(),
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  async convertToOrder(quoteId: string) {
    const quote = await this.getQuote(quoteId);

    if (quote.status !== QuoteStatus.ACCEPTED) {
      throw new BadRequestException(`Quote must be accepted before converting to order`);
    }

    if (quote.orderId) {
      throw new BadRequestException(`Quote already has an associated order`);
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = await this.prisma.printOrder.create({
      data: {
        orderNumber,
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        orderType: PrintOrderType.THREE_D_PRINT,
        status: 'QUOTED',
        subtotal: quote.subtotal,
        shippingCost: quote.shippingCost,
        taxAmount: quote.taxAmount,
        totalPrice: quote.totalPrice,
        items: {
          create: (quote.lineItems as any[]).map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await this.prisma.printQuote.update({
      where: { id: quoteId },
      data: { orderId: order.id },
    });

    return order;
  }
}
