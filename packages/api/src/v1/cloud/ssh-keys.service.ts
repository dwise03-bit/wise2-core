import { Injectable } from '@nestjs/common';
import { createPrivateKey, createPublicKey, generateKeyPairSync } from 'crypto';
import { SshKeyPairDto, SshKeyGenerateRequestDto } from './ssh-keys.types';
import * as crypto from 'crypto';

@Injectable()
export class SshKeysService {
  generateKeyPair(request: SshKeyGenerateRequestDto): SshKeyPairDto {
    const { publicKey: pubKeyObj, privateKey: privKeyObj } = generateKeyPairSync('ed25519');

    const publicKeyPem = pubKeyObj.export({ format: 'pem', type: 'spki' }).toString();
    const privateKeyPem = privKeyObj.export({ format: 'pem', type: 'pkcs8' }).toString();

    const sshPublicKey = this.formatPublicKeyForSsh(publicKeyPem, request.comment);
    const fingerprint = this.calculateFingerprint(publicKeyPem);

    return {
      publicKey: sshPublicKey,
      privateKey: privateKeyPem,
      fingerprint,
      algorithm: 'ed25519',
      createdAt: new Date().toISOString(),
    };
  }

  private formatPublicKeyForSsh(publicKeyPem: string, comment?: string): string {
    const pubKey = createPublicKey({
      key: publicKeyPem,
      format: 'pem',
    });

    const keyData = pubKey.export({ format: 'der', type: 'spki' });

    const ssh = Buffer.concat([
      Buffer.from('openssh-ed25519'),
      Buffer.from([0, 0, 0, keyData.length]),
      keyData,
    ]);

    const base64Key = ssh.toString('base64');
    const commentStr = comment || 'ed25519-key';

    return `ssh-ed25519 ${base64Key} ${commentStr}`;
  }

  private calculateFingerprint(publicKeyPem: string): string {
    const publicKey = createPublicKey({
      key: publicKeyPem,
      format: 'pem',
    });

    const keyData = publicKey.export({ format: 'der', type: 'spki' });
    const hash = crypto.createHash('sha256').update(keyData).digest();

    return (
      'SHA256:' +
      hash
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
    );
  }

  validateSshPublicKey(sshPublicKey: string): boolean {
    if (!sshPublicKey.startsWith('ssh-ed25519 ')) {
      return false;
    }

    const parts = sshPublicKey.split(' ');
    if (parts.length < 2) {
      return false;
    }

    try {
      const keyData = Buffer.from(parts[1], 'base64');
      return keyData.length > 0;
    } catch {
      return false;
    }
  }
}
