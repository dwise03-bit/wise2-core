import { describe, expect, it } from 'vitest';
import { loadRegistry, RegistryError } from '../targets.js';
import { writeRegistryFile } from './helpers.js';

const valid = [{
  alias: 'wise2-core',
  address: '100.64.0.10',
  transport: 'control-bridge',
  controlPort: 3099,
  environment: 'production',
  allowedProfiles: ['status', 'restart'],
  healthCheckProfile: 'status',
  bridgeTokenRef: 'WISE2_BRIDGE_TOKEN_CORE',
}];

const env = { WISE2_BRIDGE_TOKEN_CORE: 'a-bridge-token' };

describe('loadRegistry', () => {
  it('loads a private, valid registry', async () => {
    const file = await writeRegistryFile(valid);
    const registry = await loadRegistry(file, env);
    expect(registry.targets[0]?.alias).toBe('wise2-core');
    expect(registry.tokens.get('wise2-core')).toBe('a-bridge-token');
  });

  it('refuses a group- or world-readable registry', async () => {
    const file = await writeRegistryFile(valid, 0o644);
    await expect(loadRegistry(file, env)).rejects.toMatchObject({ code: 'REGISTRY_PERMISSIONS' });
  });

  it('refuses a missing registry', async () => {
    await expect(loadRegistry('/nonexistent/targets.json', env)).rejects.toMatchObject({ code: 'REGISTRY_MISSING' });
  });

  it('refuses malformed JSON', async () => {
    const file = await writeRegistryFile('{ not json', 0o600);
    await expect(loadRegistry(file, env)).rejects.toMatchObject({ code: 'REGISTRY_MALFORMED' });
  });

  it('refuses a target that allows a profile outside the protocol registry', async () => {
    const file = await writeRegistryFile([{ ...valid[0], allowedProfiles: ['status', 'exec'] }]);
    await expect(loadRegistry(file, env)).rejects.toMatchObject({ code: 'PROFILE_UNKNOWN' });
  });

  it('refuses at load when a bridge token is not set, rather than mid-incident', async () => {
    const file = await writeRegistryFile(valid);
    await expect(loadRegistry(file, {})).rejects.toMatchObject({ code: 'BRIDGE_TOKEN_MISSING' });
  });

  it('refuses an ssh target with no forward port', async () => {
    const file = await writeRegistryFile([{ ...valid[0], transport: 'ssh', sshUser: 'wise2-ops', bridgeTokenRef: undefined }]);
    await expect(loadRegistry(file, env)).rejects.toBeInstanceOf(RegistryError);
  });

  it('never keeps a token value in the parsed target record', async () => {
    const file = await writeRegistryFile(valid);
    const registry = await loadRegistry(file, env);
    expect(JSON.stringify(registry.targets)).not.toContain('a-bridge-token');
  });
});
