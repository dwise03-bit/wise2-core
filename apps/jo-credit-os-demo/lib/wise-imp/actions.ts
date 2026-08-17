import { PROJECT_CATEGORIES } from './knowledge';

/**
 * Wise Imp's structured action allowlist. This is intentionally small and
 * hardcoded — not a general tool-calling framework. The AI never executes
 * anything directly: it can only *suggest* one of these four actions, the
 * client always previews it via ActionConfirm, and nothing fires without an
 * explicit click. See the Wise Imp implementation plan, "Structured action
 * allowlist" section.
 */

export const ALLOWED_ROUTES = [
  '/',
  '/platform',
  '/sound-labs',
  '/audit',
  '/powered-businesses',
  '/pricing',
  '/printshop',
  '/consulting',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
] as const;

export type AllowedRoute = (typeof ALLOWED_ROUTES)[number];

const PROJECT_CATEGORY_IDS = new Set(PROJECT_CATEGORIES.map((c) => c.id));

export type WiseImpAction =
  | { type: 'navigate'; params: { path: AllowedRoute } }
  | { type: 'open_intake'; params: { category?: string } }
  | { type: 'open_contact'; params: Record<string, never> }
  | { type: 'request_human_handoff'; params: { reason: string } };

/**
 * The marker the system prompt instructs the model to emit when it wants to
 * suggest an action. Kept out of the visible reply text — the chat route
 * strips it before returning `reply` to the client and returns the parsed,
 * validated action separately.
 */
const ACTION_MARKER_RE = /<<<WISE_IMP_ACTION>>>([\s\S]*?)<<<END>>>/;

export function stripActionMarker(text: string): string {
  return text.replace(ACTION_MARKER_RE, '').trim();
}

/**
 * Parses and validates a raw model reply for an action marker. Returns null
 * if there's no marker, or if what's inside it isn't a real, well-formed
 * allowlisted action — malformed or unrecognized actions are silently
 * dropped rather than surfaced, so a model hallucinating an action shape
 * never reaches the client as something clickable.
 */
export function extractAction(rawReply: string): WiseImpAction | null {
  const match = rawReply.match(ACTION_MARKER_RE);
  if (!match) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    return null;
  }

  return validateAction(parsed);
}

export function validateAction(input: unknown): WiseImpAction | null {
  if (typeof input !== 'object' || input === null) return null;
  const { type, params } = input as { type?: unknown; params?: unknown };
  const p = typeof params === 'object' && params !== null ? (params as Record<string, unknown>) : {};

  switch (type) {
    case 'navigate': {
      const path = p.path;
      if (typeof path === 'string' && (ALLOWED_ROUTES as readonly string[]).includes(path)) {
        return { type: 'navigate', params: { path: path as AllowedRoute } };
      }
      return null;
    }
    case 'open_intake': {
      const category = p.category;
      if (category === undefined) return { type: 'open_intake', params: {} };
      if (typeof category === 'string' && PROJECT_CATEGORY_IDS.has(category)) {
        return { type: 'open_intake', params: { category } };
      }
      return null;
    }
    case 'open_contact':
      return { type: 'open_contact', params: {} };
    case 'request_human_handoff': {
      const reason = p.reason;
      if (typeof reason === 'string' && reason.trim().length > 0) {
        return { type: 'request_human_handoff', params: { reason: reason.trim() } };
      }
      return null;
    }
    default:
      return null;
  }
}

/** Human-readable preview text for ActionConfirm.tsx. */
export function describeAction(action: WiseImpAction): string {
  switch (action.type) {
    case 'navigate':
      return `Go to ${action.params.path}`;
    case 'open_intake':
      return action.params.category
        ? `Start the project intake, category: ${PROJECT_CATEGORIES.find((c) => c.id === action.params.category)?.label ?? action.params.category}`
        : 'Start the project intake';
    case 'open_contact':
      return 'Open the contact form';
    case 'request_human_handoff':
      return `Connect you with the WISE² team — ${action.params.reason}`;
  }
}
