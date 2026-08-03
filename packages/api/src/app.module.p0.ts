import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { EmailModule } from './email/email.module';
import { EventsModule } from './analytics/events.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './v1/billing/billing.module';
import { ProspectsModule } from './v1/prospects/prospects.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    EmailModule,
    EventsModule,
    AnalyticsModule,
    BillingModule,
    ProspectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
