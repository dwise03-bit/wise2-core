import { Injectable } from '@nestjs/common'

@Injectable()
export class AuditLogService {
  async log(userId: string, action: string, entityType: string, entityId: string, changes?: any) {
    return { success: true, logId: 'log_123' }
  }

  async getAuditTrail(entityType: string, entityId: string) {
    return []
  }
}
