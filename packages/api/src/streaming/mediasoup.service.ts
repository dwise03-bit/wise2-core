import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import * as mediasoup from 'mediasoup'; // Disabled - mediasoup requires native bindings

@Injectable()
export class MediasoupService implements OnModuleInit {
  private readonly logger = new Logger(MediasoupService.name);
  private worker: any | null = null;
  private routers: Map<string, any> = new Map();
  private producers: Map<string, any> = new Map();
  private consumers: Map<string, any> = new Map();
  private transports: Map<string, any> = new Map();

  async onModuleInit() {
    await this.initializeWorker();
  }

  /**
   * Initialize Mediasoup worker with optimized settings
   */
  private async initializeWorker() {
    try {
      this.worker = await mediasoup.createWorker({
        logLevel: 'warn',
        logTags: ['rtp', 'rtcp', 'srtp', 'bwe'],
        rtcMinPort: 40000,
        rtcMaxPort: 49999,
        numWorkerThreads: 4,
      });

      this.logger.log('Mediasoup worker initialized');

      this.worker.on('died', () => {
        this.logger.error('Mediasoup worker died, restarting...');
        this.worker = null;
        setTimeout(() => this.initializeWorker(), 5000);
      });
    } catch (error) {
      this.logger.error(`Failed to initialize Mediasoup worker: ${error}`);
      throw error;
    }
  }

  /**
   * Create router for job stream session
   */
  async createRouter(jobId: string): Promise<any> {
    if (!this.worker) {
      throw new Error('Mediasoup worker not initialized');
    }

    if (this.routers.has(jobId)) {
      return this.routers.get(jobId)!;
    }

    const mediaCodecs: any[] = [
      {
        kind: 'video',
        mimeType: 'video/VP9',
        clockRate: 90000,
        parameters: {
          'profile-id': 2,
        },
      },
      {
        kind: 'video',
        mimeType: 'video/H264',
        clockRate: 90000,
        parameters: {
          'profile-level-id': '42e01f',
        },
      },
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
    ];

    try {
      const router = await this.worker.createRouter({ mediaCodecs });
      this.routers.set(jobId, router);

      router.on('die', () => {
        this.logger.warn(`Router for job ${jobId} died`);
        this.routers.delete(jobId);
      });

      this.logger.log(`Created router for job ${jobId}`);
      return router;
    } catch (error) {
      this.logger.error(`Failed to create router for job ${jobId}: ${error}`);
      throw error;
    }
  }

  /**
   * Create WebRTC transport for consumer
   */
  async createWebRtcTransport(
    jobId: string,
    supervisorId: string
  ): Promise<any> {
    const router = this.routers.get(jobId);
    if (!router) {
      throw new Error(`Router not found for job ${jobId}`);
    }

    try {
      const transport = await router.createWebRtcTransport({
        listenIps: [
          {
            ip: '0.0.0.0',
            announcedIp: process.env.RTC_ANNOUNCED_IP || '127.0.0.1',
          },
        ],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        initialAvailableOutgoingBitrate: 1000000,
      });

      transport.on('dtlsstatechange', (dtlsState) => {
        if (dtlsState === 'failed') {
          this.logger.warn(`DTLS failed for supervisor ${supervisorId}`);
          transport.close();
        }
      });

      return transport;
    } catch (error) {
      this.logger.error(`Failed to create WebRTC transport: ${error}`);
      throw error;
    }
  }

  /**
   * Create consumer for supervisor viewer
   */
  async createConsumer(
    jobId: string,
    supervisorId: string,
    transport: any,
    producerId: string
  ): Promise<any> {
    const router = this.routers.get(jobId);
    if (!router) {
      throw new Error(`Router not found for job ${jobId}`);
    }

    try {
      const consumer = await router.consume({
        producerId,
        rtpCapabilities: {
          codecs: [
            {
              kind: 'video',
              mimeType: 'video/VP9',
              clockRate: 90000,
            },
            {
              kind: 'audio',
              mimeType: 'audio/opus',
              clockRate: 48000,
              channels: 2,
            },
          ],
        },
        paused: false,
      });

      this.consumers.set(`${supervisorId}:${jobId}`, consumer);

      consumer.on('transportclose', () => {
        this.logger.log(`Consumer for supervisor ${supervisorId} closed`);
        this.consumers.delete(`${supervisorId}:${jobId}`);
      });

      return consumer;
    } catch (error) {
      this.logger.error(
        `Failed to create consumer for supervisor ${supervisorId}: ${error}`
      );
      throw error;
    }
  }

  /**
   * Create producer for technician stream
   */
  async createProducer(
    jobId: string,
    transport: any,
    kind: 'video' | 'audio'
  ): Promise<any> {
    try {
      const producer = await transport.produce({
        kind,
        rtpParameters: {
          codecs: [
            kind === 'video'
              ? {
                  mimeType: 'video/VP9',
                  clockRate: 90000,
                  parameters: {},
                }
              : {
                  mimeType: 'audio/opus',
                  clockRate: 48000,
                  channels: 2,
                  parameters: {},
                },
          ],
          encodings: [
            kind === 'video'
              ? { ssrc: Math.floor(Math.random() * 10000000) }
              : undefined,
          ].filter(Boolean) as any[],
        },
      });

      this.producers.set(`${jobId}:${kind}`, producer);

      producer.on('transportclose', () => {
        this.logger.log(`Producer for job ${jobId} (${kind}) closed`);
        this.producers.delete(`${jobId}:${kind}`);
      });

      return producer;
    } catch (error) {
      this.logger.error(`Failed to create producer: ${error}`);
      throw error;
    }
  }

  /**
   * Get stream statistics
   */
  async getStreamStats(jobId: string): Promise<StreamStats> {
    const videoProducer = this.producers.get(`${jobId}:video`);
    if (!videoProducer) {
      throw new Error(`Video producer not found for job ${jobId}`);
    }

    try {
      const stats = await videoProducer.getStats();

      return {
        videoBitrate: stats[0]?.bitrate || 0,
        framesPerSecond: stats[0]?.framesPerSecond || 0,
        resolution:
          stats[0]?.width && stats[0]?.height
            ? `${stats[0].width}x${stats[0].height}`
            : '0x0',
        roundTripTime: stats[0]?.roundTripTime || 0,
        jitter: stats[0]?.jitter || 0,
        packetsLost: stats[0]?.packetsLost || 0,
      };
    } catch (error) {
      this.logger.error(`Failed to get stream stats: ${error}`);
      return {
        videoBitrate: 0,
        framesPerSecond: 0,
        resolution: '0x0',
        roundTripTime: 0,
        jitter: 0,
        packetsLost: 0,
      };
    }
  }

  /**
   * Close stream session
   */
  async closeStream(jobId: string) {
    const router = this.routers.get(jobId);
    if (router) {
      try {
        await router.close();
        this.routers.delete(jobId);
        this.logger.log(`Closed router for job ${jobId}`);
      } catch (error) {
        this.logger.error(`Failed to close router: ${error}`);
      }
    }

    // Clean up producers and consumers
    this.producers.forEach((_, key) => {
      if (key.startsWith(`${jobId}:`)) {
        this.producers.delete(key);
      }
    });

    this.consumers.forEach((_, key) => {
      if (key.endsWith(`:${jobId}`)) {
        this.consumers.delete(key);
      }
    });
  }

  /**
   * Get active router count
   */
  getActiveRouterCount(): number {
    return this.routers.size;
  }

  /**
   * Get active consumer count
   */
  getActiveConsumerCount(): number {
    return this.consumers.size;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    if (!this.worker) {
      return {
        healthy: false,
        message: 'Mediasoup worker not initialized',
      };
    }

    try {
      const resourceUsage = await this.worker.getResourceUsage();
      return {
        healthy: true,
        message: `Worker active with ${this.routers.size} routers`,
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Worker health check failed: ${error}`,
      };
    }
  }
}

export interface StreamStats {
  videoBitrate: number;
  framesPerSecond: number;
  resolution: string;
  roundTripTime: number;
  jitter: number;
  packetsLost: number;
}
