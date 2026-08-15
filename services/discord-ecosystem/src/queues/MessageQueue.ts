/**
 * WISE² Discord Ecosystem - Message Queue
 * Offline-resilient message queue with persistence and retry logic
 */

import fs from 'fs';
import path from 'path';
import { QueuedMessage } from '../types';
import Logger from '../utils/Logger';

export class MessageQueue {
  private queue: QueuedMessage[] = [];
  private processing = false;
  private queueFile: string;
  private maxRetries = 3;
  private retryDelays = [5000, 15000, 60000]; // exponential backoff

  constructor(queueDir: string = './queue') {
    this.queueFile = path.join(queueDir, 'messages.json');
    this.ensureQueueDirectory(queueDir);
    this.loadPersistentQueue();
  }

  private ensureQueueDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadPersistentQueue(): void {
    try {
      if (fs.existsSync(this.queueFile)) {
        const data = fs.readFileSync(this.queueFile, 'utf-8');
        this.queue = JSON.parse(data);
        Logger.info('MessageQueue', 'Init', `Loaded ${this.queue.length} persisted messages`);
      }
    } catch (err) {
      Logger.error('MessageQueue', 'Init', 'Failed to load persistent queue', err as Error);
      this.queue = [];
    }
  }

  private savePersistentQueue(): void {
    try {
      fs.writeFileSync(this.queueFile, JSON.stringify(this.queue, null, 2));
    } catch (err) {
      Logger.error('MessageQueue', 'Persist', 'Failed to save queue', err as Error);
    }
  }

  public enqueue(message: Omit<QueuedMessage, 'timestamp' | 'retries' | 'maxRetries'>): void {
    const queuedMessage: QueuedMessage = {
      ...message,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: this.maxRetries,
    };

    this.queue.push(queuedMessage);
    this.savePersistentQueue();

    Logger.debug('MessageQueue', 'Enqueue', `Message queued for ${message.channelId}`, {
      queueSize: this.queue.length,
    });
  }

  public async processQueue(
    sendFunction: (msg: QueuedMessage) => Promise<boolean>
  ): Promise<void> {
    if (this.processing) return;

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const message = this.queue[0];

        try {
          const success = await sendFunction(message);

          if (success) {
            this.queue.shift();
            this.savePersistentQueue();
            Logger.info('MessageQueue', 'Process', 'Message sent successfully', {
              channelId: message.channelId,
            });
          } else {
            // Retry logic
            if (message.retries < message.maxRetries) {
              message.retries++;
              const delay = this.retryDelays[Math.min(message.retries - 1, 2)];

              Logger.warn('MessageQueue', 'Process', `Retrying message (attempt ${message.retries})`, {
                channelId: message.channelId,
                delay,
              });

              await this.sleep(delay);
            } else {
              // Max retries exceeded
              this.queue.shift();
              this.savePersistentQueue();

              Logger.error('MessageQueue', 'Process', `Message failed after ${message.maxRetries} retries`, undefined, {
                channelId: message.channelId,
              });
            }
          }
        } catch (err) {
          Logger.error('MessageQueue', 'Process', 'Error processing message', err as Error, {
            channelId: message.channelId,
          });

          // Retry on error
          if (message.retries < message.maxRetries) {
            message.retries++;
            const delay = this.retryDelays[Math.min(message.retries - 1, 2)];
            await this.sleep(delay);
          } else {
            this.queue.shift();
            this.savePersistentQueue();
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  public async processQueuePeriodically(
    sendFunction: (msg: QueuedMessage) => Promise<boolean>,
    intervalMs: number = 10000
  ): Promise<NodeJS.Timer> {
    return setInterval(async () => {
      if (this.queue.length > 0) {
        await this.processQueue(sendFunction);
      }
    }, intervalMs);
  }

  public getQueueSize(): number {
    return this.queue.length;
  }

  public getQueue(): QueuedMessage[] {
    return [...this.queue];
  }

  public clearQueue(): void {
    this.queue = [];
    this.savePersistentQueue();
    Logger.info('MessageQueue', 'Clear', 'Queue cleared');
  }

  public removeMessage(index: number): boolean {
    if (index >= 0 && index < this.queue.length) {
      this.queue.splice(index, 1);
      this.savePersistentQueue();
      return true;
    }
    return false;
  }

  public getStats(): {
    size: number;
    oldestMessage?: number;
    averageRetries: number;
  } {
    if (this.queue.length === 0) {
      return { size: 0, averageRetries: 0 };
    }

    const avgRetries = this.queue.reduce((sum, msg) => sum + msg.retries, 0) / this.queue.length;

    return {
      size: this.queue.length,
      oldestMessage: this.queue[0].timestamp,
      averageRetries: avgRetries,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MessageQueue;
