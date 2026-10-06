/**
 * Voice phrase → action mapping. Keep patterns short and distinct so the
 * recognizer doesn't trip on near-matches. All phrase matching is
 * case-insensitive and ignores leading/trailing whitespace.
 */

export type VoiceAction =
  | { type: 'FIT' }
  | { type: 'ZOOM_IN' }
  | { type: 'ZOOM_OUT' }
  | { type: 'SELECT'; nodeId: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'FOLLOW' }
  | { type: 'EXIT_FOLLOW' }
  | { type: 'REPLAY_TOGGLE' }
  | { type: 'REPLAY_PLAY' }
  | { type: 'REPLAY_PAUSE' };

const SELECT_ALIASES: Record<string, string> = {
  hermes: 'hermes',
  planner: 'planner',
  claude: 'claude',
  'claude agent': 'claude',
  qa: 'qa',
  'q a': 'qa',
  deploy: 'deploy',
  github: 'github',
  approval: 'approval',
};

export function parseVoiceCommand(raw: string): VoiceAction | null {
  const text = raw.toLowerCase().trim();
  if (!text) return null;

  if (/\bfit( view| graph)?\b/.test(text)) return { type: 'FIT' };
  if (/\bzoom in\b/.test(text)) return { type: 'ZOOM_IN' };
  if (/\bzoom out\b/.test(text)) return { type: 'ZOOM_OUT' };
  if (/\b(clear|deselect)( selection| nodes?)?\b/.test(text)) return { type: 'CLEAR_SELECTION' };
  if (/\b(stop|exit) follow(ing)?\b/.test(text)) return { type: 'EXIT_FOLLOW' };
  if (/\bfollow( execution)?\b/.test(text)) return { type: 'FOLLOW' };
  if (/\breplay( mode)?\b/.test(text)) return { type: 'REPLAY_TOGGLE' };
  if (/\bpause( replay)?\b/.test(text)) return { type: 'REPLAY_PAUSE' };
  if (/\bplay( replay)?\b/.test(text)) return { type: 'REPLAY_PLAY' };

  const selectMatch = text.match(/\b(select|open|focus|show)\s+(.+)$/);
  if (selectMatch) {
    const target = selectMatch[2].replace(/[.!?]+$/, '').trim();
    const canonical = SELECT_ALIASES[target] ?? SELECT_ALIASES[target.replace(/\s+/g, ' ')];
    if (canonical) return { type: 'SELECT', nodeId: canonical };
  }

  return null;
}
