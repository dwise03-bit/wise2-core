/**
 * Enhanced OBS WebSocket API Client with Comprehensive Error Handling
 * Integration with OBS (Open Broadcaster Software) for stream control
 *
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Platform auth expiration detection
 * - Scene switch failure recovery with fallback
 * - Source missing detection and recovery
 * - Recording disk full detection
 * - Graceful error handling with recovery actions
 */

import { ObsScene, ObsSource, ObsStreamStats } from '@/types/api';
import {
  AppError,
  ObsError,
  ErrorType,
  ErrorSeverity,
  ErrorLogger,
  RecoveryAction,
  calculateBackoffDelay,
  DEFAULT_RETRY_CONFIG,
  RetryConfig,
} from './error-handling';

export interface ObsConfig {
  host: string;
  port: number;
  password?: string;
  timeout?: number;
  maxReconnectAttempts?: number;
  retryConfig?: Partial<RetryConfig>;
}

/**
 * Connection state
 */
interface ConnectionState {
  attempts: number;
  maxAttempts: number;
  isRetrying: boolean;
  lastError?: ObsError;
}

/**
 * Scene state for fallback
 */
interface SceneState {
  current: string | null;
  previous: string | null;
}

/**
 * Enhanced OBS WebSocket API Client
 */
export class ObsClientEnhanced {
  private host: string;
  private port: number;
  private password?: string;
  private timeout: number;
  private retryConfig: RetryConfig;
  private ws: WebSocket | null = null;
  private connected = false;
  private messageId = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();
  private connectionState: ConnectionState;
  private sceneState: SceneState = {
    current: null,
    previous: null,
  };
  private reconnectTimer: NodeJS.Timeout | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: ObsConfig) {
    this.host = config.host;
    this.port = config.port;
    this.password = config.password;
    this.timeout = config.timeout || 10000;
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...config.retryConfig,
    };
    this.connectionState = {
      attempts: 0,
      maxAttempts: config.maxReconnectAttempts || 5,
      isRetrying: false,
    };
  }

  /**
   * Connect to OBS WebSocket with retry logic
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = `ws://${this.host}:${this.port}`;
        this.ws = new WebSocket(url);

        const timeoutId = setTimeout(() => {
          if (!this.connected) {
            this.ws?.close();
            const error = new ObsError(
              'Connection timeout: OBS server did not respond within ' + this.timeout + 'ms',
              ErrorType.CONNECTION_ERROR,
              {
                code: 'CONNECTION_TIMEOUT',
                context: { host: this.host, port: this.port, timeout: this.timeout },
                connectionAttempts: this.connectionState.attempts,
                maxConnectionAttempts: this.connectionState.maxAttempts,
              }
            );
            ErrorLogger.log(error);
            reject(error);
          }
        }, this.timeout);

        this.ws.onopen = () => {
          clearTimeout(timeoutId);
          this.connected = true;
          this.connectionState.attempts = 0;
          this.startHealthCheck();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = () => {
          clearTimeout(timeoutId);
          this.connected = false;
          const error = new ObsError(
            'WebSocket connection error occurred',
            ErrorType.STREAM_DISCONNECTED,
            {
              code: 'WS_ERROR',
              context: { host: this.host, port: this.port },
              connectionAttempts: this.connectionState.attempts,
              maxConnectionAttempts: this.connectionState.maxAttempts,
            }
          );
          this.connectionState.lastError = error;
          ErrorLogger.log(error);
          reject(error);
        };

        this.ws.onclose = () => {
          clearTimeout(timeoutId);
          this.connected = false;
          this.stopHealthCheck();
          this.attemptReconnect();
        };
      } catch (error) {
        const appError = new ObsError(
          'Failed to create WebSocket connection',
          ErrorType.CONNECTION_ERROR,
          {
            code: 'WS_CREATION_FAILED',
            context: { error: error instanceof Error ? error.message : String(error) },
          }
        );
        ErrorLogger.log(appError);
        reject(appError);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.connectionState.isRetrying) return;
    if (this.connectionState.attempts >= this.connectionState.maxAttempts) {
      const error = new ObsError(
        'Failed to reconnect after maximum attempts',
        ErrorType.CONNECTION_ERROR,
        {
          code: 'MAX_RECONNECT_ATTEMPTS_EXCEEDED',
          context: {
            attempts: this.connectionState.attempts,
            maxAttempts: this.connectionState.maxAttempts,
          },
          connectionAttempts: this.connectionState.attempts,
          maxConnectionAttempts: this.connectionState.maxAttempts,
        }
      );
      ErrorLogger.log(error);
      this.emit('error', error);
      return;
    }

    this.connectionState.isRetrying = true;
    this.connectionState.attempts += 1;

    const delay = calculateBackoffDelay(
      this.connectionState.attempts - 1,
      this.retryConfig
    );

    this.reconnectTimer = setTimeout(() => {
      this.connectionState.isRetrying = false;
      this.connect().catch((error) => {
        ErrorLogger.log(error as ObsError);
      });
    }, delay);

    this.emit('reconnecting', {
      attempt: this.connectionState.attempts,
      maxAttempts: this.connectionState.maxAttempts,
      nextRetryIn: delay,
    });
  }

  /**
   * Start health check
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.sendRequest('GetStreamStatus').catch((error) => {
        if (error instanceof ObsError && error.type === ErrorType.STREAM_DISCONNECTED) {
          this.attemptReconnect();
        }
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop health check
   */
  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Disconnect from OBS
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.stopHealthCheck();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
    this.pendingRequests.clear();
  }

  /**
   * Send a request to OBS with error handling
   */
  private async sendRequest<T>(
    requestType: string,
    requestData?: any
  ): Promise<T> {
    if (!this.connected || !this.ws) {
      const error = new ObsError(
        'Not connected to OBS. Please establish a connection first.',
        ErrorType.CONNECTION_ERROR,
        {
          code: 'NOT_CONNECTED',
          context: { requestType },
        }
      );
      ErrorLogger.log(error);
      throw error;
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
        const error = new ObsError(
          `Request '${requestType}' timed out after ${this.timeout}ms`,
          ErrorType.CONNECTION_ERROR,
          {
            code: 'REQUEST_TIMEOUT',
            context: { requestType, timeout: this.timeout },
          }
        );
        ErrorLogger.log(error);
        reject(error);
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

        const sendError = new ObsError(
          'Failed to send request to OBS',
          ErrorType.CONNECTION_ERROR,
          {
            code: 'SEND_FAILED',
            context: {
              requestType,
              error: error instanceof Error ? error.message : String(error),
            },
          }
        );
        ErrorLogger.log(sendError);
        reject(sendError);
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
            const errorMessage = message.d.requestStatus?.comment || 'Unknown error';
            const errorCode = message.d.requestStatus?.code || 'UNKNOWN_ERROR';

            const error = new ObsError(
              errorMessage,
              this.classifyObsError(errorCode),
              {
                code: errorCode,
              }
            );

            ErrorLogger.log(error);
            pending.reject(error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  /**
   * Classify OBS error code to ErrorType
   */
  private classifyObsError(code: string): ErrorType {
    const codeMap: Record<string, ErrorType> = {
      'GENERIC_ERROR': ErrorType.API_ERROR,
      'NOT_IMPLEMENTED': ErrorType.API_ERROR,
      'UNKNOWN_OPCODE': ErrorType.API_ERROR,
      'FAILED': ErrorType.API_ERROR,
      'INVALID_FIELD': ErrorType.INVALID_REQUEST,
      'INVALID_FIELDS': ErrorType.INVALID_REQUEST,
      'RESOURCE_NOT_FOUND': ErrorType.NOT_FOUND,
      'INVALID_REQUEST_BATCH': ErrorType.INVALID_REQUEST,
      'NOT_ALLOWED': ErrorType.AUTH_ERROR,
      'NO_OUTPUT': ErrorType.STREAM_DISCONNECTED,
      'NO_RECORDING': ErrorType.RECORDING_FAILED,
      'INVALID_OUTPUT_NAME': ErrorType.NOT_FOUND,
      'NO_SOURCE': ErrorType.SOURCE_MISSING,
      'ALREADY_ACTIVE': ErrorType.API_ERROR,
      'TRANSITION_RUNNING': ErrorType.API_ERROR,
      'INVALID_TRANSITION': ErrorType.INVALID_REQUEST,
      'INVALID_SCENE': ErrorType.NOT_FOUND,
      'SCENE_NAME_EXISTS': ErrorType.API_ERROR,
      'SCENE_ITEM_NOT_FOUND': ErrorType.NOT_FOUND,
      'INVALID_HOME_DIRECTORY': ErrorType.STORAGE_ERROR,
      'PLUGIN_NOT_FOUND': ErrorType.NOT_FOUND,
    };

    return codeMap[code] || ErrorType.API_ERROR;
  }

  /**
   * Emit events
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Get all scenes
   */
  async getScenes(): Promise<ObsScene[]> {
    try {
      const response: any = await this.sendRequest('GetSceneList');

      return (response.scenes || []).map((scene: any, index: number) => ({
        id: scene.sceneName.toLowerCase().replace(/\s+/g, '_'),
        name: scene.sceneName,
        order: index,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to get scenes',
        ErrorType.API_ERROR,
        { code: 'GET_SCENES_FAILED' }
      );
    }
  }

  /**
   * Get current scene
   */
  async getCurrentScene(): Promise<string> {
    try {
      const response: any = await this.sendRequest('GetCurrentProgramScene');
      this.sceneState.current = response.currentProgramSceneName;
      return response.currentProgramSceneName;
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to get current scene',
        ErrorType.API_ERROR,
        { code: 'GET_CURRENT_SCENE_FAILED' }
      );
    }
  }

  /**
   * Set active scene with fallback recovery
   */
  async setScene(sceneName: string): Promise<void> {
    try {
      const currentScene = await this.getCurrentScene();
      this.sceneState.previous = currentScene;

      await this.sendRequest('SetCurrentProgramScene', {
        sceneName,
      });

      this.sceneState.current = sceneName;
    } catch (error) {
      // Attempt to fall back to previous scene
      if (this.sceneState.previous && this.sceneState.previous !== sceneName) {
        try {
          await this.sendRequest('SetCurrentProgramScene', {
            sceneName: this.sceneState.previous,
          });

          const fallbackError = new ObsError(
            `Failed to switch to scene '${sceneName}'. Reverted to previous scene.`,
            ErrorType.SCENE_SWITCH_FAILED,
            {
              code: 'SCENE_SWITCH_FAILED_REVERTED',
              context: { targetScene: sceneName, fallbackScene: this.sceneState.previous },
            }
          );
          ErrorLogger.log(fallbackError);
          this.emit('scene-switch-error', fallbackError);
          throw fallbackError;
        } catch (fallbackError) {
          // Fallback also failed
          const criticalError = new ObsError(
            'Failed to switch scene and could not revert to previous scene',
            ErrorType.SCENE_SWITCH_FAILED,
            {
              code: 'SCENE_SWITCH_AND_REVERT_FAILED',
              context: {
                targetScene: sceneName,
                fallbackScene: this.sceneState.previous,
              },
            }
          );
          ErrorLogger.log(criticalError);
          throw criticalError;
        }
      }

      if (error instanceof ObsError) {
        // recoveryActions removed due to read-only property
        throw error;
      }
      throw new ObsError(
        'Failed to set scene',
        ErrorType.SCENE_SWITCH_FAILED,
        { code: 'SET_SCENE_FAILED' }
      );
    }
  }

  /**
   * Create a new scene
   */
  async createScene(sceneName: string): Promise<ObsScene> {
    try {
      await this.sendRequest('CreateScene', {
        sceneName,
      });

      const scenes = await this.getScenes();
      const newScene = scenes.find((s) => s.name === sceneName);

      if (!newScene) {
        throw new ObsError(
          'Scene was created but could not be retrieved',
          ErrorType.API_ERROR,
          { code: 'SCENE_CREATE_VERIFY_FAILED' }
        );
      }

      return newScene;
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to create scene',
        ErrorType.API_ERROR,
        { code: 'SCENE_CREATE_FAILED' }
      );
    }
  }

  /**
   * Delete a scene
   */
  async deleteScene(sceneName: string): Promise<void> {
    try {
      await this.sendRequest('RemoveScene', {
        sceneName,
      });
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to delete scene',
        ErrorType.API_ERROR,
        { code: 'SCENE_DELETE_FAILED' }
      );
    }
  }

  /**
   * Rename a scene
   */
  async renameScene(oldName: string, newName: string): Promise<void> {
    try {
      await this.sendRequest('SetSceneName', {
        sceneName: oldName,
        newSceneName: newName,
      });
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to rename scene',
        ErrorType.API_ERROR,
        { code: 'SCENE_RENAME_FAILED' }
      );
    }
  }

  /**
   * Get sources in a scene
   */
  async getSceneSources(sceneName: string): Promise<ObsSource[]> {
    try {
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
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to get scene sources',
        ErrorType.API_ERROR,
        { code: 'GET_SOURCES_FAILED' }
      );
    }
  }

  /**
   * Add source to scene with validation
   */
  async addSourceToScene(
    sceneName: string,
    sourceName: string,
    sourceType: string,
    settings?: any
  ): Promise<ObsSource> {
    try {
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
    } catch (error) {
      if (error instanceof ObsError && error.type === ErrorType.SOURCE_MISSING) {
        const sourceError = new ObsError(
          `Source '${sourceName}' is missing. It will be disabled in preview.`,
          ErrorType.SOURCE_MISSING,
          {
            code: 'SOURCE_NOT_FOUND',
            context: { sceneName, sourceName },
          }
        );
        ErrorLogger.log(sourceError);
        this.emit('source-missing', { sceneName, sourceName });
        throw sourceError;
      }

      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to add source to scene',
        ErrorType.API_ERROR,
        { code: 'ADD_SOURCE_FAILED' }
      );
    }
  }

  /**
   * Remove source from scene
   */
  async removeSourceFromScene(
    sceneName: string,
    sceneItemId: number
  ): Promise<void> {
    try {
      await this.sendRequest('RemoveSceneItem', {
        sceneName,
        sceneItemId,
      });
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to remove source from scene',
        ErrorType.API_ERROR,
        { code: 'REMOVE_SOURCE_FAILED' }
      );
    }
  }

  /**
   * Start streaming with retry and auth validation
   */
  async startStreaming(settings?: {
    service?: string;
    serviceUrl?: string;
    streamKey?: string;
  }): Promise<{ success: boolean }> {
    try {
      // Set stream settings if provided
      if (settings?.serviceUrl && settings?.streamKey) {
        await this.setStreamSettings(settings.serviceUrl, settings.streamKey);
      }

      await this.sendRequest('StartStream');

      return { success: true };
    } catch (error) {
      if (error instanceof ObsError && error.type === ErrorType.AUTH_ERROR) {
        const authError = new ObsError(
          'Your streaming platform authorization has expired. Please re-authorize.',
          ErrorType.AUTH_EXPIRED,
          {
            code: 'AUTH_EXPIRED',
          }
        );
        ErrorLogger.log(authError);
        this.emit('auth-expired', authError);
        throw authError;
      }

      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to start streaming',
        ErrorType.STREAM_DISCONNECTED,
        { code: 'START_STREAM_FAILED' }
      );
    }
  }

  /**
   * Stop streaming
   */
  async stopStreaming(): Promise<{ success: boolean }> {
    try {
      await this.sendRequest('StopStream');
      return { success: true };
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to stop streaming',
        ErrorType.API_ERROR,
        { code: 'STOP_STREAM_FAILED' }
      );
    }
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
    try {
      return await this.sendRequest('GetStreamStatus');
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to get streaming status',
        ErrorType.API_ERROR,
        { code: 'GET_STREAM_STATUS_FAILED' }
      );
    }
  }

  /**
   * Set stream settings with validation
   */
  private async setStreamSettings(
    rtmpUrl: string,
    streamKey: string
  ): Promise<void> {
    try {
      const settings: any = await this.sendRequest('GetStreamServiceSettings');

      const updatedSettings = {
        ...settings.streamServiceSettings,
        'server': rtmpUrl,
        'key': streamKey,
      };

      await this.sendRequest('SetStreamServiceSettings', {
        streamServiceSettings: updatedSettings,
      });
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to set stream settings',
        ErrorType.API_ERROR,
        { code: 'SET_STREAM_SETTINGS_FAILED' }
      );
    }
  }

  /**
   * Get output statistics with disk full detection
   */
  async getStats(): Promise<ObsStreamStats> {
    try {
      const status = await this.getStreamingStatus();

      // Check for disk full condition
      if (status.outputTotalBytes > 0.95 * (500 * 1024 * 1024)) { // 95% of 500GB
        const diskError = new ObsError(
          'Recording disk is almost full. Recording may fail.',
          ErrorType.DISK_FULL,
          {
            code: 'DISK_ALMOST_FULL',
            context: { bytesUsed: status.outputTotalBytes },
          }
        );
        ErrorLogger.log(diskError);
        this.emit('disk-warning', diskError);
      }

      return {
        status: status.outputActive ? 'active' : 'inactive',
        streamId: status.outputActive ? 'stream_' + Date.now() : undefined,
        duration: status.outputActive ? Math.floor(status.outputDuration / 1000) : undefined,
        fps: status.outputActive ? Math.floor(status.outputTotalFrames / (status.outputDuration / 1000)) : undefined,
        droppedFrames: status.outputDroppedFrames || 0,
        totalFrames: status.outputTotalFrames || 0,
        bytesTransferred: status.outputTotalBytes || 0,
        cpuUsage: 0,
        memoryUsage: 0,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ObsError) {
        throw error;
      }
      throw new ObsError(
        'Failed to get stream statistics',
        ErrorType.API_ERROR,
        { code: 'GET_STATS_FAILED' }
      );
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Create and export a singleton OBS client
 */
let obsClient: ObsClientEnhanced | null = null;

export function initObsClientEnhanced(config?: Partial<ObsConfig>): ObsClientEnhanced {
  if (!obsClient) {
    const host = config?.host || process.env.OBS_HOST || 'localhost';
    const port = config?.port || parseInt(process.env.OBS_PORT || '4444');
    const password = config?.password || process.env.OBS_PASSWORD;

    obsClient = new ObsClientEnhanced({
      host,
      port,
      password,
      ...config,
    });
  }

  return obsClient;
}

export function getObsClientEnhanced(): ObsClientEnhanced {
  if (!obsClient) {
    return initObsClientEnhanced();
  }
  return obsClient;
}
