import { Module } from '@nestjs/common';
import { RayBanService } from './rayban.service';
import { RayBanController } from './rayban.controller';

@Module({
  providers: [RayBanService],
  controllers: [RayBanController],
  exports: [RayBanService],
})
export class RayBanModule {}
