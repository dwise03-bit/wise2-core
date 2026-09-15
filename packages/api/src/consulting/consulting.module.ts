import { Module } from '@nestjs/common';
import { ConsultingController } from './consulting.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({ imports: [PrismaModule], controllers: [ConsultingController] })
export class ConsultingModule {}
