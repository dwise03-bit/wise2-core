import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { HermesAction } from './hermes-action.entity';
import { HermesController } from './hermes.controller';
import { HermesService } from './hermes.service';

@Module({
  imports: [TypeOrmModule.forFeature([HermesAction]), PrismaModule],
  controllers: [HermesController],
  providers: [HermesService],
  exports: [HermesService],
})
export class HermesModule {}
