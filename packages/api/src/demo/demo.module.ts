import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DemoProvisioningService } from './services/demo-provisioning.service';
import { DemoSessionService } from './services/demo-session.service';
import { DemoScenarioService } from './services/demo-scenario.service';
import { DemoDatabFactory } from './services/demo-data-factory.service';
import { DemoSafetyService } from './services/demo-safety.service';
import { DemoEventService } from './services/demo-event.service';
import { DemoRecordService } from './services/demo-record.service';
import { DemoScenarioExecutorService } from './services/demo-scenario-executor.service';
import { DemoTourService } from './services/demo-tour.service';
import { DemoAIService } from './services/demo-ai.service';
import { DemoAnalyticsService } from './services/demo-analytics.service';
import { DemoPromotionService } from './services/demo-promotion.service';
import { DemoController } from './controllers/demo.controller';
import { DemoAdminController } from './controllers/demo-admin.controller';
import { DemoIsolationGuard } from './guards/demo-isolation.guard';
import { DemoProviderGuard } from './guards/demo-provider.guard';
import { EmailSafetyInterceptor } from './interceptors/email-safety.interceptor';
import { PaymentSafetyInterceptor } from './interceptors/payment-safety.interceptor';
import { SMSSafetyInterceptor } from './interceptors/sms-safety.interceptor';

@Module({
  imports: [PrismaModule],
  providers: [
    // Services - Provisioning & Session
    DemoProvisioningService,
    DemoSessionService,
    DemoScenarioService,
    DemoDatabFactory,
    DemoSafetyService,
    // Services - Scenario Execution (Phase 4)
    DemoEventService,
    DemoRecordService,
    DemoScenarioExecutorService,
    // Services - Tours, AI, Analytics, Promotion (Phases 6-9)
    DemoTourService,
    DemoAIService,
    DemoAnalyticsService,
    DemoPromotionService,
    // Guards
    DemoIsolationGuard,
    DemoProviderGuard,
    // Interceptors
    EmailSafetyInterceptor,
    PaymentSafetyInterceptor,
    SMSSafetyInterceptor,
  ],
  controllers: [DemoController, DemoAdminController],
  exports: [
    // Services - Provisioning & Session
    DemoProvisioningService,
    DemoSessionService,
    DemoScenarioService,
    DemoDatabFactory,
    DemoSafetyService,
    // Services - Scenario Execution
    DemoEventService,
    DemoRecordService,
    DemoScenarioExecutorService,
    // Services - Tours, AI, Analytics, Promotion
    DemoTourService,
    DemoAIService,
    DemoAnalyticsService,
    DemoPromotionService,
    // Guards
    DemoIsolationGuard,
    DemoProviderGuard,
    // Interceptors
    EmailSafetyInterceptor,
    PaymentSafetyInterceptor,
    SMSSafetyInterceptor,
  ],
})
export class DemoModule {}
