import OBSWebSocket from 'obs-websocket-js';
import { ObsScene, ObsSource, ObsStreamStats } from '@/types/api';

export interface ObsConfig {
  host: string;
  port: number;
  password?: string;
  timeout?: number;
  secure?: boolean;
}

export class ObsError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ObsError';
  }
}

export class ObsClient {
  private readonly obs = new OBSWebSocket();
  private connected = false;
  private connecting: Promise<void> | null = null;

  constructor(private readonly config: ObsConfig) {}

  async connect(): Promise<void> {
    if (this.connected) return;
    if (this.connecting) return this.connecting;

    this.connecting = (async () => {
      const protocol = this.config.secure ? 'wss' : 'ws';
      const url = `${protocol}://${this.config.host}:${this.config.port}`;
      try {
        await this.obs.connect(url, this.config.password, { rpcVersion: 1 });
        this.connected = true;
      } catch (error) {
        this.connected = false;
        throw new ObsError(
          error instanceof Error ? error.message : 'Unable to connect to OBS',
          'CONNECTION_ERROR',
        );
      } finally {
        this.connecting = null;
      }
    })();

    return this.connecting;
  }

  disconnect(): void {
    this.obs.disconnect();
    this.connected = false;
  }

  private async call<T = Record<string, unknown>>(requestType: any, requestData?: any): Promise<T> {
    await this.connect();
    try {
      return (await this.obs.call(requestType, requestData)) as T;
    } catch (error) {
      throw new ObsError(
        error instanceof Error ? error.message : `OBS request ${requestType} failed`,
        'REQUEST_FAILED',
      );
    }
  }

  async getScenes(): Promise<ObsScene[]> {
    const response: any = await this.call('GetSceneList');
    return (response.scenes || []).map((scene: any, index: number) => ({
      id: scene.sceneName,
      name: scene.sceneName,
      order: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async getCurrentScene(): Promise<string> {
    const response: any = await this.call('GetCurrentProgramScene');
    return response.currentProgramSceneName;
  }

  async setScene(sceneName: string): Promise<void> {
    await this.call('SetCurrentProgramScene', { sceneName });
  }

  async createScene(sceneName: string): Promise<ObsScene> {
    await this.call('CreateScene', { sceneName });
    return {
      id: sceneName,
      name: sceneName,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async deleteScene(sceneName: string): Promise<void> {
    await this.call('RemoveScene', { sceneName });
  }

  async renameScene(oldName: string, newName: string): Promise<void> {
    await this.call('SetSceneName', { sceneName: oldName, newSceneName: newName });
  }

  async getSceneSources(sceneName: string): Promise<ObsSource[]> {
    const response: any = await this.call('GetSceneItemList', { sceneName });
    return (response.sceneItems || []).map((item: any) => ({
      id: String(item.sceneItemId),
      sceneId: sceneName,
      name: item.sourceName,
      type: item.inputKind || item.sourceType || 'custom',
      settings: {},
      enabled: item.sceneItemEnabled !== false,
      order: item.sceneItemIndex || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async addSourceToScene(sceneName: string, sourceName: string, sourceType: string, settings: any = {}): Promise<ObsSource> {
    const input: any = await this.call('CreateInput', {
      sceneName,
      inputName: sourceName,
      inputKind: sourceType,
      inputSettings: settings,
      sceneItemEnabled: true,
    });
    return {
      id: String(input.sceneItemId),
      sceneId: sceneName,
      name: sourceName,
      type: sourceType,
      settings,
      enabled: true,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async removeSourceFromScene(sceneName: string, sceneItemId: number): Promise<void> {
    await this.call('RemoveSceneItem', { sceneName, sceneItemId });
  }

  async startStreaming(settings?: { serviceUrl?: string; streamKey?: string }): Promise<{ success: boolean }> {
    if (settings?.serviceUrl && settings.streamKey) {
      await this.call('SetStreamServiceSettings', {
        streamServiceType: 'rtmp_custom',
        streamServiceSettings: { server: settings.serviceUrl, key: settings.streamKey },
      });
    }
    await this.call('StartStream');
    return { success: true };
  }

  async stopStreaming(): Promise<{ success: boolean }> {
    await this.call('StopStream');
    return { success: true };
  }

  async getStreamingStatus(): Promise<any> {
    return this.call('GetStreamStatus');
  }

  async getStats(): Promise<ObsStreamStats> {
    const [status, stats]: any[] = await Promise.all([
      this.getStreamingStatus(),
      this.call('GetStats'),
    ]);
    const durationMs = Number(status.outputDuration || 0);
    const totalFrames = Number(status.outputTotalFrames || 0);
    return {
      status: status.outputActive ? 'active' : 'inactive',
      streamId: status.outputActive ? 'obs-live' : undefined,
      duration: status.outputActive ? Math.floor(durationMs / 1000) : undefined,
      bitrate: status.outputActive ? Math.round(Number(status.outputBytes || 0) * 8 / Math.max(durationMs, 1)) : undefined,
      fps: Number(stats.activeFps || 0),
      droppedFrames: Number(status.outputSkippedFrames || 0),
      totalFrames,
      bytesTransferred: Number(status.outputBytes || 0),
      cpuUsage: Number(stats.cpuUsage || 0),
      memoryUsage: Number(stats.memoryUsage || 0),
      updatedAt: new Date().toISOString(),
    };
  }

  isConnected(): boolean { return this.connected; }
}

let obsClient: ObsClient | null = null;

export function initObsClient(config?: Partial<ObsConfig>): ObsClient {
  if (!obsClient) {
    obsClient = new ObsClient({
      host: config?.host || process.env.OBS_HOST || 'localhost',
      port: config?.port || parseInt(process.env.OBS_PORT || '4455', 10),
      password: config?.password || process.env.OBS_PASSWORD,
      secure: config?.secure ?? process.env.OBS_SECURE === 'true',
      timeout: config?.timeout || 10000,
    });
  }
  return obsClient;
}

export function getObsClient(): ObsClient { return obsClient || initObsClient(); }
