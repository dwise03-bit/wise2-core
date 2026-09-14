/**
 * Ray-Ban Meta Integration - AR Glasses Interface
 * Real-time video capture, voice input, and visual responses
 */

import axios, { AxiosInstance } from 'axios';

export interface RayBanFrame {
  device_id: string;
  timestamp: number;
  video_stream?: string; // Base64 encoded frame or stream URL
  audio_stream?: string; // Audio input from glasses microphone
  gesture?: string; // Detected gesture (tap, swipe, etc.)
}

export interface RayBanResponse {
  text?: string; // Text response
  visual?: string; // AR overlay data
  audio_url?: string; // Audio response URL
  gesture_response?: string; // Visual feedback
}

export interface RayBanContext {
  device_id: string;
  user_location?: { lat: number; lng: number };
  detected_objects?: string[];
  ambient_sound_level?: number;
  battery_level?: number;
}

export class RayBanMetaClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = process.env.RAYBAN_META_URL || 'http://127.0.0.1:3013';
    this.enabled = process.env.RAYBAN_META_ENABLED !== 'false';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Process frame from Ray-Ban Meta glasses
   */
  async processFrame(frame: RayBanFrame): Promise<RayBanContext | null> {
    if (!this.enabled) {
      console.log('⚠️ Ray-Ban Meta disabled (RAYBAN_META_ENABLED=false)');
      return null;
    }

    try {
      const response = await this.client.post('/api/frame', {
        device_id: frame.device_id,
        video: frame.video_stream,
        audio: frame.audio_stream,
        gesture: frame.gesture,
        timestamp: frame.timestamp,
      });

      return {
        device_id: frame.device_id,
        detected_objects: response.data.detected_objects || [],
        ambient_sound_level: response.data.ambient_sound_level,
        battery_level: response.data.battery_level,
        user_location: response.data.location,
      };
    } catch (error) {
      console.warn('⚠️ Ray-Ban frame processing failed:', (error as Error).message);
      return null;
    }
  }

  /**
   * Send response to Ray-Ban Meta glasses
   */
  async sendResponse(deviceId: string, response: RayBanResponse): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      await this.client.post('/api/response', {
        device_id: deviceId,
        text: response.text,
        visual: response.visual,
        audio_url: response.audio_url,
        gesture_response: response.gesture_response,
      });
      return true;
    } catch (error) {
      console.warn('⚠️ Ray-Ban response send failed:', (error as Error).message);
      return false;
    }
  }

  /**
   * Get device status and context
   */
  async getDeviceContext(deviceId: string): Promise<RayBanContext | null> {
    if (!this.enabled) return null;

    try {
      const response = await this.client.get(`/api/device/${deviceId}`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Ray-Ban device context fetch failed:', (error as Error).message);
      return null;
    }
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    if (!this.enabled) return false;
    try {
      const response = await this.client.get('/health', { timeout: 2000 });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}
