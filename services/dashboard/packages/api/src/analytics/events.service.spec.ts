import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => undefined),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackEvent', () => {
    it('should track generic event', async () => {
      const event = {
        event: 'test_event',
        userId: 'user-123',
        timestamp: new Date(),
        properties: { key: 'value' },
      };

      await service.trackEvent(event);
      const buffer = service.getEventBuffer();
      expect(buffer).toHaveLength(1);
      expect(buffer[0].event).toBe('test_event');
    });
  });

  describe('trackUserRegistered', () => {
    it('should track user registration', async () => {
      await service.trackUserRegistered('user-123', 'test@example.com', 'John');
      const buffer = service.getEventBuffer();
      expect(buffer).toHaveLength(1);
      expect(buffer[0].event).toBe('user_registered');
      expect(buffer[0].properties?.email).toBe('test@example.com');
    });
  });

  describe('trackUserLoggedIn', () => {
    it('should track user login', async () => {
      await service.trackUserLoggedIn('user-123', 'email');
      const buffer = service.getEventBuffer();
      expect(buffer).toHaveLength(1);
      expect(buffer[0].event).toBe('user_logged_in');
    });
  });

  describe('trackOAuthLogin', () => {
    it('should track Google OAuth login', async () => {
      await service.trackOAuthLogin('user-123', 'google');
      const buffer = service.getEventBuffer();
      expect(buffer).toHaveLength(1);
      expect(buffer[0].properties?.provider).toBe('google');
    });

    it('should track GitHub OAuth login', async () => {
      await service.trackOAuthLogin('user-456', 'github');
      const buffer = service.getEventBuffer();
      expect(buffer).toHaveLength(1);
      expect(buffer[0].properties?.provider).toBe('github');
    });
  });

  describe('trackSubscriptionCreated', () => {
    it('should track subscription creation', async () => {
      await service.trackSubscriptionCreated('user-123', 'pro', 9900);
      const buffer = service.getEventBuffer();
      expect(buffer).toHaveLength(1);
      expect(buffer[0].event).toBe('subscription_created');
      expect(buffer[0].properties?.plan).toBe('pro');
    });
  });

  describe('trackPaymentSucceeded', () => {
    it('should track successful payment', async () => {
      await service.trackPaymentSucceeded('user-123', 9900, 'inv-001');
      const buffer = service.getEventBuffer();
      expect(buffer).toHaveLength(1);
      expect(buffer[0].event).toBe('payment_succeeded');
    });
  });

  describe('trackPaymentFailed', () => {
    it('should track failed payment', async () => {
      await service.trackPaymentFailed('user-123', 9900, 'Insufficient funds');
      const buffer = service.getEventBuffer();
      expect(buffer).toHaveLength(1);
      expect(buffer[0].event).toBe('payment_failed');
    });
  });

  describe('getEventBuffer and clearEventBuffer', () => {
    it('should manage event buffer', async () => {
      await service.trackUserRegistered('user-123', 'test@example.com', 'John');
      let buffer = service.getEventBuffer();
      expect(buffer).toHaveLength(1);

      service.clearEventBuffer();
      buffer = service.getEventBuffer();
      expect(buffer).toHaveLength(0);
    });
  });
});
