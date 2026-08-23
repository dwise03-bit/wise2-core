import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FieldtechController, FieldtechPublicController } from './fieldtech.controller';
import { FieldtechService } from './fieldtech.service';

@Module({
  imports: [PrismaModule],
  controllers: [FieldtechController, FieldtechPublicController],
  providers: [FieldtechService],
  exports: [FieldtechService],
})
export class FieldtechModule {}
