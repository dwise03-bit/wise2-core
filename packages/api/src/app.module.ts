import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
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
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APIStatusController } from './config/api-status.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri =
          configService.get('MONGODB_URI') ||
          'mongodb://localhost:27017/wise2-brain';
        return { uri: mongoUri };
      },
    }),
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
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') !== 'production',
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
  ],
  controllers: [AppController, APIStatusController],
  providers: [AppService],
})
export class AppModule {}
