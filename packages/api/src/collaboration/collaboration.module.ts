import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CollaborationGateway } from './collaboration.gateway';
import { CollaborationService } from './collaboration.service';
import { CollaborationController } from './collaboration.controller';
import { PermissionGuard } from './guards/permission.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Collaboration Module
 * Encapsulates all real-time collaboration features for WISE² Studio
 *
 * Components:
 * - CollaborationGateway: WebSocket handling
 * - CollaborationService: Business logic
 * - CollaborationController: REST API endpoints
 * - PermissionGuard: Access control
 *
 * Provides real-time sync, permissions, comments, versions, and activity logging
 */
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [CollaborationGateway, CollaborationService, PermissionGuard],
  controllers: [CollaborationController],
  exports: [CollaborationService],
})
export class CollaborationModule {}
