import type { LiveAction, LiveParticipantRole } from './domain.js';

const policy: Record<LiveParticipantRole, ReadonlySet<LiveAction>> = {
  OWNER: new Set([
    'view',
    'chat',
    'vote',
    'suggest',
    'create_version',
    'promote_version',
    'open_poll',
    'close_poll',
    'moderate_chat',
    'manage_roles',
    'change_crowd_mode',
  ]),
  CO_ARTIST: new Set([
    'view',
    'chat',
    'vote',
    'suggest',
    'create_version',
    'promote_version',
  ]),
  PRODUCER: new Set([
    'view',
    'chat',
    'vote',
    'suggest',
    'create_version',
    'open_poll',
    'close_poll',
  ]),
  GUEST: new Set(['view', 'chat', 'vote', 'suggest']),
  MODERATOR: new Set([
    'view',
    'chat',
    'vote',
    'suggest',
    'open_poll',
    'close_poll',
    'moderate_chat',
  ]),
  VIEWER: new Set(['view', 'chat', 'vote', 'suggest']),
};

export function can(role: LiveParticipantRole, action: LiveAction): boolean {
  return policy[role].has(action);
}
