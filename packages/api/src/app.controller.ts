import { Controller, Get, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from '@app/common/prisma.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('health')
  @HttpCode(200)
  async getHealth(): Promise<any> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('ready')
  @HttpCode(200)
  async getReady(): Promise<any> {
    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
          // Add Redis check if available
        },
      };
    } catch (error) {
      return {
        status: 'not-ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}
