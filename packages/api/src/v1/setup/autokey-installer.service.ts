import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { SshKeysService } from '../cloud/ssh-keys.service';
import { OsDetectorService } from './os-detector.service';
import { AutoKeyInstallRequestDto, AutoKeyInstallResultDto, SystemInfo } from './setup.types';

@Injectable()
export class AutoKeyInstallerService {
  private readonly logger = new Logger(AutoKeyInstallerService.name);

  constructor(
    private sshKeysService: SshKeysService,
    private osDetectorService: OsDetectorService,
  ) {}

  async installAutoKey(request: AutoKeyInstallRequestDto): Promise<AutoKeyInstallResultDto> {
    const systemInfo = this.osDetectorService.getSystemInfo();
    let keyGenerated = false;
    let keyInstalledToSystem = false;
    let publicKeyPath: string | undefined;
    let privateKeyPath: string | undefined;
    let sshKeyFingerprint: string | undefined;

    try {
      // Generate the SSH key pair
      const keyName = request.keyName || 'id_ed25519';
      const comment = request.email ? `${request.email}@wise2` : 'wise2-autokey';

      const keyPair = this.sshKeysService.generateKeyPair({ comment });
      keyGenerated = true;
      sshKeyFingerprint = keyPair.fingerprint;

      // Install to system if requested and supported
      if (request.installToSystem) {
        const result = await this.installKeysToSystem(systemInfo, keyName, keyPair.publicKey, keyPair.privateKey);
        keyInstalledToSystem = result.success;
        publicKeyPath = result.publicKeyPath;
        privateKeyPath = result.privateKeyPath;
      }

      return {
        success: true,
        keyGenerated,
        keyInstalledToSystem,
        publicKeyPath,
        privateKeyPath,
        sshKeyFingerprint,
        message: keyInstalledToSystem
          ? `SSH key successfully generated and installed to ${systemInfo.os}`
          : `SSH key successfully generated. No system installation performed.`,
        systemInfo,
      };
    } catch (error) {
      this.logger.error('Failed to install autokey', error);
      return {
        success: false,
        keyGenerated,
        keyInstalledToSystem,
        message: error instanceof Error ? error.message : 'Failed to install SSH key',
        systemInfo,
      };
    }
  }

  private async installKeysToSystem(
    systemInfo: SystemInfo,
    keyName: string,
    publicKey: string,
    privateKey: string,
  ): Promise<{ success: boolean; publicKeyPath?: string; privateKeyPath?: string }> {
    try {
      const sshDir = this.osDetectorService.getSshDir(systemInfo);
      const privateKeyPath = this.osDetectorService.getPrivateKeyPath(systemInfo, keyName);
      const publicKeyPath = this.osDetectorService.getPublicKeyPath(systemInfo, keyName);

      // Create .ssh directory if it doesn't exist
      await this.ensureSshDirExists(sshDir, systemInfo);

      // Skip if keys already exist (safety check)
      try {
        await fs.access(privateKeyPath);
        this.logger.warn(`Private key already exists at ${privateKeyPath}, skipping installation`);
        return {
          success: false,
          publicKeyPath,
          privateKeyPath,
        };
      } catch {
        // File doesn't exist, continue with installation
      }

      // Write private key with restrictive permissions
      await fs.writeFile(privateKey, privateKey, { mode: 0o600 });
      this.logger.log(`Private key written to ${privateKeyPath}`);

      // Write public key
      await fs.writeFile(publicKeyPath, publicKey, { mode: 0o644 });
      this.logger.log(`Public key written to ${publicKeyPath}`);

      // Add to authorized_keys if on Unix-like systems
      if (systemInfo.os !== 'windows') {
        await this.addToAuthorizedKeys(sshDir, publicKey);
      }

      return {
        success: true,
        publicKeyPath,
        privateKeyPath,
      };
    } catch (error) {
      this.logger.error('Failed to install keys to system', error);
      return { success: false };
    }
  }

  private async ensureSshDirExists(sshDir: string, systemInfo: SystemInfo): Promise<void> {
    try {
      await fs.mkdir(sshDir, { recursive: true, mode: 0o700 });
      this.logger.log(`SSH directory ready at ${sshDir}`);
    } catch (error) {
      this.logger.error(`Failed to create SSH directory`, error);
      throw error;
    }
  }

  private async addToAuthorizedKeys(sshDir: string, publicKey: string): Promise<void> {
    const authorizedKeysPath = path.join(sshDir, 'authorized_keys');

    try {
      // Read existing authorized_keys if it exists
      let existingKeys = '';
      try {
        existingKeys = await fs.readFile(authorizedKeysPath, 'utf-8');
      } catch {
        // File doesn't exist yet, that's fine
      }

      // Append new public key if not already present
      if (!existingKeys.includes(publicKey)) {
        const content = existingKeys.endsWith('\n') ? existingKeys : existingKeys + '\n';
        await fs.writeFile(authorizedKeysPath, content + publicKey + '\n', { mode: 0o600 });
        this.logger.log('Public key added to authorized_keys');
      }
    } catch (error) {
      this.logger.warn('Failed to update authorized_keys', error);
      // Don't fail the entire installation if this step fails
    }
  }
}
