import { Module } from '@nestjs/common';
import { HermesModule } from '../hermes/hermes.module';
import { RevenueOsModule } from '../revenue-os/revenue-os.module';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';

@Module({
  imports: [HermesModule, RevenueOsModule],
  controllers: [DiscordController],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}
