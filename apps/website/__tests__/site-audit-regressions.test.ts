import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('WISE2 public site audit regressions', () => {
  test('shared navigation is rendered during SSR instead of appearing only after mount', () => {
    const source = read('components/navigation/PublicNav.tsx');

    expect(source).not.toContain('if (!mounted) return null');
    expect(source).not.toContain('const [mounted, setMounted]');
  });

  test('footer Solutions link targets the implemented services route', () => {
    const source = read('components/navigation/PublicFooter.tsx');

    expect(source).toContain("{ href: '/services', label: 'Solutions' }");
    expect(source).not.toContain("{ href: '/solutions', label: 'Solutions' }");
  });
});

test('homepage navigation avoids known 404 destinations', () => {
  const source = read('components/BrandEcosystemHomepage.tsx');
  expect(source).not.toContain('href="/lil-lizzy"');
  expect(source).not.toContain('href="/industries"');
  expect(source).not.toContain('href="/sales-academy/"');
  expect(source).not.toContain('href="/sales-academy/nc-academy.html"');
  expect(source).not.toContain('href="/sales-academy/nyc-academy.html"');
  expect(source).not.toContain('href="/sales-academy/li-academy.html"');
});
