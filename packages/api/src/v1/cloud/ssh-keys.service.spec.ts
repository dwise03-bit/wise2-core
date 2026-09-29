import { Test, TestingModule } from '@nestjs/testing';
import { SshKeysService } from './ssh-keys.service';

describe('SshKeysService', () => {
  let service: SshKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SshKeysService],
    }).compile();

    service = module.get<SshKeysService>(SshKeysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateKeyPair', () => {
    it('should generate valid ED25519 key pair', () => {
      const result = service.generateKeyPair({});

      expect(result).toHaveProperty('publicKey');
      expect(result).toHaveProperty('privateKey');
      expect(result).toHaveProperty('fingerprint');
      expect(result).toHaveProperty('algorithm', 'ed25519');
      expect(result).toHaveProperty('createdAt');
    });

    it('should generate SSH format public key starting with ssh-ed25519', () => {
      const result = service.generateKeyPair({});

      expect(result.publicKey).toMatch(/^ssh-ed25519\s+[A-Za-z0-9+/=]+\s+.*$/);
    });

    it('should include comment in public key when provided', () => {
      const comment = 'my-ssh-key';
      const result = service.generateKeyPair({ comment });

      expect(result.publicKey).toContain(comment);
    });

    it('should use default comment when not provided', () => {
      const result = service.generateKeyPair({});

      expect(result.publicKey).toContain('ed25519-key');
    });

    it('should generate valid fingerprint starting with SHA256:', () => {
      const result = service.generateKeyPair({});

      expect(result.fingerprint).toMatch(/^SHA256:[A-Za-z0-9\-_]+$/);
    });

    it('should generate PKCS8 formatted private key', () => {
      const result = service.generateKeyPair({});

      expect(result.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
      expect(result.privateKey).toContain('-----END PRIVATE KEY-----');
    });

    it('should generate unique key pairs on each call', () => {
      const result1 = service.generateKeyPair({});
      const result2 = service.generateKeyPair({});

      expect(result1.publicKey).not.toBe(result2.publicKey);
      expect(result1.privateKey).not.toBe(result2.privateKey);
      expect(result1.fingerprint).not.toBe(result2.fingerprint);
    });
  });

  describe('validateSshPublicKey', () => {
    it('should validate correct SSH ED25519 public key', () => {
      const keyPair = service.generateKeyPair({});
      const isValid = service.validateSshPublicKey(keyPair.publicKey);

      expect(isValid).toBe(true);
    });

    it('should reject key without ssh-ed25519 prefix', () => {
      const isValid = service.validateSshPublicKey('invalid-key data');

      expect(isValid).toBe(false);
    });

    it('should reject key with missing base64 data', () => {
      const isValid = service.validateSshPublicKey('ssh-ed25519');

      expect(isValid).toBe(false);
    });

    it('should reject key with invalid base64', () => {
      const isValid = service.validateSshPublicKey('ssh-ed25519 !!!invalid!!!');

      expect(isValid).toBe(false);
    });

    it('should accept key with or without comment', () => {
      const keyPair = service.generateKeyPair({ comment: 'test-key' });
      const keyWithoutComment = keyPair.publicKey.split(' ').slice(0, 2).join(' ');

      expect(service.validateSshPublicKey(keyPair.publicKey)).toBe(true);
      expect(service.validateSshPublicKey(keyWithoutComment)).toBe(false);
    });
  });
});
