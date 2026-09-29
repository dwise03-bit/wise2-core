import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * DemoIsolationGuard
 *
 * Enforces tenant isolation for demo routes.
 * Prevents a demo session from accessing another tenant's demo data.
 *
 * Usage:
 * @UseGuards(DemoIsolationGuard)
 * @Post('demo/session/:demoSessionId/action')
 */
@Injectable()
export class DemoIsolationGuard implements CanActivate {
  private readonly logger = new Logger('Demo/IsolationGuard');

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { demoSessionId, tenantId } = request.params;

    if (!demoSessionId || !tenantId) {
      return true; // Skip guard if not demo-specific
    }

    // Verify session belongs to tenant
    const session = await this.prisma.demoSession.findUnique({
      where: { id: demoSessionId },
      include: { demoEnvironment: { select: { tenantId: true } } },
    });

    if (!session) {
      this.logger.warn(`Session not found: ${demoSessionId}`);
      throw new ForbiddenException('Session not found');
    }

    if (session.demoEnvironment.tenantId !== tenantId) {
      this.logger.warn(
        `Cross-tenant access attempt: session ${demoSessionId} does not belong to tenant ${tenantId}`,
      );
      throw new ForbiddenException('Access denied: session does not belong to this tenant');
    }

    return true;
  }
}
