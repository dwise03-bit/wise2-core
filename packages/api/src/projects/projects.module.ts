import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { S3Service } from '../storage/s3.service';

@Module({
  imports: [ConfigModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, S3Service],
  exports: [ProjectsService, S3Service],
})
export class ProjectsModule {}
