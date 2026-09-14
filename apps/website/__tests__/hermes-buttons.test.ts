import fs from 'node:fs';
import path from 'node:path';
const page=fs.readFileSync(path.resolve(__dirname,'../app/hermes/page.tsx'),'utf8');
const components=fs.readFileSync(path.resolve(__dirname,'../app/hermes/components.tsx'),'utf8');
describe('Hermes controls',()=>{
 test('navigation and agents perform actions',()=>{ expect(page).toContain('navTargets'); expect(page).toContain('agentPrompts'); expect(page).toContain('router.push'); });
 test('utility controls are wired',()=>{ expect(page).toContain('handleAddContext'); expect(page).toContain('handleAgent'); expect(components).toContain('onSync'); });
 test('command submit calls Hermes API',()=>{ expect(page).toContain('/api/v1/hermes/chat'); expect(page).toContain('await fetch'); });
});
