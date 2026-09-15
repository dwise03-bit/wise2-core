import { Injectable, Logger } from '@nestjs/common';

export interface VoiceCommand {
  commandId: string;
  timestamp: Date;
  speaker: 'technician' | 'supervisor';
  intent: string;
  parameters?: Record<string, any>;
  confidence: number;
  rawText: string;
}

export interface VoiceResponse {
  responseId: string;
  commandId: string;
  type: 'text' | 'audio' | 'action';
  content: string;
  audioUrl?: string;
}

export interface ASRResult {
  text: string;
  confidence: number;
  alternatives: string[];
}

@Injectable()
export class VoiceCommandService {
  private readonly logger = new Logger(VoiceCommandService.name);
  private commandHistory: Map<string, VoiceCommand[]> = new Map();
  private supportedCommands = [
    'start_stream',
    'stop_stream',
    'take_screenshot',
    'start_recording',
    'stop_recording',
    'add_annotation',
    'send_guidance',
    'detect_damage',
    'show_stats',
    'call_supervisor',
  ];

  /**
   * Process voice input from technician or supervisor
   */
  async processVoiceCommand(
    audioData: Buffer,
    speaker: 'technician' | 'supervisor',
    jobId: string
  ): Promise<VoiceCommand> {
    try {
      // Step 1: Convert audio to text (ASR)
      const asrResult = await this.speechToText(audioData);

      // Step 2: Parse intent and parameters
      const { intent, parameters, confidence } = this.parseIntent(asrResult.text, speaker);

      const command: VoiceCommand = {
        commandId: `cmd-${jobId}-${Date.now()}`,
        timestamp: new Date(),
        speaker,
        intent,
        parameters,
        confidence,
        rawText: asrResult.text,
      };

      // Store in history
      if (!this.commandHistory.has(jobId)) {
        this.commandHistory.set(jobId, []);
      }
      this.commandHistory.get(jobId)!.push(command);

      this.logger.log(`Voice command recognized: ${intent} (confidence: ${confidence.toFixed(2)})`);

      return command;
    } catch (error) {
      this.logger.error(`Voice processing failed: ${error}`);
      throw error;
    }
  }

  /**
   * Execute voice command
   */
  async executeCommand(command: VoiceCommand): Promise<VoiceResponse> {
    this.logger.log(`Executing command: ${command.intent}`);

    const responseId = `resp-${command.commandId}`;
    let response: VoiceResponse;

    switch (command.intent) {
      case 'start_stream':
        response = {
          responseId,
          commandId: command.commandId,
          type: 'action',
          content: 'Starting video stream...',
        };
        break;

      case 'stop_stream':
        response = {
          responseId,
          commandId: command.commandId,
          type: 'action',
          content: 'Stopping video stream',
        };
        break;

      case 'start_recording':
        response = {
          responseId,
          commandId: command.commandId,
          type: 'action',
          content: 'Recording started',
        };
        break;

      case 'stop_recording':
        response = {
          responseId,
          commandId: command.commandId,
          type: 'action',
          content: 'Recording stopped and saved',
        };
        break;

      case 'add_annotation':
        response = {
          responseId,
          commandId: command.commandId,
          type: 'action',
          content: `Adding ${command.parameters?.type || 'annotation'} to stream`,
        };
        break;

      case 'detect_damage':
        response = {
          responseId,
          commandId: command.commandId,
          type: 'action',
          content: 'Running damage detection analysis',
        };
        break;

      case 'show_stats':
        response = {
          responseId,
          commandId: command.commandId,
          type: 'text',
          content: 'Displaying stream statistics',
        };
        break;

      case 'send_guidance':
        response = {
          responseId,
          commandId: command.commandId,
          type: 'action',
          content: 'Sending voice guidance to technician',
        };
        break;

      default:
        response = {
          responseId,
          commandId: command.commandId,
          type: 'text',
          content: `Command recognized: ${command.intent}`,
        };
    }

    return response;
  }

  /**
   * Convert speech to text using ASR
   */
  private async speechToText(audioData: Buffer): Promise<ASRResult> {
    try {
      // In production: call Google Cloud Speech-to-Text, AWS Transcribe, or local Whisper
      // For demo: simulate
      const demoText = this.simulateSpeechRecognition(audioData);

      return {
        text: demoText,
        confidence: 0.92,
        alternatives: [],
      };
    } catch (error) {
      this.logger.error(`ASR failed: ${error}`);
      throw error;
    }
  }

  /**
   * Parse voice text into intent and parameters
   */
  private parseIntent(
    text: string,
    speaker: 'technician' | 'supervisor'
  ): { intent: string; parameters?: Record<string, any>; confidence: number } {
    const lowerText = text.toLowerCase();

    // Command matching patterns
    const patterns: Record<string, string> = {
      'start.*stream|begin.*video': 'start_stream',
      'stop.*stream|end.*video': 'stop_stream',
      'record|start.*record': 'start_recording',
      'stop.*record': 'stop_recording',
      'add.*annotation|draw': 'add_annotation',
      'detect.*damage|analyze': 'detect_damage',
      'show.*stats|display.*metrics': 'show_stats',
      'send.*guidance|tell.*technician': 'send_guidance',
      'call.*supervisor|need.*help': 'call_supervisor',
    };

    let matchedIntent = 'unknown';
    let confidence = 0.5;

    for (const [pattern, intent] of Object.entries(patterns)) {
      const regex = new RegExp(pattern);
      if (regex.test(lowerText)) {
        matchedIntent = intent;
        confidence = 0.95;
        break;
      }
    }

    // Extract parameters if available
    const parameters: Record<string, any> = {};

    if (matchedIntent === 'add_annotation') {
      if (/circle/.test(lowerText)) parameters.type = 'circle';
      if (/arrow|arrow/.test(lowerText)) parameters.type = 'arrow';
      if (/rectangle|box/.test(lowerText)) parameters.type = 'rectangle';
      if (/red/.test(lowerText)) parameters.color = '#FF0000';
      if (/yellow/.test(lowerText)) parameters.color = '#FFFF00';
    }

    return {
      intent: matchedIntent,
      parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
      confidence,
    };
  }

  /**
   * Simulate speech recognition for demo
   */
  private simulateSpeechRecognition(audioData: Buffer): string {
    // In production: real ASR. In demo/test mode, preserve recognizable input text
    // so command parsing is deterministic instead of randomly changing intent.
    const suppliedText = audioData.toString('utf8').trim();
    if (suppliedText && /^[\x20-\x7E]+$/.test(suppliedText)) {
      return suppliedText;
    }

    const demoCommands = [
      'start stream',
      'stop stream',
      'start recording',
      'stop recording',
      'add circle annotation',
      'detect damage',
      'show statistics',
    ];

    return demoCommands[Math.floor(Math.random() * demoCommands.length)];
  }

  /**
   * Text-to-speech for supervisor guidance
   */
  async textToSpeech(text: string): Promise<Buffer> {
    try {
      // In production: call Google Cloud TTS, AWS Polly, or local TTS
      // For demo: placeholder

      this.logger.log(`Generating speech for: ${text}`);

      // Return empty buffer for demo
      return Buffer.from('audio-placeholder');
    } catch (error) {
      this.logger.error(`TTS failed: ${error}`);
      throw error;
    }
  }

  /**
   * Get command history for job
   */
  getCommandHistory(jobId: string, limit: number = 50): VoiceCommand[] {
    const history = this.commandHistory.get(jobId) || [];
    return history.slice(-limit);
  }

  /**
   * Get supported commands
   */
  getSupportedCommands(): string[] {
    return this.supportedCommands;
  }

  /**
   * Clear history for job
   */
  clearHistory(jobId: string): boolean {
    if (this.commandHistory.has(jobId)) {
      this.commandHistory.delete(jobId);
      return true;
    }
    return false;
  }
}
