import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrintShopController } from './print-shop.controller';
import { PrintProductsService } from './services/print-products.service';
import { PrintOrdersService } from './services/print-orders.service';
import { PrintQuotesService } from './services/print-quotes.service';
import { EmailModule } from '../../email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [PrintShopController],
  providers: [PrintProductsService, PrintOrdersService, PrintQuotesService],
  exports: [PrintProductsService, PrintOrdersService, PrintQuotesService],
})
export class PrintShopModule {}
