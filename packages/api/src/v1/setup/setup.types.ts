export type OperatingSystem = 'macos' | 'linux' | 'windows' | 'unknown';
export type Architecture = 'x64' | 'arm64' | 'x86' | 'unknown';

export interface SystemInfo {
  os: OperatingSystem;
  architecture: Architecture;
  platform: string;
  nodeVersion: string;
  homeDir: string;
}

export interface SetupWizardStepDto {
  stepId: string;
  name: string;
  description: string;
  completed: boolean;
  optional: boolean;
}

export interface AutoKeyInstallRequestDto {
  email?: string;
  keyName?: string;
  installToSystem?: boolean;
}

export interface AutoKeyInstallResultDto {
  success: boolean;
  keyGenerated: boolean;
  keyInstalledToSystem: boolean;
  publicKeyPath?: string;
  privateKeyPath?: string;
  sshKeyFingerprint?: string;
  message: string;
  systemInfo: SystemInfo;
}

export interface SetupWizardProgressDto {
  currentStep: number;
  totalSteps: number;
  steps: SetupWizardStepDto[];
  completionPercentage: number;
  systemInfo: SystemInfo;
}
