import { describe, expect, it } from 'vitest';
import { ACTION_PROFILES, findProfile, isWriteProfile, profileIds, roleSatisfies } from '../profiles.js';

describe('action profile registry', () => {
  it('exposes exactly the profiles the ops surface documents', () => {
    expect(profileIds().sort()).toEqual([
      'deploy', 'deploy-status', 'diagnose', 'emergency-stop', 'logs',
      'maintenance', 'restart', 'rollback', 'services', 'status',
    ]);
  });

  it('has no profile that accepts free-form text', () => {
    for (const profile of ACTION_PROFILES) {
      for (const arg of profile.args) {
        expect(arg.values ?? arg.pattern, `${profile.id}.${arg.name}`).toBeDefined();
      }
    }
  });

  it('gates every write behind owner plus confirmation', () => {
    for (const profile of ACTION_PROFILES.filter(candidate => candidate.kind === 'write')) {
      expect(profile.minRole, profile.id).toBe('owner');
      expect(profile.requiresConfirmation, profile.id).toBe(true);
    }
  });

  it('double-confirms only emergency-stop', () => {
    expect(ACTION_PROFILES.filter(profile => profile.requiresDoubleConfirmation).map(profile => profile.id)).toEqual(['emergency-stop']);
  });

  it('classifies reads and writes', () => {
    expect(isWriteProfile('status')).toBe(false);
    expect(isWriteProfile('deploy')).toBe(true);
    expect(findProfile('nope')).toBeUndefined();
  });
});

describe('roleSatisfies', () => {
  it('ranks viewer below operator below owner', () => {
    expect(roleSatisfies('owner', 'operator')).toBe(true);
    expect(roleSatisfies('operator', 'owner')).toBe(false);
    expect(roleSatisfies('viewer', 'operator')).toBe(false);
  });
});
