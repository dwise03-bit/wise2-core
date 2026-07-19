import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ChatService, ChatMessage } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  async sendMessage(
    @Body()
    body: {
      roomId: string;
      username: string;
      message: string;
      avatar?: string;
    }
  ): Promise<ChatMessage> {
    return this.chatService.sendMessage(
      body.roomId,
      body.username,
      body.message,
      body.avatar
    );
  }

  @Get('messages/:roomId')
  async getMessages(
    @Param('roomId') roomId: string,
    @Query('limit') limit = '50'
  ): Promise<ChatMessage[]> {
    return this.chatService.getMessages(roomId, parseInt(limit));
  }

  @Get('count/:roomId')
  async getMessageCount(@Param('roomId') roomId: string): Promise<{
    count: number;
  }> {
    return {
      count: this.chatService.getMessageCount(roomId),
    };
  }

  @Post('clear/:roomId')
  async clearMessages(@Param('roomId') roomId: string): Promise<{
    success: boolean;
  }> {
    await this.chatService.clearMessages(roomId);
    return { success: true };
  }
}
