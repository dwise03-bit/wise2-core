import { Controller, Get, Post, Param, Body } from '@nestjs/common'
import { ModulesService } from './modules.service'

@Controller('v1/modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  async getModules() {
    return await this.modulesService.getModules()
  }

  @Get(':id')
  async getModuleStatus(@Param('id') moduleId: string) {
    return await this.modulesService.getModuleStatus(moduleId)
  }

  @Post(':id/enable')
  async enableModule(@Param('id') moduleId: string, @Body() dto: { user_id: string }) {
    return await this.modulesService.enableModule(dto.user_id, moduleId)
  }
}
