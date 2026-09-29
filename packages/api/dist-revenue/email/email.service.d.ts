import { ConfigService } from '@nestjs/config';
type EmailProvider = 'resend' | 'sendgrid' | 'mock';
export declare class EmailService {
    private configService;
    private readonly logger;
    private provider;
    constructor(configService: ConfigService);
    /**
     * Automatically select email provider based on available credentials
     */
    private selectProvider;
    /**
     * Send password reset email
     */
    sendPasswordReset(email: string, resetToken: string, userName?: string): Promise<boolean>;
    /**
     * Send email verification email
     */
    sendVerificationEmail(email: string, verificationToken: string, userName?: string): Promise<boolean>;
    /**
     * Send welcome email
     */
    sendWelcome(email: string, userName: string): Promise<boolean>;
    /**
     * Send invoice email
     */
    sendInvoice(email: string, invoiceId: string, amount: number, dueDate?: string): Promise<boolean>;
    /**
     * Send notification email
     */
    sendNotification(email: string, title: string, message: string, actionUrl?: string, actionText?: string): Promise<boolean>;
    /**
     * Generic email send method
     */
    private send;
    /**
     * Send via Resend
     */
    private sendViaResend;
    /**
     * Send via SendGrid
     */
    private sendViaSendGrid;
    /**
     * Mock email provider (for development)
     */
    private sendViaMock;
    /**
     * Check if email service is properly configured
     */
    getStatus(): {
        provider: EmailProvider;
        configured: boolean;
    };
}
export {};
//# sourceMappingURL=email.service.d.ts.map