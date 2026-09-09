/**
 * The bridge's sanitizers are the shared ones. Keeping a second copy here is how the
 * connection-string rule went missing from bridge output while the card had it.
 */
export { boundedText, redactText } from '../../../../packages/ops-protocol/src/redact.js';
