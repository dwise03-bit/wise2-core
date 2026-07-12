import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

type EmailProvider = 'resend' | 'sendgrid' | 'mock'

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');
  private provider: EmailProvider;

  constructor(private configService: ConfigService) {
    this.provider = this.selectProvider();
    this.logger.log(`📧 Email Service initialized with provider: ${this.provider}`);
  }

  /**
   * Automatically select email provider based on available credentials
   */
  private selectProvider(): EmailProvider {
    if (this.configService.get('RESEND_API_KEY')) {
      return 'resend';
    }
    if (this.configService.get('SENDGRID_API_KEY')) {
      return 'sendgrid';
    }
    this.logger.warn('⚠️  No email provider configured. Using mock provider (emails not sent)');
    return 'mock';
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetToken: string, userName: string = 'User'): Promise<boolean> {
    const resetUrl = `${this.configService.get('APP_URL', 'http://localhost:3000')}/reset-password?token=${resetToken}`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>Hi ${userName},</p>
      <p>We received a request to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>Best regards,<br>WISE² Team</p>
    `;

    return this.send({
      to: email,
      subject: 'Password Reset Request',
      html,
      text: `Click here to reset your password: ${resetUrl}`,
    });
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, verificationToken: string, userName: string = 'User'): Promise<boolean> {
    const verifyUrl = `${this.configService.get('APP_URL', 'http://localhost:3000')}/verify-email?token=${verificationToken}`;

    const html = `
      <h1>Verify Your Email Address</h1>
      <p>Hi ${userName},</p>
      <p>Welcome to WISE²! Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't create this account, you can safely ignore this email.</p>
      <p>Best regards,<br>WISE² Team</p>
    `;

    return this.send({
      to: email,
      subject: 'Verify Your Email Address',
      html,
      text: `Click here to verify your email: ${verifyUrl}`,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcome(email: string, userName: string): Promise<boolean> {
    const dashboardUrl = `${this.configService.get('APP_URL', 'http://localhost:3000')}/dashboard`;

    const html = `
      <h1>Welcome to WISE² Enterprise!</h1>
      <p>Hi ${userName},</p>
      <p>Your account has been successfully created. You're now ready to explore WISE² and unlock the power of AI-driven business automation.</p>
      <h2>What's Next?</h2>
      <ul>
        <li><a href="${dashboardUrl}">Go to Your Dashboard</a></li>
        <li>Complete your profile</li>
        <li>Create your first project</li>
        <li>Explore AI features</li>
      </ul>
      <p>Questions? Check our <a href="https://docs.wise2.net">documentation</a> or contact our support team.</p>
      <p>Best regards,<br>WISE² Team</p>
    `;

    return this.send({
      to: email,
      subject: 'Welcome to WISE² Enterprise',
      html,
      text: `Welcome to WISE²! Visit ${dashboardUrl} to get started.`,
    });
  }

  /**
   * Send invoice email
   */
  async sendInvoice(email: string, invoiceId: string, amount: number, dueDate?: string): Promise<boolean> {
    const invoiceUrl = `${this.configService.get('APP_URL', 'http://localhost:3000')}/invoices/${invoiceId}`;
    const dueDateText = dueDate ? `<p>Due Date: ${dueDate}</p>` : '';

    const html = `
      <h1>Invoice #${invoiceId}</h1>
      <p>Thank you for your business!</p>
      <p>Amount: $${(amount / 100).toFixed(2)}</p>
      ${dueDateText}
      <p><a href="${invoiceUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Invoice</a></p>
      <p>Best regards,<br>WISE² Billing Team</p>
    `;

    return this.send({
      to: email,
      subject: `Invoice #${invoiceId}`,
      html,
      text: `Invoice #${invoiceId} for $${(amount / 100).toFixed(2)}`,
    });
  }

  /**
   * Send notification email
   */
  async sendNotification(email: string, title: string, message: string, actionUrl?: string, actionText: string = 'View Details'): Promise<boolean> {
    const actionButton = actionUrl
      ? `<p><a href="${actionUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${actionText}</a></p>`
      : '';

    const html = `
      <h1>${title}</h1>
      <p>${message}</p>
      ${actionButton}
      <p>Best regards,<br>WISE² Team</p>
    `;

    return this.send({
      to: email,
      subject: title,
      html,
      text: message,
    });
  }

  /**
   * Generic email send method
   */
  private async send(options: EmailOptions): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'resend':
          return await this.sendViaResend(options);
        case 'sendgrid':
          return await this.sendViaSendGrid(options);
        case 'mock':
          return await this.sendViaMock(options);
        default:
          this.logger.error(`Unknown email provider: ${this.provider}`);
          return false;
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Send via Resend
   */
  private async sendViaResend(options: EmailOptions): Promise<boolean> {
    try {
      const apiKey = this.configService.get('RESEND_API_KEY');
      if (!apiKey) {
        throw new Error('RESEND_API_KEY not configured');
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: this.configService.get('EMAIL_FROM', 'noreply@wise2.net'),
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
          replyTo: options.replyTo,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as any;
        throw new Error(`Resend API error: ${error?.message || 'Unknown error'}`);
      }

      this.logger.log(`✉️  Email sent to ${options.to} via Resend`);
      return true;
    } catch (error) {
      this.logger.error(`Resend error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(options: EmailOptions): Promise<boolean> {
    try {
      const apiKey = this.configService.get('SENDGRID_API_KEY');
      if (!apiKey) {
        throw new Error('SENDGRID_API_KEY not configured');
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.to }] }],
          from: { email: this.configService.get('EMAIL_FROM', 'noreply@wise2.net') },
          subject: options.subject,
          content: [
            {
              type: 'text/html',
              value: options.html,
            },
            {
              type: 'text/plain',
              value: options.text || options.html,
            },
          ],
          replyTo: options.replyTo ? { email: options.replyTo } : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`SendGrid API error: ${error}`);
      }

      this.logger.log(`✉️  Email sent to ${options.to} via SendGrid`);
      return true;
    } catch (error) {
      this.logger.error(`SendGrid error: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Mock email provider (for development)
   */
  private async sendViaMock(options: EmailOptions): Promise<boolean> {
    this.logger.warn(`📧 [MOCK] Email to ${options.to}:`);
    this.logger.warn(`📧 [MOCK] Subject: ${options.subject}`);
    this.logger.warn(`📧 [MOCK] (Content not shown in logs)`);
    return true;
  }

  /**
   * Check if email service is properly configured
   */
  getStatus(): {
    provider: EmailProvider
    configured: boolean
  } {
    return {
      provider: this.provider,
      configured: this.provider !== 'mock',
    };
  }
}
