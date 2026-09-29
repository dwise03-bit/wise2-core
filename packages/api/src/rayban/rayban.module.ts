import { Module } from '@nestjs/common';
import { RayBanService } from './rayban.service';
import { RayBanController } from './rayban.controller';
import { RayBanGateway } from './rayban.gateway';

@Module({
  providers: [RayBanService, RayBanGateway],
  controllers: [RayBanController],
  exports: [RayBanService],
})
export class RayBanModule {}
