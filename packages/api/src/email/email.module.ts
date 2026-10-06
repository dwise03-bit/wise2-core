import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailLogsController } from '../v1/email/email-logs.controller';

@Module({
  imports: [ConfigModule],
  providers: [EmailService],
  exports: [EmailService],
  controllers: [EmailLogsController],
})
export class EmailModule {}
