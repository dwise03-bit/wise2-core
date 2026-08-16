import { Injectable } from '@nestjs/common'

@Injectable()
export class CacheService {
  async get(key: string) {
    return null
  }

  async set(key: string, value: any, ttl?: number) {
    return true
  }

  async delete(key: string) {
    return true
  }

  async invalidate(pattern: string) {
    return 0
  }
}
