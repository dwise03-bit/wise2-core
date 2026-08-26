import { Request, Response, NextFunction } from 'express';
import twilio from 'twilio';
import { logger } from '../../logger';

export class TwilioWebhookValidator {
  private authToken: string;
  private webhookUrl: string;

  constructor(authToken: string, webhookUrl: string) {
    this.authToken = authToken;
    this.webhookUrl = webhookUrl;
  }

  /**
   * Express middleware to validate Twilio webhook signatures
   */
  validate() {
    return (req: Request, res: Response, next: NextFunction) => {
      const signature = req.headers['x-twilio-signature'] as string;

      if (!signature) {
        logger.warn('Twilio webhook missing signature');
        return res.status(403).json({ error: 'Missing Twilio signature' });
      }

      try {
        const isValid = twilio.validateRequest(this.authToken, signature, this.webhookUrl, req.body);

        if (!isValid) {
          logger.warn('Twilio webhook signature validation failed', {
            url: this.webhookUrl,
            signature: signature.substring(0, 10) + '***',
          });
          return res.status(403).json({ error: 'Invalid Twilio signature' });
        }

        logger.debug('Twilio webhook signature valid');
        next();
      } catch (error) {
        logger.error('Twilio webhook validation error', { error });
        return res.status(500).json({ error: 'Internal validation error' });
      }
    };
  }

  /**
   * Alternative: validate a single webhook request manually
   */
  validateRequest(signature: string, url: string, body: Record<string, any>): boolean {
    try {
      return twilio.validateRequest(this.authToken, signature, url, body);
    } catch (error) {
      logger.error('Manual webhook validation failed', { error });
      return false;
    }
  }
}

export function createTwilioWebhookValidator(authToken: string): (req: Request, res: Response, next: NextFunction) => void {
  // Webhook URL will be replaced at runtime with actual base URL
  const validator = new TwilioWebhookValidator(authToken, '');
  return (req: Request, res: Response, next: NextFunction) => {
    const baseUrl = req.protocol + '://' + req.get('host');
    const fullUrl = baseUrl + req.originalUrl;

    const signature = req.headers['x-twilio-signature'] as string;
    if (!signature) {
      logger.warn('Twilio webhook missing signature');
      return res.status(403).json({ error: 'Missing Twilio signature' });
    }

    if (!validator.validateRequest(signature, fullUrl, req.body)) {
      logger.warn('Invalid Twilio webhook signature', { url: fullUrl });
      return res.status(403).json({ error: 'Invalid signature' });
    }

    next();
  };
}
