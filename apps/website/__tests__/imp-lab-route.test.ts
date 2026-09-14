import fs from 'node:fs';
import path from 'node:path';

const route = path.resolve(__dirname, '../app/imp-lab/page.tsx');
const data = path.resolve(__dirname, '../data/imp-lab.ts');

describe('WISE2 IMP LAB route', () => {
  test('ships the approved five-track classroom surface', () => {
    expect(fs.existsSync(route)).toBe(true);
    expect(fs.existsSync(data)).toBe(true);
    if (!fs.existsSync(route) || !fs.existsSync(data)) return;
    const source = fs.readFileSync(route, 'utf8');
    const config = fs.readFileSync(data, 'utf8');
    expect(source).toContain('WISE² IMP LAB');
    expect(source).toContain('REAL SCHOOLS. BRIGHTER FUTURES.');
    expect(source).toContain('Join Discord');
    expect(source).toContain('Quest XR');
    for (const track of ['Learner', 'Creator', 'Guide', 'Safe', 'Team']) {
      expect(config).toContain(`name: '${track} IMP'`);
    }
  });
});
