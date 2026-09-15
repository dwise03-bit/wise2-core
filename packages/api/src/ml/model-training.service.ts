import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

export interface TrainingJob {
  jobId: string;
  datasetPath: string;
  epochs: number;
  batchSize: number;
  learningRate: number;
  status: 'queued' | 'training' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  modelPath?: string;
  metrics?: {
    loss: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
  };
}

@Injectable()
export class ModelTrainingService {
  private readonly logger = new Logger(ModelTrainingService.name);
  private trainingSessions: Map<string, TrainingJob> = new Map();
  private pythonScriptPath = path.join(__dirname, '../../../scripts/train-yolo.py');

  /**
   * Start YOLO model training on HVAC dataset
   */
  async startTraining(
    datasetPath: string,
    epochs: number = 50,
    batchSize: number = 16,
    learningRate: number = 0.001
  ): Promise<TrainingJob> {
    const jobId = `train-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job: TrainingJob = {
      jobId,
      datasetPath,
      epochs,
      batchSize,
      learningRate,
      status: 'queued',
      progress: 0,
      startedAt: new Date(),
    };

    this.trainingSessions.set(jobId, job);
    this.logger.log(`Training job queued: ${jobId}`);

    // Start training in background
    setImmediate(() => this.executeTraining(job));

    return job;
  }

  /**
   * Execute training process
   */
  private executeTraining(job: TrainingJob): void {
    const args = [
      this.pythonScriptPath,
      '--dataset', job.datasetPath,
      '--epochs', job.epochs.toString(),
      '--batch-size', job.batchSize.toString(),
      '--learning-rate', job.learningRate.toString(),
      '--output-dir', path.join('/tmp', job.jobId),
    ];

    const process = spawn('python3', args);
    let outputBuffer = '';

    process.stdout?.on('data', (data) => {
      const text = data.toString();
      outputBuffer += text;
      this.parseTrainingProgress(job, text);
    });

    process.stderr?.on('data', (data) => {
      this.logger.error(`Training error (${job.jobId}): ${data}`);
    });

    process.on('close', (code) => {
      if (code === 0) {
        job.status = 'completed';
        job.progress = 100;
        job.completedAt = new Date();
        job.modelPath = path.join('/tmp', job.jobId, 'best_model.pt');
        this.logger.log(`Training completed: ${job.jobId}`);
      } else {
        job.status = 'failed';
        this.logger.error(`Training failed with code ${code}: ${job.jobId}`);
      }
    });
  }

  /**
   * Parse training progress from stdout
   */
  private parseTrainingProgress(job: TrainingJob, output: string): void {
    // Pattern: "Epoch 10/50 - loss: 0.234, accuracy: 0.892"
    const epochMatch = output.match(/Epoch (\d+)\/(\d+)/);
    if (epochMatch) {
      const current = parseInt(epochMatch[1]);
      const total = parseInt(epochMatch[2]);
      job.progress = (current / total) * 100;
      job.status = 'training';
    }

    // Parse metrics
    const lossMatch = output.match(/loss:\s*([\d.]+)/);
    const accMatch = output.match(/accuracy:\s*([\d.]+)/);
    const precMatch = output.match(/precision:\s*([\d.]+)/);
    const recMatch = output.match(/recall:\s*([\d.]+)/);
    const f1Match = output.match(/f1:\s*([\d.]+)/);

    if (lossMatch || accMatch || precMatch || recMatch || f1Match) {
      if (!job.metrics) job.metrics = { loss: 0, accuracy: 0, precision: 0, recall: 0, f1: 0 };
      if (lossMatch) job.metrics.loss = parseFloat(lossMatch[1]);
      if (accMatch) job.metrics.accuracy = parseFloat(accMatch[1]);
      if (precMatch) job.metrics.precision = parseFloat(precMatch[1]);
      if (recMatch) job.metrics.recall = parseFloat(recMatch[1]);
      if (f1Match) job.metrics.f1 = parseFloat(f1Match[1]);
    }
  }

  /**
   * Get training job status
   */
  getTrainingStatus(jobId: string): TrainingJob | null {
    return this.trainingSessions.get(jobId) || null;
  }

  /**
   * List all training jobs
   */
  listTrainingJobs(): TrainingJob[] {
    return Array.from(this.trainingSessions.values());
  }

  /**
   * Cancel training job
   */
  cancelTraining(jobId: string): boolean {
    const job = this.trainingSessions.get(jobId);
    if (job && job.status === 'training') {
      job.status = 'failed';
      return true;
    }
    return false;
  }

  /**
   * Export trained model
   */
  async exportModel(jobId: string, outputPath: string): Promise<boolean> {
    const job = this.trainingSessions.get(jobId);
    if (!job || !job.modelPath || job.status !== 'completed') {
      return false;
    }

    try {
      const modelBuffer = await fs.readFile(job.modelPath);
      await fs.writeFile(outputPath, modelBuffer);
      this.logger.log(`Model exported: ${jobId} → ${outputPath}`);
      return true;
    } catch (error) {
      this.logger.error(`Export failed: ${error}`);
      return false;
    }
  }

  /**
   * Create YOLO dataset structure from images
   */
  async prepareDataset(
    imagePath: string,
    labelPath: string,
    trainSplit: number = 0.8
  ): Promise<string> {
    const datasetRoot = path.join('/tmp', `dataset-${Date.now()}`);

    // Create directory structure
    await fs.mkdir(path.join(datasetRoot, 'images/train'), { recursive: true });
    await fs.mkdir(path.join(datasetRoot, 'images/val'), { recursive: true });
    await fs.mkdir(path.join(datasetRoot, 'labels/train'), { recursive: true });
    await fs.mkdir(path.join(datasetRoot, 'labels/val'), { recursive: true });

    // Create YAML config
    const datasetYaml = `
path: ${datasetRoot}
train: images/train
val: images/val
nc: 3
names: ['working', 'broken', 'needs_maintenance']
`;

    await fs.writeFile(path.join(datasetRoot, 'data.yaml'), datasetYaml);

    this.logger.log(`Dataset prepared: ${datasetRoot}`);
    return datasetRoot;
  }
}
