// Public entry point for @wise2/reaper-domain.
// package.json points main/types at ./dist/index.*, so the barrel has to live
// at src/index.ts — previously the only source was src/types/index.ts, which
// emitted to dist/types/index.js and left the declared entry point missing.
export * from './types';
