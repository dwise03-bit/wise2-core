import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CjaysController } from './cjays.controller';
import { CjaysGoogleCallbackController } from './cjays.controller';
import { CjaysService } from './cjays.service';
import { CjaysTenantGuard } from './cjays-tenant.guard';
import { CjaysAiService } from './cjays-ai.service';
import { CjaysGoogleService } from './cjays-google.service';
import { AuthModule } from '../auth/auth.module';
import { HermesModule } from '../hermes/hermes.module';
import { GoogleCalendarModule } from '../services/google-calendar.module';

@Module({ imports: [PrismaModule,AuthModule,HermesModule,GoogleCalendarModule], controllers: [CjaysController,CjaysGoogleCallbackController], providers: [CjaysService,CjaysTenantGuard,CjaysAiService,CjaysGoogleService], exports: [CjaysService] })
export class CjaysModule {}
