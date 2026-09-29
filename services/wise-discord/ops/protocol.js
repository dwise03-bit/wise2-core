'use strict';
/**
 * Loads the shared ops protocol. It is an ES module and this bot is CommonJS, so it is
 * pulled in with a dynamic import once and cached. Nothing here reimplements the
 * protocol: signing, verification and the profile allowlist all live in one place.
 */
const { pathToFileURL } = require('node:url');
const { join } = require('node:path');

const DEFAULT_ENTRY = join(__dirname, '..', '..', '..', 'packages', 'ops-protocol', 'dist', 'index.js');

/** Exports this bot depends on. A stale build resolves but is missing some of these. */
const REQUIRED_EXPORTS = ['sign', 'verifyJob', 'findProfile', 'validateArgs', 'roleSatisfies', 'newJobId', 'newNonce', 'idempotencyKeyFor', 'renderResultCard', 'summariseArgs'];

let cached = null;

function loadProtocol(entry = process.env.WISE2_OPS_PROTOCOL_ENTRY || DEFAULT_ENTRY) {
  if (!cached) {
    cached = import(pathToFileURL(entry).href).then((api) => {
      // A stale dist imports cleanly but silently lacks newer exports, which surfaces far
      // away as "x is not a function". Fail here, with the fix, instead.
      const missing = REQUIRED_EXPORTS.filter((name) => typeof api[name] !== 'function');
      if (missing.length > 0) {
        cached = null;
        throw new Error(
          `@wise2/ops-protocol at ${entry} is out of date (missing: ${missing.join(', ')}). ` +
          `Rebuild it: (cd packages/ops-protocol && npm run build).`,
        );
      }
      return api;
    }).catch((error) => {
      cached = null;
      throw new Error(
        `Unable to load @wise2/ops-protocol from ${entry}. ` +
        `Build it first: (cd packages/ops-protocol && npm install && npm run build). ` +
        `Original error: ${error.message}`,
      );
    });
  }
  return cached;
}

module.exports = { loadProtocol, DEFAULT_ENTRY };
