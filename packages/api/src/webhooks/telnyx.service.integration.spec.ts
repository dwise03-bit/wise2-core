import { TelnyxService } from './telnyx.service';
import { TelnyxDatabaseService } from './telnyx-database.service';

// Mock the database service
jest.mock('./telnyx-database.service');

// Mock TelnyxProvider to avoid actual API calls
jest.mock('../../../ai-phone/dist/telnyx-provider', () => {
  return {
    TelnyxProvider: jest.fn().mockImplementation(() => ({
      incomingCall: jest.fn().mockResolvedValue({
        callId: 'call-123',
        direction: 'inbound',
        state: 'ringing',
        from: '+15551111111',
        to: '+15559999999',
      }),
      acceptCall: jest.fn().mockResolvedValue(undefined),
      rejectCall: jest.fn().mockResolvedValue(undefined),
      startMediaStream: jest.fn().mockResolvedValue(undefined),
      endCall: jest.fn().mockResolvedValue(undefined),
      getCall: jest.fn().mockResolvedValue({
        callId: 'call-123',
        state: 'ringing',
      }),
      recordDTMF: jest.fn(),
      getDTMFInput: jest.fn().mockReturnValue(''),
    })),
  };
});

// Mock CallSessionManager
jest.mock('../../../ai-phone/dist/call-session', () => {
  return {
    CallSessionManager: jest.fn().mockImplementation(() => ({
      createSession: jest.fn().mockReturnValue({
        sessionId: 'session-123',
        callId: 'call-123',
        state: 'answered',
        startedAt: new Date(),
        transcript: [],
        tools: [],
        context: {},
        metadata: {},
      }),
      getSession: jest.fn(),
      updateState: jest.fn().mockReturnValue(true),
      addMessage: jest.fn(),
      getSummary: jest.fn().mockReturnValue({
        messageCount: 0,
        toolsUsed: [],
      }),
    })),
  };
});

describe('TelnyxService Integration Tests', () => {
  let telnyxService: TelnyxService;
  let databaseService: jest.Mocked<TelnyxDatabaseService>;

  beforeEach(() => {
    databaseService = new TelnyxDatabaseService(null as any) as jest.Mocked<TelnyxDatabaseService>;

    // Mock database methods
    databaseService.lookupCustomer = jest.fn().mockResolvedValue({
      id: 'cust-123',
      email: 'phone-+15551111111@internal.local',
      phone: '+15551111111',
    });

    databaseService.createCall = jest.fn().mockResolvedValue({
      id: 'db-call-123',
      callSid: 'telnyx-control-id',
      status: 'INITIATED',
    });

    databaseService.updateCallAnswered = jest.fn().mockResolvedValue({
      id: 'db-call-123',
      status: 'ANSWERED',
    });

    databaseService.endCall = jest.fn().mockResolvedValue({
      id: 'db-call-123',
      status: 'DISCONNECTED',
      durationSeconds: 180,
    });

    databaseService.getTodayMetrics = jest.fn().mockResolvedValue({
      total: 5,
      answered: 4,
      failed: 1,
      failureRate: '20.0',
      totalDurationSeconds: 1200,
      averageDurationSeconds: '240',
    });

    databaseService.createCallbackTask = jest.fn().mockResolvedValue({
      id: 'task-123',
      customerId: 'cust-123',
      status: 'PENDING',
    });

    databaseService.getCustomerCallHistory = jest.fn().mockResolvedValue([
      {
        id: 'call-prev-123',
        callSid: 'prev-control-id',
        status: 'ANSWERED',
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ]);

    telnyxService = new TelnyxService(databaseService);
  });

  describe('Call Initiated Flow', () => {
    it('should handle incoming call and create database record', async () => {
      const webhookEvent = {
        callId: 'call-123',
        callControlId: 'control-123',
        from: '+15551111111',
        to: '+15559999999',
        timestamp: new Date().toISOString(),
      };

      await telnyxService.handleCallInitiated(webhookEvent);

      expect(databaseService.lookupCustomer).toHaveBeenCalledWith('+15551111111');
      expect(databaseService.createCall).toHaveBeenCalled();
    });

    it('should store session mapping with database call ID', async () => {
      const webhookEvent = {
        callId: 'call-456',
        callControlId: 'control-456',
        from: '+15551111111',
        to: '+15559999999',
        timestamp: new Date().toISOString(),
      };

      await telnyxService.handleCallInitiated(webhookEvent);

      const sessionStatus = telnyxService.getCallStatus('call-456');
      expect(sessionStatus).toBeDefined();
      expect(sessionStatus?.customerId).toBe('cust-123');
      expect(sessionStatus?.databaseCallId).toBe('db-call-123');
    });
  });

  describe('Call Answered Flow', () => {
    it('should update call status when answered', async () => {
      // First, create the call
      const initiateEvent = {
        callId: 'call-789',
        callControlId: 'control-789',
        from: '+15551111111',
        to: '+15559999999',
        timestamp: new Date().toISOString(),
      };

      await telnyxService.handleCallInitiated(initiateEvent);

      // Then handle answered event
      const answeredEvent = {
        callId: 'call-789',
        callControlId: 'control-789',
        timestamp: new Date().toISOString(),
      };

      await telnyxService.handleCallAnswered(answeredEvent);

      expect(databaseService.updateCallAnswered).toHaveBeenCalledWith(
        'db-call-123',
        expect.any(Date)
      );
    });
  });

  describe('Call Ended Flow', () => {
    it('should process call end and create callback task', async () => {
      // Setup initial call
      const initiateEvent = {
        callId: 'call-999',
        callControlId: 'control-999',
        from: '+15551111111',
        to: '+15559999999',
        timestamp: new Date().toISOString(),
      };

      await telnyxService.handleCallInitiated(initiateEvent);

      // End the call
      const endEvent = {
        callId: 'call-999',
        callControlId: 'control-999',
        timestamp: new Date().toISOString(),
      };

      await telnyxService.handleCallEnded(endEvent);

      expect(databaseService.endCall).toHaveBeenCalled();
    });

    it('should handle DTMF input during call', async () => {
      const initiateEvent = {
        callId: 'call-dtmf',
        callControlId: 'control-dtmf',
        from: '+15551111111',
        to: '+15559999999',
        timestamp: new Date().toISOString(),
      };

      await telnyxService.handleCallInitiated(initiateEvent);

      const dtmfEvent = {
        callId: 'call-dtmf',
        callControlId: 'control-dtmf',
        dtmfDigits: '1',
        timestamp: new Date().toISOString(),
      };

      await telnyxService.handleDTMFInput(dtmfEvent);

      const sessionStatus = telnyxService.getCallStatus('call-dtmf');
      expect(sessionStatus).toBeDefined();
    });
  });

  describe('Active Sessions Management', () => {
    it('should maintain list of active sessions', async () => {
      const event1 = {
        callId: 'call-session-1',
        callControlId: 'control-1',
        from: '+15551111111',
        to: '+15559999999',
        timestamp: new Date().toISOString(),
      };

      const event2 = {
        callId: 'call-session-2',
        callControlId: 'control-2',
        from: '+15552222222',
        to: '+15559999999',
        timestamp: new Date().toISOString(),
      };

      await telnyxService.handleCallInitiated(event1);
      await telnyxService.handleCallInitiated(event2);

      const activeSessions = telnyxService.getActiveSessions();
      expect(activeSessions.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Metrics Tracking', () => {
    it('should retrieve call metrics', async () => {
      const metrics = await telnyxService.getCallMetrics();

      expect(metrics).toBeDefined();
      expect(metrics?.total).toBe(5);
      expect(metrics?.answered).toBe(4);
      expect(metrics?.failureRate).toBe('20.0');
    });

    it('should retrieve customer call history', async () => {
      const history = await telnyxService.getCustomerCallHistory('cust-123');

      expect(history).toBeDefined();
      expect(history?.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle database lookup failures', async () => {
      databaseService.lookupCustomer = jest.fn().mockResolvedValue(null);
      databaseService.createCall = jest.fn().mockResolvedValue({
        id: 'db-call-error',
        callSid: 'control-error',
        status: 'INITIATED',
      });

      const event = {
        callId: 'call-error-1',
        callControlId: 'control-error',
        from: '+15551111111',
        to: '+15559999999',
        timestamp: new Date().toISOString(),
      };

      // Should gracefully handle null customer
      await telnyxService.handleCallInitiated(event);

      expect(databaseService.lookupCustomer).toHaveBeenCalled();
      expect(databaseService.createCall).toHaveBeenCalled();
    });
  });
});
