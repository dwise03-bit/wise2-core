/**
 * Speech-to-Text Service
 * Handles transcription of caller audio
 */

import axios from 'axios';
import FormData from 'form-data';
import { logger } from '../logger';

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
}

export interface STTOptions {
  language?: string;
  model?: string;
}

export class STTService {
  private whisperUrl: string;
  private fallbackProvider: 'google' | 'azure' = 'google';

  constructor(whisperUrl: string = 'http://localhost:8000/v1/audio/transcriptions') {
    this.whisperUrl = whisperUrl;
  }

  /**
   * Transcribe audio buffer
   */
  async transcribe(
    audioBuffer: Buffer,
    options: STTOptions = {}
  ): Promise<TranscriptionResult> {
    const language = options.language || 'en';

    try {
      // Try Whisper first
      return await this.transcribeWithWhisper(audioBuffer, language);
    } catch (error) {
      logger.warn(`Whisper STT failed, falling back to ${this.fallbackProvider}:`, error);

      if (this.fallbackProvider === 'google') {
        return await this.transcribeWithGoogle(audioBuffer, language);
      }

      throw error;
    }
  }

  /**
   * Transcribe with Whisper (local or via onesoil API)
   */
  private async transcribeWithWhisper(
    audioBuffer: Buffer,
    language: string
  ): Promise<TranscriptionResult> {
    try {
      const form = new FormData();
      form.append('file', audioBuffer, 'audio.wav');
      form.append('language', language);
      form.append('temperature', '0.0');
      form.append('response_format', 'json');

      const response = await axios.post(this.whisperUrl, form, {
        headers: form.getHeaders(),
        timeout: 30000,
      });

      const result = response.data;

      return {
        text: result.text || '',
        confidence: result.confidence || 0.9,
        language,
        duration: audioBuffer.length / (16000 * 2), // Rough estimate for 16kHz 16-bit audio
      };
    } catch (error) {
      logger.error('Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Transcribe with Google Cloud Speech-to-Text
   */
  private async transcribeWithGoogle(
    audioBuffer: Buffer,
    language: string
  ): Promise<TranscriptionResult> {
    // Stub for Google Cloud integration
    // In production, would use @google-cloud/speech library
    logger.warn('Google Cloud STT not yet implemented, returning empty result');

    return {
      text: '',
      confidence: 0,
      language,
      duration: 0,
    };
  }

  /**
   * Check STT health
   */
  async health(): Promise<boolean> {
    try {
      await axios.get(`${this.whisperUrl.replace('/v1/audio/transcriptions', '')}/health`, {
        timeout: 5000,
      });
      return true;
    } catch {
      return false;
    }
  }
}

export default STTService;
