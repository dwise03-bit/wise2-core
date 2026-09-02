import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { MongooseModule } from '@nestjs/mongoose'; // DEFERRED for Phase B
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { CommunityModule } from './community/community.module';
import { ModulesModule } from './modules/modules.module';
import { APIManagerModule } from './config/api-manager.module';
import { EmailModule } from './email/email.module';
import { EventsModule } from './analytics/events.module';
import { QueueModule } from './queue/queue.module';
// import { DiscordModule } from './discord/discord.module'; // DISABLED: TokenInvalid error blocking deployment
// import { ConsultingModule } from './v1/consulting/consulting.module';
import { BillingModule } from './v1/billing/billing.module';
import { ProspectsModule } from './v1/prospects/prospects.module';
import { WiseImpEventsModule } from './v1/wise-imp-events/wise-imp-events.module';
// import { AuditsModule } from './v1/audits/audits.module'; // DEFERRED
import { SoundLabsModule } from './v1/sound-labs/sound-labs.module';
import { CustomersModule } from './v1/customers/customers.module';
import { GalleryModule } from './v1/gallery/gallery.module';
import { PrismaModule } from './prisma/prisma.module';
import { RevenueOsModule } from './revenue-os/revenue-os.module';
import { DigitalTwinModule } from './digital-twin/digital-twin.module';
import { DemoModule } from './demo/demo.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APIStatusController } from './config/api-status.controller';
import { WiseDefenseModule } from './wise-defense/wise-defense.module';
import { PrintShopModule } from './v1/print-shop/print-shop.module';
// import { HermesModule } from './hermes/hermes.module'; // DISABLED: @nestjs/axios missing dependency
import { TradingModule } from './trading/trading.module';
import { FieldtechModule } from './fieldtech/fieldtech.module';
// import { CjaysModule } from './cjays/cjays.module'; // DISABLED: depends on HermesModule
// import { BusinessOsModule } from './v1/business-os/business-os.module'; // DISABLED: depends on HermesModule + AiPhoneModule
import { CherryCountModule } from './cherry-count/cherry-count.module';
import { CommandCenterModule } from './command-center/command-center.module';
// import { AiPhoneModule } from './ai-phone/ai-phone.module'; // DISABLED: CallSessionManager type mismatches
// import { ReaperModule } from './reaper/reaper.module'; // DISABLED: Prisma model name mismatches

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // MongooseModule.forRootAsync({ // DEFERRED for Phase B
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     const mongoUri =
    //       configService.get('MONGODB_URI') ||
    //       'mongodb://localhost:27017/wise2-brain';
    //     return { uri: mongoUri };
    //   },
    // }),
    // DISABLED: TypeORM blocking startup. Using Prisma for database access instead.
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => {
    //     // Parse DATABASE_URL if provided and valid, otherwise use individual DB_* variables
    //     const databaseUrl = configService.get('DATABASE_URL');
    //     let dbConfig: any;
    //
    //     if (databaseUrl) {
    //       // Parse DATABASE_URL format: postgresql://user:password@host:port/database
    //       try {
    //         const url = new URL(databaseUrl);
    //         dbConfig = {
    //           type: 'postgres',
    //           host: url.hostname,
    //           port: url.port ? parseInt(url.port, 10) : 5432,
    //           username: url.username,
    //           password: url.password,
    //           database: url.pathname.replace('/', ''),
    //         };
          } catch (error) {
            // Fall back to individual DB_* variables if DATABASE_URL parsing fails
            console.warn('DATABASE_URL invalid, using individual DB_* variables:', error instanceof Error ? error.message : String(error));
            dbConfig = {
              type: 'postgres',
              host: configService.get('DB_HOST') || 'localhost',
              port: configService.get('DB_PORT') || 5432,
              username: configService.get('DB_USERNAME') || configService.get('DB_USER') || 'wise2',
              password: configService.get('DB_PASSWORD') || 'wise2dev',
              database: configService.get('DB_NAME') || 'wise2',
            };
          }
        } else {
          // Fallback to individual DB_* environment variables
          dbConfig = {
            type: 'postgres',
            host: configService.get('DB_HOST') || 'localhost',
            port: configService.get('DB_PORT') || 5432,
            username: configService.get('DB_USERNAME') || configService.get('DB_USER') || 'wise2',
            password: configService.get('DB_PASSWORD') || 'wise2dev',
            database: configService.get('DB_NAME') || 'wise2',
          };
        }

    //     return {
    //       ...dbConfig,
    //       entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //       migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    //       migrationsRun: false,
    //       synchronize: false,
    //       logging: false,
    //     };
    //   },
    // }),
    APIManagerModule,
    AuthModule,
    AdminModule,
    EmailModule,
    EventsModule,
    QueueModule,
    ProjectsModule,
    AnalyticsModule,
    CommunityModule,
    ModulesModule,
    // DiscordModule, // DISABLED: TokenInvalid error blocking deployment
    PrismaModule,
    RevenueOsModule,
    DigitalTwinModule,
    DemoModule,
    WiseDefenseModule,
    // ConsultingAuditModule, // DEFERRED - has type errors
    // ConsultingModule, // DEFERRED
    BillingModule,
    SoundLabsModule,
    ProspectsModule,
    WiseImpEventsModule,
    CustomersModule,
    GalleryModule,
    PrintShopModule,
    // HermesModule, // DISABLED: @nestjs/axios missing dependency
    TradingModule,
    FieldtechModule,
    // CjaysModule, // DISABLED: depends on HermesModule
    // BusinessOsModule, // DISABLED: depends on HermesModule + AiPhoneModule
    CherryCountModule,
    CommandCenterModule,
    // AiPhoneModule, // DISABLED: CallSessionManager type mismatches
    // AuditsModule, // DEFERRED
    // ReaperModule, // DISABLED: Prisma model name mismatches (lowercase vs CamelCase)
  ],
  controllers: [AppController, APIStatusController],
  providers: [AppService, TenantMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
