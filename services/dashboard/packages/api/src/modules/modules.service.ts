import { Injectable } from '@nestjs/common'

@Injectable()
export class ModulesService {
  async getModules() {
    return [
      { id: 'sound-labs', name: 'WISE Sound Labs', status: 'active', users: 1234 },
      { id: 'design-studio', name: 'Design Studio', status: 'coming-soon', eta: 'Q3 2026' },
      { id: 'video-studio', name: 'Video Studio', status: 'coming-soon', eta: 'Q4 2026' },
    ]
  }

  async getModuleStatus(moduleId: string) {
    const modules = await this.getModules()
    return modules.find((m) => m.id === moduleId)
  }

  async enableModule(userId: string, moduleId: string) {
    return { success: true, module_id: moduleId }
  }
}
