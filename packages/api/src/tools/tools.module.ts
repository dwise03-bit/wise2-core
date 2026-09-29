import { Module } from '@nestjs/common';
import { ToolsService } from './tools.service';
import { ToolsController } from './tools.controller';
import { GoogleMapsService } from '../maps/google-maps.service';

/**
 * Tools Module
 * Provides unified tool execution for AI agents
 * Integrates: Maps, CRM, Calendar, Phone, Hermes
 */
@Module({
  providers: [ToolsService, GoogleMapsService],
  controllers: [ToolsController],
  exports: [ToolsService, GoogleMapsService],
})
export class ToolsModule {}
