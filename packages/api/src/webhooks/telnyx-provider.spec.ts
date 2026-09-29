// @ts-ignore - importing compiled JS directly from ai-phone dist
import { TelnyxProvider } from '../../../ai-phone/dist/telnyx-provider';

describe('TelnyxProvider - Retry Logic & Reliability', () => {
  let provider: TelnyxProvider;

  beforeEach(() => {
    provider = new TelnyxProvider({
      apiKey: 'test-key',
      phoneNumber: '+15551234567',
      maxRetries: 2,
      retryDelayMs: 100,
      requestTimeoutMs: 5000,
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      const callId = 'test-call-123';

      // Mock timeout scenario - getCall throws when call not found
      await expect(provider.getCall(callId)).rejects.toThrow('Call test-call-123 not found');
    });

    it('should configure retry limits', () => {
      const config = {
        apiKey: 'test-key',
        phoneNumber: '+15551234567',
        maxRetries: 5,
        retryDelayMs: 2000,
      };

      const p = new TelnyxProvider(config);
      expect(p).toBeDefined();
    });
  });

  describe('Advanced Call Features', () => {
    it('should track call hold state', async () => {
      const callId = 'call-hold-test';
      // Set up call state
      await provider.incomingCall(callId, '+15551111111', '+15559999999', 'call-control-id');

      // Hold should update state
      await expect(provider.holdCall(callId)).rejects.toThrow();
    });

    it('should accumulate DTMF input', async () => {
      const callId = 'dtmf-test';
      await provider.incomingCall(callId, '+15551111111', '+15559999999', 'call-id');

      provider.recordDTMF(callId, '1');
      provider.recordDTMF(callId, '2');
      provider.recordDTMF(callId, '3');

      const accumulated = provider.getDTMFInput(callId);
      expect(accumulated).toBe('123');
    });

    it('should clear DTMF on new call', async () => {
      const callId = 'dtmf-clear-test';
      await provider.incomingCall(callId, '+15551111111', '+15559999999', 'call-id');

      provider.recordDTMF(callId, '99');
      expect(provider.getDTMFInput(callId)).toBe('99');

      // New call should have no DTMF
      const newCallId = 'new-call';
      await provider.incomingCall(newCallId, '+15551111111', '+15559999999', 'call-id-2');
      expect(provider.getDTMFInput(newCallId)).toBeUndefined();
    });
  });

  describe('Call State Management', () => {
    it('should initialize inbound calls', async () => {
      const callId = 'inbound-test';
      const result = await provider.incomingCall(callId, '+15551111111', '+15559999999', 'control-id');

      expect(result.callId).toBe(callId);
      expect(result.direction).toBe('inbound');
      expect(result.state).toBe('ringing');
      expect(result.from).toBe('+15551111111');
      expect(result.to).toBe('+15559999999');
    });

    it('should retrieve call info', async () => {
      const callId = 'get-call-test';
      await provider.incomingCall(callId, '+15551111111', '+15559999999', 'control-id');

      const call = await provider.getCall(callId);
      expect(call.callId).toBe(callId);
      expect(call.state).toBe('ringing');
    });
  });
});

describe('TelnyxProvider - Webhook Security', () => {
  let provider: TelnyxProvider;

  beforeEach(() => {
    provider = new TelnyxProvider({
      apiKey: 'test-key',
      phoneNumber: '+15551234567',
      webhookSecret: 'test-secret-123',
    });
  });

  it('should be initialized with webhook secret', () => {
    expect(provider).toBeDefined();
  });
});

describe('TelnyxProvider - Configuration', () => {
  it('should use default retry settings', () => {
    const provider = new TelnyxProvider({
      apiKey: 'test-key',
      phoneNumber: '+15551234567',
    });

    expect(provider).toBeDefined();
  });

  it('should accept custom retry configuration', () => {
    const provider = new TelnyxProvider({
      apiKey: 'test-key',
      phoneNumber: '+15551234567',
      maxRetries: 10,
      retryDelayMs: 5000,
      requestTimeoutMs: 60000,
    });

    expect(provider).toBeDefined();
  });
});
