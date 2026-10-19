import { SkillRegistry, TaskEngine } from '../wise-imp-desktop/src/companion-core.js';

export function createWebsiteCompanion({ navigate, getPage, onStatus, confirmAction }) {
  const registry = new SkillRegistry();
  registry.register({
    id: 'website.navigate',
    description: 'Open a WISE² page',
    permissions: [],
    validate(input) {
      if (!input?.path || typeof input.path !== 'string' || !input.path.startsWith('/') || input.path.startsWith('//')) throw Error('Invalid internal path');
    },
    execute: async ({ path }) => {
      navigate(path);
      return { path };
    },
    verify: ({ path }) => ({ ok: getPage() === path, message: 'Destination verified' })
  });
  return new TaskEngine({
    registry,
    permissions: { request: confirmAction || (async () => false) },
    onStatus
  });
}
