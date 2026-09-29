import { EventEmitter } from 'events';
import pino from 'pino';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GPIOPin {
  pin: number;
  mode: 'in' | 'out';
  value: boolean;
}

export interface CameraConfig {
  device: string;
  resolution: string;
  fps: number;
  format: string;
}

export interface MicrophoneConfig {
  device: string;
  sampleRate: number;
  channels: number;
  format: string;
}

export class HardwareInterface extends EventEmitter {
  private logger: pino.Logger;
  private initialized: boolean = false;
  private gpioMap: Map<number, GPIOPin> = new Map();
  private cameraConfig: CameraConfig | null = null;
  private microphoneConfig: MicrophoneConfig | null = null;
  private isRaspberryPi: boolean = false;

  constructor(logger: pino.Logger) {
    super();
    this.logger = logger;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('HardwareInterface already initialized');
      return;
    }

    try {
      // Detect if running on Raspberry Pi
      await this.detectPlatform();

      // Initialize GPIO
      await this.initializeGPIO();

      // Initialize camera
      await this.initializeCamera();

      // Initialize microphone
      await this.initializeMicrophone();

      this.initialized = true;
      this.logger.info('HardwareInterface initialized');
    } catch (error) {
      this.logger.error(error, 'Failed to initialize HardwareInterface');
      // Don't throw - allow graceful degradation
      this.logger.warn(
        'HardwareInterface running in degraded mode (hardware unavailable)'
      );
    }
  }

  private async detectPlatform(): Promise<void> {
    try {
      const { stdout } = await execAsync('cat /etc/os-release');
      this.isRaspberryPi =
        stdout.includes('Raspberry Pi') || stdout.includes('raspbian');
      this.logger.info(
        { isRaspberryPi: this.isRaspberryPi },
        'Platform detected'
      );
    } catch (error) {
      this.logger.debug('Not running on Raspberry Pi, using mock hardware');
      this.isRaspberryPi = false;
    }
  }

  private async initializeGPIO(): Promise<void> {
    if (!this.isRaspberryPi) {
      this.logger.debug('GPIO initialization skipped (not on RPi)');
      return;
    }

    try {
      // Check if GPIO is accessible
      await execAsync('gpio -v');
      this.logger.info('GPIO available via WiringPi');
    } catch (error) {
      this.logger.warn('GPIO not available, running in software simulation mode');
    }
  }

  private async initializeCamera(): Promise<void> {
    if (!this.isRaspberryPi) {
      this.logger.debug('Camera initialization skipped (not on RPi)');
      return;
    }

    try {
      // Check for camera device
      const { stdout } = await execAsync('ls /dev/video*');
      if (stdout) {
        this.cameraConfig = {
          device: '/dev/video0',
          resolution: '1920x1080',
          fps: 30,
          format: 'MJPEG',
        };
        this.logger.info(this.cameraConfig, 'Camera detected');
      }
    } catch (error) {
      this.logger.debug('Camera not available');
    }
  }

  private async initializeMicrophone(): Promise<void> {
    if (!this.isRaspberryPi) {
      this.logger.debug('Microphone initialization skipped (not on RPi)');
      return;
    }

    try {
      // Check for audio device
      const { stdout } = await execAsync('arecord -l');
      if (stdout) {
        this.microphoneConfig = {
          device: 'hw:0,0',
          sampleRate: 16000,
          channels: 1,
          format: 'S16_LE',
        };
        this.logger.info(this.microphoneConfig, 'Microphone detected');
      }
    } catch (error) {
      this.logger.debug('Microphone not available');
    }
  }

  async setGPIO(pin: number, mode: 'in' | 'out', value?: boolean): Promise<void> {
    if (!this.initialized) {
      throw new Error('HardwareInterface not initialized');
    }

    try {
      const gpioPin: GPIOPin = { pin, mode, value: value || false };

      if (this.isRaspberryPi) {
        // Use actual GPIO control
        await execAsync(`gpio mode ${pin} ${mode === 'out' ? 'out' : 'in'}`);
        if (mode === 'out' && value !== undefined) {
          await execAsync(`gpio write ${pin} ${value ? 1 : 0}`);
        }
      }

      this.gpioMap.set(pin, gpioPin);
      this.logger.info({ pin, mode, value }, 'GPIO pin set');
      this.emit('gpio:set', gpioPin);
    } catch (error) {
      this.logger.error(error, 'Failed to set GPIO pin');
      throw error;
    }
  }

  async getGPIO(pin: number): Promise<boolean> {
    if (!this.initialized) {
      throw new Error('HardwareInterface not initialized');
    }

    try {
      if (this.isRaspberryPi) {
        const { stdout } = await execAsync(`gpio read ${pin}`);
        return stdout.trim() === '1';
      }

      // Return cached value for non-RPi environments
      const gpioPin = this.gpioMap.get(pin);
      return gpioPin?.value || false;
    } catch (error) {
      this.logger.error(error, 'Failed to read GPIO pin');
      throw error;
    }
  }

  async captureImage(filename?: string): Promise<Buffer> {
    if (!this.initialized || !this.cameraConfig) {
      throw new Error('Camera not available');
    }

    try {
      const outputFile = filename || `/tmp/capture_${Date.now()}.jpg`;

      await execAsync(
        `libcamera-still -o ${outputFile} --width 1920 --height 1080 --timeout 1000`
      );

      const { stdout } = await execAsync(`cat ${outputFile}`);
      this.logger.info({ filename: outputFile }, 'Image captured');
      return Buffer.from(stdout);
    } catch (error) {
      this.logger.error(error, 'Failed to capture image');
      throw error;
    }
  }

  async startVideoStream(duration: number = 30): Promise<string> {
    if (!this.initialized || !this.cameraConfig) {
      throw new Error('Camera not available');
    }

    try {
      const outputFile = `/tmp/video_${Date.now()}.h264`;

      const command = `libcamera-vid -o ${outputFile} --width 1920 --height 1080 --framerate 30 --timeout ${duration * 1000}`;

      const { stdout } = await execAsync(command);
      this.logger.info({ outputFile, duration }, 'Video stream captured');
      return outputFile;
    } catch (error) {
      this.logger.error(error, 'Failed to capture video');
      throw error;
    }
  }

  async recordAudio(
    duration: number = 10,
    filename?: string
  ): Promise<string> {
    if (!this.initialized || !this.microphoneConfig) {
      throw new Error('Microphone not available');
    }

    try {
      const outputFile = filename || `/tmp/audio_${Date.now()}.wav`;

      const command = `arecord -D hw:0,0 -f cd -t wav -d ${duration} ${outputFile}`;

      await execAsync(command);
      this.logger.info({ outputFile, duration }, 'Audio recorded');
      return outputFile;
    } catch (error) {
      this.logger.error(error, 'Failed to record audio');
      throw error;
    }
  }

  async playAudio(filename: string, device?: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('HardwareInterface not initialized');
    }

    try {
      const dev = device || 'default';
      const command = `aplay -D ${dev} ${filename}`;
      await execAsync(command);
      this.logger.info({ filename }, 'Audio played');
    } catch (error) {
      this.logger.error(error, 'Failed to play audio');
      throw error;
    }
  }

  async getPinStatus(pin: number): Promise<GPIOPin | null> {
    return this.gpioMap.get(pin) || null;
  }

  getAllPins(): GPIOPin[] {
    return Array.from(this.gpioMap.values());
  }

  getCameraConfig(): CameraConfig | null {
    return this.cameraConfig;
  }

  getMicrophoneConfig(): MicrophoneConfig | null {
    return this.microphoneConfig;
  }

  isRaspberryPiPlatform(): boolean {
    return this.isRaspberryPi;
  }

  async shutdown(): Promise<void> {
    try {
      // Reset all GPIO pins
      for (const [pin] of this.gpioMap) {
        try {
          await execAsync(`gpio mode ${pin} in`);
        } catch (error) {
          this.logger.debug(
            { pin },
            'Could not reset GPIO pin during shutdown'
          );
        }
      }

      this.gpioMap.clear();
      this.initialized = false;
      this.logger.info('HardwareInterface shut down');
    } catch (error) {
      this.logger.error(error, 'Error during HardwareInterface shutdown');
      throw error;
    }
  }
}
