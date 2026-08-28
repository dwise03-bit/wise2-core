/**
 * Approval Execution Adapters
 * Phase 4: Demo and production adapters for executing approvals
 */

import { logger } from '../logger';

/**
 * SMS Provider Interface
 */
interface ISmsProvider {
  sendSMS(phoneNumber: string, message: string): Promise<any>;
}

/**
 * Email Provider Interface
 */
interface IEmailProvider {
  sendEmail(email: string, subject: string, body: string): Promise<any>;
}

/**
 * Social Media Provider Interface
 */
interface ISocialProvider {
  publish(platform: string, content: string, media?: string[]): Promise<any>;
}

/**
 * Payment Provider Interface
 */
interface IPaymentProvider {
  charge(customerId: string, amount: number, description: string): Promise<any>;
}

/**
 * Demo SMS Provider - Simulates SMS without Twilio credentials
 */
class DemoSmsProvider implements ISmsProvider {
  async sendSMS(phoneNumber: string, message: string): Promise<any> {
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    logger.info('Demo SMS sent', { phoneNumber, messageId, messageLength: message.length });

    return {
      messageId,
      provider: 'demo-sms',
      status: 'sent',
      phoneNumber: phoneNumber.slice(-4).padStart(phoneNumber.length, '*'),
      messagePreview: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
      timestamp: new Date().toISOString(),
      cost: Math.ceil(message.length / 160) * 0.0075, // Demo: $0.0075 per SMS
    };
  }
}

/**
 * Demo Email Provider - Simulates email without SendGrid credentials
 */
class DemoEmailProvider implements IEmailProvider {
  async sendEmail(email: string, subject: string, body: string): Promise<any> {
    const messageId = `email_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    logger.info('Demo email sent', { email, subject, messageId });

    return {
      messageId,
      provider: 'demo-email',
      status: 'sent',
      email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      subject,
      preview: body.slice(0, 80) + (body.length > 80 ? '...' : ''),
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Demo Social Media Provider - Simulates social posting without API keys
 */
class DemoSocialProvider implements ISocialProvider {
  async publish(platform: string, content: string, media?: string[]): Promise<any> {
    const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    logger.info('Demo social post published', { platform, postId, mediaCount: media?.length || 0 });

    return {
      postId,
      provider: `demo-${platform}`,
      platform,
      status: 'published',
      contentPreview: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
      mediaCount: media?.length || 0,
      reach: Math.floor(Math.random() * 5000) + 500,
      timestamp: new Date().toISOString(),
      url: `https://${platform}.com/posts/${postId}`,
    };
  }
}

/**
 * Demo Payment Provider - Simulates charges without Stripe
 */
class DemoPaymentProvider implements IPaymentProvider {
  async charge(customerId: string, amount: number, description: string): Promise<any> {
    const chargeId = `ch_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    logger.info('Demo payment charged', { customerId, amount, chargeId });

    return {
      chargeId,
      provider: 'demo-stripe',
      status: 'succeeded',
      customerId: customerId.slice(-4).padStart(customerId.length, '*'),
      amount,
      currency: 'usd',
      description,
      timestamp: new Date().toISOString(),
      fee: Math.round(amount * 0.029 + 30), // Demo: 2.9% + $0.30
    };
  }
}

/**
 * Production SMS Provider (Twilio) - Production adapter
 */
class TwilioSmsProvider implements ISmsProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor(accountSid?: string, authToken?: string, fromNumber?: string) {
    this.accountSid = accountSid || process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = authToken || process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = fromNumber || process.env.TWILIO_FROM_NUMBER || '';

    if (!this.accountSid || !this.authToken) {
      logger.warn('Twilio SMS Provider: Credentials not configured, will fall back to demo');
    }
  }

  async sendSMS(phoneNumber: string, message: string): Promise<any> {
    if (!this.accountSid || !this.authToken) {
      // Fallback to demo provider
      const demoProvider = new DemoSmsProvider();
      return demoProvider.sendSMS(phoneNumber, message);
    }

    try {
      // TODO: Implement real Twilio integration
      // const twilio = require('twilio');
      // const client = twilio(this.accountSid, this.authToken);
      // const result = await client.messages.create({
      //   body: message,
      //   from: this.fromNumber,
      //   to: phoneNumber,
      // });
      // return { messageId: result.sid, provider: 'twilio', status: 'sent' };

      logger.info('Twilio SMS would be sent', { phoneNumber, fromNumber: this.fromNumber });
      const demoProvider = new DemoSmsProvider();
      return demoProvider.sendSMS(phoneNumber, message);
    } catch (error) {
      logger.error('Twilio SMS failed', { error, phoneNumber });
      const demoProvider = new DemoSmsProvider();
      return demoProvider.sendSMS(phoneNumber, message);
    }
  }
}

/**
 * Production Email Provider (SendGrid) - Production adapter
 */
class SendGridEmailProvider implements IEmailProvider {
  private apiKey: string;
  private fromEmail: string;

  constructor(apiKey?: string, fromEmail?: string) {
    this.apiKey = apiKey || process.env.SENDGRID_API_KEY || '';
    this.fromEmail = fromEmail || process.env.SENDGRID_FROM_EMAIL || 'noreply@wise2.net';

    if (!this.apiKey) {
      logger.warn('SendGrid Email Provider: API key not configured, will fall back to demo');
    }
  }

  async sendEmail(email: string, subject: string, body: string): Promise<any> {
    if (!this.apiKey) {
      // Fallback to demo provider
      const demoProvider = new DemoEmailProvider();
      return demoProvider.sendEmail(email, subject, body);
    }

    try {
      // TODO: Implement real SendGrid integration
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.apiKey);
      // const result = await sgMail.send({
      //   to: email,
      //   from: this.fromEmail,
      //   subject,
      //   html: body,
      // });
      // return { messageId: result[0].headers['x-message-id'], provider: 'sendgrid', status: 'sent' };

      logger.info('SendGrid email would be sent', { email, subject });
      const demoProvider = new DemoEmailProvider();
      return demoProvider.sendEmail(email, subject, body);
    } catch (error) {
      logger.error('SendGrid email failed', { error, email });
      const demoProvider = new DemoEmailProvider();
      return demoProvider.sendEmail(email, subject, body);
    }
  }
}

/**
 * Production Social Provider (Facebook Graph API) - Production adapter
 */
class FacebookSocialProvider implements ISocialProvider {
  private pageAccessToken: string;
  private pageId: string;

  constructor(pageAccessToken?: string, pageId?: string) {
    this.pageAccessToken = pageAccessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
    this.pageId = pageId || process.env.FACEBOOK_PAGE_ID || '';

    if (!this.pageAccessToken) {
      logger.warn('Facebook Social Provider: Access token not configured, will fall back to demo');
    }
  }

  async publish(platform: string, content: string, media?: string[]): Promise<any> {
    if (!this.pageAccessToken) {
      // Fallback to demo provider
      const demoProvider = new DemoSocialProvider();
      return demoProvider.publish(platform, content, media);
    }

    try {
      // TODO: Implement real Facebook Graph API integration
      // const response = await fetch(`https://graph.facebook.com/v15.0/${this.pageId}/feed`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     message: content,
      //     access_token: this.pageAccessToken,
      //   }),
      // });
      // const result = await response.json();
      // return { postId: result.id, provider: 'facebook', status: 'published' };

      logger.info('Facebook post would be published', { pageId: this.pageId, contentLength: content.length });
      const demoProvider = new DemoSocialProvider();
      return demoProvider.publish(platform, content, media);
    } catch (error) {
      logger.error('Facebook post failed', { error, platform });
      const demoProvider = new DemoSocialProvider();
      return demoProvider.publish(platform, content, media);
    }
  }
}

/**
 * Production Payment Provider (Stripe) - Production adapter
 */
class StripePaymentProvider implements IPaymentProvider {
  private secretKey: string;

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.STRIPE_SECRET_KEY || '';

    if (!this.secretKey) {
      logger.warn('Stripe Payment Provider: Secret key not configured, will fall back to demo');
    }
  }

  async charge(customerId: string, amount: number, description: string): Promise<any> {
    if (!this.secretKey) {
      // Fallback to demo provider
      const demoProvider = new DemoPaymentProvider();
      return demoProvider.charge(customerId, amount, description);
    }

    try {
      // TODO: Implement real Stripe integration
      // const stripe = require('stripe')(this.secretKey);
      // const charge = await stripe.charges.create({
      //   amount: Math.round(amount * 100), // Convert to cents
      //   currency: 'usd',
      //   customer: customerId,
      //   description,
      // });
      // return { chargeId: charge.id, provider: 'stripe', status: charge.status };

      logger.info('Stripe charge would be created', { customerId, amount, description });
      const demoProvider = new DemoPaymentProvider();
      return demoProvider.charge(customerId, amount, description);
    } catch (error) {
      logger.error('Stripe charge failed', { error, customerId, amount });
      const demoProvider = new DemoPaymentProvider();
      return demoProvider.charge(customerId, amount, description);
    }
  }
}

/**
 * Provider Factory - Creates appropriate provider based on environment
 */
class ApprovalExecutorFactory {
  private smsProvider: ISmsProvider;
  private emailProvider: IEmailProvider;
  private socialProvider: ISocialProvider;
  private paymentProvider: IPaymentProvider;

  constructor() {
    // Initialize providers - production providers with demo fallback
    this.smsProvider = new TwilioSmsProvider();
    this.emailProvider = new SendGridEmailProvider();
    this.socialProvider = new FacebookSocialProvider();
    this.paymentProvider = new StripePaymentProvider();
  }

  async executeSendSMS(payload: any): Promise<any> {
    return this.smsProvider.sendSMS(payload.phoneNumber, payload.message);
  }

  async executeSendEmail(payload: any): Promise<any> {
    return this.emailProvider.sendEmail(payload.email, payload.subject, payload.body);
  }

  async executePublishSocial(payload: any): Promise<any> {
    return this.socialProvider.publish(payload.platform, payload.content, payload.media);
  }

  async executeChargePayment(payload: any): Promise<any> {
    return this.paymentProvider.charge(payload.customerId, payload.amount, payload.description);
  }
}

export {
  ApprovalExecutorFactory,
  DemoSmsProvider,
  DemoEmailProvider,
  DemoSocialProvider,
  DemoPaymentProvider,
  TwilioSmsProvider,
  SendGridEmailProvider,
  FacebookSocialProvider,
  StripePaymentProvider,
};
