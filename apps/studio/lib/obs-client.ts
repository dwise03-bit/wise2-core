/**
 * OBS WebSocket API Client
 * Integration with OBS (Open Broadcaster Software) for stream control
 *
 * This module provides a typed client for interacting with OBS via WebSocket.
 * It handles scene management, source control, and streaming control.
 */

import { ObsScene, ObsSource, ObsStreamStats } from '@/types/api';

export interface ObsConfig {
  host: string;
  port: number;
  password?: string;
  timeout?: number;
}

/**
 * OBS WebSocket API Client
 * Manages all interactions with OBS
 */
export class ObsClient {
  private host: string;
  private port: number;
  private password?: string;
  private timeout: number;
  private ws: WebSocket | null = null;
  private connected = false;
  private messageId = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();

  constructor(config: ObsConfig) {
    this.host = config.host;
    this.port = config.port;
    this.password = config.password;
    this.timeout = config.timeout || 10000;
  }

  /**
   * Connect to OBS WebSocket
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `ws://${this.host}:${this.port}`;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.connected = true;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          this.connected = false;
          reject(new ObsError('WebSocket connection error', 'CONNECTION_ERROR'));
        };

        this.ws.onclose = () => {
          this.connected = false;
        };

        // Set connection timeout
        const timeoutId = setTimeout(() => {
          if (!this.connected) {
            reject(new ObsError('Connection timeout', 'CONNECTION_TIMEOUT'));
          }
        }, this.timeout);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from OBS
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.pendingRequests.clear();
  }

  /**
   * Send a request to OBS
   */
  private async sendRequest<T>(
    requestType: string,
    requestData?: any
  ): Promise<T> {
    if (!this.connected || !this.ws) {
      throw new ObsError('Not connected to OBS', 'NOT_CONNECTED');
    }

    const messageId = ++this.messageId;
    const message = {
      d: {
        requestType,
        requestId: String(messageId),
        requestData: requestData || {},
      },
    };

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(messageId);
        reject(new ObsError('Request timeout', 'REQUEST_TIMEOUT'));
      }, this.timeout);

      this.pendingRequests.set(messageId, {
        resolve,
        reject,
        timeout: timeoutId,
      });

      try {
        this.ws!.send(JSON.stringify(message));
      } catch (error) {
        this.pendingRequests.delete(messageId);
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Handle WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      if (message.d?.requestId) {
        const messageId = parseInt(message.d.requestId);
        const pending = this.pendingRequests.get(messageId);

        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(messageId);

          if (message.d.requestStatus?.result) {
            pending.resolve(message.d.responseData || {});
          } else {
            pending.reject(
              new ObsError(
                message.d.requestStatus?.comment || 'Unknown error',
                message.d.requestStatus?.code || 'UNKNOWN_ERROR'
              )
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Get all scenes
   */
  async getScenes(): Promise<ObsScene[]> {
    const response: any = await this.sendRequest('GetSceneList');

    return (response.scenes || []).map((scene: any, index: number) => ({
      id: scene.sceneName.toLowerCase().replace(/\s+/g, '_'),
      name: scene.sceneName,
      order: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  /**
   * Get current scene
   */
  async getCurrentScene(): Promise<string> {
    const response: any = await this.sendRequest('GetCurrentProgramScene');
    return response.currentProgramSceneName;
  }

  /**
   * Set active scene
   */
  async setScene(sceneName: string): Promise<void> {
    await this.sendRequest('SetCurrentProgramScene', {
      sceneName,
    });
  }

  /**
   * Create a new scene
   */
  async createScene(sceneName: string): Promise<ObsScene> {
    await this.sendRequest('CreateScene', {
      sceneName,
    });

    const scenes = await this.getScenes();
    const newScene = scenes.find(s => s.name === sceneName);

    if (!newScene) {
      throw new ObsError('Failed to create scene', 'SCENE_CREATE_FAILED');
    }

    return newScene;
  }

  /**
   * Delete a scene
   */
  async deleteScene(sceneName: string): Promise<void> {
    await this.sendRequest('RemoveScene', {
      sceneName,
    });
  }

  /**
   * Rename a scene
   */
  async renameScene(oldName: string, newName: string): Promise<void> {
    await this.sendRequest('SetSceneName', {
      sceneName: oldName,
      newSceneName: newName,
    });
  }

  /**
   * Get sources in a scene
   */
  async getSceneSources(sceneName: string): Promise<ObsSource[]> {
    const response: any = await this.sendRequest('GetSceneItemList', {
      sceneName,
    });

    return (response.sceneItems || []).map((item: any) => ({
      id: String(item.sceneItemId),
      sceneId: sceneName.toLowerCase().replace(/\s+/g, '_'),
      name: item.sourceName,
      type: item.sourceType || 'custom',
      settings: item.sourceSettings || {},
      enabled: item.sceneItemEnabled !== false,
      order: item.sceneItemIndex || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  /**
   * Add source to scene
   */
  async addSourceToScene(
    sceneName: string,
    sourceName: string,
    // Narrowed from `string`: the value flows straight into ObsSource['type'].
    sourceType: ObsSource['type'],
    settings?: any
  ): Promise<ObsSource> {
    const response: any = await this.sendRequest('CreateSceneItem', {
      sceneName,
      sourceName,
      sceneItemEnabled: true,
    });

    return {
      id: String(response.sceneItemId),
      sceneId: sceneName.toLowerCase().replace(/\s+/g, '_'),
      name: sourceName,
      type: sourceType,
      settings: settings || {},
      enabled: true,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Remove source from scene
   */
  async removeSourceFromScene(
    sceneName: string,
    sceneItemId: number
  ): Promise<void> {
    await this.sendRequest('RemoveSceneItem', {
      sceneName,
      sceneItemId,
    });
  }

  /**
   * Start streaming
   */
  async startStreaming(settings?: {
    service?: string;
    serviceUrl?: string;
    streamKey?: string;
  }): Promise<{ success: boolean }> {
    // Set stream settings if provided
    if (settings?.serviceUrl && settings?.streamKey) {
      await this.setStreamSettings(settings.serviceUrl, settings.streamKey);
    }

    await this.sendRequest('StartStream');

    return { success: true };
  }

  /**
   * Stop streaming
   */
  async stopStreaming(): Promise<{ success: boolean }> {
    await this.sendRequest('StopStream');
    return { success: true };
  }

  /**
   * Get streaming status
   */
  async getStreamingStatus(): Promise<{
    outputActive: boolean;
    outputDuration: number;
    outputTotalFrames: number;
    outputTotalBytes: number;
    outputDroppedFrames: number;
    outputRenderTotalFrames: number;
    outputRenderMissedFrames: number;
  }> {
    return this.sendRequest('GetStreamStatus');
  }

  /**
   * Set stream settings
   */
  private async setStreamSettings(
    rtmpUrl: string,
    streamKey: string
  ): Promise<void> {
    // Get current settings
    const settings: any = await this.sendRequest('GetStreamServiceSettings');

    // Update with new values
    const updatedSettings = {
      ...settings.streamServiceSettings,
      'server': rtmpUrl,
      'key': streamKey,
    };

    await this.sendRequest('SetStreamServiceSettings', {
      streamServiceSettings: updatedSettings,
    });
  }

  /**
   * Get output statistics
   */
  async getStats(): Promise<ObsStreamStats> {
    const status = await this.getStreamingStatus();

    return {
      status: status.outputActive ? 'active' : 'inactive',
      streamId: status.outputActive ? 'stream_' + Date.now() : undefined,
      duration: status.outputActive ? Math.floor(status.outputDuration / 1000) : undefined,
      fps: status.outputActive ? Math.floor(status.outputTotalFrames / (status.outputDuration / 1000)) : undefined,
      droppedFrames: status.outputDroppedFrames || 0,
      totalFrames: status.outputTotalFrames || 0,
      bytesTransferred: status.outputTotalBytes || 0,
      cpuUsage: 0, // Would need separate stats API call
      memoryUsage: 0, // Would need separate stats API call
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Custom error class for OBS API errors
 */
export class ObsError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'ObsError';
  }
}

/**
 * Create and export a singleton OBS client
 * Initialize with OBS_HOST and OBS_PORT environment variables
 */
let obsClient: ObsClient | null = null;

export function initObsClient(config?: Partial<ObsConfig>): ObsClient {
  if (!obsClient) {
    const host = config?.host || process.env.OBS_HOST || 'localhost';
    const port = config?.port || parseInt(process.env.OBS_PORT || '4444');
    const password = config?.password || process.env.OBS_PASSWORD;

    obsClient = new ObsClient({
      host,
      port,
      password,
      ...config,
    });
  }

  return obsClient;
}

export function getObsClient(): ObsClient {
  if (!obsClient) {
    return initObsClient();
  }
  return obsClient;
}
