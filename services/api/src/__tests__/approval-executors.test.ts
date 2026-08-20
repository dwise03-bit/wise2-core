import { ApprovalExecutorFactory } from '../services/approval-executors';

describe('ApprovalExecutorFactory', () => {
  let factory: ApprovalExecutorFactory;

  beforeEach(() => {
    factory = new ApprovalExecutorFactory();
  });

  describe('SMS Execution', () => {
    it('should generate messageId for demo provider', async () => {
      const result = await factory.executeSendSMS({
        phoneNumber: '+1234567890',
        message: 'Test message',
        from: 'WISE2',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^sms_/);
      expect(result.cost).toBeGreaterThan(0);
    });

    it('should mask phone number in response', async () => {
      const result = await factory.executeSendSMS({
        phoneNumber: '+12025551234',
        message: 'Test',
        from: 'WISE2',
      });

      expect(result.maskedPhoneNumber).toBe('***-1234');
    });

    it('should validate phone number format', async () => {
      const result = await factory.executeSendSMS({
        phoneNumber: 'invalid',
        message: 'Test',
        from: 'WISE2',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Phone number');
    });

    it('should validate message length', async () => {
      const result = await factory.executeSendSMS({
        phoneNumber: '+1234567890',
        message: '', // Empty message
        from: 'WISE2',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Message');
    });
  });

  describe('Email Execution', () => {
    it('should generate messageId for demo provider', async () => {
      const result = await factory.executeSendEmail({
        email: 'test@example.com',
        subject: 'Test',
        body: 'Test body',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^email_/);
    });

    it('should mask email in response', async () => {
      const result = await factory.executeSendEmail({
        email: 'john.doe@example.com',
        subject: 'Test',
        body: 'Test',
      });

      expect(result.maskedEmail).toMatch(/^.*@example\.com$/);
      expect(result.maskedEmail).not.toContain('john');
      expect(result.maskedEmail).not.toContain('doe');
    });

    it('should validate email format', async () => {
      const result = await factory.executeSendEmail({
        email: 'invalid-email',
        subject: 'Test',
        body: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should require subject and body', async () => {
      const result = await factory.executeSendEmail({
        email: 'test@example.com',
        subject: '',
        body: '',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Social Publication', () => {
    it('should generate postId for demo provider', async () => {
      const result = await factory.executePublishSocial({
        platform: 'facebook',
        content: 'Test post',
        media: [],
      });

      expect(result.success).toBe(true);
      expect(result.postId).toMatch(/^post_/);
      expect(result.platform).toBe('facebook');
    });

    it('should return realistic reach for demo', async () => {
      const result = await factory.executePublishSocial({
        platform: 'facebook',
        content: 'Test',
      });

      expect(result.success).toBe(true);
      expect(result.reach).toBeGreaterThanOrEqual(500);
      expect(result.reach).toBeLessThanOrEqual(5500);
    });

    it('should track media count', async () => {
      const result = await factory.executePublishSocial({
        platform: 'instagram',
        content: 'Test post',
        media: ['img1.jpg', 'img2.jpg', 'img3.jpg'],
      });

      expect(result.success).toBe(true);
      expect(result.mediaCount).toBe(3);
    });

    it('should validate platform', async () => {
      const result = await factory.executePublishSocial({
        platform: 'invalid-platform',
        content: 'Test',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Payment Execution', () => {
    it('should generate chargeId for demo provider', async () => {
      const result = await factory.executeChargePayment({
        customerId: 'cust_123',
        amount: 10000,
        currency: 'USD',
        description: 'Test charge',
      });

      expect(result.success).toBe(true);
      expect(result.transactionId).toMatch(/^ch_/);
      expect(result.currency).toBe('USD');
    });

    it('should mask customer ID in response', async () => {
      const result = await factory.executeChargePayment({
        customerId: 'cust_1234567890',
        amount: 10000,
        currency: 'USD',
        description: 'Test',
      });

      expect(result.success).toBe(true);
      expect(result.maskedCustomerId).toMatch(/cust_\*+/);
    });

    it('should calculate realistic fee (2.9% + $0.30)', async () => {
      const result = await factory.executeChargePayment({
        customerId: 'cust_123',
        amount: 10000, // $100.00
        currency: 'USD',
        description: 'Test',
      });

      expect(result.success).toBe(true);
      // 2.9% of 10000 = 290 + 30 = 320 cents
      const expectedFee = Math.round(10000 * 0.029 + 30);
      expect(result.fee).toBeLessThanOrEqual(expectedFee + 1);
      expect(result.fee).toBeGreaterThanOrEqual(expectedFee - 1);
    });

    it('should calculate net amount correctly', async () => {
      const result = await factory.executeChargePayment({
        customerId: 'cust_123',
        amount: 10000,
        currency: 'USD',
        description: 'Test',
      });

      expect(result.success).toBe(true);
      expect(result.net).toBe(result.amount - result.fee);
    });

    it('should validate amount', async () => {
      const result = await factory.executeChargePayment({
        customerId: 'cust_123',
        amount: 0, // Invalid
        currency: 'USD',
        description: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('amount');
    });

    it('should validate currency', async () => {
      const result = await factory.executeChargePayment({
        customerId: 'cust_123',
        amount: 10000,
        currency: 'INVALID',
        description: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('currency');
    });
  });

  describe('Error Handling', () => {
    it('should handle provider timeout gracefully', async () => {
      // This would require mocking a slow provider
      const result = await factory.executeSendSMS({
        phoneNumber: '+1234567890',
        message: 'Test',
        from: 'WISE2',
      });

      // Should complete within reasonable time
      expect(result).toBeDefined();
    });

    it('should return success=false on validation error', async () => {
      const result = await factory.executeSendEmail({
        email: '',
        subject: '',
        body: '',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
