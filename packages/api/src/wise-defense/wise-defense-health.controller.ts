import { Controller, Get, HttpCode } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class WiseDefenseHealthController {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}
  @Get('wise-defense') @HttpCode(200)
  async health() {
    let database = 'unavailable';
    try { await this.prisma.$queryRaw`SELECT 1`; database = 'ok'; } catch { /* intentionally no connection detail */ }
    const enabled = this.config.get<string>('WISE_DEFENSE_ENABLED') === 'true';
    return { module: enabled ? 'enabled' : 'disabled', database, redis: this.config.get('REDIS_URL') ? 'configured' : 'not_configured', worker: 'not_configured', incidents: this.config.get('INCIDENT_PROVIDER_ENABLED') === 'true' ? 'configured' : 'not_configured', mesh: this.config.get('MESHTASTIC_ENABLED') === 'true' ? 'configured' : 'not_configured', sdr: this.config.get('SDR_ENABLED') === 'true' ? 'configured' : 'not_configured', notifications: this.config.get('WISE_DEFENSE_NOTIFICATIONS_ENABLED') === 'true' ? 'configured' : 'not_configured', ai: this.config.get('WISE_DEFENSE_AI_ENABLED') === 'true' ? 'configured' : 'not_configured' };
  }
}
