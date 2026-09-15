import { Test, TestingModule } from '@nestjs/testing';
import { OsDetectorService } from './os-detector.service';
import * as os from 'os';

describe('OsDetectorService', () => {
  let service: OsDetectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OsDetectorService],
    }).compile();

    service = module.get<OsDetectorService>(OsDetectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('detectOs', () => {
    it('should detect macOS', () => {
      jest.spyOn(os, 'platform').mockReturnValue('darwin');
      expect(service.detectOs()).toBe('macos');
    });

    it('should detect Linux', () => {
      jest.spyOn(os, 'platform').mockReturnValue('linux');
      expect(service.detectOs()).toBe('linux');
    });

    it('should detect Windows', () => {
      jest.spyOn(os, 'platform').mockReturnValue('win32');
      expect(service.detectOs()).toBe('windows');
    });

    it('should return unknown for unsupported OS', () => {
      jest.spyOn(os, 'platform').mockReturnValue('freebsd');
      expect(service.detectOs()).toBe('unknown');
    });
  });

  describe('detectArchitecture', () => {
    it('should detect x64 architecture', () => {
      jest.spyOn(os, 'arch').mockReturnValue('x64');
      expect(service.detectArchitecture()).toBe('x64');
    });

    it('should detect arm64 architecture', () => {
      jest.spyOn(os, 'arch').mockReturnValue('arm64');
      expect(service.detectArchitecture()).toBe('arm64');
    });

    it('should detect x86 architecture', () => {
      jest.spyOn(os, 'arch').mockReturnValue('x86');
      expect(service.detectArchitecture()).toBe('x86');
    });
  });

  describe('getSystemInfo', () => {
    it('should return complete system information', () => {
      const systemInfo = service.getSystemInfo();

      expect(systemInfo).toHaveProperty('os');
      expect(systemInfo).toHaveProperty('architecture');
      expect(systemInfo).toHaveProperty('platform');
      expect(systemInfo).toHaveProperty('nodeVersion');
      expect(systemInfo).toHaveProperty('homeDir');

      expect(systemInfo.nodeVersion).toMatch(/^v\d+\.\d+\.\d+/);
      expect(systemInfo.homeDir).toBeTruthy();
    });
  });

  describe('getSshDir', () => {
    it('should return correct SSH directory for Unix-like systems', () => {
      const systemInfo = { ...service.getSystemInfo(), os: 'linux' as const };
      const sshDir = service.getSshDir(systemInfo);
      expect(sshDir).toContain('.ssh');
    });

    it('should return correct SSH directory for macOS', () => {
      const systemInfo = { ...service.getSystemInfo(), os: 'macos' as const };
      const sshDir = service.getSshDir(systemInfo);
      expect(sshDir).toContain('.ssh');
    });

    it('should return correct SSH directory for Windows', () => {
      const systemInfo = { ...service.getSystemInfo(), os: 'windows' as const };
      const sshDir = service.getSshDir(systemInfo);
      expect(sshDir).toContain('.ssh');
    });
  });

  describe('key path generation', () => {
    it('should generate correct private key path', () => {
      const systemInfo = service.getSystemInfo();
      const keyPath = service.getPrivateKeyPath(systemInfo, 'id_ed25519');
      expect(keyPath).toContain('id_ed25519');
      expect(keyPath).toContain('.ssh');
    });

    it('should generate correct public key path', () => {
      const systemInfo = service.getSystemInfo();
      const keyPath = service.getPublicKeyPath(systemInfo, 'id_ed25519');
      expect(keyPath).toContain('id_ed25519.pub');
      expect(keyPath).toContain('.ssh');
    });

    it('should generate correct known_hosts path', () => {
      const systemInfo = service.getSystemInfo();
      const path = service.getKnownHostsPath(systemInfo);
      expect(path).toContain('known_hosts');
      expect(path).toContain('.ssh');
    });

    it('should generate correct config path', () => {
      const systemInfo = service.getSystemInfo();
      const configPath = service.getConfigPath(systemInfo);
      expect(configPath).toContain('config');
      expect(configPath).toContain('.ssh');
    });
  });
});
