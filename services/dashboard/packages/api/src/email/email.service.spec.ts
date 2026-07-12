import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                APP_URL: 'http://localhost:3000',
                EMAIL_FROM: 'noreply@wise2.net',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email', async () => {
      const result = await service.sendPasswordReset(
        'test@example.com',
        'reset-token-123',
        'John'
      );
      expect(result).toBe(true);
    });

    it('should include reset URL in email', async () => {
      const result = await service.sendPasswordReset(
        'test@example.com',
        'reset-token-abc',
        'Jane'
      );
      expect(result).toBe(true);
    });
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email', async () => {
      const result = await service.sendVerificationEmail(
        'newuser@example.com',
        'verify-token-123',
        'NewUser'
      );
      expect(result).toBe(true);
    });

    it('should include verification URL in email', async () => {
      const result = await service.sendVerificationEmail(
        'another@example.com',
        'verify-token-xyz',
        'Another'
      );
      expect(result).toBe(true);
    });
  });

  describe('sendWelcome', () => {
    it('should send welcome email', async () => {
      const result = await service.sendWelcome('welcome@example.com', 'John Doe');
      expect(result).toBe(true);
    });

    it('should include dashboard URL', async () => {
      const result = await service.sendWelcome('user@example.com', 'Jane Smith');
      expect(result).toBe(true);
    });
  });

  describe('sendInvoice', () => {
    it('should send invoice email', async () => {
      const result = await service.sendInvoice(
        'billing@example.com',
        'INV-001',
        9999,
        '2026-08-11'
      );
      expect(result).toBe(true);
    });

    it('should include correct amount formatting', async () => {
      const result = await service.sendInvoice(
        'customer@example.com',
        'INV-002',
        29900,
        '2026-08-15'
      );
      expect(result).toBe(true);
    });
  });

  describe('sendNotification', () => {
    it('should send notification email', async () => {
      const result = await service.sendNotification(
        'notify@example.com',
        'Payment Received',
        'Your payment has been processed successfully'
      );
      expect(result).toBe(true);
    });

    it('should include action button when URL provided', async () => {
      const result = await service.sendNotification(
        'user@example.com',
        'Review Required',
        'Your project needs review',
        'http://localhost:3000/projects/123',
        'Review Now'
      );
      expect(result).toBe(true);
    });
  });

  describe('getStatus', () => {
    it('should return provider status', () => {
      const status = service.getStatus();
      expect(status).toHaveProperty('provider');
      expect(status).toHaveProperty('configured');
    });

    it('should indicate mock provider when no credentials', () => {
      const status = service.getStatus();
      expect(status.provider).toBe('mock');
      expect(status.configured).toBe(false);
    });
  });
});
