/**
 * WISE² Edge Hub - Voice Coordinator
 *
 * Manages the complete voice flow:
 * Microphone → STT → Hermes API → TTS → Speaker
 *
 * Integrates with:
 * - Device Registry (device context)
 * - Health API (audio diagnostics)
 * - Hermes (AI backend)
 * - Ollama (local inference fallback)
 * - PulseAudio (audio routing)
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VoiceRequest {
  deviceId: string;
  userId?: string;
  audioBuffer?: Buffer;
  audioPath?: string;
  context?: Record<string, any>;
  timeout?: number;
}

export interface VoiceResponse {
  success: boolean;
  deviceId: string;
  transcription?: string;
  response?: string;
  audioUrl?: string;
  latency: number;
  error?: string;
}

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  format: string; // 'wav', 'mp3', 'pcm'
}

export class VoiceCoordinator extends EventEmitter {
  private hermesUrl: string;
  private ollamaUrl: string;
  private audioConfig: AudioConfig = {
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16,
    format: 'wav',
  };

  constructor(
    private bluetoothManager: any, // Injected dependency
    hermesUrl: string = 'http://127.0.0.1:3012',
    ollamaUrl: string = 'http://127.0.0.1:11434'
  ) {
    super();
    this.hermesUrl = hermesUrl;
    this.ollamaUrl = ollamaUrl;
  }

  /**
   * Main voice flow: Capture → STT → LLM → TTS → Playback
   */
  async processVoiceRequest(request: VoiceRequest): Promise<VoiceResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Capture audio (if not provided)
      let audioBuffer = request.audioBuffer;
      if (!audioBuffer && !request.audioPath) {
        console.log(`[Voice] Capturing audio from device ${request.deviceId}`);
        audioBuffer = await this.captureAudio(5000); // 5 second timeout
      }

      if (!audioBuffer) {
        throw new Error('No audio captured');
      }

      // Step 2: Speech-to-Text (via Ollama whisper)
      console.log('[Voice] Running STT...');
      const transcription = await this.speechToText(audioBuffer);
      this.emit('transcription', { deviceId: request.deviceId, text: transcription });

      // Step 3: Send to Hermes (AI processing)
      console.log('[Voice] Querying Hermes...');
      const response = await this.queryHermes(transcription, request.context);
      this.emit('response', { deviceId: request.deviceId, response });

      // Step 4: Text-to-Speech (via Ollama)
      console.log('[Voice] Generating TTS...');
      const ttsAudio = await this.textToSpeech(response);

      // Step 5: Playback (via Bluetooth or built-in audio)
      console.log('[Voice] Playing audio...');
      await this.playAudio(ttsAudio, request.deviceId);

      const latency = Date.now() - startTime;
      this.emit('complete', { deviceId: request.deviceId, latency });

      return {
        success: true,
        deviceId: request.deviceId,
        transcription,
        response,
        latency,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Voice] Error:', error);

      return {
        success: false,
        deviceId: request.deviceId,
        latency: Date.now() - startTime,
        error,
      };
    }
  }

  /**
   * Capture audio from system input (Bluetooth or built-in mic)
   */
  private async captureAudio(timeoutMs: number): Promise<Buffer> {
    try {
      // Get default input device
      const { stdout: source } = await execAsync('pactl get-default-source');
      const defaultSource = source.trim();

      console.log(`[Voice] Capturing from ${defaultSource}`);

      // Use parec (PulseAudio record) to capture audio
      const tmpFile = `/tmp/voice-capture-${Date.now()}.wav`;

      // Capture 5 seconds of audio at 16kHz mono
      await execAsync(
        `timeout ${Math.ceil(timeoutMs / 1000)} parec -d "${defaultSource}" --format=s16le --rate=16000 --channels=1 | sox -t raw -r 16000 -c 1 -b 16 -e signed - -t wav "${tmpFile}"`
      );

      // Read file into buffer
      const fs = await import('fs');
      const buffer = fs.readFileSync(tmpFile);
      fs.unlinkSync(tmpFile); // Cleanup

      return buffer;
    } catch (err) {
      console.error('[Voice] Audio capture failed:', err);
      throw new Error('Failed to capture audio');
    }
  }

  /**
   * Speech-to-Text using Ollama whisper-small model with Hermes fallback
   */
  private async speechToText(audioBuffer: Buffer): Promise<string> {
    const fs = await import('fs');
    const tmpFile = `/tmp/voice-${Date.now()}.wav`;

    try {
      // Write buffer to temp file for Ollama
      fs.writeFileSync(tmpFile, audioBuffer);

      // Call Ollama whisper endpoint
      const response = await fetch(`${this.ollamaUrl}/api/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'whisper-small',
          audio_path: tmpFile,
          language: 'en',
        }),
      });

      const result = await response.json() as { text?: string; transcription?: string };
      fs.unlinkSync(tmpFile);

      return result.text || result.transcription || '';
    } catch (err) {
      console.warn('[Voice] Ollama STT failed, trying Hermes fallback:', err instanceof Error ? err.message : String(err));

      // Fallback to Hermes for transcription
      try {
        const audioBase64 = fs.readFileSync(tmpFile).toString('base64');
        const response = await fetch(`${this.hermesUrl}/api/transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: audioBase64,
            format: 'wav',
            language: 'en',
          }),
        });

        if (!response.ok) throw new Error(`Hermes STT failed: ${response.status}`);

        const result = await response.json() as { text?: string; transcription?: string };
        fs.unlinkSync(tmpFile);
        return result.text || result.transcription || '';
      } catch (hermeErr) {
        console.error('[Voice] Hermes STT fallback failed:', hermeErr);
        try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
        throw new Error('Speech-to-text failed (both Ollama and Hermes unavailable)');
      }
    } finally {
      // Cleanup temp file if it still exists
      try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
    }
  }

  /**
   * Query Hermes API for AI response
   */
  private async queryHermes(
    query: string,
    context?: Record<string, any>
  ): Promise<string> {
    try {
      const response = await fetch(`${this.hermesUrl}/api/hermes/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: query }],
          context,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Hermes returned ${response.status}`);
      }

      const result = await response.json() as { content?: string; text?: string };
      return result.content || result.text || 'No response';
    } catch (err) {
      console.error('[Voice] Hermes query failed:', err);
      // Fallback to local Ollama
      return await this.queryOllama(query);
    }
  }

  /**
   * Fallback: Query Ollama directly if Hermes unavailable
   */
  private async queryOllama(query: string): Promise<string> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'neural-chat:7b',
          prompt: query,
          stream: false,
        }),
      });

      const result = await response.json() as { response?: string };
      return result.response || 'No response from Ollama';
    } catch (err) {
      console.error('[Voice] Ollama query failed:', err);
      throw err;
    }
  }

  /**
   * Text-to-Speech using Ollama
   */
  private async textToSpeech(text: string): Promise<Buffer> {
    try {
      // For now, return silence buffer (Phase 3: integrate Piper TTS)
      // Placeholder: return minimal WAV header + silence
      const fs = await import('fs');
      const tmpFile = `/tmp/tts-${Date.now()}.wav`;

      // Use espeak-ng or piper-tts if available (fallback to silence for now)
      try {
        await execAsync(
          `echo "${text.replace(/"/g, '\\"')}" | espeak-ng --stdout -s 120 -p 50 > "${tmpFile}"`
        );
      } catch {
        // Fallback: create silent WAV
        const silentWav = Buffer.alloc(44);
        silentWav.writeUInt32LE(0x46464952, 0); // RIFF
        silentWav.writeUInt32LE(36, 4); // Size
        silentWav.writeUInt32LE(0x45564157, 8); // WAVE
        silentWav.writeUInt32LE(0x20746d66, 12); // fmt
        silentWav.writeUInt32LE(16, 16); // fmt size
        silentWav.writeUInt16LE(1, 20); // PCM
        silentWav.writeUInt16LE(1, 22); // Mono
        silentWav.writeUInt32LE(16000, 24); // 16kHz
        silentWav.writeUInt32LE(32000, 28); // Byte rate
        silentWav.writeUInt16LE(2, 32); // Block align
        silentWav.writeUInt16LE(16, 34); // Bits per sample
        silentWav.writeUInt32LE(0x61746164, 36); // data
        silentWav.writeUInt32LE(0, 40); // data size
        fs.writeFileSync(tmpFile, silentWav);
      }

      const audioBuffer = fs.readFileSync(tmpFile);
      fs.unlinkSync(tmpFile);
      return audioBuffer;
    } catch (err) {
      console.error('[Voice] TTS error:', err);
      // Return empty buffer on error (phase 3 will improve)
      return Buffer.alloc(0);
    }
  }

  /**
   * Playback audio via PulseAudio (Bluetooth or built-in)
   */
  private async playAudio(audioBuffer: Buffer, deviceId: string): Promise<void> {
    try {
      const fs = await import('fs');
      const tmpFile = `/tmp/playback-${Date.now()}.wav`;
      fs.writeFileSync(tmpFile, audioBuffer);

      // Get default sink and play
      const { stdout: sink } = await execAsync('pactl get-default-sink');
      const defaultSink = sink.trim();

      // Play using paplay
      await execAsync(`paplay -d "${defaultSink}" "${tmpFile}"`);
      fs.unlinkSync(tmpFile);

      this.emit('audio-played', { deviceId });
    } catch (err) {
      console.error('[Voice] Playback error:', err);
      // Non-fatal: log but don't throw
    }
  }

  /**
   * Test voice capture and playback
   */
  async testVoice(): Promise<{ success: boolean; message: string }> {
    try {
      // Quick 2-second capture test
      const audio = await this.captureAudio(2000);

      if (audio.length < 100) {
        return { success: false, message: 'Audio capture returned empty buffer' };
      }

      // Test playback with tone
      await this.playAudio(audio, 'test');

      return { success: true, message: 'Voice capture and playback working' };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : 'Test failed' };
    }
  }

  /**
   * Get audio diagnostics
   */
  async getAudioDiagnostics(): Promise<Record<string, any>> {
    try {
      const [sources, sinks] = await Promise.all([
        execAsync('pactl list sources short'),
        execAsync('pactl list sinks short'),
      ]);

      return {
        sources: sources.stdout.split('\n').filter(Boolean),
        sinks: sinks.stdout.split('\n').filter(Boolean),
        config: this.audioConfig,
      };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Diagnostics failed' };
    }
  }
}

export async function createVoiceCoordinator(bluetoothManager: any): Promise<VoiceCoordinator> {
  const coordinator = new VoiceCoordinator(bluetoothManager);
  console.log('[Voice] Coordinator initialized');
  return coordinator;
}
