import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { BlakkhailProductService } from './services/product.service';
import { BlakkhailCartService } from './services/cart.service';
import { BlakkhailOrderService } from './services/order.service';
import { BlakkhailPaymentService } from './services/payment.service';
import { BlakkhailProductController } from './controllers/product.controller';
import { BlakkhailCartController } from './controllers/cart.controller';
import { BlakkhailOrderController } from './controllers/order.controller';
import { BlakkhailCheckoutController } from './controllers/checkout.controller';
import { BlakkhailAdminController } from './controllers/admin.controller';
import { StripeService } from '@/common/services/stripe.service';
import { EmailService } from '@/common/services/email.service';

@Module({
  imports: [PrismaModule],
  providers: [
    BlakkhailProductService,
    BlakkhailCartService,
    BlakkhailOrderService,
    BlakkhailPaymentService,
    StripeService,
    EmailService,
  ],
  controllers: [
    BlakkhailProductController,
    BlakkhailCartController,
    BlakkhailOrderController,
    BlakkhailCheckoutController,
    BlakkhailAdminController,
  ],
  exports: [
    BlakkhailProductService,
    BlakkhailCartService,
    BlakkhailOrderService,
    BlakkhailPaymentService,
  ],
})
export class BlakkhailModule {}
