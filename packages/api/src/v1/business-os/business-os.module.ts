import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { BusinessOsController } from './business-os.controller';
import { BusinessOsService } from './business-os.service';

@Module({
  imports: [AuthModule],
  controllers: [BusinessOsController],
  providers: [BusinessOsService],
  exports: [BusinessOsService],
})
export class BusinessOsModule {}
