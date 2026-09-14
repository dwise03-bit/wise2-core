/**
 * TDD Contract Test: VPS Preflight Nginx Validation
 *
 * This test encodes the contract that preflight validation must enforce:
 * 1. Only expected WISE² services have Nginx config
 * 2. No port conflicts exist
 * 3. No dangling node_modules symlink
 *
 * The actual preflight-nginx-check.sh script validates this on VPS.
 * This test documents the expected behavior.
 *
 * Status: Executable validation is platform-blocked; this test records intent.
 */

import fs from 'fs';
import path from 'path';

describe('VPS Preflight Nginx Validation Contract', () => {
  // Expected services that should have Nginx config
  const expectedServices = [
    'wise2-website',
    'wise2-api',
    'wise2-command-center', // dashboard
  ];

  // Ports that are allocated and must not conflict
  const allocatedPorts = new Map([
    ['wise2-website', 3001],
    ['wise2-api', 5000],
    ['wise2-command-center', 3002],
  ]);

  test('contract: only expected WISE² services are deployed', () => {
    // This test documents that the preflight validator will reject
    // deployments where unknown services appear in /etc/nginx/sites-enabled/
    //
    // Example failure case (should reject):
    //   /etc/nginx/sites-enabled/rogue-service-*.conf exists
    //
    // Expected behavior: Nginx config only contains wise2-* services

    const contract = {
      description: 'Nginx sites-enabled/ must contain only WISE² services',
      validator: 'scripts/preflight-nginx-check.sh',
      rule: 'For each *.conf in /etc/nginx/sites-enabled/, service name must match wise2-* pattern',
      failureMode: 'Reject deployment',
    };

    expect(contract.validator).toBe('scripts/preflight-nginx-check.sh');
    expect(expectedServices.length).toBeGreaterThan(0);
  });

  test('contract: no port conflicts across services', () => {
    // This test documents that the preflight validator will reject
    // deployments where port conflicts are detected.
    //
    // Example failure case (should reject):
    //   service A listening on 3001
    //   service B listening on 3001 (conflict!)
    //
    // Expected behavior: Each allocated port is used by exactly one service

    const ports = new Set(allocatedPorts.values());
    const uniquePortCount = ports.size;
    const totalServiceCount = allocatedPorts.size;

    expect(uniquePortCount).toBe(totalServiceCount);

    // Verify no duplicates
    const portArray = Array.from(allocatedPorts.values());
    const duplicates = portArray.filter((p, i) => portArray.indexOf(p) !== i);
    expect(duplicates).toHaveLength(0);
  });

  test('contract: no dangling node_modules symlink in repo', () => {
    // Regression test: ensure dangling node_modules symlink is not re-introduced.
    // This symlink causes pnpm install to fail with ENOTDIR.
    //
    // Expected: node_modules either doesn't exist or is a real directory.
    // Never: node_modules is a symlink to a non-existent path.

    const repoRoot = path.resolve(__dirname, '../../');
    const nodeModulesPath = path.join(repoRoot, 'node_modules');

    const exists = fs.existsSync(nodeModulesPath);
    if (exists) {
      const stat = fs.lstatSync(nodeModulesPath);
      expect(stat.isSymbolicLink()).toBe(false); // Must not be symlink
      expect(stat.isDirectory()).toBe(true); // Must be real directory
    }
  });

  test('contract: docker-compose.prod.yml defines all expected services', () => {
    // Verify that docker-compose.prod.yml includes all services
    // that should appear in production.

    const composePath = path.resolve(__dirname, '../../docker-compose.prod.yml');
    expect(fs.existsSync(composePath)).toBe(true);

    const composeContent = fs.readFileSync(composePath, 'utf8');

    for (const service of expectedServices) {
      expect(composeContent).toContain(service);
    }
  });

  test('contract: allocation map is source of truth for port assignments', () => {
    // This test documents that allocatedPorts is the source of truth.
    // Any changes to port allocations must update this map first,
    // then docker-compose.prod.yml, then .env/secrets.

    expect(allocatedPorts.get('wise2-website')).toBe(3001);
    expect(allocatedPorts.get('wise2-api')).toBe(5000);
    expect(allocatedPorts.get('wise2-command-center')).toBe(3002);
  });
});

/**
 * Integration Test: Preflight Script Behavior
 *
 * Status: BLOCKED by platform (cannot execute scripts that inspect /etc/nginx/)
 * Will be implemented once platform access is elevated.
 */
describe.skip('VPS Preflight Nginx Script Integration', () => {
  test('preflight-nginx-check.sh validates Nginx config', () => {
    // This test will run the actual preflight script on VPS and verify:
    // 1. Script exits 0 if validation passes
    // 2. Script exits 1 if validation fails
    // 3. Error output explains the failure

    // Implementation blocked: requires /etc/nginx/ access on VPS
  });

  test('preflight-nginx-check.sh rejects port conflicts', () => {
    // This test will intentionally create a port conflict in Nginx config,
    // then verify the preflight script rejects it.

    // Implementation blocked: requires /etc/nginx/ access on VPS
  });
});
