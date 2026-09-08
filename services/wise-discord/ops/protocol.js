'use strict';
/**
 * Loads the shared ops protocol. It is an ES module and this bot is CommonJS, so it is
 * pulled in with a dynamic import once and cached. Nothing here reimplements the
 * protocol: signing, verification and the profile allowlist all live in one place.
 */
const { pathToFileURL } = require('node:url');
const { join } = require('node:path');

const DEFAULT_ENTRY = join(__dirname, '..', '..', '..', 'packages', 'ops-protocol', 'dist', 'index.js');

let cached = null;

function loadProtocol(entry = process.env.WISE2_OPS_PROTOCOL_ENTRY || DEFAULT_ENTRY) {
  if (!cached) {
    cached = import(pathToFileURL(entry).href).catch((error) => {
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
