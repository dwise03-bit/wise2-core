import { Injectable, Logger } from '@nestjs/common';
import { OsDetectorService } from './os-detector.service';
import { SetupWizardStepDto, SetupWizardProgressDto } from './setup.types';

@Injectable()
export class SetupWizardService {
  private readonly logger = new Logger(SetupWizardService.name);

  private readonly steps: SetupWizardStepDto[] = [
    {
      stepId: 'system-detection',
      name: 'System Detection',
      description: 'Detecting your operating system and architecture',
      completed: false,
      optional: false,
    },
    {
      stepId: 'autokey-generation',
      name: 'SSH Key Generation',
      description: 'Generating ED25519 SSH keys for secure authentication',
      completed: false,
      optional: false,
    },
    {
      stepId: 'autokey-installation',
      name: 'SSH Key Installation',
      description: 'Installing SSH keys to your system',
      completed: false,
      optional: true,
    },
    {
      stepId: 'environment-setup',
      name: 'Environment Setup',
      description: 'Configuring environment variables',
      completed: false,
      optional: true,
    },
    {
      stepId: 'deployment-config',
      name: 'Deployment Configuration',
      description: 'Setting up deployment configuration',
      completed: false,
      optional: true,
    },
  ];

  constructor(private osDetectorService: OsDetectorService) {}

  getInitialProgress(): SetupWizardProgressDto {
    const systemInfo = this.osDetectorService.getSystemInfo();
    const stepsClone = JSON.parse(JSON.stringify(this.steps));

    // Mark system detection as completed since we just did it
    const systemDetectionStep = stepsClone.find((s: SetupWizardStepDto) => s.stepId === 'system-detection');
    if (systemDetectionStep) {
      systemDetectionStep.completed = true;
    }

    this.logger.log(
      `Setup wizard initialized for ${systemInfo.os} (${systemInfo.architecture}) on Node ${systemInfo.nodeVersion}`,
    );

    return {
      currentStep: 1,
      totalSteps: stepsClone.length,
      steps: stepsClone,
      completionPercentage: this.calculateCompletionPercentage(stepsClone),
      systemInfo,
    };
  }

  completeStep(stepId: string, progress: SetupWizardProgressDto): SetupWizardProgressDto {
    const step = progress.steps.find((s) => s.stepId === stepId);

    if (step) {
      step.completed = true;
      this.logger.log(`Step completed: ${step.name}`);
    }

    // Move to next incomplete required step
    let nextStep = progress.currentStep;
    for (let i = progress.currentStep; i < progress.steps.length; i++) {
      if (!progress.steps[i].completed && !progress.steps[i].optional) {
        nextStep = i + 1;
        break;
      }
    }

    return {
      ...progress,
      currentStep: nextStep,
      completionPercentage: this.calculateCompletionPercentage(progress.steps),
    };
  }

  skipOptionalStep(stepId: string, progress: SetupWizardProgressDto): SetupWizardProgressDto {
    const step = progress.steps.find((s) => s.stepId === stepId);

    if (step && step.optional) {
      // Move to next step without marking as completed
      let nextStep = progress.currentStep;
      for (let i = progress.currentStep; i < progress.steps.length; i++) {
        if (!progress.steps[i].completed && !progress.steps[i].optional) {
          nextStep = i + 1;
          break;
        }
      }

      this.logger.log(`Step skipped: ${step.name}`);

      return {
        ...progress,
        currentStep: nextStep,
        completionPercentage: this.calculateCompletionPercentage(progress.steps),
      };
    }

    return progress;
  }

  isSetupComplete(progress: SetupWizardProgressDto): boolean {
    // All required steps must be completed
    return progress.steps.every((s) => !s.optional || s.completed || s.completed);
  }

  getRecommendedSteps(systemInfo: any): string[] {
    const recommended: string[] = [];

    // All systems should complete autokey setup
    recommended.push('autokey-generation', 'autokey-installation');

    // Linux systems might need additional configuration
    if (systemInfo.os === 'linux') {
      recommended.push('environment-setup', 'deployment-config');
    }

    // macOS might need Homebrew setup
    if (systemInfo.os === 'macos') {
      recommended.push('environment-setup');
    }

    return recommended;
  }

  private calculateCompletionPercentage(steps: SetupWizardStepDto[]): number {
    const completedCount = steps.filter((s) => s.completed).length;
    return Math.round((completedCount / steps.length) * 100);
  }
}
