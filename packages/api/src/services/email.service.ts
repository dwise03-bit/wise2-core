import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendVerificationEmail(email: string, token: string) {
    return { success: true, messageId: 'msg_123' };
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    return { success: true, messageId: 'msg_456' };
  }

  async sendNotification(email: string, subject: string, body: string) {
    return { success: true };
  }
}
