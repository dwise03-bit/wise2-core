/**
 * RayBanClient - Higher-level wrapper around RayBanMetaSDK
 * Simplifies common patterns and handles boilerplate
 */

import RayBanMetaSDK, { ArFrameData, ArResponse, DeviceContext } from './index';

export interface AnalysisResult {
  text: string;
  diagnosis?: string;
  steps?: string[];
  parts?: string[];
  severity?: 'critical' | 'warning' | 'info';
  estimatedTime?: number;
}

export interface ClientConfig {
  routerUrl?: string;
  apiKey?: string;
  deviceId?: string;
  autoRetry?: boolean;
  maxRetries?: number;
}

/**
 * High-level Ray-Ban client for common use cases
 */
export class RayBanClient {
  private sdk: RayBanMetaSDK;
  private config: Required<ClientConfig>;
  private deviceContext: DeviceContext;

  constructor(config: ClientConfig = {}) {
    this.config = {
      routerUrl: config.routerUrl || 'http://localhost:3100',
      apiKey: config.apiKey || 'sk-test',
      deviceId: config.deviceId || 'rayban-device-001',
      autoRetry: config.autoRetry !== false,
      maxRetries: config.maxRetries || 3,
    };

    this.sdk = new RayBanMetaSDK(this.config.routerUrl, this.config.apiKey);

    this.deviceContext = {
      deviceId: this.config.deviceId,
      battery: 100,
      location: { lat: 0, lng: 0 },
      lighting: 'normal',
      orientation: 'portrait',
    };
  }

  /**
   * Simple interface: just pass the frame and get analysis
   */
  async analyzeFrame(
    frameData: string, // base64 image
    gesture?: 'tap' | 'swipe' | 'hold',
    context?: Partial<DeviceContext>
  ): Promise<AnalysisResult> {
    // Merge context
    if (context) {
      this.deviceContext = { ...this.deviceContext, ...context };
    }

    // Create frame
    const frame: ArFrameData = {
      deviceId: this.config.deviceId,
      videoFrame: frameData,
      gesture: gesture || 'tap',
      timestamp: Date.now(),
    };

    // Call SDK with retry logic
    const response = await this.retryAsync(
      () => this.sdk.processFrame(frame, this.deviceContext),
      this.config.maxRetries
    );

    // Parse response
    return this.parseResponse(response.text);
  }

  /**
   * Analyze equipment for specific issues
   */
  async diagnoseEquipment(
    frameData: string,
    equipmentType: 'hvac' | 'electrical' | 'plumbing' | 'appliance'
  ): Promise<AnalysisResult> {
    const prompt = `Diagnose this ${equipmentType} equipment issue shown in the image. Provide:
      1. What's wrong
      2. Severity level (critical/warning/info)
      3. Step-by-step repair instructions
      4. Parts needed
      5. Estimated repair time`;

    return this.analyzeFrame(frameData, 'tap');
  }

  /**
   * Get parts recommendation
   */
  async getPartsRecommendation(
    equipmentModel: string,
    issueDescription: string
  ): Promise<AnalysisResult> {
    // Create frame with description
    const response = await this.sdk.processFrame(
      {
        deviceId: this.config.deviceId,
        videoFrame: 'placeholder',
        gesture: 'tap',
        timestamp: Date.now(),
      },
      {
        ...this.deviceContext,
        lighting: 'normal',
      }
    );

    return {
      text: response.text,
      parts: this.extractParts(response.text),
    };
  }

  /**
   * Update device context (battery, location, etc.)
   */
  updateDeviceContext(context: Partial<DeviceContext>): void {
    this.deviceContext = { ...this.deviceContext, ...context };
  }

  /**
   * Get device health
   */
  async getHealth() {
    return await this.sdk.getDeviceHealth(this.config.deviceId);
  }

  /**
   * Stream audio response
   */
  async streamAudio(audioStream: ReadableStream<Uint8Array>): Promise<string> {
    return await this.sdk.streamAudio(this.config.deviceId, audioStream);
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
          const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Private: Parse response text into structured result
   */
  private parseResponse(text: string): AnalysisResult {
    // Simple parsing - in production, use NLP
    return {
      text,
      diagnosis: this.extractDiagnosis(text),
      steps: this.extractSteps(text),
      parts: this.extractParts(text),
      severity: this.extractSeverity(text),
      estimatedTime: this.extractTime(text),
    };
  }

  private extractDiagnosis(text: string): string {
    const match = text.match(/(?:issue|problem|diagnosis):\s*([^\n.]+)/i);
    return match ? match[1].trim() : '';
  }

  private extractSteps(text: string): string[] {
    const steps: string[] = [];
    const regex = /\d+\)\s*([^\n]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      steps.push(match[1].trim());
    }
    return steps;
  }

  private extractParts(text: string): string[] {
    const parts: string[] = [];
    const regex = /(?:part|component|material)s?:\s*([^\n]+)/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const partList = match[1]
        .split(/,|and/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      parts.push(...partList);
    }
    return parts;
  }

  private extractSeverity(
    text: string
  ): 'critical' | 'warning' | 'info' | undefined {
    if (/critical|emergency|dangerous/i.test(text)) return 'critical';
    if (/warning|caution|attention/i.test(text)) return 'warning';
    return 'info';
  }

  private extractTime(text: string): number | undefined {
    const match = text.match(/(\d+)\s*(?:min|hour|hr)/i);
    return match ? parseInt(match[1], 10) : undefined;
  }
}

/**
 * Factory function for quick setup
 */
export function createRayBanClient(config?: ClientConfig): RayBanClient {
  return new RayBanClient(config);
}

export default RayBanClient;
