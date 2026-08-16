import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { StripeService } from './stripe.service'
import { BadRequestException } from '@nestjs/common'

describe('StripeService', () => {
  let service: StripeService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // Mock Stripe not configured for test environment
              return undefined
            }),
          },
        },
      ],
    }).compile()

    service = module.get<StripeService>(StripeService)
    configService = module.get<ConfigService>(ConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getStatus', () => {
    it('should return Stripe status', () => {
      const status = service.getStatus()
      expect(status).toHaveProperty('configured')
      expect(typeof status.configured).toBe('boolean')
    })

    it('should indicate not configured when no API key', () => {
      const status = service.getStatus()
      expect(status.configured).toBe(false)
    })
  })

  describe('verifyWebhookSignature', () => {
    it('should return false when no webhook secret', () => {
      const isValid = service.verifyWebhookSignature(
        'test-payload',
        'test-signature'
      )
      expect(isValid).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should throw BadRequestException when Stripe not configured', async () => {
      try {
        await service.createCustomer('user-123', 'test@example.com', 'Test User')
        fail('Should have thrown BadRequestException')
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException)
      }
    })

    it('should handle subscription errors gracefully', async () => {
      try {
        await service.createSubscription('cus-123', 'price-123')
        fail('Should have thrown BadRequestException')
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException)
      }
    })

    it('should handle invoice retrieval errors', async () => {
      try {
        await service.getInvoices('cus-123')
        fail('Should have thrown BadRequestException')
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException)
      }
    })
  })
})
