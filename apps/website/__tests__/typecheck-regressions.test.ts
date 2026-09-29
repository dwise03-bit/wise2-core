import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('website typecheck regressions', () => {
  test('Card has one canonical TypeScript source', () => {
    expect(fs.existsSync(path.join(root, 'components/ui/Card.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'components/ui/Card.ts'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'components/ui/card.ts'))).toBe(false);
  });

  test('canonical Card preserves the existing variant API', () => {
    const source = read('components/ui/Card.tsx');
    expect(source).toContain('variant?:');
    expect(source).toContain("'elevated'");
  });

  test('navigation badges match the numeric NavItem badge contract', () => {
    const source = read('components/navConfig.tsx');
    expect(source).not.toContain("badge: '⚡'");
    expect(source).not.toContain("badge: '11'");
  });

  test('SoundLab avoids unsupported bt-lr writing mode', () => {
    expect(read('components/studio/pages/SoundLab.tsx')).not.toContain("writingMode: 'bt-lr'");
  });
});