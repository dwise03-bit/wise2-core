import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth(): any {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }

  @Get('api/docs')
  getApiDocs(): any {
    return {
      message: 'WISE² Enterprise API',
      version: '1.0.0',
      status: 'running',
    }
  }
}
