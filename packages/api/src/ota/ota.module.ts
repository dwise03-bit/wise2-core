import { Module } from '@nestjs/common';
import { OTAController } from './ota.controller';

@Module({
  controllers: [OTAController],
})
export class OTAModule {}
