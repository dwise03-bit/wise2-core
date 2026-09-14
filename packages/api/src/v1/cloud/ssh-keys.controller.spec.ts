import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SshKeysController } from './ssh-keys.controller';
import { SshKeysService } from './ssh-keys.service';

describe('SshKeysController', () => {
  let controller: SshKeysController;
  let service: SshKeysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SshKeysController],
      providers: [SshKeysService],
    }).compile();

    controller = module.get<SshKeysController>(SshKeysController);
    service = module.get<SshKeysService>(SshKeysService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateKeyPair', () => {
    it('should generate key pair successfully', async () => {
      const result = await controller.generateKeyPair({});

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('publicKey');
      expect(result.data).toHaveProperty('privateKey');
      expect(result.data).toHaveProperty('fingerprint');
      expect(result.data).toHaveProperty('algorithm', 'ed25519');
    });

    it('should include comment in generated key pair', async () => {
      const comment = 'my-test-key';
      const result = await controller.generateKeyPair({ comment });

      expect(result.data.publicKey).toContain(comment);
    });

    it('should handle generation errors', async () => {
      jest.spyOn(service, 'generateKeyPair').mockImplementation(() => {
        throw new Error('Generation error');
      });

      await expect(controller.generateKeyPair({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('validatePublicKey', () => {
    it('should validate correct public key', async () => {
      const keyPair = service.generateKeyPair({});
      const result = await controller.validatePublicKey({ publicKey: keyPair.publicKey });

      expect(result).toHaveProperty('valid', true);
      expect(result).toHaveProperty('algorithm', 'ed25519');
    });

    it('should reject invalid public key', async () => {
      const result = await controller.validatePublicKey({ publicKey: 'invalid-key' });

      expect(result).toHaveProperty('valid', false);
      expect(result).toHaveProperty('algorithm', null);
    });

    it('should reject missing public key', async () => {
      await expect(
        controller.validatePublicKey({ publicKey: '' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject undefined public key', async () => {
      await expect(
        controller.validatePublicKey({ publicKey: undefined as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle validation errors gracefully', async () => {
      jest.spyOn(service, 'validateSshPublicKey').mockImplementation(() => {
        throw new Error('Validation error');
      });

      await expect(
        controller.validatePublicKey({ publicKey: 'key-data' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
