import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from './auth/auth.module'
import { ProjectsModule } from './projects/projects.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { BillingModule } from './billing/billing.module'
import { CommunityModule } from './community/community.module'
import { ModulesModule } from './modules/modules.module'
import { APIManagerModule } from './config/api-manager.module'
import { EmailModule } from './email/email.module'
import { EventsModule } from './analytics/events.module'
import { QueueModule } from './queue/queue.module'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { APIStatusController } from './config/api-status.controller'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || 'wise2',
        password: configService.get('DB_PASSWORD') || 'wise2dev',
        database: configService.get('DB_NAME') || 'wise2',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
    }),
    APIManagerModule,
    AuthModule,
    EmailModule,
    EventsModule,
    QueueModule,
    ProjectsModule,
    AnalyticsModule,
    BillingModule,
    CommunityModule,
    ModulesModule,
  ],
  controllers: [AppController, APIStatusController],
  providers: [AppService],
})
export class AppModule {}
