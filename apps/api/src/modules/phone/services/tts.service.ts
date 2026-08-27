/**
 * Text-to-Speech Service
 * Uses Google Translate TTS (free) or Google Cloud TTS
 * Streams audio directly to caller
 */

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

export interface TTSOptions {
  language?: string;
  gender?: 'male' | 'female' | 'neutral';
  speed?: number; // 0.5 to 2.0
  pitch?: number; // -20.0 to 20.0
}

export interface TTSResult {
  audioUrl: string;
  duration: number; // seconds
  mimeType: string;
  size: number; // bytes
}

export type TTSProvider = 'gtts' | 'google' | 'azure' | 'elevenlabs';

@Injectable()
export class TTSService {
  private readonly logger = new Logger(TTSService.name);
  private provider: TTSProvider = 'gtts';
  private audioDir = process.env.AUDIO_DIR || '/tmp/wise2-phone-audio';

  constructor() {
    // Ensure audio directory exists
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  /**
   * Convert text to speech
   */
  async synthesize(text: string, options: TTSOptions = {}): Promise<TTSResult> {
    if (this.provider === 'gtts') {
      return this.synthesizeWithGTTS(text, options);
    } else if (this.provider === 'google') {
      return this.synthesizeWithGoogle(text, options);
    }

    throw new Error(`Unknown TTS provider: ${this.provider}`);
  }

  /**
   * Synthesize using Google Translate TTS (gTTS)
   * Free, no API key required
   */
  private async synthesizeWithGTTS(
    text: string,
    options: TTSOptions
  ): Promise<TTSResult> {
    try {
      const gTTS = require('gtts').gTTS;
      const timestamp = Date.now();
      const audioFile = path.join(this.audioDir, `tts-${timestamp}.mp3`);

      const gtts = new gTTS(text, {
        lang: options.language || 'en',
        slow: false,
      });

      // Promisify save
      const save = util.promisify(gtts.save.bind(gtts));
      await save(audioFile);

      // Get file size and estimate duration
      const stats = fs.statSync(audioFile);
      const duration = this.estimateDuration(text);

      this.logger.log(
        `TTS synthesized (gTTS): ${text.substring(0, 50)}... → ${audioFile}`
      );

      return {
        audioUrl: `/api/v1/phone/audio/${path.basename(audioFile)}`,
        duration,
        mimeType: 'audio/mpeg',
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(`gTTS synthesis failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Synthesize using Google Cloud Text-to-Speech
   * Free tier: 1M characters/month
   */
  private async synthesizeWithGoogle(
    text: string,
    options: TTSOptions
  ): Promise<TTSResult> {
    try {
      const textToSpeech = require('@google-cloud/text-to-speech');
      const client = new textToSpeech.TextToSpeechClient();

      const request = {
        input: { text },
        voice: {
          languageCode: options.language || 'en-US',
          ssmlGender:
            options.gender === 'male'
              ? 'MALE'
              : options.gender === 'female'
              ? 'FEMALE'
              : 'NEUTRAL',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: options.speed || 1.0,
          pitch: options.pitch || 0,
        },
      };

      const [response] = await client.synthesizeSpeech(request);
      const timestamp = Date.now();
      const audioFile = path.join(this.audioDir, `tts-${timestamp}.mp3`);

      fs.writeFileSync(audioFile, response.audioContent);

      const stats = fs.statSync(audioFile);
      const duration = this.estimateDuration(text);

      this.logger.log(
        `TTS synthesized (Google): ${text.substring(0, 50)}... → ${audioFile}`
      );

      return {
        audioUrl: `/api/v1/phone/audio/${path.basename(audioFile)}`,
        duration,
        mimeType: 'audio/mpeg',
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(
        `Google TTS synthesis failed: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Stream TTS to call in real-time
   * For interactive conversations, we want to play audio as it's synthesized
   */
  async synthesizeStream(
    text: string,
    options: TTSOptions = {}
  ): Promise<NodeJS.ReadableStream> {
    /**
     * TODO: Implement streaming synthesis
     * For smooth conversation flow, synthesize and stream chunks as they complete
     * This requires streaming from gTTS or Google Cloud
     */
    this.logger.warn('TTS streaming not yet implemented');
    return null as any;
  }

  /**
   * Set TTS provider
   */
  setProvider(provider: TTSProvider): void {
    this.provider = provider;
    this.logger.log(`TTS provider set to: ${provider}`);
  }

  /**
   * Get current provider
   */
  getProvider(): TTSProvider {
    return this.provider;
  }

  /**
   * Get stored audio file
   */
  getAudioFile(filename: string): { path: string; exists: boolean } {
    const filePath = path.join(this.audioDir, filename);
    return {
      path: filePath,
      exists: fs.existsSync(filePath),
    };
  }

  /**
   * Clean up old audio files
   */
  async cleanup(olderThanHours: number = 24): Promise<number> {
    try {
      const files = fs.readdirSync(this.audioDir);
      const now = Date.now();
      const maxAge = olderThanHours * 60 * 60 * 1000;
      let deleted = 0;

      for (const file of files) {
        const filePath = path.join(this.audioDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          fs.unlinkSync(filePath);
          deleted++;
        }
      }

      this.logger.log(`Cleaned up ${deleted} old TTS audio files`);
      return deleted;
    } catch (error) {
      this.logger.error(`Audio cleanup failed: ${error.message}`);
      return 0;
    }
  }

  /**
   * Health check TTS service
   */
  async healthCheck(): Promise<{ isHealthy: boolean; provider: TTSProvider; error?: string }> {
    try {
      // Try synthesizing a short test string
      const result = await this.synthesize('Test', { language: 'en' });

      if (!result.audioUrl) {
        return {
          isHealthy: false,
          provider: this.provider,
          error: 'No audio URL returned',
        };
      }

      // Cleanup test file
      try {
        const match = result.audioUrl.match(/tts-\d+\.mp3/);
        if (match) {
          const testFile = path.join(this.audioDir, match[0]);
          fs.unlinkSync(testFile);
        }
      } catch (e) {
        // Ignore cleanup errors
      }

      return { isHealthy: true, provider: this.provider };
    } catch (error) {
      return {
        isHealthy: false,
        provider: this.provider,
        error: error.message,
      };
    }
  }

  /**
   * Estimate audio duration based on text length
   * Average speaking rate: ~150 words per minute = 2.5 words per second
   */
  private estimateDuration(text: string): number {
    const wordCount = text.split(/\s+/).length;
    const wordsPerSecond = 2.5;
    return Math.max(1, Math.ceil(wordCount / wordsPerSecond));
  }
}
