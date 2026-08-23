import { GoogleVoiceProvider } from './google-voice-provider';

describe('GoogleVoiceProvider', () => {
  let provider: GoogleVoiceProvider;
  const mockConfig = {
    projectId: 'test-project-123',
    credentials: {
      type: 'service_account',
      project_id: 'test-project-123',
      private_key_id: 'key-123',
      private_key: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----\n',
      client_email: 'service@test-project-123.iam.gserviceaccount.com',
      client_id: '123456789',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: 'https://www.googleapis.com/robot/v1/metadata/x509/service%40test-project-123.iam.gserviceaccount.com',
    },
    phoneNumber: '+1-555-0123',
  };

  beforeEach(() => {
    provider = new GoogleVoiceProvider(mockConfig);
  });

  describe('Basic Call Operations', () => {
    it('should register an incoming call', async () => {
      const callInfo = await provider.incomingCall('call-001', '+1-555-9999', '+1-555-0123', 'gv-call-xyz');

      expect(callInfo.callId).toBe('call-001');
      expect(callInfo.from).toBe('+1-555-9999');
      expect(callInfo.to).toBe('+1-555-0123');
      expect(callInfo.direction).toBe('inbound');
      expect(callInfo.state).toBe('ringing');
    });

    it('should accept an incoming call', async () => {
      await provider.incomingCall('call-001', '+1-555-9999', '+1-555-0123');
      await provider.acceptCall('call-001');

      const call = await provider.getCall('call-001');
      expect(call.state).toBe('answered');
      expect(call.connectedAt).toBeDefined();
    });

    it('should reject an incoming call', async () => {
      await provider.incomingCall('call-002', '+1-555-8888', '+1-555-0123');
      await provider.rejectCall('call-002');

      const call = await provider.getCall('call-002');
      expect(call.state).toBe('failed');
      expect(call.endedAt).toBeDefined();
    });

    it('should end a call', async () => {
      await provider.incomingCall('call-003', '+1-555-7777', '+1-555-0123');
      await provider.acceptCall('call-003');
      await provider.endCall('call-003');

      const call = await provider.getCall('call-003');
      expect(call.state).toBe('completed');
      expect(call.duration).toBeDefined();
      expect(call.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Media Stream', () => {
    it('should start a media stream', async () => {
      await provider.incomingCall('call-004', '+1-555-6666', '+1-555-0123');
      await provider.acceptCall('call-004');
      await provider.startMediaStream('call-004', 'ws://localhost:3001/media/stream');

      const call = await provider.getCall('call-004');
      expect(call.state).toBe('in-progress');
    });
  });

  describe('Call Transfer', () => {
    it('should transfer a call to a destination', async () => {
      await provider.incomingCall('call-005', '+1-555-5555', '+1-555-0123');
      await provider.acceptCall('call-005');
      await provider.transferCall('call-005', '+1-555-0789');

      const call = await provider.getCall('call-005');
      expect(call.state).toBe('transferring');
    });
  });

  describe('Outbound Calls', () => {
    it('should initiate an outbound call', async () => {
      const callInfo = await provider.initiateOutboundCall('call-006', '+1-555-0123', '+1-555-1111');

      expect(callInfo.callId).toBe('call-006');
      expect(callInfo.from).toBe('+1-555-0123');
      expect(callInfo.to).toBe('+1-555-1111');
      expect(callInfo.direction).toBe('outbound');
      expect(callInfo.state).toBe('queued');
    });
  });

  describe('Recording and Transcription', () => {
    it('should track call recording', async () => {
      await provider.incomingCall('call-007', '+1-555-4444', '+1-555-0123');
      provider.recordingStarted('call-007', 'rec-uuid-001');

      const recording = await provider.getRecording('call-007');
      expect(recording).toBeDefined();
      expect(recording?.recordingId).toBe('rec-uuid-001');
      expect(recording?.url).toContain('storage.googleapis.com');
    });

    it('should track call transcript', async () => {
      await provider.incomingCall('call-008', '+1-555-3333', '+1-555-0123');
      provider.transcriptReady('call-008', 'trans-uuid-001');

      const transcript = await provider.getTranscript('call-008');
      expect(transcript).toBeDefined();
      expect(transcript?.transcriptId).toBe('trans-uuid-001');
      expect(transcript?.text).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for non-existent call on accept', async () => {
      await expect(provider.acceptCall('non-existent')).rejects.toThrow('Call non-existent not found');
    });

    it('should throw error for non-existent call on reject', async () => {
      await expect(provider.rejectCall('non-existent')).rejects.toThrow('Call non-existent not found');
    });

    it('should throw error for non-existent call on transfer', async () => {
      await expect(provider.transferCall('non-existent', '+1-555-0789')).rejects.toThrow('Call non-existent not found');
    });

    it('should throw error for non-existent call on end', async () => {
      await expect(provider.endCall('non-existent')).rejects.toThrow('Call non-existent not found');
    });

    it('should throw error for non-existent call on getCall', async () => {
      await expect(provider.getCall('non-existent')).rejects.toThrow('Call non-existent not found');
    });
  });

  describe('Provider Metadata', () => {
    it('should have correct provider name', () => {
      expect(provider.name).toBe('Google Voice');
    });
  });
});
