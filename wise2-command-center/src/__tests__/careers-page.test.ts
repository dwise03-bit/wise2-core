import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('WISE2 Careers route', () => {
  it('contains the approved careers experience and conversion sections', () => {
    const page = readFileSync(join(process.cwd(), 'src/app/careers/page.tsx'), 'utf8');
    for (const text of ['WISE²','AI-POWERED JOB SEARCH','MORE THAN A JOB SEARCH','AI Career Score','LIVE JOB MATCHES','Resume Intelligence','Interview Coach','Start Free Today']) {
      expect(page).toContain(text);
    }
  });
});
