import { describe, expect, it } from 'vitest';
import { can } from '../permissions.js';

describe('live room permissions', () => {
  it('lets viewers vote but never promote a version', () => {
    expect(can('VIEWER', 'vote')).toBe(true);
    expect(can('VIEWER', 'promote_version')).toBe(false);
  });

  it('lets moderators moderate without changing creative state', () => {
    expect(can('MODERATOR', 'moderate_chat')).toBe(true);
    expect(can('MODERATOR', 'promote_version')).toBe(false);
  });

  it('lets owners control the full phase-1 room', () => {
    expect(can('OWNER', 'manage_roles')).toBe(true);
    expect(can('OWNER', 'promote_version')).toBe(true);
    expect(can('OWNER', 'open_poll')).toBe(true);
  });
});
