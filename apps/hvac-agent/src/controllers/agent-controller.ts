import { AIEngine } from '../ai/ai-engine';
import { ContextManager, SessionContext } from '../context/context-manager';
import { VoiceProcessor } from '../voice/voice-processor';
import { v4 as uuidv4 } from 'uuid';

export class AgentController {
  constructor(
    private aiEngine: AIEngine,
    private contextManager: ContextManager,
    private voiceProcessor: VoiceProcessor
  ) {}

  async handleTextMessage(
    message: string,
    jobId: string,
    fieldpieceData: any,
    sessionId: string
  ): Promise<any> {
    try {
      // Get or initialize session context
      let context = this.contextManager.getContext(sessionId);
      if (!context && jobId) {
        context = this.contextManager.createSession(
          sessionId,
          {
            jobId,
            customerName: fieldpieceData?.customerName || 'Unknown',
            address: fieldpieceData?.address || '',
            equipmentType: fieldpieceData?.equipmentType || 'HVAC Unit',
            serviceType: 'repair',
            startTime: Date.now(),
          },
          {
            techId: 'field-tech',
            name: 'Field Technician',
            experience: 'senior',
          }
        );
      }

      // Update Fieldpiece readings if provided
      if (fieldpieceData && context) {
        this.contextManager.updateFieldpieceReading(sessionId, {
          timestamp: Date.now(),
          ...fieldpieceData,
        });
      }

      // Get AI response
      const response = await this.aiEngine.respondToMessage(message, sessionId, {
        jobId: context?.jobContext?.jobId,
        customerName: context?.jobContext?.customerName,
        equipmentType: context?.jobContext?.equipmentType,
        fieldpieceReadings: fieldpieceData,
        previousDiagnosis: context?.diagnosis,
      });

      return {
        sessionId,
        userMessage: message,
        agentResponse: response,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Text message handler error:', error);
      throw error;
    }
  }

  async handleVoiceSession(ws: any, sessionId: string): Promise<void> {
    try {
      console.log(`🎙️  Voice session started: ${sessionId}`);

      ws.on('message', async (data: Buffer) => {
        try {
          // Determine message type (audio or JSON)
          if (data[0] === 0x52 && data[1] === 0x49) {
            // RIFF header (WAV file)
            await this.processAudioMessage(ws, data, sessionId);
          } else {
            // JSON message (metadata, fieldpiece data, etc.)
            const json = JSON.parse(data.toString());
            await this.processJsonMessage(ws, json, sessionId);
          }
        } catch (error) {
          console.error('Message processing error:', error);
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Failed to process message',
            })
          );
        }
      });

      ws.on('close', () => {
        console.log(`🎙️  Voice session closed: ${sessionId}`);
        this.contextManager.closeSession(sessionId);
        this.aiEngine.clearSession(sessionId);
      });
    } catch (error) {
      console.error('Voice session error:', error);
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Voice session failed',
        })
      );
    }
  }

  private async processAudioMessage(
    ws: any,
    audioData: Buffer,
    sessionId: string
  ): Promise<void> {
    // Transcribe audio
    const transcript = await this.voiceProcessor.transcribeAudio(audioData);

    // Send partial transcript to client (real-time feedback)
    ws.send(
      JSON.stringify({
        type: 'transcript',
        text: transcript,
        isFinal: true,
      })
    );

    // Get AI response
    const context = this.contextManager.getContext(sessionId);
    const response = await this.aiEngine.respondToMessage(
      transcript,
      sessionId,
      {
        jobId: context?.jobContext?.jobId,
        customerName: context?.jobContext?.customerName,
        equipmentType: context?.jobContext?.equipmentType,
      }
    );

    // Synthesize response to speech
    const audioResponse = await this.voiceProcessor.synthesizeToSpeech(response);

    // Send response (text + audio)
    ws.send(
      JSON.stringify({
        type: 'response',
        text: response,
        audioBase64: audioResponse.toString('base64'),
      })
    );
  }

  private async processJsonMessage(ws: any, json: any, sessionId: string): Promise<void> {
    const { type, data } = json;

    switch (type) {
      case 'init':
        // Initialize session with job/technician context
        const context = this.contextManager.createSession(
          sessionId,
          data.jobContext,
          data.technicianContext
        );
        ws.send(
          JSON.stringify({
            type: 'initialized',
            sessionId,
            context,
          })
        );
        break;

      case 'fieldpiece':
        // Update Fieldpiece readings
        this.contextManager.updateFieldpieceReading(sessionId, data.reading);
        ws.send(
          JSON.stringify({
            type: 'reading_received',
          })
        );
        break;

      case 'text':
        // Handle text message
        const result = await this.handleTextMessage(
          data.message,
          data.jobId,
          data.fieldpieceData,
          sessionId
        );
        ws.send(
          JSON.stringify({
            type: 'response',
            ...result,
          })
        );
        break;

      default:
        ws.send(
          JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${type}`,
          })
        );
    }
  }
}
