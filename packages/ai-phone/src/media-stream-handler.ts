import { WebSocket } from 'ws';

export interface MediaStreamConfig {
  sessionId: string;
  callId: string;
  sampleRate: number; // 8000, 16000, etc.
  encoding: 'ulaw' | 'linear16';
}

export class MediaStreamHandler {
  private ws: WebSocket | null = null;
  private config: MediaStreamConfig;
  private audioBuffer: Buffer[] = [];
  private isConnected = false;

  constructor(config: MediaStreamConfig) {
    this.config = config;
  }

  async connect(wsUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', () => {
          this.isConnected = true;
          console.log(`📡 Media stream connected for session ${this.config.sessionId}`);
          resolve();
        });

        this.ws.on('message', (data) => {
          this.handleMediaData(data);
        });

        this.ws.on('error', (error) => {
          console.error(`Media stream error: ${error.message}`);
          reject(error);
        });

        this.ws.on('close', () => {
          this.isConnected = false;
          console.log(
            `📡 Media stream disconnected for session ${this.config.sessionId}`
          );
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  sendAudio(audioData: Buffer): void {
    if (!this.isConnected || !this.ws) {
      console.warn('Media stream not connected');
      return;
    }

    try {
      // Send audio in the configured encoding
      const message = {
        type: 'audio',
        sessionId: this.config.sessionId,
        data: audioData.toString('base64'),
        encoding: this.config.encoding,
        sampleRate: this.config.sampleRate,
      };

      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`Error sending audio: ${error}`);
    }
  }

  private handleMediaData(data: any): void {
    try {
      const message =
        typeof data === 'string' ? JSON.parse(data) : data;

      if (message.type === 'audio') {
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(message.data, 'base64');
        this.audioBuffer.push(audioBuffer);

        // Emit audio event for processing
        console.log(
          `📨 Received ${audioBuffer.length} bytes of audio from ${message.sessionId}`
        );
      } else if (message.type === 'event') {
        // Handle media events (e.g., silence detection)
        console.log(
          `📢 Media event: ${message.event} (${message.duration}ms)`
        );
      }
    } catch (error) {
      console.error(`Error handling media data: ${error}`);
    }
  }

  getAudioBuffer(): Buffer {
    if (this.audioBuffer.length === 0) {
      return Buffer.alloc(0);
    }

    return Buffer.concat(this.audioBuffer);
  }

  clearAudioBuffer(): void {
    this.audioBuffer = [];
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  isActive(): boolean {
    return this.isConnected;
  }
}
