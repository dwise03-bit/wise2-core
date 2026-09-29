'use client';

import { ChatConnectorBase } from './ChatConnectorBase';
import { ChatMessage, ChatAlert } from '../components/LiveStudio/types/chat';
import { generateMockMessage, generateMockAlert } from '../utils/chatUtils';

/**
 * Mock chat connector for testing and development
 */
export class MockConnector extends ChatConnectorBase {
  private intervalRef: NodeJS.Timeout | null = null;
  private messageCount: number = 0;

  constructor() {
    super('mock');
  }

  async connect(): Promise<void> {
    this.setStatus('connecting');

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.setStatus('connected');
    this.messageCount = 0;

    // Start sending mock messages
    this.intervalRef = setInterval(() => {
      if (Math.random() > 0.6) {
        this.emitMessage(generateMockMessage());
        this.messageCount++;
      }

      if (Math.random() > 0.93) {
        this.emitAlert(generateMockAlert());
      }
    }, 2000);
  }

  async disconnect(): Promise<void> {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
    this.setStatus('disconnected');
    this.isConnected = false;
  }

  async sendMessage(text: string): Promise<void> {
    const message = generateMockMessage({
      message: text,
      userName: 'You',
      userType: 'broadcaster',
    });
    this.emitMessage(message);
  }
}
