import { Controller, Get } from '@nestjs/common'

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'healthy',
      service: 'petals-potions-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    }
  }
}
