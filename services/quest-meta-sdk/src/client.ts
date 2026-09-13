/**
 * QuestClient - Higher-level wrapper around QuestMetaSDK
 * Simplifies common VR patterns and handles spatial math
 */

import QuestMetaSDK, { VrFrameData, VrResponse, VrDeviceContext, SpatialObject } from './index';

export interface VRResponse {
  text: string;
  objects: SpatialObject[];
  audioUrl?: string;
  audioPosition?: [number, number, number];
}

export interface ClientConfig {
  routerUrl?: string;
  apiKey?: string;
  deviceId?: string;
  autoRetry?: boolean;
  maxRetries?: number;
}

/**
 * High-level Quest client for common VR patterns
 */
export class QuestClient {
  private sdk: QuestMetaSDK;
  private config: Required<ClientConfig>;
  private deviceContext: VrDeviceContext;

  constructor(config: ClientConfig = {}) {
    this.config = {
      routerUrl: config.routerUrl || 'http://localhost:3100',
      apiKey: config.apiKey || 'sk-test',
      deviceId: config.deviceId || 'quest-device-001',
      autoRetry: config.autoRetry !== false,
      maxRetries: config.maxRetries || 3,
    };

    this.sdk = new QuestMetaSDK(this.config.routerUrl, this.config.apiKey);

    this.deviceContext = {
      deviceId: this.config.deviceId,
      battery: 100,
      environmentLight: 'normal',
      trackingQuality: 'excellent',
    };
  }

  /**
   * Handle pinch gesture - ask AI a question
   */
  async handlePinch(
    gazePosition: [number, number, number],
    targetObject: string = 'workspace'
  ): Promise<VRResponse> {
    const frame: VrFrameData = {
      deviceId: this.config.deviceId,
      handTracking: {
        leftHand: { position: [0, 0, 0], gesture: 'idle' },
        rightHand: { position: [0, 0, 0], gesture: 'pinch' },
        timestamp: Date.now(),
      },
      gaze: {
        direction: this.normalizeVector(gazePosition),
        distance: this.vectorMagnitude(gazePosition),
        targetObject,
      },
      timestamp: Date.now(),
    };

    return await this.processAndRespond(frame, `User pinched while looking at ${targetObject}`);
  }

  /**
   * Handle grab gesture - select and confirm
   */
  async handleGrab(selectedObject: string): Promise<VRResponse> {
    const frame: VrFrameData = {
      deviceId: this.config.deviceId,
      handTracking: {
        leftHand: { position: [0, 0, 0], gesture: 'idle' },
        rightHand: { position: [0, 0, 0], gesture: 'grab' },
        timestamp: Date.now(),
      },
      gaze: {
        direction: [0, 0, -1],
        distance: 2,
        targetObject: selectedObject,
      },
      timestamp: Date.now(),
    };

    return await this.processAndRespond(frame, `User grabbed ${selectedObject}`);
  }

  /**
   * Handle point gesture - get information about area
   */
  async handlePoint(
    pointPosition: [number, number, number]
  ): Promise<VRResponse> {
    const frame: VrFrameData = {
      deviceId: this.config.deviceId,
      handTracking: {
        leftHand: { position: [0, 0, 0], gesture: 'idle' },
        rightHand: { position: pointPosition, gesture: 'point' },
        timestamp: Date.now(),
      },
      gaze: {
        direction: this.normalizeVector(pointPosition),
        distance: this.vectorMagnitude(pointPosition),
      },
      timestamp: Date.now(),
    };

    return await this.processAndRespond(frame, `User pointing at position ${pointPosition}`);
  }

  /**
   * Handle palm gesture - cancel/back
   */
  async handlePalm(): Promise<VRResponse> {
    const frame: VrFrameData = {
      deviceId: this.config.deviceId,
      handTracking: {
        leftHand: { position: [0, 0, 0], gesture: 'palm' },
        rightHand: { position: [0, 0, 0], gesture: 'palm' },
        timestamp: Date.now(),
      },
      gaze: {
        direction: [0, 0, -1],
        distance: 1,
      },
      timestamp: Date.now(),
    };

    return await this.processAndRespond(frame, 'User cancelled current action');
  }

  /**
   * Display data in VR space
   */
  async showDataVisualization(
    title: string,
    data: Record<string, number>,
    position: [number, number, number] = [0, 1.5, -2]
  ): Promise<VRResponse> {
    const dataString = Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const frame: VrFrameData = {
      deviceId: this.config.deviceId,
      handTracking: {
        leftHand: { position: [0, 0, 0], gesture: 'idle' },
        rightHand: { position: [0, 0, 0], gesture: 'idle' },
        timestamp: Date.now(),
      },
      gaze: {
        direction: this.normalizeVector(position),
        distance: this.vectorMagnitude(position),
      },
      timestamp: Date.now(),
    };

    const response = await this.processAndRespond(
      frame,
      `Show visualization: ${title}\nData:\n${dataString}`
    );

    // Position the response at specified location
    return {
      ...response,
      objects: response.objects.map(obj => ({
        ...obj,
        position: position,
      })),
    };
  }

  /**
   * Play voice guidance at a specific position
   */
  async playGuidance(
    text: string,
    position: [number, number, number] = [0, 1.5, -2]
  ): Promise<void> {
    await this.sdk.sendResponse(this.config.deviceId, {
      spatialObjects: [
        {
          type: 'text',
          position,
          data: text,
        },
      ],
      handGestureFeedback: 'acknowledge',
    });
  }

  /**
   * Update device context (battery, tracking quality, etc.)
   */
  updateDeviceContext(context: Partial<VrDeviceContext>): void {
    this.deviceContext = { ...this.deviceContext, ...context };
  }

  /**
   * Get device health and tracking status
   */
  async getHealth() {
    return await this.sdk.getDeviceHealth(this.config.deviceId);
  }

  /**
   * Private: Process frame and send response back
   */
  private async processAndRespond(frame: VrFrameData, userMessage: string): Promise<VRResponse> {
    const response = await this.retryAsync(
      () => this.sdk.processFrame(frame, this.deviceContext),
      this.config.maxRetries
    );

    return {
      text: response.spatialObjects[0]?.data || response.handGestureFeedback,
      objects: response.spatialObjects || [],
      audioUrl: response.spatialAudio?.url,
      audioPosition: response.spatialAudio?.position as [number, number, number],
    };
  }

  /**
   * Private: Retry logic with exponential backoff
   */
  private async retryAsync<T>(
    fn: () => Promise<T>,
    maxRetries: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Private: Vector math utilities
   */
  private normalizeVector(v: [number, number, number]): [number, number, number] {
    const mag = this.vectorMagnitude(v);
    if (mag === 0) return [0, 0, -1];
    return [v[0] / mag, v[1] / mag, v[2] / mag];
  }

  private vectorMagnitude(v: [number, number, number]): number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  }
}

/**
 * Factory function for quick setup
 */
export function createQuestClient(config?: ClientConfig): QuestClient {
  return new QuestClient(config);
}

export default QuestClient;
