/**
 * Text-to-Speech Service
 * Handles synthesis of AI responses with streaming support
 */

import axios from 'axios';
import { Readable } from 'stream';
import { logger } from '../logger';
import fs from 'fs';
import path from 'path';

export interface TTSOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  streaming?: boolean;
}

export interface SynthesisResult {
  audioUrl: string;
  duration: number;
  mimeType: string;
  size: number;
  stream?: AsyncIterable<Buffer>;
}

export class TTSService {
  private piperUrl: string;
  private audioDir: string;

  constructor(
    piperUrl: string = 'http://localhost:8080/api/tts',
    audioDir: string = '/tmp/wise2-phone-audio'
  ) {
    this.piperUrl = piperUrl;
    this.audioDir = audioDir;

    // Create audio directory if it doesn't exist
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  /**
   * Synthesize text to speech
   */
  async synthesize(text: string, options: TTSOptions = {}): Promise<SynthesisResult> {
    const voice = options.voice || 'daniel';
    const speed = options.speed || 1.0;

    try {
      if (options.streaming) {
        return await this.synthesizeStream(text, voice, speed);
      } else {
        return await this.synthesizeToFile(text, voice, speed);
      }
    } catch (error) {
      logger.error('TTS synthesis failed:', error);
      throw error;
    }
  }

  /**
   * Synthesize to file (batch)
   */
  private async synthesizeToFile(
    text: string,
    voice: string,
    speed: number
  ): Promise<SynthesisResult> {
    try {
      // For now, use a mock/placeholder approach
      // In production, would call Piper or similar TTS engine

      const filename = `tts_${Date.now()}.wav`;
      const filepath = path.join(this.audioDir, filename);

      // Call Piper API
      const response = await axios.post(
        `${this.piperUrl}/synthesize`,
        {
          text,
          speaker: this.mapVoiceToSpeaker(voice),
          length_scale: 1.0 / speed,
        },
        {
          responseType: 'arraybuffer',
          timeout: 30000,
        }
      );

      const audioBuffer = Buffer.from(response.data);

      // Save to file
      fs.writeFileSync(filepath, audioBuffer);

      // Estimate duration (rough: ~2.5 words per second)
      const wordCount = text.split(/\s+/).length;
      const duration = (wordCount / 2.5) * (1 / speed);

      logger.info(`Synthesized: "${text}" → ${filename} (${duration.toFixed(1)}s)`);

      return {
        audioUrl: `file://${filepath}`,
        duration,
        mimeType: 'audio/wav',
        size: audioBuffer.length,
      };
    } catch (error) {
      logger.error('Piper synthesis failed:', error);

      // Fallback to mock silence if Piper unavailable
      logger.warn(`Piper unavailable, returning mock audio for: "${text}"`);

      const filename = `tts_mock_${Date.now()}.wav`;
      const filepath = path.join(this.audioDir, filename);

      // Create minimal WAV file (silence)
      const duration = (text.split(/\s+/).length / 2.5) * 1000; // ms
      const silenceBuffer = Buffer.alloc(Math.floor((duration / 1000) * 16000 * 2));

      fs.writeFileSync(filepath, silenceBuffer);

      return {
        audioUrl: `file://${filepath}`,
        duration: duration / 1000,
        mimeType: 'audio/wav',
        size: silenceBuffer.length,
      };
    }
  }

  /**
   * Synthesize with streaming chunks
   */
  private async synthesizeStream(
    text: string,
    voice: string,
    speed: number
  ): Promise<SynthesisResult> {
    try {
      const response = await axios.post(
        `${this.piperUrl}/synthesize-stream`,
        {
          text,
          speaker: this.mapVoiceToSpeaker(voice),
          length_scale: 1.0 / speed,
        },
        {
          responseType: 'stream',
          timeout: 30000,
        }
      );

      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = (wordCount / 2.5) * (1 / speed);

      // Create async iterable from stream
      const streamAsync = this.streamToAsyncIterable(response.data);

      return {
        audioUrl: 'stream://realtime',
        duration: estimatedDuration,
        mimeType: 'audio/wav',
        size: 0, // Unknown for streaming
        stream: streamAsync,
      };
    } catch (error) {
      logger.error('Piper streaming failed:', error);

      // Fallback to non-streaming
      return this.synthesizeToFile(text, voice, speed);
    }
  }

  /**
   * Convert Node.js stream to async iterable
   */
  private async *streamToAsyncIterable(
    stream: Readable
  ): AsyncIterable<Buffer> {
    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * Map voice name to Piper speaker ID
   */
  private mapVoiceToSpeaker(voice: string): string {
    const mapping: Record<string, string> = {
      daniel: 'en_US-male-daniel',
      default: 'en_US-male',
      male: 'en_US-male',
      female: 'en_US-female',
    };

    return mapping[voice] || mapping.default;
  }

  /**
   * Get Daniel voice status
   */
  async getDanielVoiceStatus(): Promise<{
    status: string;
    model?: string;
    quality?: number;
  }> {
    try {
      const response = await axios.get(`${this.piperUrl}/voices/daniel`, {
        timeout: 5000,
      });

      return {
        status: 'active',
        model: response.data.model,
        quality: response.data.quality || 0.9,
      };
    } catch {
      return {
        status: 'unavailable',
      };
    }
  }

  /**
   * Check TTS health
   */
  async health(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.piperUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Cleanup old audio files
   */
  async cleanup(maxAgeHours: number = 24): Promise<void> {
    try {
      const files = fs.readdirSync(this.audioDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filepath = path.join(this.audioDir, file);
        const stats = fs.statSync(filepath);
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filepath);
          logger.info(`Cleaned up old audio file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Audio cleanup failed:', error);
    }
  }
}

export default TTSService;
