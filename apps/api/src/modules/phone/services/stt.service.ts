/**
 * Speech-to-Text Service
 * Uses OpenAI Whisper (local) for transcription
 * Provider-neutral abstraction for easy switching
 */

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
  duration: number; // seconds
}

export interface TranscriptionSegment {
  text: string;
  speaker?: string;
  startMs: number;
  endMs: number;
  confidence: number;
}

export type STTProvider = 'whisper' | 'google' | 'azure';

@Injectable()
export class STTService {
  private readonly logger = new Logger(STTService.name);
  private provider: STTProvider = 'whisper';
  private whisperUrl: string; // localhost:8000 or similar (Ollama)

  constructor() {
    this.whisperUrl = process.env.WHISPER_URL || 'http://localhost:8000/v1/audio/transcriptions';
  }

  /**
   * Transcribe audio file
   */
  async transcribeAudio(
    audioFilePath: string,
    language: string = 'en'
  ): Promise<TranscriptionResult> {
    if (this.provider === 'whisper') {
      return this.transcribeWithWhisper(audioFilePath, language);
    } else if (this.provider === 'google') {
      return this.transcribeWithGoogle(audioFilePath, language);
    }

    throw new Error(`Unknown STT provider: ${this.provider}`);
  }

  /**
   * Transcribe using Whisper (local)
   */
  private async transcribeWithWhisper(
    audioFilePath: string,
    language: string
  ): Promise<TranscriptionResult> {
    try {
      const fileBuffer = fs.readFileSync(audioFilePath);
      const fileName = path.basename(audioFilePath);

      // Create FormData
      const FormData = require('form-data');
      const form = new FormData();
      form.append('file', fileBuffer, fileName);
      form.append('model', 'whisper-1');
      form.append('language', language);
      form.append('response_format', 'json');

      // Call Whisper API (via Ollama or local server)
      const response = await fetch(this.whisperUrl, {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Whisper API error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();

      this.logger.log(
        `Transcription complete: ${audioFilePath} (${result.text.length} chars)`
      );

      return {
        text: result.text,
        language: language,
        confidence: 0.95, // Whisper doesn't return confidence, use default
        duration: result.duration || 0,
      };
    } catch (error) {
      this.logger.error(
        `Whisper transcription failed: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Transcribe using Google Cloud Speech-to-Text
   */
  private async transcribeWithGoogle(
    audioFilePath: string,
    language: string
  ): Promise<TranscriptionResult> {
    try {
      const speech = require('@google-cloud/speech');
      const client = new speech.SpeechClient();

      const audio = {
        content: fs.readFileSync(audioFilePath),
      };

      const request = {
        audio: audio,
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 16000,
          languageCode: `${language}-US`,
        },
      };

      const [response] = await client.recognize(request);
      const transcription = response.results
        .map((result: any) =>
          result.alternatives[0] ? result.alternatives[0].transcript : ''
        )
        .join('\n');

      this.logger.log(
        `Google STT complete: ${audioFilePath} (${transcription.length} chars)`
      );

      return {
        text: transcription,
        language: language,
        confidence: 0.92,
        duration: 0,
      };
    } catch (error) {
      this.logger.error(
        `Google STT failed: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  /**
   * Transcribe audio stream (for real-time transcription)
   */
  async transcribeStream(
    audioStream: NodeJS.ReadableStream,
    language: string = 'en'
  ): Promise<AsyncIterable<TranscriptionSegment>> {
    /**
     * TODO: Implement streaming transcription
     * For real-time AI conversation, we need incremental results
     * This would use WebSocket or chunked HTTP
     */
    this.logger.warn('Streaming transcription not yet implemented');
    return null as any;
  }

  /**
   * Set STT provider
   */
  setProvider(provider: STTProvider): void {
    this.provider = provider;
    this.logger.log(`STT provider set to: ${provider}`);
  }

  /**
   * Get current provider
   */
  getProvider(): STTProvider {
    return this.provider;
  }

  /**
   * Health check STT service
   */
  async healthCheck(): Promise<{ isHealthy: boolean; provider: STTProvider; error?: string }> {
    try {
      if (this.provider === 'whisper') {
        // Try a quick request to verify Whisper is available
        const response = await fetch(this.whisperUrl, {
          method: 'HEAD',
          timeout: 5000,
        }).catch(() => null);

        if (!response || !response.ok) {
          return {
            isHealthy: false,
            provider: this.provider,
            error: 'Whisper service unreachable',
          };
        }
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
}
