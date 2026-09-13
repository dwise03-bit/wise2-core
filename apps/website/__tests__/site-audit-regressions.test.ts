import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('WISE2 public site audit regressions', () => {
  test('homepage keeps the server and first client render on the same reduced-motion state', () => {
    const source = read('components/BrandEcosystemHomepage.tsx');

    expect(source).toContain('const [hydrated, setHydrated] = useState(false)');
    expect(source).toContain('const reduceMotion = hydrated && prefersReducedMotion');
  });

  test('shared navigation is rendered during SSR instead of appearing only after mount', () => {
    const source = read('components/navigation/PublicNav.tsx');

    expect(source).not.toContain('if (!mounted) return null');
    expect(source).not.toContain('const [mounted, setMounted]');
  });

  test('footer year is supplied as stable serialized data instead of generated during client render', () => {
    const footer = read('components/navigation/PublicFooter.tsx');
    const chrome = read('components/SiteChrome.tsx');
    const layout = read('app/layout.tsx');

    expect(footer).not.toContain('new Date().getFullYear()');
    expect(chrome).toContain('currentYear');
    expect(layout).toContain('currentYear={new Date().getUTCFullYear()}');
  });

  test('footer Solutions link targets the implemented services route', () => {
    const source = read('components/navigation/PublicFooter.tsx');

    expect(source).toContain("{ href: '/services', label: 'Solutions' }");
    expect(source).not.toContain("{ href: '/solutions', label: 'Solutions' }");
  });
});
