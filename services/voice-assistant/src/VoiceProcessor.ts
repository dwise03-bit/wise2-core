/**
 * Voice Processor
 * Central audio pipeline for speech processing
 */

import { EventEmitter } from 'events';
import { STT } from './STT';
import { TTS } from './TTS';
import { WakeWord } from './WakeWord';
import { LanguageDetection } from './LanguageDetection';

export interface AudioFrame {
  data: Float32Array;
  sampleRate: number;
  timestamp: number;
}

export interface ProcessedResult {
  originalAudio: AudioFrame;
  transcript: string;
  language: string;
  confidence: number;
  intent: string;
  entities: Record<string, any>;
  response: string;
  audioResponse: AudioFrame;
}

export interface VoiceConfig {
  sampleRate: number;
  channels: number;
  encoding: 'LINEAR16' | 'MP3' | 'OPUS';
  enableWakeWord: boolean;
  wakeWords: string[];
  enableLanguageDetection: boolean;
  defaultLanguage: string;
  maxAudioDuration: number;
}

export class VoiceProcessor extends EventEmitter {
  private config: VoiceConfig;
  private stt: STT;
  private tts: TTS;
  private wakeWord: WakeWord;
  private languageDetection: LanguageDetection;
  private audioBuffer: Float32Array[] = [];
  private isListening: boolean = false;
  private currentLanguage: string;

  constructor(config: VoiceConfig) {
    super();
    this.config = config;
    this.currentLanguage = config.defaultLanguage;

    // Initialize sub-processors
    this.stt = new STT({
      sampleRate: config.sampleRate,
      language: config.defaultLanguage,
    });

    this.tts = new TTS({
      sampleRate: config.sampleRate,
      language: config.defaultLanguage,
    });

    this.wakeWord = new WakeWord({
      wakeWords: config.wakeWords,
    });

    this.languageDetection = new LanguageDetection();
  }

  /**
   * Process audio stream
   */
  async processAudioStream(
    audioStream: NodeJS.ReadableStream
  ): Promise<ProcessedResult> {
    return new Promise((resolve, reject) => {
      const chunks: Float32Array[] = [];
      const startTime = Date.now();

      audioStream.on('data', async (chunk: Buffer) => {
        try {
          const float32 = this.convertBufferToFloat32(chunk);
          chunks.push(float32);

          // Check for wake word
          if (this.config.enableWakeWord && !this.isListening) {
            const wakeWordDetected = await this.wakeWord.detect(float32);
            if (wakeWordDetected) {
              this.isListening = true;
              this.emit('wake-word-detected', { wakeWord: wakeWordDetected });
            }
          }

          // Check audio duration limit
          const duration = Date.now() - startTime;
          if (duration > this.config.maxAudioDuration) {
            audioStream.pause();
            this.emit('audio-timeout', { duration });
          }
        } catch (error) {
          this.emit('audio-error', { error });
        }
      });

      audioStream.on('end', async () => {
        try {
          const result = await this.processAudioBuffer(chunks);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      audioStream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Process audio buffer
   */
  async processAudioBuffer(audioFrames: Float32Array[]): Promise<ProcessedResult> {
    // Combine audio frames
    const combinedAudio = this.combineAudioFrames(audioFrames);

    // Detect language
    let language = this.currentLanguage;
    if (this.config.enableLanguageDetection) {
      language = await this.languageDetection.detect(combinedAudio);
      this.currentLanguage = language;
    }

    // Speech to text
    const { transcript, confidence } = await this.stt.transcribe(
      combinedAudio,
      language
    );

    // Parse intent and entities (simplified)
    const { intent, entities } = this.parseIntentAndEntities(transcript);

    // Generate response (placeholder)
    const response = await this.generateResponse(intent, entities);

    // Text to speech
    const audioResponse = await this.tts.synthesize(response, language);

    return {
      originalAudio: {
        data: combinedAudio,
        sampleRate: this.config.sampleRate,
        timestamp: Date.now(),
      },
      transcript,
      language,
      confidence,
      intent,
      entities,
      response,
      audioResponse: {
        data: audioResponse,
        sampleRate: this.config.sampleRate,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Start listening
   */
  async startListening(): Promise<void> {
    this.isListening = true;
    this.audioBuffer = [];
    this.emit('listening-started');
  }

  /**
   * Stop listening
   */
  async stopListening(): Promise<void> {
    this.isListening = false;
    this.emit('listening-stopped');
  }

  /**
   * Get current language
   */
  getLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Set language
   */
  setLanguage(language: string): void {
    this.currentLanguage = language;
    this.stt.setLanguage(language);
    this.tts.setLanguage(language);
  }

  /**
   * Add wake word
   */
  async addWakeWord(wakeWord: string): Promise<void> {
    this.config.wakeWords.push(wakeWord);
    await this.wakeWord.addWakeWord(wakeWord);
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return this.stt.getSupportedLanguages();
  }

  /**
   * Private helper: Convert Buffer to Float32Array
   */
  private convertBufferToFloat32(buffer: Buffer): Float32Array {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const output = new Float32Array(buffer.length / 2);

    for (let i = 0, offset = 0; i < output.length; i++, offset += 2) {
      // Convert 16-bit PCM to float32
      const s = view.getInt16(offset, true);
      output[i] = s < 0 ? s / 0x8000 : s / 0x7fff;
    }

    return output;
  }

  /**
   * Private helper: Combine audio frames
   */
  private combineAudioFrames(frames: Float32Array[]): Float32Array {
    const totalLength = frames.reduce((sum, frame) => sum + frame.length, 0);
    const combined = new Float32Array(totalLength);

    let offset = 0;
    for (const frame of frames) {
      combined.set(frame, offset);
      offset += frame.length;
    }

    return combined;
  }

  /**
   * Private helper: Parse intent and entities
   */
  private parseIntentAndEntities(transcript: string): {
    intent: string;
    entities: Record<string, any>;
  } {
    // Simplified intent/entity extraction
    // In production, this would use NLU model
    const lowerTranscript = transcript.toLowerCase();

    let intent = 'unknown';
    const entities: Record<string, any> = {};

    if (lowerTranscript.includes('weather')) {
      intent = 'get_weather';
      const match = lowerTranscript.match(/in (\w+)/);
      if (match) {
        entities.location = match[1];
      }
    } else if (lowerTranscript.includes('time')) {
      intent = 'get_time';
    } else if (lowerTranscript.includes('note') || lowerTranscript.includes('remember')) {
      intent = 'create_note';
      entities.content = transcript;
    }

    return { intent, entities };
  }

  /**
   * Private helper: Generate response
   */
  private async generateResponse(
    intent: string,
    entities: Record<string, any>
  ): Promise<string> {
    // Placeholder response generation
    // In production, this would call an LLM or response template engine
    const responses: Record<string, string> = {
      get_weather: `The weather in ${entities.location || 'your location'} is sunny and 72 degrees.`,
      get_time: `The current time is ${new Date().toLocaleTimeString()}.`,
      create_note: 'Note created successfully.',
      unknown: 'I did not understand that. Could you please repeat?',
    };

    return responses[intent] || responses.unknown;
  }
}

export default VoiceProcessor;
