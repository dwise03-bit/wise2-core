import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('WISE² Cloud Living Core regressions', () => {
  test('the Cloud route uses the dedicated Living Core experience', () => {
    expect(read('app/cloud/page.tsx')).toContain("import { LivingCoreCloud } from '@/components/LivingCoreCloud'");
  });

  test('the Living Core retains the locked business sequence', () => {
    const source = read('components/LivingCoreCloud.tsx');

    for (const stage of ['HOST', 'PROTECT', 'SCALE', 'PROFIT']) {
      expect(source).toContain(stage);
    }
    expect(source).toContain('YOUR BUSINESS.');
    expect(source).toContain('OUR INFRASTRUCTURE.');
  });

  test('the landing experience does not reintroduce fabricated dashboard metrics', () => {
    const source = read('components/LivingCoreCloud.tsx');

    for (const metric of ['99.99%', 'Total Domains', 'Monthly Revenue', 'Active Servers']) {
      expect(source).not.toContain(metric);
    }
  });
});
