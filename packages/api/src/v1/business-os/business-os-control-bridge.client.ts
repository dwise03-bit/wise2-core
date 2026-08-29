import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import type {
  CloudDeployDto,
  CloudHealthDto,
  CloudInventoryDto,
  CloudOperationResultDto,
  CloudRestartDto,
  CloudRollbackDto,
} from './business-os.types';

@Injectable()
export class BusinessOsControlBridgeClient {
  private readonly logger = new Logger('ControlBridgeClient');
  private readonly http: AxiosInstance;

  constructor() {
    const baseURL = process.env.CONTROL_BRIDGE_URL ?? '';
    const token = process.env.CONTROL_BRIDGE_TOKEN ?? '';

    this.http = axios.create({
      baseURL,
      timeout: 10_000,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  private get isConfigured(): boolean {
    return Boolean(process.env.CONTROL_BRIDGE_URL);
  }

  async healthCheck(): Promise<CloudHealthDto> {
    const checkedAt = new Date().toISOString();

    if (!this.isConfigured) {
      return { status: 'unreachable', message: 'CONTROL_BRIDGE_URL not configured', checkedAt };
    }

    const start = Date.now();
    try {
      await this.http.get('/v1/control/health');
      return { status: 'ok', latencyMs: Date.now() - start, checkedAt };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'connection failed';
      this.logger.warn(`ControlBridge health check failed: ${msg}`);
      return { status: 'unreachable', message: msg, checkedAt };
    }
  }

  async deploy(dto: CloudDeployDto): Promise<CloudOperationResultDto> {
    const executedAt = new Date().toISOString();

    if (!this.isConfigured) {
      return { success: false, service: dto.service, error: 'CONTROL_BRIDGE_URL not configured', executedAt };
    }

    try {
      const { data } = await this.http.post(`/v1/control/deploy/${dto.service}`, {
        image: dto.image,
        tag: dto.tag,
        env: dto.env,
      });
      return { success: true, service: dto.service, output: data?.data?.id ?? 'Deploy queued', executedAt };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'deploy failed';
      this.logger.error(`ControlBridge deploy error: ${msg}`);
      return { success: false, service: dto.service, error: msg, executedAt };
    }
  }

  async restart(dto: CloudRestartDto): Promise<CloudOperationResultDto> {
    const executedAt = new Date().toISOString();

    if (!this.isConfigured) {
      return { success: false, service: dto.service, error: 'CONTROL_BRIDGE_URL not configured', executedAt };
    }

    try {
      const { data } = await this.http.post(`/v1/control/docker/${dto.service}/restart`);
      return { success: true, service: dto.service, output: data?.data?.stdout ?? 'Restart queued', executedAt };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'restart failed';
      this.logger.error(`ControlBridge restart error: ${msg}`);
      return { success: false, service: dto.service, error: msg, executedAt };
    }
  }

  async rollback(dto: CloudRollbackDto): Promise<CloudOperationResultDto> {
    const executedAt = new Date().toISOString();

    if (!this.isConfigured) {
      return { success: false, service: dto.service, error: 'CONTROL_BRIDGE_URL not configured', executedAt };
    }

    try {
      const { data } = await this.http.post(`/v1/control/rollback/${dto.service}`, {
        steps: dto.steps,
        toTag: dto.toTag,
      });
      return { success: true, service: dto.service, output: data?.data?.id ?? 'Rollback queued', executedAt };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'rollback failed';
      this.logger.error(`ControlBridge rollback error: ${msg}`);
      return { success: false, service: dto.service, error: msg, executedAt };
    }
  }

  async inventory(): Promise<CloudInventoryDto> {
    const generatedAt = new Date().toISOString();

    if (!this.isConfigured) {
      return { services: [], generatedAt };
    }

    try {
      const { data } = await this.http.get('/v1/control/docker/services');
      const services = (data?.data?.services ?? []).map((service: any) => ({
        name: service.name ?? service.Service ?? 'unknown',
        status: service.status ?? service.State ?? 'unknown',
        image: service.image,
        uptime: service.uptime,
      }));
      return { services, generatedAt };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'inventory failed';
      this.logger.warn(`ControlBridge inventory failed: ${msg}`);
      return { services: [], generatedAt };
    }
  }
}
