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
import { DiscordModule } from './discord/discord.module';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Parse DATABASE_URL if provided, otherwise use individual DB_* variables
        const databaseUrl = configService.get('DATABASE_URL');
        let dbConfig: any;

        if (databaseUrl) {
          // Parse DATABASE_URL format: postgresql://user:password@host:port/database
          try {
            const url = new URL(databaseUrl);
            dbConfig = {
              type: 'postgres',
              host: url.hostname,
              port: url.port ? parseInt(url.port, 10) : 5432,
              username: url.username,
              password: url.password,
              database: url.pathname.replace('/', ''),
            };
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error('Invalid DATABASE_URL format:', errorMsg);
            throw new Error('DATABASE_URL is invalid. Expected format: postgresql://user:password@host:port/database');
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

        return {
          ...dbConfig,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
          migrationsRun: false,
          synchronize: false,
          logging: false,
        };
      },
    }),
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
    DiscordModule,
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
    // AuditsModule, // DEFERRED
  ],
  controllers: [AppController, APIStatusController],
  providers: [AppService, TenantMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
