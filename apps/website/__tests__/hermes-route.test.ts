import fs from 'node:fs';
import path from 'node:path';

const route = path.resolve(__dirname, '../app/hermes/page.tsx');

describe('WISE2 Hermes public route', () => {
  test('ships the approved Hermes command surface at /hermes', () => {
    expect(fs.existsSync(route)).toBe(true);
    if (!fs.existsSync(route)) return;
    const source = fs.readFileSync(route, 'utf8');
    expect(source).toContain('WISE² HERMES');
    expect(source).toContain('Ask Hermes anything');
    expect(source).toContain('LIVE CONTEXT');
    expect(source).toContain("['AUTO', 'LOCAL', 'CLOUD']");
  });
});