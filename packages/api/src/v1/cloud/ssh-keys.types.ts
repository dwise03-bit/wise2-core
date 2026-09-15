export interface SshKeyPairDto {
  publicKey: string;
  privateKey: string;
  fingerprint: string;
  algorithm: 'ed25519';
  createdAt: string;
}

export interface SshKeyGenerateRequestDto {
  comment?: string;
}

export interface SshKeyExportDto {
  publicKey: string;
  fingerprint: string;
  algorithm: 'ed25519';
  comment?: string;
}
