import { describe, expect, it } from 'vitest';
import roles from '../roles.js';
const { createRoleResolver, parseIds } = roles;

describe('createRoleResolver', () => {
  it('is fail-closed when nothing is configured', () => {
    const roles = createRoleResolver({});
    expect(roles.configured).toBe(false);
    expect(roles.roleFor('111111111111111111')).toBeNull();
  });

  it('resolves owners and operators', () => {
    const roles = createRoleResolver({ DISCORD_OPS_OWNER_IDS: '111111111111111111', DISCORD_OPS_OPERATOR_IDS: '222222222222222222' });
    expect(roles.roleFor('111111111111111111')).toBe('owner');
    expect(roles.roleFor('222222222222222222')).toBe('operator');
    expect(roles.roleFor('333333333333333333')).toBeNull();
  });

  it('never demotes an owner who also appears in the operator list', () => {
    const roles = createRoleResolver({ DISCORD_OPS_OWNER_IDS: '111111111111111111', DISCORD_OPS_OPERATOR_IDS: '111111111111111111' });
    expect(roles.roleFor('111111111111111111')).toBe('owner');
    expect(roles.operators).toEqual([]);
  });

  it('ignores entries that are not Discord snowflakes', () => {
    expect(parseIds('everyone, @here, 111111111111111111, ')).toEqual(['111111111111111111']);
  });
});
