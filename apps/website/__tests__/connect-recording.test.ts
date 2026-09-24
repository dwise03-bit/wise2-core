import fs from 'fs';
import path from 'path';

const page = fs.readFileSync(path.join(process.cwd(), 'app/connect/page.tsx'), 'utf8');

describe('WISE² Connect recording surface', () => {
  it('uses explicit browser capture APIs and visible controls', () => {
    expect(page).toContain('getUserMedia');
    expect(page).toContain('MediaRecorder');
    expect(page).toContain('Save locally');
    expect(page).toContain('Discard');
    expect(page).toContain('Recording');
    expect(page).toContain('Discord');
    expect(page).toContain('/api/connect/captures/discord');
  });

  it('persists capture metadata and media in IndexedDB', () => {
    expect(page).toContain('indexedDB.open');
    expect(page).toContain("objectStore(STORE).put");
    expect(page).toContain("status: 'LOCAL'");
  });
});
