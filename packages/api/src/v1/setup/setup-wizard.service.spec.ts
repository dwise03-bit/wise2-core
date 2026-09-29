import { Test, TestingModule } from '@nestjs/testing';
import { SetupWizardService } from './setup-wizard.service';
import { OsDetectorService } from './os-detector.service';

describe('SetupWizardService', () => {
  let service: SetupWizardService;
  let osDetectorService: OsDetectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SetupWizardService, OsDetectorService],
    }).compile();

    service = module.get<SetupWizardService>(SetupWizardService);
    osDetectorService = module.get<OsDetectorService>(OsDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInitialProgress', () => {
    it('should initialize progress with all steps', () => {
      const progress = service.getInitialProgress();

      expect(progress).toHaveProperty('currentStep');
      expect(progress).toHaveProperty('totalSteps');
      expect(progress).toHaveProperty('steps');
      expect(progress).toHaveProperty('completionPercentage');
      expect(progress).toHaveProperty('systemInfo');

      expect(progress.totalSteps).toBeGreaterThan(0);
    });

    it('should mark system detection as completed', () => {
      const progress = service.getInitialProgress();
      const systemDetectionStep = progress.steps.find((s) => s.stepId === 'system-detection');

      expect(systemDetectionStep).toBeDefined();
      expect(systemDetectionStep?.completed).toBe(true);
    });

    it('should include required steps', () => {
      const progress = service.getInitialProgress();
      const stepIds = progress.steps.map((s) => s.stepId);

      expect(stepIds).toContain('system-detection');
      expect(stepIds).toContain('autokey-generation');
    });
  });

  describe('completeStep', () => {
    it('should mark step as completed', () => {
      const progress = service.getInitialProgress();
      const updatedProgress = service.completeStep('autokey-generation', progress);

      const step = updatedProgress.steps.find((s) => s.stepId === 'autokey-generation');
      expect(step?.completed).toBe(true);
    });

    it('should increase completion percentage', () => {
      const progress = service.getInitialProgress();
      const initialPercentage = progress.completionPercentage;

      const updatedProgress = service.completeStep('autokey-generation', progress);
      expect(updatedProgress.completionPercentage).toBeGreaterThan(initialPercentage);
    });

    it('should advance current step', () => {
      const progress = service.getInitialProgress();
      const initialStep = progress.currentStep;

      const updatedProgress = service.completeStep('autokey-generation', progress);
      expect(updatedProgress.currentStep).toBeGreaterThanOrEqual(initialStep);
    });
  });

  describe('skipOptionalStep', () => {
    it('should skip optional step', () => {
      const progress = service.getInitialProgress();
      const updatedProgress = service.skipOptionalStep('autokey-installation', progress);

      const step = updatedProgress.steps.find((s) => s.stepId === 'autokey-installation');
      expect(step?.completed).toBe(false);
    });

    it('should advance to next step', () => {
      const progress = service.getInitialProgress();
      const initialStep = progress.currentStep;

      const updatedProgress = service.skipOptionalStep('autokey-installation', progress);
      expect(updatedProgress.currentStep).toBeGreaterThanOrEqual(initialStep);
    });
  });

  describe('isSetupComplete', () => {
    it('should return false for new wizard', () => {
      const progress = service.getInitialProgress();
      expect(service.isSetupComplete(progress)).toBe(false);
    });

    it('should return true when all required steps are complete', () => {
      let progress = service.getInitialProgress();

      // Complete all required steps
      for (const step of progress.steps) {
        if (!step.optional && !step.completed) {
          progress = service.completeStep(step.stepId, progress);
        }
      }

      // Should be close to complete
      const requiredStepsComplete = progress.steps
        .filter((s) => !s.optional)
        .every((s) => s.completed);
      expect(requiredStepsComplete).toBe(true);
    });
  });

  describe('getRecommendedSteps', () => {
    it('should recommend autokey steps for all systems', () => {
      const systemInfo = osDetectorService.getSystemInfo();
      const recommended = service.getRecommendedSteps(systemInfo);

      expect(recommended).toContain('autokey-generation');
      expect(recommended).toContain('autokey-installation');
    });

    it('should recommend environment setup for Linux', () => {
      const systemInfo = { ...osDetectorService.getSystemInfo(), os: 'linux' as const };
      const recommended = service.getRecommendedSteps(systemInfo);

      expect(recommended).toContain('environment-setup');
    });

    it('should recommend environment setup for macOS', () => {
      const systemInfo = { ...osDetectorService.getSystemInfo(), os: 'macos' as const };
      const recommended = service.getRecommendedSteps(systemInfo);

      expect(recommended).toContain('environment-setup');
    });
  });
});
