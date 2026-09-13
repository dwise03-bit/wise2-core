import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get('current')
  async getCurrentWorkspace(@Req() req: Request) {
    const tenantId = (req as any).tenant_id || (req.user as any).workspace_id;
    if (!tenantId) {
      throw new Error('Missing tenant context');
    }
    return this.workspacesService.getCurrentWorkspace(tenantId);
  }
}
