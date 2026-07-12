import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APIManager } from './api-manager'

@Module({
  imports: [ConfigModule],
  providers: [APIManager],
  exports: [APIManager],
})
export class APIManagerModule {}
