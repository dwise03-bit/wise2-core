import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { SshKeysService } from './ssh-keys.service';
import { SshKeyGenerateRequestDto } from './ssh-keys.types';

@Controller('v1/ssh-keys')
export class SshKeysController {
  constructor(private readonly sshKeysService: SshKeysService) {}

  @Post('generate')
  async generateKeyPair(@Body() body: SshKeyGenerateRequestDto) {
    try {
      const keyPair = this.sshKeysService.generateKeyPair(body);
      return {
        success: true,
        data: keyPair,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Key generation failed';
      throw new BadRequestException(message);
    }
  }

  @Post('validate')
  async validatePublicKey(@Body() body: { publicKey: string }) {
    if (!body.publicKey) {
      throw new BadRequestException('Public key is required');
    }

    try {
      const isValid = this.sshKeysService.validateSshPublicKey(body.publicKey);
      return {
        valid: isValid,
        algorithm: isValid ? 'ed25519' : null,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation failed';
      throw new BadRequestException(message);
    }
  }
}
