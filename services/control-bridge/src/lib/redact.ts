export function boundedText(value: string, maxBytes = 64_000): string {
  return Buffer.from(value).subarray(0, Math.max(0, maxBytes)).toString();
}

export function redactText(value: string, secrets: string[] = []): string {
  let redacted = secrets.filter(Boolean).reduce((text, secret) => text.split(secret).join('[REDACTED]'), value);
  redacted = redacted.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [REDACTED]');
  redacted = redacted.replace(/([A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY|ACCESS_KEY)[A-Z0-9_]*=)[^\s"']+/gi, '$1[REDACTED]');
  redacted = redacted.replace(/-----BEGIN [^-]+PRIVATE KEY-----[\s\S]*?-----END [^-]+PRIVATE KEY-----/g, '[REDACTED PRIVATE KEY]');
  return redacted;
}
