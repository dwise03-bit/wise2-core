import fs from 'node:fs';
import path from 'node:path';

const route = path.resolve(__dirname, '../app/hermes/page.tsx');
const components = path.resolve(__dirname, '../app/hermes/components.tsx');

describe('WISE2 Hermes public route', () => {
  test('ships the approved Hermes command surface at /hermes', () => {
    expect(fs.existsSync(route)).toBe(true);
    const source = fs.readFileSync(route, 'utf8');
    const ui = fs.readFileSync(components, 'utf8');
    expect(source).toContain('WISE² HERMES');
    expect(source).toContain('Ask Hermes anything');
    expect(ui).toContain('LIVE CONTEXT');
    expect(source).toContain("['AUTO', 'LOCAL', 'CLOUD']");
  });

  test('uses extracted responsive Hermes UI components', () => {
    expect(fs.existsSync(components)).toBe(true);
    const source = fs.readFileSync(components, 'utf8');
    expect(source).toContain('HermesSidebar');
    expect(source).toContain('CommandWorld');
    expect(source).toContain('LiveContextPanel');
    expect(source).toContain('focus-visible:ring-2');
    expect(source).toContain('aria-pressed');
  });
});