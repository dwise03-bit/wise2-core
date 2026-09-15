import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as path from 'path';
import { OperatingSystem, Architecture, SystemInfo } from './setup.types';

@Injectable()
export class OsDetectorService {
  detectOs(): OperatingSystem {
    const platform = os.platform();

    switch (platform) {
      case 'darwin':
        return 'macos';
      case 'linux':
        return 'linux';
      case 'win32':
        return 'windows';
      default:
        return 'unknown';
    }
  }

  detectArchitecture(): Architecture {
    const arch = os.arch();

    switch (arch) {
      case 'x64':
        return 'x64';
      case 'arm64':
        return 'arm64';
      case 'x86':
        return 'x86';
      default:
        return 'unknown';
    }
  }

  getSystemInfo(): SystemInfo {
    const homeDir = os.homedir();

    return {
      os: this.detectOs(),
      architecture: this.detectArchitecture(),
      platform: os.platform(),
      nodeVersion: process.version,
      homeDir,
    };
  }

  getSshDir(systemInfo: SystemInfo): string {
    if (systemInfo.os === 'windows') {
      return path.join(systemInfo.homeDir, '.ssh');
    }
    return path.join(systemInfo.homeDir, '.ssh');
  }

  getPrivateKeyPath(systemInfo: SystemInfo, keyName: string = 'id_ed25519'): string {
    const sshDir = this.getSshDir(systemInfo);
    return path.join(sshDir, keyName);
  }

  getPublicKeyPath(systemInfo: SystemInfo, keyName: string = 'id_ed25519'): string {
    const sshDir = this.getSshDir(systemInfo);
    return path.join(sshDir, `${keyName}.pub`);
  }

  getKnownHostsPath(systemInfo: SystemInfo): string {
    const sshDir = this.getSshDir(systemInfo);
    return path.join(sshDir, 'known_hosts');
  }

  getConfigPath(systemInfo: SystemInfo): string {
    const sshDir = this.getSshDir(systemInfo);
    return path.join(sshDir, 'config');
  }
}
