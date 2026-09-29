/**
 * Meta Quest Integration - VR Headset Interface
 * Immersive 3D environment, hand tracking, and spatial audio
 */

import axios, { AxiosInstance } from 'axios';

export interface QuestFrame {
  device_id: string;
  timestamp: number;
  hand_tracking?: {
    left_hand?: { position: [number, number, number]; gesture: string };
    right_hand?: { position: [number, number, number]; gesture: string };
  };
  gaze?: { direction: [number, number, number]; distance: number };
  spatial_audio?: string; // Audio stream from user
  environment_data?: string; // Spatial mapping data
}

export interface QuestResponse {
  spatial_object?: {
    type: 'model' | 'text' | 'audio' | 'animation';
    position: [number, number, number];
    data: string;
  };
  hand_gesture_feedback?: string; // Hand gesture to play
  spatial_audio_url?: string; // 3D positional audio
  environment_annotation?: string; // AR annotation data
}

export interface QuestContext {
  device_id: string;
  battery_level?: number;
  hand_tracking_confidence?: number;
  spatial_mapping_ready?: boolean;
  user_position?: [number, number, number];
  guardian_boundary?: boolean;
}

export class QuestMetaClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private enabled: boolean;

  constructor() {
    this.baseUrl = process.env.QUEST_META_URL || 'http://127.0.0.1:3013';
    this.enabled = process.env.QUEST_META_ENABLED !== 'false';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Process frame from Meta Quest headset
   */
  async processFrame(frame: QuestFrame): Promise<QuestContext | null> {
    if (!this.enabled) {
      console.log('⚠️ Meta Quest disabled (QUEST_META_ENABLED=false)');
      return null;
    }

    try {
      const response = await this.client.post('/api/frame', {
        device_id: frame.device_id,
        hand_tracking: frame.hand_tracking,
        gaze: frame.gaze,
        spatial_audio: frame.spatial_audio,
        environment_data: frame.environment_data,
        timestamp: frame.timestamp,
      });

      return {
        device_id: frame.device_id,
        battery_level: response.data.battery_level,
        hand_tracking_confidence: response.data.hand_tracking_confidence,
        spatial_mapping_ready: response.data.spatial_mapping_ready,
        user_position: response.data.user_position,
        guardian_boundary: response.data.guardian_boundary,
      };
    } catch (error) {
      console.warn('⚠️ Quest frame processing failed:', (error as Error).message);
      return null;
    }
  }

  /**
   * Send immersive response to Quest headset
   */
  async sendResponse(deviceId: string, response: QuestResponse): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      await this.client.post('/api/response', {
        device_id: deviceId,
        spatial_object: response.spatial_object,
        hand_gesture_feedback: response.hand_gesture_feedback,
        spatial_audio_url: response.spatial_audio_url,
        environment_annotation: response.environment_annotation,
      });
      return true;
    } catch (error) {
      console.warn('⚠️ Quest response send failed:', (error as Error).message);
      return false;
    }
  }

  /**
   * Get device context and capabilities
   */
  async getDeviceContext(deviceId: string): Promise<QuestContext | null> {
    if (!this.enabled) return null;

    try {
      const response = await this.client.get(`/api/device/${deviceId}`);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Quest device context fetch failed:', (error as Error).message);
      return null;
    }
  }

  /**
   * Stream spatial audio response (for real-time interaction)
   */
  async streamSpatialAudio(
    deviceId: string,
    audioStream: NodeJS.ReadableStream
  ): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      await this.client.post(`/api/audio/stream/${deviceId}`, audioStream, {
        headers: { 'Content-Type': 'audio/wav' },
      });
      return true;
    } catch (error) {
      console.warn('⚠️ Quest audio stream failed:', (error as Error).message);
      return false;
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
