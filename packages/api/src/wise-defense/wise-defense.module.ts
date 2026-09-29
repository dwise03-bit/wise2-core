import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WiseDefenseController } from './wise-defense.controller';
import { WiseDefenseHealthController } from './wise-defense-health.controller';
import { WiseDefenseService } from './wise-defense.service';
import { WiseDefenseTenantGuard } from './wise-defense.guard';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule],
  controllers: [WiseDefenseController, WiseDefenseHealthController],
  providers: [WiseDefenseService, WiseDefenseTenantGuard],
  exports: [WiseDefenseService],
})
export class WiseDefenseModule {}
