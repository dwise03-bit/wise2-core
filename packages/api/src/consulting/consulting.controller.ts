import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('consulting')
export class ConsultingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('workspaces/:workspaceId/clients')
  list(@Param('workspaceId') workspaceId: string) {
    return this.prisma.consultingClient.findMany({
      where: { workspaceId },
      include: { sessions: true, consultingFindings: true, tasks: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('clients/:clientId')
  get(@Param('clientId') id: string) {
    return this.prisma.consultingClient.findUnique({
      where: { id },
      include: { contacts: true, sessions: true, consultingFindings: true, tasks: true, research: true, plan: { include: { phases: true } } },
    });
  }

  @Post('clients')
  create(@Body() body: { workspaceId: string; companyName: string; industry?: string; employees?: number; revenue?: string; primaryContact?: string; primaryContactEmail?: string }) {
    return this.prisma.consultingClient.create({
      data: {
        workspaceId: body.workspaceId,
        companyName: body.companyName,
        industry: body.industry,
        employees: body.employees,
        revenue: body.revenue,
        primaryContact: body.primaryContact,
        primaryContactEmail: body.primaryContactEmail,
      },
    });
  }
}
