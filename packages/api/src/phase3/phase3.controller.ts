import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { DamageDetectionService, DamageDetectionResult } from '../ml/damage-detection.service';
import { AREngineService, ARScene } from '../ar/ar-engine.service';
import { VoiceCommandService, VoiceCommand } from '../voice/voice-command.service';
import { ModelTrainingService, TrainingJob } from '../ml/model-training.service';

@Controller('jobs/:jobId/phase3')
@UseGuards(JwtAuthGuard)
export class Phase3Controller {
  constructor(
    private readonly damageDetection: DamageDetectionService,
    private readonly arEngine: AREngineService,
    private readonly voiceCommand: VoiceCommandService,
    private readonly modelTraining: ModelTrainingService
  ) {}

  /**
   * Detect damage from image
   * POST /jobs/:jobId/phase3/detect
   */
  @Post('detect')
  async detectDamage(
    @Param('jobId') jobId: string,
    @Body('image') imageData: string
  ): Promise<DamageDetectionResult> {
    const detection = await this.damageDetection.detectDamage(imageData, jobId);

    // Auto-add detection box to AR scene
    const scene = this.arEngine.getARState(jobId);
    if (scene && detection.location) {
      this.arEngine.addDetectionBox(
        jobId,
        detection.classification,
        {
          x: detection.location.x,
          y: detection.location.y,
          w: detection.location.width,
          h: detection.location.height,
        },
        detection.confidence
      );
    }

    return detection;
  }

  /**
   * Analyze entire recording for damage
   * POST /jobs/:jobId/phase3/analyze-recording
   */
  @Post('analyze-recording')
  async analyzeRecording(
    @Param('jobId') jobId: string,
    @Body('recordingPath') recordingPath: string
  ): Promise<DamageDetectionResult[]> {
    return this.damageDetection.analyzeRecording(recordingPath, jobId);
  }

  /**
   * Initialize AR scene
   * POST /jobs/:jobId/phase3/ar/init
   */
  @Post('ar/init')
  async initARScene(
    @Param('jobId') jobId: string,
    @Body('cameraFeedUrl') cameraFeedUrl: string
  ): Promise<ARScene> {
    return this.arEngine.createARScene(jobId, cameraFeedUrl);
  }

  /**
   * Get AR state
   * GET /jobs/:jobId/phase3/ar/state
   */
  @Get('ar/state')
  async getARState(@Param('jobId') jobId: string): Promise<ARScene | null> {
    return this.arEngine.getARState(jobId);
  }

  /**
   * Clear AR scene
   * POST /jobs/:jobId/phase3/ar/clear
   */
  @Post('ar/clear')
  async clearARScene(@Param('jobId') jobId: string): Promise<{ success: boolean }> {
    const success = this.arEngine.clearScene(jobId);
    return { success };
  }

  /**
   * Process voice command
   * POST /jobs/:jobId/phase3/voice/command
   */
  @Post('voice/command')
  async processVoiceCommand(
    @Param('jobId') jobId: string,
    @Body('audioData') audioData: string,
    @Body('speaker') speaker: 'technician' | 'supervisor',
    @Req() req: any
  ): Promise<VoiceCommand> {
    const audioBuffer = Buffer.from(audioData, 'base64');
    return this.voiceCommand.processVoiceCommand(audioBuffer, speaker, jobId);
  }

  /**
   * Execute voice command
   * POST /jobs/:jobId/phase3/voice/execute
   */
  @Post('voice/execute')
  async executeCommand(
    @Param('jobId') jobId: string,
    @Body('commandId') commandId: string
  ): Promise<any> {
    // Fetch command from history and execute
    const history = this.voiceCommand.getCommandHistory(jobId, 1);
    if (history.length > 0) {
      return this.voiceCommand.executeCommand(history[0]);
    }
    return { error: 'Command not found' };
  }

  /**
   * Get voice command history
   * GET /jobs/:jobId/phase3/voice/history
   */
  @Get('voice/history')
  async getVoiceHistory(@Param('jobId') jobId: string): Promise<VoiceCommand[]> {
    return this.voiceCommand.getCommandHistory(jobId);
  }

  /**
   * Get supported voice commands
   * GET /phase3/voice/commands
   */
  @Get('../phase3/voice/commands')
  async getSupportedCommands(): Promise<string[]> {
    return this.voiceCommand.getSupportedCommands();
  }

  /**
   * Get available ML models
   * GET /phase3/models
   */
  @Get('../phase3/models')
  async getAvailableModels() {
    return this.damageDetection.getAvailableModels();
  }

  /**
   * Switch ML model (edge/cloud)
   * POST /phase3/models/switch
   */
  @Post('../phase3/models/switch')
  async switchModel(
    @Body('modelName') modelName: string,
    @Body('edge') edge: boolean = false
  ): Promise<{ success: boolean; model: string }> {
    const success = await this.damageDetection.switchModel(modelName, edge);
    return { success, model: modelName };
  }

  /**
   * Start training custom model
   * POST /phase3/models/train
   */
  @Post('../phase3/models/train')
  async startTraining(
    @Body('dataset') dataset: string,
    @Body('epochs') epochs: number = 50
  ): Promise<{ jobId: string; status: string }> {
    const jobId = await this.damageDetection.startTraining(dataset, epochs);
    return { jobId, status: 'training' };
  }

  /**
   * Get training status
   * GET /phase3/models/train/:jobId
   */
  @Get('../phase3/models/train/:trainingJobId')
  async getTrainingStatus(@Param('trainingJobId') trainingJobId: string) {
    return this.damageDetection.getTrainingStatus(trainingJobId);
  }

  /**
   * Start model training (new training service)
   * POST /phase3/training/start
   */
  @Post('../phase3/training/start')
  async startModelTraining(
    @Body('dataset') dataset: string,
    @Body('epochs') epochs: number = 50,
    @Body('batchSize') batchSize: number = 16,
    @Body('learningRate') learningRate: number = 0.001
  ): Promise<TrainingJob> {
    return this.modelTraining.startTraining(dataset, epochs, batchSize, learningRate);
  }

  /**
   * Get training job status
   * GET /phase3/training/:jobId
   */
  @Get('../phase3/training/:jobId')
  async getTrainingJobStatus(@Param('jobId') jobId: string) {
    return this.modelTraining.getTrainingStatus(jobId);
  }

  /**
   * List all training jobs
   * GET /phase3/training/list
   */
  @Get('../phase3/training/list')
  async listTrainingJobs() {
    return this.modelTraining.listTrainingJobs();
  }

  /**
   * Cancel training job
   * POST /phase3/training/:jobId/cancel
   */
  @Post('../phase3/training/:jobId/cancel')
  async cancelTraining(@Param('jobId') jobId: string): Promise<{ success: boolean }> {
    const success = this.modelTraining.cancelTraining(jobId);
    return { success };
  }

  /**
   * Export trained model
   * POST /phase3/training/:jobId/export
   */
  @Post('../phase3/training/:jobId/export')
  async exportModel(
    @Param('jobId') jobId: string,
    @Body('outputPath') outputPath: string
  ): Promise<{ success: boolean; path?: string }> {
    const success = await this.modelTraining.exportModel(jobId, outputPath);
    return { success, path: success ? outputPath : undefined };
  }

  /**
   * Prepare dataset for training
   * POST /phase3/training/prepare-dataset
   */
  @Post('../phase3/training/prepare-dataset')
  async prepareDataset(
    @Body('imagePath') imagePath: string,
    @Body('labelPath') labelPath: string,
    @Body('trainSplit') trainSplit: number = 0.8
  ): Promise<{ datasetPath: string }> {
    const datasetPath = await this.modelTraining.prepareDataset(imagePath, labelPath, trainSplit);
    return { datasetPath };
  }
}
