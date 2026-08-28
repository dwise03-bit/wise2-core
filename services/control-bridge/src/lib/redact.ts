export function boundedText(value: string, maxBytes = 64_000): string {
  return Buffer.from(value).subarray(0, Math.max(0, maxBytes)).toString();
}

export function redactText(value: string, secrets: string[] = []): string {
  return secrets.filter(Boolean).reduce((text, secret) => text.split(secret).join('[REDACTED]'), value);
}
