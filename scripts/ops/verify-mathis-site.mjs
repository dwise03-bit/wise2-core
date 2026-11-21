#!/usr/bin/env node
/**
 * Read-only production smoke check for Mathis Electric.
 * Usage: node scripts/ops/verify-mathis-site.mjs [https://mathis.wise2.net]
 * Does not deploy or modify production.
 */
const base = new URL(process.argv[2] || 'https://mathis.wise2.net');
const timeoutMs = 12000;
const checks = [
  { path: '/', kind: 'html', required: ['Mathis Electric'] },
  { path: '/mathis/logo.png', kind: 'image' },
  { path: '/mathis/entrance.mp4', kind: 'video' },
  { path: '/mathis/audio/high-voltage.wav', kind: 'audio' },
  { path: '/mathis/audio/after-hours.wav', kind: 'audio' },
  { path: '/mathis/audio/power-grid.wav', kind: 'audio' },
  { path: '/mathis/audio/never-lose-power.wav', kind: 'audio' },
  { path: '/mathis/audio/powered-by-purpose.wav', kind: 'audio' },
];
let failures = 0;
for (const check of checks) {
  const url = new URL(check.path, base);
  try {
    const headers = check.kind === 'video' || check.kind === 'audio' ? { Range: 'bytes=0-1023' } : {};
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });
    const type = response.headers.get('content-type') || '';
    const validType = check.kind === 'html' ? type.includes('text/html') :
      check.kind === 'image' ? type.startsWith('image/') :
      check.kind === 'video' ? type.startsWith('video/') || type.includes('octet-stream') :
      type.startsWith('audio/') || type.includes('octet-stream');
    const text = check.kind === 'html' && response.ok ? await response.text() : '';
    const hasRequired = (check.required || []).every(value => text.includes(value));
    const ok = response.ok && validType && hasRequired;
    if (!ok) failures++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${check.path}: HTTP ${response.status}, ${type || 'missing content-type'}`);
  } catch (error) {
    failures++;
    console.log(`FAIL ${check.path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
if (failures) {
  console.error(`Mathis verification failed: ${failures} / ${checks.length} checks. Do not approve release.`);
  process.exitCode = 1;
} else {
  console.log('All HTTP media and homepage checks passed. Manual playback, route, and UI QA are still required.');
}
