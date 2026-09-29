import { EventEmitter } from 'events';
import pino from 'pino';
import { exec } from 'child_process';
import { promisify } from 'util';
import { HardwareInterface } from './HardwareInterface';

const execAsync = promisify(exec);

export interface VoiceConfig {
  wakeWord: string;
  sttEngine: 'whisper' | 'pocketsphinx';
  ttsEngine: 'espeak' | 'google' | 'piper';
  language: string;
  sampleRate: number;
}

export class VoiceAssistant extends EventEmitter {
  private voiceModel: string;
  private logger: pino.Logger;
  private initialized: boolean = false;
  private config: VoiceConfig;
  private isListening: boolean = false;
  private hardware: HardwareInterface | null = null;

  constructor(voiceModel: string, logger: pino.Logger) {
    super();
    this.voiceModel = voiceModel;
    this.logger = logger;
    this.config = {
      wakeWord: 'hey wise',
      sttEngine: 'whisper',
      ttsEngine: 'piper',
      language: 'en-US',
      sampleRate: 16000,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('VoiceAssistant already initialized');
      return;
    }

    try {
      // Check for required tools
      await this.checkDependencies();

      this.initialized = true;
      this.logger.info(this.config, 'VoiceAssistant initialized');

      // Start listening for wake word
      this.startWakeWordDetection();
    } catch (error) {
      this.logger.error(error, 'Failed to initialize VoiceAssistant');
      throw error;
    }
  }

  private async checkDependencies(): Promise<void> {
    const requiredTools = ['arecord', 'aplay'];

    for (const tool of requiredTools) {
      try {
        await execAsync(`which ${tool}`);
      } catch (error) {
        this.logger.warn(
          { tool },
          `Required tool not found: ${tool}. Install with: sudo apt-get install alsa-utils`
        );
      }
    }
  }

  private async startWakeWordDetection(): Promise<void> {
    if (this.isListening || !this.initialized) return;

    this.isListening = true;
    this.logger.info('Starting wake-word detection');

    try {
      // Use pocketsphinx for efficient local wake-word detection
      const command = `pocketsphinx_continuous -dict /usr/share/pocketsphinx/model/en-us/cmudict-en-us.dict -hmm /usr/share/pocketsphinx/model/en-us/en-us -lm /usr/share/pocketsphinx/model/en-us/en-us.lm.bin -keyphrase "${this.config.wakeWord}" -kws_threshold 1e-20`;

      const proc = exec(command, (error, stdout, stderr) => {
        if (error && !error.message.includes('SIGTERM')) {
          this.logger.error(error, 'Wake-word detection error');
        }
      });

      if (proc.stdout) {
        proc.stdout.on('data', (data: Buffer) => {
          const output = data.toString().trim();
          if (output.toLowerCase().includes(this.config.wakeWord)) {
            this.logger.info('Wake word detected');
            this.emit('wake-word');
            this.handleWakeWord();
          }
        });
      }

      // Store process reference for cleanup
      (this as any).wakeWordProcess = proc;
    } catch (error) {
      this.logger.error(error, 'Failed to start wake-word detection');
      this.isListening = false;
    }
  }

  private async handleWakeWord(): Promise<void> {
    try {
      // Play wake-word sound
      await this.playTone('wake');

      // Start listening for command
      const audio = await this.recordAudio(5); // 5 second timeout
      const command = await this.transcribeAudio(audio);

      if (command) {
        this.logger.info({ command }, 'Command transcribed');
        this.emit('command', command);

        // Provide audio feedback
        await this.playTone('ack');
      }
    } catch (error) {
      this.logger.error(error, 'Error handling wake word');
      await this.playTone('error');
    }
  }

  private async recordAudio(timeoutSeconds: number = 5): Promise<Buffer> {
    try {
      const audioFile = `/tmp/voice_${Date.now()}.wav`;

      // Record audio using ALSA
      const command = `arecord -D default -f cd -t wav -d ${timeoutSeconds} ${audioFile}`;
      await execAsync(command);

      // Read the file
      const { stdout } = await execAsync(`cat ${audioFile}`);
      return Buffer.from(stdout);
    } catch (error) {
      this.logger.error(error, 'Failed to record audio');
      throw error;
    }
  }

  private async transcribeAudio(audio: Buffer): Promise<string> {
    try {
      // Save audio to temporary file
      const audioFile = `/tmp/audio_${Date.now()}.wav`;
      const fs = await import('fs').then((m) => m.promises);
      await fs.writeFile(audioFile, audio);

      // Use Whisper for speech-to-text
      const outputFile = `/tmp/transcript_${Date.now()}.txt`;
      const command = `whisper ${audioFile} --model base --language en --output_format txt --output_dir ${outputFile}`;

      try {
        await execAsync(command);
        const transcript = await fs.readFile(outputFile, 'utf-8');
        return transcript.trim();
      } catch (whisperError) {
        // Fallback to pocketsphinx if whisper not available
        this.logger.warn(
          'Whisper not available, falling back to pocketsphinx'
        );
        return await this.transcribeWithPocketsphinx(audioFile);
      }
    } catch (error) {
      this.logger.error(error, 'Failed to transcribe audio');
      throw error;
    }
  }

  private async transcribeWithPocketsphinx(audioFile: string): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `pocketsphinx_batch -samprate 16000 -logfn /dev/null -infile ${audioFile}`
      );
      return stdout.trim();
    } catch (error) {
      this.logger.error(error, 'Pocketsphinx transcription failed');
      return '';
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('VoiceAssistant not initialized');
    }

    try {
      const audioFile = `/tmp/speech_${Date.now()}.wav`;

      // Use piper for fast TTS
      const command = `echo "${text}" | piper --model en_US-hfc_female-medium --output_file ${audioFile}`;

      try {
        await execAsync(command);
        await this.playAudio(audioFile);
      } catch (piperError) {
        // Fallback to espeak
        this.logger.warn('Piper not available, falling back to espeak');
        await execAsync(`espeak -a 200 "${text}"`);
      }

      this.logger.info({ text }, 'Text spoken');
    } catch (error) {
      this.logger.error(error, 'Failed to speak text');
      throw error;
    }
  }

  private async playTone(type: 'wake' | 'ack' | 'error'): Promise<void> {
    try {
      const frequency = type === 'wake' ? 800 : type === 'ack' ? 1000 : 600;
      const duration = 100; // milliseconds

      // Generate tone using ffmpeg or sox
      const command = `ffmpeg -f lavfi -i sine=f=${frequency}:d=${duration / 1000} -q:a 9 -acodec libmp3lame /tmp/tone_${Date.now()}.mp3 -y`;

      try {
        await execAsync(command);
      } catch (ffmpegError) {
        // Fallback: use speaker-test
        await execAsync(`speaker-test -t sine -f ${frequency} -l 1`);
      }
    } catch (error) {
      this.logger.debug({ type }, 'Could not play tone');
    }
  }

  private async playAudio(audioFile: string): Promise<void> {
    try {
      await execAsync(`aplay ${audioFile}`);
    } catch (error) {
      this.logger.error(error, 'Failed to play audio');
      throw error;
    }
  }

  getConfig(): VoiceConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info(this.config, 'Voice config updated');
  }

  isListeningForWakeWord(): boolean {
    return this.isListening;
  }

  async stopListening(): Promise<void> {
    if (!this.isListening) return;

    try {
      const proc = (this as any).wakeWordProcess;
      if (proc) {
        proc.kill();
        (this as any).wakeWordProcess = null;
      }
      this.isListening = false;
      this.logger.info('Stopped listening for wake word');
    } catch (error) {
      this.logger.error(error, 'Error stopping wake-word detection');
    }
  }

  async shutdown(): Promise<void> {
    try {
      await this.stopListening();
      this.initialized = false;
      this.logger.info('VoiceAssistant shut down');
    } catch (error) {
      this.logger.error(error, 'Error during VoiceAssistant shutdown');
      throw error;
    }
  }
}
