import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  avatar?: string;
  isHighlighted?: boolean;
}

@Injectable()
export class ChatService {
  private messages: Map<string, ChatMessage[]> = new Map();

  constructor(private prisma: PrismaService) {}

  async sendMessage(
    roomId: string,
    username: string,
    message: string,
    avatar = '👤'
  ): Promise<ChatMessage> {
    if (!this.messages.has(roomId)) {
      this.messages.set(roomId, []);
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      username,
      message,
      timestamp: new Date(),
      avatar,
    };

    this.messages.get(roomId)!.push(newMessage);

    // Keep only last 100 messages
    const roomMessages = this.messages.get(roomId)!;
    if (roomMessages.length > 100) {
      roomMessages.shift();
    }

    return newMessage;
  }

  async getMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const messages = this.messages.get(roomId) || [];
    return messages.slice(-limit);
  }

  async clearMessages(roomId: string): Promise<void> {
    this.messages.delete(roomId);
  }

  getMessageCount(roomId: string): number {
    return (this.messages.get(roomId) || []).length;
  }
}
