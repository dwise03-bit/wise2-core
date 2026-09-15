import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { SetupWizardService } from './setup-wizard.service';
import { AutoKeyInstallerService } from './autokey-installer.service';
import { OsDetectorService } from './os-detector.service';
import { AutoKeyInstallRequestDto, SetupWizardProgressDto } from './setup.types';

@Controller('v1/setup')
export class SetupController {
  private wizardProgress: Map<string, SetupWizardProgressDto> = new Map();

  constructor(
    private setupWizardService: SetupWizardService,
    private autoKeyInstallerService: AutoKeyInstallerService,
    private osDetectorService: OsDetectorService,
  ) {}

  @Get('system-info')
  getSystemInfo() {
    try {
      const systemInfo = this.osDetectorService.getSystemInfo();
      return {
        success: true,
        data: systemInfo,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to detect system info';
      throw new BadRequestException(message);
    }
  }

  @Get('wizard/init')
  initializeWizard() {
    try {
      const progress = this.setupWizardService.getInitialProgress();
      const sessionId = this.generateSessionId();
      this.wizardProgress.set(sessionId, progress);

      return {
        success: true,
        sessionId,
        progress,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialize wizard';
      throw new BadRequestException(message);
    }
  }

  @Post('wizard/:sessionId/autokey')
  async installAutoKey(
    @Body() request: AutoKeyInstallRequestDto,
  ) {
    try {
      const result = await this.autoKeyInstallerService.installAutoKey(request);
      return {
        success: result.success,
        data: result,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to install autokey';
      throw new BadRequestException(message);
    }
  }

  @Post('wizard/:sessionId/complete-step')
  completeStep(
    @Body() body: { sessionId: string; stepId: string },
  ) {
    try {
      const progress = this.wizardProgress.get(body.sessionId);
      if (!progress) {
        throw new Error('Invalid session ID');
      }

      const updatedProgress = this.setupWizardService.completeStep(body.stepId, progress);
      this.wizardProgress.set(body.sessionId, updatedProgress);

      return {
        success: true,
        progress: updatedProgress,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete step';
      throw new BadRequestException(message);
    }
  }

  @Post('wizard/:sessionId/skip-step')
  skipStep(
    @Body() body: { sessionId: string; stepId: string },
  ) {
    try {
      const progress = this.wizardProgress.get(body.sessionId);
      if (!progress) {
        throw new Error('Invalid session ID');
      }

      const updatedProgress = this.setupWizardService.skipOptionalStep(body.stepId, progress);
      this.wizardProgress.set(body.sessionId, updatedProgress);

      return {
        success: true,
        progress: updatedProgress,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to skip step';
      throw new BadRequestException(message);
    }
  }

  @Get('wizard/:sessionId/status')
  getWizardStatus(sessionId: string) {
    try {
      const progress = this.wizardProgress.get(sessionId);
      if (!progress) {
        throw new Error('Invalid session ID');
      }

      const isComplete = this.setupWizardService.isSetupComplete(progress);

      return {
        success: true,
        progress,
        isComplete,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get wizard status';
      throw new BadRequestException(message);
    }
  }

  @Get('wizard/:sessionId/recommended-steps')
  getRecommendedSteps(sessionId: string) {
    try {
      const progress = this.wizardProgress.get(sessionId);
      if (!progress) {
        throw new Error('Invalid session ID');
      }

      const recommended = this.setupWizardService.getRecommendedSteps(progress.systemInfo);

      return {
        success: true,
        recommended,
        systemInfo: progress.systemInfo,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get recommended steps';
      throw new BadRequestException(message);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
